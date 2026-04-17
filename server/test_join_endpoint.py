"""
Test for the join session endpoint.

Tests that the join endpoint correctly integrates with the email service.
"""

import unittest
from unittest.mock import patch, MagicMock
from app import app, posts, users


class TestJoinEndpoint(unittest.TestCase):
    """Test cases for the join session endpoint."""
    
    def setUp(self):
        """Set up test client."""
        self.client = app.test_client()
        self.client.testing = True
    
    @patch('app.threading.Thread')
    @patch('app.send_join_notification')
    def test_join_session_success(self, mock_send_email, mock_thread):
        """Test successful join with email notification."""
        # Mock the thread to not actually start
        mock_thread_instance = MagicMock()
        mock_thread.return_value = mock_thread_instance
        
        # Make request to join session
        response = self.client.post(
            '/api/sessions/1/join',
            json={'user_id': 'user_456'}
        )
        
        # Check response
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['message'], 'Successfully joined session')
        self.assertEqual(data['session_id'], 1)
        self.assertEqual(data['joiner'], 'Sarah Johnson')
        
        # Verify thread was created and started
        mock_thread.assert_called_once()
        mock_thread_instance.start.assert_called_once()
    
    def test_join_session_not_found(self):
        """Test joining non-existent session."""
        response = self.client.post(
            '/api/sessions/999/join',
            json={'user_id': 'user_456'}
        )
        
        self.assertEqual(response.status_code, 404)
        data = response.get_json()
        self.assertEqual(data['error'], 'Session not found')
    
    def test_join_own_session(self):
        """Test that user cannot join their own session."""
        response = self.client.post(
            '/api/sessions/1/join',
            json={'user_id': 'user_123'}
        )
        
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertEqual(data['error'], 'Cannot join your own session')
    
    def test_join_without_user_id(self):
        """Test joining without providing user_id."""
        response = self.client.post(
            '/api/sessions/1/join',
            json={}
        )
        
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertEqual(data['error'], 'User ID is required')
        self.assertEqual(data['field'], 'user_id')
    
    def test_join_with_invalid_user(self):
        """Test joining with non-existent user."""
        response = self.client.post(
            '/api/sessions/1/join',
            json={'user_id': 'user_999'}
        )
        
        self.assertEqual(response.status_code, 404)
        data = response.get_json()
        self.assertEqual(data['error'], 'User not found')
    
    @patch('app.threading.Thread')
    def test_join_completes_even_if_email_fails(self, mock_thread):
        """Test that join action completes even if email sending fails."""
        # Mock the thread to not actually start (simulating async behavior)
        mock_thread_instance = MagicMock()
        mock_thread.return_value = mock_thread_instance
        
        # Make request - should succeed regardless of email status
        response = self.client.post(
            '/api/sessions/1/join',
            json={'user_id': 'user_456'}
        )
        
        # Join should succeed even if email fails in background
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['message'], 'Successfully joined session')
        
        # Verify thread was created (email sent asynchronously)
        mock_thread.assert_called_once()
        mock_thread_instance.start.assert_called_once()


if __name__ == '__main__':
    unittest.main()
