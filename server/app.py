from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)

CORS(app, origins=["http://localhost:5173"])

@app.get("/api/health")
def health():
    return jsonify(status="ok", app="StudyBuddy")

@app.get("/api/posts")
def posts():
    return jsonify([
        {
            "id": 1, 
            "topic": "CSE3380 Alrogithms and data structures",
            "building": "Library",
            "time": "7:00PM",
            "status": "open"      
        }
    ])

if __name__ == "__main__":
    app.run(debug=True, port=5000)

    