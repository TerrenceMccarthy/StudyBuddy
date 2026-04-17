"""
Integration test for join endpoint with email service.

Verifies that the email service is called with correct parameters.
"""

import unittest
from unittest.mock import patch, call
from app import app


class TestJoinEmailIntegration(unittest.TestCase):
    """Integration tests for join endpoint and email service."""
    
    def setUp(self):
        """Set up test client."""
        self.client = app.test_client()
        self.client.testing = True
    
    @patch('email_service.smtplib.SMTP')
    @patch('email_service.os.getenv')
    def test_email_sent_with_correct_details(self, mock_getenv, mock_smtp):
        """Test that email is sent with correct session and user details."""
        # Mock environment variables for SMTP
        def getenv_side_effect(key, default=None):
            env_vars = {
                'SMTP_HOST': 'smtp.test.com',
                'SMTP_PORT': '587',
                'SMTP_USER': 'test@test.com',
                'SMTP_PASSWORD': 'testpass',
                'SMTP_FROM_EMAIL': 'noreply@studybuddy.app'
            }
            return env_vars.get(key, default)
        
        mock_getenv.side_effect = getenv_side_effect
        
        # Mock SMTP server
        mock_server = mock_smtp.return_value.__enter__.return_value
        
        # Make request to join session
        response = self.client.post(
            '/api/sessions/1/join',
            json={'user_id': 'user_456'}
        )
        
        # Wait a bit for async thread to complete
        import time
        time.sleep(0.5)
        
        # Verify response
        self.assertEqual(response.status_code, 200)
        
        # Verify SMTP was called
        mock_smtp.assert_called_with('smtp.test.com', 587)
        mock_server.starttls.assert_called_once()
        mock_server.login.assert_called_with('test@test.com', 'testpass')
        
        # Verify email was sent
        self.assertTrue(mock_server.send_message.called)
        
        # Get the message that was sent
        sent_message = mock_server.send_message.call_args[0][0]
        
        # Verify email details
        self.assertEqual(sent_message['To'], 'marcus.t@example.com')
        self.assertIn('CSE 3318', sent_message['Subject'])
        
        # Verify email body contains correct information
        import base64
        email_body_encoded = sent_message.get_payload()[0].get_payload()
        email_body = base64.b64decode(email_body_encoded).decode('utf-8')
        self.assertIn('Sarah Johnson', email_body)
        self.assertIn('sarah.j@example.com', email_body)
        self.assertIn('CSE 3318', email_body)
        self.assertIn('Central Library', email_body)


if __name__ == '__main__':
    unittest.main()
