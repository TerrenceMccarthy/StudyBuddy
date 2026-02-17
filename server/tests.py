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