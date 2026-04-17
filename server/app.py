from flask import Flask, jsonify, request
from flask_cors import CORS
from validation import validate_session_data, validate_session_time, ValidationError
from email_service import send_join_notification
from authorization import require_auth, require_moderator
import threading
import logging
from datetime import datetime

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])

# Configure logging for moderator actions
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# hard coded data for posts (replace with a real DB later)
posts = [
    {
        "id": 1,
        "topic": "CSE 3318 — Algorithms & Data Structures",
        "subject": "Computer Science",
        "building": "Central Library",
        "room": "Study Room 4B",
        "time": "Today, 7:00 PM",
        "duration": "2 hours",
        "status": "open",
        "author": "Marcus T.",
        "user_id": "user_123",  # Mock user ID for session owner
        "notes": "Focusing on graph traversal and dynamic programming. Bring your notes!",
    }
]

# Mock user data (replace with real DB later)
users = {
    "user_123": {
        "id": "user_123",
        "name": "Marcus T.",
        "email": "marcus.t@example.com"
    },
    "user_456": {
        "id": "user_456",
        "name": "Sarah Johnson",
        "email": "sarah.j@example.com"
    }
}

@app.get("/api/health")
def health():
    return jsonify(status="ok", app="StudyBuddy")

@app.get("/api/posts")
def get_posts():
    return jsonify(posts)

@app.post("/api/posts")
def create_post():
    data = request.get_json()
    
    # Validate session data
    try:
        validate_session_data(data)
    except ValidationError as e:
        return jsonify(error=e.message, field=e.field), 400
    
    new_post = {
        "id": len(posts) + 1,
        "status": "open",
        **data
    }
    posts.append(new_post)
    return jsonify(new_post), 201

@app.patch("/api/posts/<int:post_id>")
def update_post(post_id):
    post = next((p for p in posts if p["id"] == post_id), None)
    if not post:
        return jsonify(error="Post not found"), 404
    
    data = request.get_json()
    
    # Validate session time if time is being updated
    if 'time' in data:
        try:
            validate_session_time(data['time'])
        except ValidationError as e:
            return jsonify(error=e.message, field=e.field), 400
    
    # Update post with new data
    post.update(data)
    return jsonify(post)

@app.patch("/api/posts/<int:post_id>/accept")
def accept_post(post_id):
    post = next((p for p in posts if p["id"] == post_id), None)
    if not post:
        return jsonify(error="Post not found"), 404
    post["status"] = "accepted"
    return jsonify(post)

@app.post("/api/sessions/<int:session_id>/join")
def join_session(session_id):
    """
    Join a session endpoint.
    
    Allows a user to join a study session and sends an email notification
    to the session owner asynchronously.
    """
    # Find the session (using posts array for now)
    session = next((p for p in posts if p["id"] == session_id), None)
    if not session:
        return jsonify(error="Session not found"), 404
    
    # Get joiner details from request body
    data = request.get_json()
    joiner_id = data.get('user_id')
    
    if not joiner_id:
        return jsonify(error="User ID is required", field="user_id"), 400
    
    # Check if user is trying to join their own session
    if session.get('user_id') == joiner_id:
        return jsonify(error="Cannot join your own session"), 400
    
    # Get joiner details
    joiner = users.get(joiner_id)
    if not joiner:
        return jsonify(error="User not found"), 404
    
    # Get session owner details
    owner_id = session.get('user_id')
    owner = users.get(owner_id)
    
    if not owner:
        return jsonify(error="Session owner not found"), 404
    
    # Prepare session details for email
    session_details = {
        'course': session.get('topic', 'N/A'),
        'time': session.get('time', 'N/A'),
        'building': session.get('building', 'N/A')
    }
    
    # Send email notification asynchronously
    # This ensures the join action completes even if email fails
    def send_email_async():
        send_join_notification(
            session_owner_email=owner['email'],
            joiner_name=joiner['name'],
            joiner_email=joiner['email'],
            session_details=session_details
        )
    
    # Start email sending in background thread
    email_thread = threading.Thread(target=send_email_async)
    email_thread.daemon = True
    email_thread.start()
    
    # Update session status if needed (e.g., mark as matched)
    # For now, we'll just return success
    
    return jsonify({
        "message": "Successfully joined session",
        "session_id": session_id,
        "joiner": joiner['name']
    }), 200


# Moderation endpoints
# Requirements: 10.4, 10.5, 10.6, 20.5

@app.delete("/api/moderation/sessions/<int:session_id>")
@require_auth
@require_moderator
def moderator_delete_session(user, session_id):
    """
    Moderator endpoint to delete any session.
    
    Allows moderators to remove inappropriate or problematic sessions.
    Logs all moderator actions for audit purposes.
    
    Requirements: 10.4, 10.5, 10.6, 20.5
    """
    # Find the session
    session = next((p for p in posts if p["id"] == session_id), None)
    if not session:
        return jsonify(error="Session not found"), 404
    
    # Log moderator action
    logger.info(
        f"MODERATOR_ACTION: User {user['id']} ({user['email']}) deleted session {session_id} "
        f"at {datetime.utcnow().isoformat()}. "
        f"Session details: {session.get('topic', 'N/A')} by user {session.get('user_id', 'N/A')}"
    )
    
    # Remove session from posts
    posts.remove(session)
    
    return jsonify({
        "message": "Session deleted by moderator",
        "session_id": session_id,
        "moderator_id": user['id']
    }), 200


@app.patch("/api/moderation/sessions/<int:session_id>/close")
@require_auth
@require_moderator
def moderator_close_session(user, session_id):
    """
    Moderator endpoint to close any session.
    
    Allows moderators to close sessions that should no longer accept participants.
    Logs all moderator actions for audit purposes.
    
    Requirements: 10.5, 10.6, 20.5
    """
    # Find the session
    session = next((p for p in posts if p["id"] == session_id), None)
    if not session:
        return jsonify(error="Session not found"), 404
    
    # Log moderator action
    logger.info(
        f"MODERATOR_ACTION: User {user['id']} ({user['email']}) closed session {session_id} "
        f"at {datetime.utcnow().isoformat()}. "
        f"Session details: {session.get('topic', 'N/A')} by user {session.get('user_id', 'N/A')}"
    )
    
    # Update session status to closed
    session['status'] = 'closed'
    
    return jsonify({
        "message": "Session closed by moderator",
        "session_id": session_id,
        "moderator_id": user['id'],
        "session": session
    }), 200

if __name__ == "__main__":
    app.run(debug=True, port=5000)