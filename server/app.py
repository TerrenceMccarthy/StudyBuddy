from flask import Flask, jsonify, request
from flask_cors import CORS
from validation import validate_session_data, validate_session_time, ValidationError

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])

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
        "notes": "Focusing on graph traversal and dynamic programming. Bring your notes!",
    }
]

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

if __name__ == "__main__":
    app.run(debug=True, port=5000)