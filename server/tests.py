import pytest
from app import app
from datetime import datetime, timedelta, timezone

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
    future_time = datetime.now(timezone.utc) + timedelta(hours=2)
    new_post = {
        "topic": "CSE 4344 - Networks",
        "course": "CSE 4344 - Networks",
        "subject": "Computer Science",
        "building": "ERB",
        "room": "131",
        "time": future_time.isoformat().replace('+00:00', 'Z'),
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

def test_create_post_with_past_time(client):
    """Test that creating a post with past time returns 400 error."""
    past_time = datetime.now(timezone.utc) - timedelta(hours=1)
    new_post = {
        "course": "CSE 3318",
        "subject": "Computer Science",
        "building": "Central Library",
        "time": past_time.isoformat().replace('+00:00', 'Z'),
        "duration": "2 hours"
    }
    res = client.post("/api/posts", json=new_post)
    assert res.status_code == 400
    data = res.get_json()
    assert "error" in data
    assert "future" in data["error"].lower()
    assert data["field"] == "time"

def test_create_post_missing_required_field(client):
    """Test that creating a post without required fields returns 400 error."""
    future_time = datetime.now(timezone.utc) + timedelta(hours=2)
    new_post = {
        "subject": "Computer Science",
        "building": "Central Library",
        "time": future_time.isoformat().replace('+00:00', 'Z'),
        "duration": "2 hours"
        # Missing 'course' field
    }
    res = client.post("/api/posts", json=new_post)
    assert res.status_code == 400
    data = res.get_json()
    assert "error" in data
    assert data["field"] == "course"

def test_update_post(client):
    """Test updating a post with valid data."""
    future_time = datetime.now(timezone.utc) + timedelta(hours=3)
    update_data = {
        "building": "Engineering Building",
        "time": future_time.isoformat().replace('+00:00', 'Z'),
        "duration": "3 hours"
    }
    res = client.patch("/api/posts/1", json=update_data)
    assert res.status_code == 200
    data = res.get_json()
    assert data["building"] == "Engineering Building"
    assert data["duration"] == "3 hours"

def test_update_post_with_past_time(client):
    """Test that updating a post with past time returns 400 error."""
    past_time = datetime.now(timezone.utc) - timedelta(hours=1)
    update_data = {
        "time": past_time.isoformat().replace('+00:00', 'Z')
    }
    res = client.patch("/api/posts/1", json=update_data)
    assert res.status_code == 400
    data = res.get_json()
    assert "error" in data
    assert "future" in data["error"].lower()
    assert data["field"] == "time"

def test_update_nonexistent_post(client):
    """Test updating a non-existent post returns 404."""
    future_time = datetime.now(timezone.utc) + timedelta(hours=2)
    update_data = {
        "time": future_time.isoformat().replace('+00:00', 'Z')
    }
    res = client.patch("/api/posts/999", json=update_data)
    assert res.status_code == 404
    assert "error" in res.get_json()

def test_update_post_without_time(client):
    """Test updating a post without changing time works."""
    update_data = {
        "building": "New Building",
        "notes": "Updated notes"
    }
    res = client.patch("/api/posts/1", json=update_data)
    assert res.status_code == 200
    data = res.get_json()
    assert data["building"] == "New Building"
