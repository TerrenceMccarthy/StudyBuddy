# Backend Validation Module

## Overview

This module provides centralized validation logic for the StudyBuddy backend, implementing requirements 1.2, 1.5, 9.2, 9.3, 19.1, and 19.2.

## Files Created

1. **validation.py** - Core validation module
2. **test_validation.py** - Comprehensive unit tests (29 tests, all passing)
3. **validation_example.py** - Usage examples for Flask integration

## Components

### ValidationError Class

Custom exception class for validation errors with structured error information:
- `field`: The field name that failed validation
- `message`: Human-readable error message

### validate_session_time(time_str)

Validates that a session time is in the future.

**Parameters:**
- `time_str`: ISO format datetime string (e.g., "2024-01-15T19:00:00Z")

**Returns:** `True` if validation passes

**Raises:** `ValidationError` if time is not in the future or format is invalid

**Addresses Requirements:**
- 1.2: Backend SHALL reject requests with past times
- 1.5: Backend SHALL validate session time as authoritative check
- 19.1: Backend SHALL define validation rules in centralized module

### validate_session_data(data)

Validates all required session fields and ensures time is in the future.

**Parameters:**
- `data`: Dictionary containing session data

**Required Fields:**
- `course`: Course name/number
- `subject`: Subject area
- `building`: Location building
- `time`: ISO format datetime string
- `duration`: Session duration

**Returns:** `True` if all validations pass

**Raises:** `ValidationError` if any required field is missing or invalid

**Addresses Requirements:**
- 1.2: Backend SHALL reject requests with past times
- 1.5: Backend SHALL validate session time as authoritative check
- 19.1: Backend SHALL define validation rules in centralized module
- 19.3: Backend validation rules SHALL be authoritative source of truth

### validate_image_file(file_data, max_size_mb=5)

Validates profile picture uploads.

**Parameters:**
- `file_data`: File object with `read()`, `seek()`, and `content_type` attributes
- `max_size_mb`: Maximum file size in megabytes (default: 5MB)

**Validation Rules:**
- File must exist
- Content type must be image format (JPEG, JPG, PNG, GIF, WebP)
- File size must be less than max_size_mb

**Returns:** `True` if validation passes

**Raises:** `ValidationError` if file is invalid

**Addresses Requirements:**
- 9.2: Frontend SHALL validate file type is an image format
- 9.3: Frontend SHALL validate file size is less than 5MB
- 19.1: Backend SHALL define validation rules in centralized module
- 19.3: Backend validation rules SHALL be authoritative source of truth

## Usage in Flask Endpoints

### Example: Create Session Endpoint

```python
from flask import Flask, request, jsonify
from validation import ValidationError, validate_session_data

@app.post("/api/sessions")
def create_session():
    data = request.get_json()
    
    try:
        # Validate session data
        validate_session_data(data)
        
        # Create session in database
        session = create_session_in_db(data)
        return jsonify(session), 201
        
    except ValidationError as e:
        return jsonify({
            'error': e.message,
            'field': e.field,
            'code': 'VALIDATION_ERROR'
        }), 400
```

### Example: Upload Profile Picture Endpoint

```python
from flask import Flask, request, jsonify
from validation import ValidationError, validate_image_file

@app.post("/api/profiles/<user_id>/upload-picture")
def upload_profile_picture(user_id):
    file = request.files.get('file')
    
    try:
        # Validate image file
        validate_image_file(file)
        
        # Upload to storage
        url = upload_to_storage(file, user_id)
        return jsonify({'url': url}), 200
        
    except ValidationError as e:
        return jsonify({
            'error': e.message,
            'field': e.field,
            'code': 'VALIDATION_ERROR'
        }), 400
```

## Test Coverage

The module includes 29 comprehensive unit tests covering:

### ValidationError Tests (2 tests)
- Attribute storage
- String representation

### validate_session_time Tests (7 tests)
- Future time validation (passes)
- Past time validation (fails)
- Current time validation (fails)
- 'Z' suffix format support
- '+00:00' suffix format support
- Invalid format handling
- Empty string handling

### validate_session_data Tests (9 tests)
- Valid complete session data
- Missing required fields (course, subject, building, time, duration)
- Empty string values
- Past time in session data
- None values

### validate_image_file Tests (11 tests)
- Valid image formats (JPEG, JPG, PNG, GIF, WebP)
- Invalid file types
- File size validation (too large, exactly 5MB)
- No file provided
- Custom max size parameter
- File pointer reset after validation

## Requirements Traceability

| Requirement | Implementation |
|-------------|----------------|
| 1.2 - Backend rejects past times | `validate_session_time()` raises ValidationError for past times |
| 1.5 - Backend authoritative validation | All validation functions in centralized module |
| 9.2 - Validate image file type | `validate_image_file()` checks content_type |
| 9.3 - Validate file size < 5MB | `validate_image_file()` checks file size |
| 19.1 - Centralized validation module | All validation in `validation.py` |
| 19.2 - Frontend validation utility | Backend provides authoritative rules for frontend to match |

## Running Tests

```bash
cd StudyBuddy/server
python -m pytest test_validation.py -v
```

All 29 tests pass successfully.

## Integration Notes

1. **Error Handling**: All validation functions raise `ValidationError` with structured field and message information
2. **Timezone Handling**: All time validation uses UTC timezone for consistency
3. **File Validation**: File pointer is reset after validation so file can be read again
4. **Extensibility**: Easy to add new validation functions following the same pattern
5. **Type Hints**: All functions include type hints for better IDE support

## Next Steps

To integrate this module into the Flask application:

1. Import validation functions in `app.py`
2. Add validation to POST `/api/sessions` endpoint
3. Add validation to PATCH `/api/sessions/:id` endpoint
4. Add validation to POST `/api/profiles/:id/upload-picture` endpoint
5. Return consistent error responses using ValidationError attributes
