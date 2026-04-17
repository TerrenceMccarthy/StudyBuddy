# Moderator Role Implementation

## Overview

This document describes the implementation of the moderator role feature for StudyBuddy, allowing designated team members to manage inappropriate or problematic content.

**Requirements Addressed:** 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 20.1, 20.2, 20.3, 20.4, 20.5

## Implementation Summary

### Task 14.1: Database Migration ✓

**File:** `StudyBuddy/migrations/001_add_profile_columns.sql`

The migration adds the `is_moderator` column to the profiles table:
- Column type: BOOLEAN
- Default value: FALSE
- Nullable: YES
- Includes backfill for existing users

**Verification:**
Run `StudyBuddy/migrations/verify_001.sql` to verify the migration was successful.

### Task 14.2: Authorization Module ✓

**File:** `StudyBuddy/server/authorization.py`

Created a comprehensive authorization module with three main decorators:

#### 1. `@require_auth`
- Verifies user has valid JWT token
- Extracts user data from Supabase
- Injects user object into decorated function
- Returns 401 Unauthorized if token is missing or invalid

**Usage:**
```python
@app.route('/api/protected')
@require_auth
def protected_route(user):
    return jsonify(user_id=user['id'])
```

#### 2. `@require_moderator`
- Must be used with `@require_auth`
- Verifies user has `is_moderator=True` in profile
- Returns 403 Forbidden if user is not a moderator

**Usage:**
```python
@app.route('/api/moderation/action')
@require_auth
@require_moderator
def moderator_action(user):
    return jsonify(message='Moderator action performed')
```

#### 3. `@require_ownership_or_moderator(resource_type)`
- Must be used with `@require_auth`
- Verifies user either owns the resource OR is a moderator
- Supports resource types: 'post', 'session', 'profile'
- Returns 403 Forbidden if user lacks permission

**Usage:**
```python
@app.route('/api/sessions/<int:session_id>')
@require_auth
@require_ownership_or_moderator('post')
def edit_session(user, session_id):
    return jsonify(message='Session updated')
```

**Testing:**
- Created `test_authorization.py` with 8 comprehensive tests
- All tests pass ✓
- Tests cover authentication, authorization, and ownership checks

### Task 14.3: Frontend Moderator Controls ✓

**Files Modified:**
- `StudyBuddy/client/src/context/UserContext.jsx`
- `StudyBuddy/client/src/components/PostCard.jsx`
- `StudyBuddy/client/src/components/PostCard.module.css`
- `StudyBuddy/client/src/pages/Home.jsx`

#### UserContext Updates
- Added `is_moderator` to profile fetch query
- Moderator status is now available throughout the app via `useUser()` hook

#### PostCard Component Updates
- Added `currentUser` prop to receive user profile
- Added `onModeratorDelete` and `onModeratorClose` callback props
- Conditionally renders moderator action buttons when `currentUser.is_moderator === true`
- Moderator buttons appear in the footer section:
  - **Close** button: Closes the session (changes status to 'closed')
  - **Delete** button: Removes the session entirely
- Both buttons include confirmation dialogs

#### Styling
Added CSS for moderator buttons:
- `.moderatorActions`: Container for moderator buttons
- `.moderatorBtn`: Base styling for moderator buttons
- `.moderatorDeleteBtn`: Red styling for delete button
- Hover effects with color transitions and shadows

#### Home Page Updates
- Imports `useUser` hook to access profile data
- Passes `profile` to PostCard as `currentUser` prop
- Implements `handleModeratorDelete` function:
  - Calls DELETE `/api/moderation/sessions/:id`
  - Removes session from local state on success
  - Shows error alert on failure
- Implements `handleModeratorClose` function:
  - Calls PATCH `/api/moderation/sessions/:id/close`
  - Updates session status in local state on success
  - Shows error alert on failure

### Task 14.4: Moderation API Endpoints ✓

**File:** `StudyBuddy/server/app.py`

Added two new moderation endpoints:

#### DELETE `/api/moderation/sessions/:id`
- Requires authentication and moderator role
- Deletes any session regardless of ownership
- Logs action with moderator ID, timestamp, and session details
- Returns 200 with confirmation message on success
- Returns 404 if session not found
- Returns 403 if user is not a moderator

**Request:**
```
DELETE /api/moderation/sessions/123
Authorization: Bearer <token>
```

**Response (Success):**
```json
{
  "message": "Session deleted by moderator",
  "session_id": 123,
  "moderator_id": "mod_user_id"
}
```

#### PATCH `/api/moderation/sessions/:id/close`
- Requires authentication and moderator role
- Closes any session by setting status to 'closed'
- Logs action with moderator ID, timestamp, and session details
- Returns 200 with updated session on success
- Returns 404 if session not found
- Returns 403 if user is not a moderator

**Request:**
```
PATCH /api/moderation/sessions/123/close
Authorization: Bearer <token>
```

**Response (Success):**
```json
{
  "message": "Session closed by moderator",
  "session_id": 123,
  "moderator_id": "mod_user_id",
  "session": { ... }
}
```

#### Logging
All moderator actions are logged using Python's logging module:
```
MODERATOR_ACTION: User <user_id> (<email>) deleted/closed session <session_id> 
at <timestamp>. Session details: <course> by user <owner_id>
```

## Security Considerations

1. **Server-side Authorization**: All authorization checks happen on the backend
2. **Token Verification**: JWT tokens are verified with Supabase on every request
3. **Audit Trail**: All moderator actions are logged for accountability
4. **Frontend Hiding**: Moderator controls are hidden from non-moderators in UI
5. **Defense in Depth**: Even if frontend is bypassed, backend enforces permissions

## Testing Checklist

### Backend Tests ✓
- [x] `@require_auth` rejects requests without Authorization header
- [x] `@require_auth` rejects requests with invalid token
- [x] `@require_auth` allows requests with valid token
- [x] `@require_moderator` rejects non-moderator users
- [x] `@require_moderator` allows moderator users
- [x] `@require_ownership_or_moderator` allows resource owner
- [x] `@require_ownership_or_moderator` allows moderator
- [x] `@require_ownership_or_moderator` rejects non-owner non-moderator

### Manual Testing Required

#### Database Migration
- [ ] Run migration: `psql <database_url> -f StudyBuddy/migrations/001_add_profile_columns.sql`
- [ ] Verify migration: `psql <database_url> -f StudyBuddy/migrations/verify_001.sql`
- [ ] Confirm `is_moderator` column exists with default FALSE
- [ ] Set a test user to moderator: `UPDATE profiles SET is_moderator = TRUE WHERE id = '<user_id>'`

#### Frontend Testing
- [ ] Login as non-moderator user
- [ ] Verify moderator buttons do NOT appear on session cards
- [ ] Login as moderator user
- [ ] Verify moderator buttons DO appear on all session cards
- [ ] Click "Close" button and confirm session status changes to 'closed'
- [ ] Click "Delete" button and confirm session is removed
- [ ] Verify confirmation dialogs appear before actions

#### Backend Testing
- [ ] Test DELETE endpoint with non-moderator token (should return 403)
- [ ] Test DELETE endpoint with moderator token (should return 200)
- [ ] Test PATCH close endpoint with non-moderator token (should return 403)
- [ ] Test PATCH close endpoint with moderator token (should return 200)
- [ ] Verify moderator actions are logged in server logs

## Usage Instructions

### Making a User a Moderator

To grant moderator privileges to a user:

```sql
UPDATE profiles 
SET is_moderator = TRUE 
WHERE id = '<user_id>';
```

To revoke moderator privileges:

```sql
UPDATE profiles 
SET is_moderator = FALSE 
WHERE id = '<user_id>';
```

### Viewing Moderator Logs

Moderator actions are logged to the application log. To view them:

```bash
# If using systemd
journalctl -u studybuddy-server | grep MODERATOR_ACTION

# If using log files
grep MODERATOR_ACTION /var/log/studybuddy/server.log
```

## Future Enhancements

1. **Admin Dashboard**: Create a dedicated moderator dashboard
2. **Bulk Actions**: Allow moderators to act on multiple sessions at once
3. **Moderation Queue**: Flag sessions for review before deletion
4. **Moderator Roles**: Different levels of moderator permissions
5. **Undo Actions**: Allow moderators to restore deleted sessions
6. **User Banning**: Allow moderators to ban problematic users
7. **Notification System**: Notify session owners when their content is moderated

## Dependencies

### Backend
- Flask >= 3.1.2
- Flask-CORS >= 6.0.2
- supabase >= 2.28.3
- pytest >= 8.4.2 (for testing)

### Frontend
- React >= 18
- Supabase client library

## Files Created/Modified

### Created
- `StudyBuddy/server/authorization.py` - Authorization module
- `StudyBuddy/server/test_authorization.py` - Authorization tests
- `StudyBuddy/MODERATOR_IMPLEMENTATION.md` - This document

### Modified
- `StudyBuddy/server/app.py` - Added moderation endpoints
- `StudyBuddy/client/src/context/UserContext.jsx` - Added is_moderator to profile
- `StudyBuddy/client/src/components/PostCard.jsx` - Added moderator controls
- `StudyBuddy/client/src/components/PostCard.module.css` - Added moderator button styles
- `StudyBuddy/client/src/pages/Home.jsx` - Added moderator action handlers

### Existing (Migration)
- `StudyBuddy/migrations/001_add_profile_columns.sql` - Already includes is_moderator column

## Requirements Traceability

| Requirement | Implementation |
|-------------|----------------|
| 10.1 - Backend supports moderator role flag | Migration adds `is_moderator` column |
| 10.2 - Frontend displays moderator controls | PostCard shows buttons when user is moderator |
| 10.3 - Moderator can see actions on any session | Buttons appear on all sessions for moderators |
| 10.4 - Moderator can delete any session | DELETE endpoint with `@require_moderator` |
| 10.5 - Moderator can close any session | PATCH close endpoint with `@require_moderator` |
| 10.6 - Backend logs moderator actions | Logging in both endpoints |
| 10.7 - Non-moderator attempts rejected | `@require_moderator` returns 403 |
| 20.1 - Role-checking decorator | `@require_auth` decorator |
| 20.2 - Verify user roles | `@require_moderator` decorator |
| 20.3 - Return 403 for unauthorized | All decorators return 403 |
| 20.4 - Frontend hides unauthorized actions | Conditional rendering based on `is_moderator` |
| 20.5 - Backend is authoritative | All checks happen server-side |

## Conclusion

The moderator role feature has been successfully implemented with:
- ✓ Database schema updated
- ✓ Authorization module created and tested
- ✓ Frontend controls added
- ✓ Backend API endpoints created
- ✓ Comprehensive logging implemented
- ✓ Security best practices followed

All sub-tasks (14.1, 14.2, 14.3, 14.4) are complete and ready for integration testing.
