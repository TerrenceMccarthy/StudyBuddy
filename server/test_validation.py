"""
Unit tests for validation module.

Tests cover all validation functions including:
- ValidationError class
- validate_session_time()
- validate_session_data()
- validate_image_file()
"""

import pytest
from datetime import datetime, timedelta, timezone
from io import BytesIO
from validation import ValidationError, validate_session_time, validate_session_data, validate_image_file


class TestValidationError:
    """Tests for ValidationError class."""
    
    def test_validation_error_attributes(self):
        """Test that ValidationError stores field and message correctly."""
        error = ValidationError('email', 'Invalid email format')
        assert error.field == 'email'
        assert error.message == 'Invalid email format'
    
    def test_validation_error_string_representation(self):
        """Test that ValidationError has correct string representation."""
        error = ValidationError('time', 'Must be in future')
        assert str(error) == 'time: Must be in future'


class TestValidateSessionTime:
    """Tests for validate_session_time function."""
    
    def test_future_time_valid(self):
        """Test that future time passes validation."""
        future_time = datetime.now(timezone.utc) + timedelta(hours=2)
        time_str = future_time.isoformat().replace('+00:00', 'Z')
        
        result = validate_session_time(time_str)
        assert result is True
    
    def test_past_time_invalid(self):
        """Test that past time raises ValidationError."""
        past_time = datetime.now(timezone.utc) - timedelta(hours=1)
        time_str = past_time.isoformat().replace('+00:00', 'Z')
        
        with pytest.raises(ValidationError) as exc_info:
            validate_session_time(time_str)
        
        assert exc_info.value.field == 'time'
        assert 'must be in the future' in exc_info.value.message.lower()
    
    def test_current_time_invalid(self):
        """Test that current time (now) raises ValidationError."""
        now = datetime.now(timezone.utc)
        time_str = now.isoformat().replace('+00:00', 'Z')
        
        with pytest.raises(ValidationError) as exc_info:
            validate_session_time(time_str)
        
        assert exc_info.value.field == 'time'
    
    def test_accepts_z_suffix(self):
        """Test that time string with 'Z' suffix is accepted."""
        future_time = datetime.now(timezone.utc) + timedelta(days=1)
        time_str = future_time.strftime('%Y-%m-%dT%H:%M:%SZ')
        
        result = validate_session_time(time_str)
        assert result is True
    
    def test_accepts_plus_zero_zero_suffix(self):
        """Test that time string with '+00:00' suffix is accepted."""
        future_time = datetime.now(timezone.utc) + timedelta(days=1)
        time_str = future_time.isoformat()
        
        result = validate_session_time(time_str)
        assert result is True
    
    def test_invalid_format_raises_error(self):
        """Test that invalid time format raises ValidationError."""
        with pytest.raises(ValidationError) as exc_info:
            validate_session_time('not-a-valid-time')
        
        assert exc_info.value.field == 'time'
        assert 'invalid time format' in exc_info.value.message.lower()
    
    def test_empty_string_raises_error(self):
        """Test that empty string raises ValidationError."""
        with pytest.raises(ValidationError) as exc_info:
            validate_session_time('')
        
        assert exc_info.value.field == 'time'


class TestValidateSessionData:
    """Tests for validate_session_data function."""
    
    def test_valid_session_data(self):
        """Test that valid session data passes validation."""
        future_time = datetime.now(timezone.utc) + timedelta(hours=3)
        data = {
            'course': 'CSE 3318',
            'subject': 'Computer Science',
            'building': 'Central Library',
            'time': future_time.isoformat().replace('+00:00', 'Z'),
            'duration': '2 hours'
        }
        
        result = validate_session_data(data)
        assert result is True
    
    def test_missing_course_raises_error(self):
        """Test that missing course field raises ValidationError."""
        future_time = datetime.now(timezone.utc) + timedelta(hours=3)
        data = {
            'subject': 'Computer Science',
            'building': 'Central Library',
            'time': future_time.isoformat().replace('+00:00', 'Z'),
            'duration': '2 hours'
        }
        
        with pytest.raises(ValidationError) as exc_info:
            validate_session_data(data)
        
        assert exc_info.value.field == 'course'
        assert 'required' in exc_info.value.message.lower()
    
    def test_missing_subject_raises_error(self):
        """Test that missing subject field raises ValidationError."""
        future_time = datetime.now(timezone.utc) + timedelta(hours=3)
        data = {
            'course': 'CSE 3318',
            'building': 'Central Library',
            'time': future_time.isoformat().replace('+00:00', 'Z'),
            'duration': '2 hours'
        }
        
        with pytest.raises(ValidationError) as exc_info:
            validate_session_data(data)
        
        assert exc_info.value.field == 'subject'
    
    def test_missing_building_raises_error(self):
        """Test that missing building field raises ValidationError."""
        future_time = datetime.now(timezone.utc) + timedelta(hours=3)
        data = {
            'course': 'CSE 3318',
            'subject': 'Computer Science',
            'time': future_time.isoformat().replace('+00:00', 'Z'),
            'duration': '2 hours'
        }
        
        with pytest.raises(ValidationError) as exc_info:
            validate_session_data(data)
        
        assert exc_info.value.field == 'building'
    
    def test_missing_time_raises_error(self):
        """Test that missing time field raises ValidationError."""
        data = {
            'course': 'CSE 3318',
            'subject': 'Computer Science',
            'building': 'Central Library',
            'duration': '2 hours'
        }
        
        with pytest.raises(ValidationError) as exc_info:
            validate_session_data(data)
        
        assert exc_info.value.field == 'time'
    
    def test_missing_duration_raises_error(self):
        """Test that missing duration field raises ValidationError."""
        future_time = datetime.now(timezone.utc) + timedelta(hours=3)
        data = {
            'course': 'CSE 3318',
            'subject': 'Computer Science',
            'building': 'Central Library',
            'time': future_time.isoformat().replace('+00:00', 'Z')
        }
        
        with pytest.raises(ValidationError) as exc_info:
            validate_session_data(data)
        
        assert exc_info.value.field == 'duration'
    
    def test_empty_course_raises_error(self):
        """Test that empty course string raises ValidationError."""
        future_time = datetime.now(timezone.utc) + timedelta(hours=3)
        data = {
            'course': '',
            'subject': 'Computer Science',
            'building': 'Central Library',
            'time': future_time.isoformat().replace('+00:00', 'Z'),
            'duration': '2 hours'
        }
        
        with pytest.raises(ValidationError) as exc_info:
            validate_session_data(data)
        
        assert exc_info.value.field == 'course'
    
    def test_past_time_in_session_data_raises_error(self):
        """Test that past time in session data raises ValidationError."""
        past_time = datetime.now(timezone.utc) - timedelta(hours=1)
        data = {
            'course': 'CSE 3318',
            'subject': 'Computer Science',
            'building': 'Central Library',
            'time': past_time.isoformat().replace('+00:00', 'Z'),
            'duration': '2 hours'
        }
        
        with pytest.raises(ValidationError) as exc_info:
            validate_session_data(data)
        
        assert exc_info.value.field == 'time'
        assert 'future' in exc_info.value.message.lower()
    
    def test_none_values_raise_error(self):
        """Test that None values for required fields raise ValidationError."""
        future_time = datetime.now(timezone.utc) + timedelta(hours=3)
        data = {
            'course': None,
            'subject': 'Computer Science',
            'building': 'Central Library',
            'time': future_time.isoformat().replace('+00:00', 'Z'),
            'duration': '2 hours'
        }
        
        with pytest.raises(ValidationError) as exc_info:
            validate_session_data(data)
        
        assert exc_info.value.field == 'course'


class MockFile:
    """Mock file object for testing."""
    
    def __init__(self, content: bytes, content_type: str):
        self.content = content
        self.content_type = content_type
        self._position = 0
    
    def read(self):
        """Read file content."""
        return self.content[self._position:]
    
    def seek(self, position: int):
        """Seek to position in file."""
        self._position = position


class TestValidateImageFile:
    """Tests for validate_image_file function."""
    
    def test_valid_jpeg_file(self):
        """Test that valid JPEG file passes validation."""
        # Create a small mock JPEG file (under 5MB)
        file_content = b'fake jpeg content' * 100
        mock_file = MockFile(file_content, 'image/jpeg')
        
        result = validate_image_file(mock_file)
        assert result is True
    
    def test_valid_png_file(self):
        """Test that valid PNG file passes validation."""
        file_content = b'fake png content' * 100
        mock_file = MockFile(file_content, 'image/png')
        
        result = validate_image_file(mock_file)
        assert result is True
    
    def test_valid_gif_file(self):
        """Test that valid GIF file passes validation."""
        file_content = b'fake gif content' * 100
        mock_file = MockFile(file_content, 'image/gif')
        
        result = validate_image_file(mock_file)
        assert result is True
    
    def test_valid_webp_file(self):
        """Test that valid WebP file passes validation."""
        file_content = b'fake webp content' * 100
        mock_file = MockFile(file_content, 'image/webp')
        
        result = validate_image_file(mock_file)
        assert result is True
    
    def test_jpg_extension_accepted(self):
        """Test that 'image/jpg' content type is accepted."""
        file_content = b'fake jpg content' * 100
        mock_file = MockFile(file_content, 'image/jpg')
        
        result = validate_image_file(mock_file)
        assert result is True
    
    def test_invalid_file_type_raises_error(self):
        """Test that non-image file type raises ValidationError."""
        file_content = b'fake pdf content'
        mock_file = MockFile(file_content, 'application/pdf')
        
        with pytest.raises(ValidationError) as exc_info:
            validate_image_file(mock_file)
        
        assert exc_info.value.field == 'file'
        assert 'valid image file' in exc_info.value.message.lower()
    
    def test_file_too_large_raises_error(self):
        """Test that file larger than 5MB raises ValidationError."""
        # Create a file larger than 5MB
        file_content = b'x' * (6 * 1024 * 1024)  # 6MB
        mock_file = MockFile(file_content, 'image/jpeg')
        
        with pytest.raises(ValidationError) as exc_info:
            validate_image_file(mock_file)
        
        assert exc_info.value.field == 'file'
        assert '5mb' in exc_info.value.message.lower()
    
    def test_file_exactly_5mb_passes(self):
        """Test that file exactly 5MB passes validation."""
        # Create a file exactly 5MB
        file_content = b'x' * (5 * 1024 * 1024)
        mock_file = MockFile(file_content, 'image/jpeg')
        
        result = validate_image_file(mock_file)
        assert result is True
    
    def test_no_file_provided_raises_error(self):
        """Test that None file raises ValidationError."""
        with pytest.raises(ValidationError) as exc_info:
            validate_image_file(None)
        
        assert exc_info.value.field == 'file'
        assert 'no file provided' in exc_info.value.message.lower()
    
    def test_custom_max_size(self):
        """Test that custom max size parameter works."""
        # Create a 2MB file
        file_content = b'x' * (2 * 1024 * 1024)
        mock_file = MockFile(file_content, 'image/jpeg')
        
        # Should pass with 5MB limit
        result = validate_image_file(mock_file, max_size_mb=5)
        assert result is True
        
        # Should fail with 1MB limit
        with pytest.raises(ValidationError) as exc_info:
            validate_image_file(mock_file, max_size_mb=1)
        
        assert exc_info.value.field == 'file'
        assert '1mb' in exc_info.value.message.lower()
    
    def test_file_pointer_reset_after_validation(self):
        """Test that file pointer is reset to beginning after validation."""
        file_content = b'test content'
        mock_file = MockFile(file_content, 'image/jpeg')
        
        validate_image_file(mock_file)
        
        # File pointer should be at beginning
        assert mock_file._position == 0
        assert mock_file.read() == file_content
