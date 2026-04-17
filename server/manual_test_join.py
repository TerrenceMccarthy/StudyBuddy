"""
Manual test script for the join endpoint.

This script demonstrates how to use the join endpoint.
Run the Flask app first, then run this script.
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_join_endpoint():
    """Test the join endpoint manually."""
    
    print("=" * 60)
    print("Testing Join Session Endpoint")
    print("=" * 60)
    
    # Test 1: Successful join
    print("\n1. Testing successful join...")
    response = requests.post(
        f"{BASE_URL}/api/sessions/1/join",
        json={"user_id": "user_456"}
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    # Test 2: Try to join own session
    print("\n2. Testing join own session (should fail)...")
    response = requests.post(
        f"{BASE_URL}/api/sessions/1/join",
        json={"user_id": "user_123"}
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    # Test 3: Join non-existent session
    print("\n3. Testing join non-existent session (should fail)...")
    response = requests.post(
        f"{BASE_URL}/api/sessions/999/join",
        json={"user_id": "user_456"}
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    # Test 4: Join without user_id
    print("\n4. Testing join without user_id (should fail)...")
    response = requests.post(
        f"{BASE_URL}/api/sessions/1/join",
        json={}
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    print("\n" + "=" * 60)
    print("Tests completed!")
    print("=" * 60)


if __name__ == "__main__":
    try:
        test_join_endpoint()
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to Flask server.")
        print("Please start the Flask app first with: python app.py")
