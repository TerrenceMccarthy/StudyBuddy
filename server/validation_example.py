"""
Example usage of the validation module in Flask endpoints.

This demonstrates how to integrate the validation module with Flask routes.
"""

from datetime import datetime, timedelta, timezone
from validation import ValidationError, validate_session_data, validate_image_file


def example_create_session_endpoint():
    """Example of using validation in a POST /api/sessions endpoint."""
    
    # Simulated request data
    request_data = {
        'course': 'CSE 3318',
        'subject': 'Computer Science',
        'building': 'Central Library',
        'time': (datetime.now(timezone.utc) + timedelta(hours=2)).isoformat(),
        'duration': '2 hours'
    }
    
    try:
        # Validate the session data
        validate_session_data(request_data)
        
        # If validation passes, create the session
        print("✓ Validation passed - session would be created")
        return {'status': 'success', 'data': request_data}, 201
        
    except ValidationError as e:
        # Return validation error to client
        print(f"✗ Validation failed: {e.field} - {e.message}")
        return {
            'error': e.message,
            'field': e.field,
            'code': 'VALIDATION_ERROR'
        }, 400


def example_upload_profile_picture_endpoint():
    """Example of using validation in a POST /api/profiles/:id/upload-picture endpoint."""
    
    # Simulated file upload
    class MockFile:
        def __init__(self):
            self.content_type = 'image/jpeg'
            self._content = b'fake image data' * 100
            self._position = 0
        
        def read(self):
            return self._content[self._position:]
        
        def seek(self, position):
            self._position = position
    
    file_data = MockFile()
    
    try:
        # Validate the image file
        validate_image_file(file_data)
        
        # If validation passes, upload the file
        print("✓ File validation passed - image would be uploaded")
        return {'status': 'success', 'url': 'https://example.com/profile.jpg'}, 200
        
    except ValidationError as e:
        # Return validation error to client
        print(f"✗ File validation failed: {e.field} - {e.message}")
        return {
            'error': e.message,
            'field': e.field,
            'code': 'VALIDATION_ERROR'
        }, 400


def example_invalid_session():
    """Example of validation catching an invalid session."""
    
    # Session with past time
    past_time = datetime.now(timezone.utc) - timedelta(hours=1)
    request_data = {
        'course': 'CSE 3318',
        'subject': 'Computer Science',
        'building': 'Central Library',
        'time': past_time.isoformat(),
        'duration': '2 hours'
    }
    
    try:
        validate_session_data(request_data)
        print("✓ Validation passed")
        
    except ValidationError as e:
        print(f"✗ Validation failed as expected: {e.field} - {e.message}")
        return {
            'error': e.message,
            'field': e.field,
            'code': 'VALIDATION_ERROR'
        }, 400


if __name__ == '__main__':
    print("=== Example 1: Valid session creation ===")
    example_create_session_endpoint()
    
    print("\n=== Example 2: Valid profile picture upload ===")
    example_upload_profile_picture_endpoint()
    
    print("\n=== Example 3: Invalid session (past time) ===")
    example_invalid_session()
