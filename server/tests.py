import pytest
from app import app

@pytest.fixture
def client():
    with app.test_client() as client:
        yield client

def test_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "ok"
    assert data["app"] == "StudyBuddy"

def test_posts_endpoint(client):
    response = client.get("/api/posts")
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data,list)
    assert len(data) > 0

def test_post_structure(client):
    response = client.get("/api/posts")
    data = response.get_json()[0]

    required_keys = {"id", "topic", "building", "time", "status"}
    assert required_keys.issubset(data.keys())

def test_create_post(client):
    new_post = {
        "topic": "CSE 4344 - Networks",
        "subject": "Computer Science",
        "building": "ERB",
        "room": "131",
        "time": "tomorrow, 3:00 PM",
        "duration": "1.5 hours",
        "author": "Terrence M.",
        "notes": "Review chapter 4"
    }
    res = client.post("/api/posts", json=new_post)
    assert res.status_code == 201
    data = res.get_json()
    assert data["topic"] == "CSE 4344 - Networks"
    assert data["status"] == "open"
    assert "id" in data

def test_accept_post(client):
    res = client.patch("/api/posts/1/accept")
    assert res.status_code == 200
    assert res.get_json()["status"] == "accepted"

def test_accept_nonexistent_post(client):
    res = client.patch("/api/posts/999/accept")
    assert res.status_code == 404 
    assert "error" in res.get_json()