"""
Validation module for StudyBuddy backend.

This module provides centralized validation logic for session data,
time validation, and file uploads.
"""

from datetime import datetime, timezone
from typing import Dict, Any, Optional


class ValidationError(Exception):
    """Custom exception for validation errors.
    
    Attributes:
        field: The field name that failed validation
        message: Human-readable error message
    """
    
    def __init__(self, field: str, message: str):
        self.field = field
        self.message = message
        super().__init__(f"{field}: {message}")


def validate_session_time(time_str: str) -> bool:
    """Validate that session time is in the future.
    
    Args:
        time_str: ISO format datetime string (e.g., "2024-01-15T19:00:00Z")
        
    Returns:
        True if validation passes
        
    Raises:
        ValidationError: If time is not in the future
    """
    try:
        # Parse ISO format time string, handle both 'Z' and '+00:00' UTC indicators
        session_time = datetime.fromisoformat(time_str.replace('Z', '+00:00'))
        now = datetime.now(timezone.utc)
        
        if session_time <= now:
            raise ValidationError('time', 'Session time must be in the future')
        
        return True
    except ValueError as e:
        raise ValidationError('time', f'Invalid time format: {str(e)}')


def validate_session_data(data: Dict[str, Any]) -> bool:
    """Validate all required session fields.
    
    Args:
        data: Dictionary containing session data
        
    Returns:
        True if all validations pass
        
    Raises:
        ValidationError: If any required field is missing or invalid
    """
    required_fields = ['course', 'subject', 'building', 'time', 'duration']
    
    # Check for required fields
    for field in required_fields:
        if not data.get(field):
            raise ValidationError(field, f'{field} is required')
    
    # Validate session time is in the future
    validate_session_time(data['time'])
    
    return True


def validate_image_file(file_data: Any, max_size_mb: int = 5) -> bool:
    """Validate profile picture file.
    
    Args:
        file_data: File object or file-like object with read() and content_type
        max_size_mb: Maximum file size in megabytes (default: 5MB)
        
    Returns:
        True if validation passes
        
    Raises:
        ValidationError: If file is invalid
    """
    # Check if file exists
    if not file_data:
        raise ValidationError('file', 'No file provided')
    
    # Check file type
    allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    content_type = getattr(file_data, 'content_type', None)
    
    if content_type and content_type not in allowed_types:
        raise ValidationError('file', 'Please select a valid image file (JPEG, PNG, GIF, or WebP)')
    
    # Check file size
    if hasattr(file_data, 'read'):
        # Read file to check size
        file_data.seek(0)
        file_content = file_data.read()
        file_size = len(file_content)
        file_data.seek(0)  # Reset file pointer
        
        max_size_bytes = max_size_mb * 1024 * 1024
        if file_size > max_size_bytes:
            raise ValidationError('file', f'Image must be less than {max_size_mb}MB')
    
    return True
