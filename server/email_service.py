"""
Email service module for StudyBuddy.

Handles sending email notifications for various events.
"""

import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any
import os

logger = logging.getLogger(__name__)


def send_join_notification(
    session_owner_email: str,
    joiner_name: str,
    joiner_email: str,
    session_details: Dict[str, Any]
) -> bool:
    """
    Send email notification when someone joins a session.
    
    Args:
        session_owner_email: Email of the session owner
        joiner_name: Name of the person joining
        joiner_email: Email of the person joining
        session_details: Dictionary with session info (course, time, building)
        
    Returns:
        True if email sent successfully, False otherwise
    """
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f'Someone joined your study session: {session_details.get("course", "")}'
        msg['From'] = os.getenv('SMTP_FROM_EMAIL', 'noreply@studybuddy.app')
        msg['To'] = session_owner_email
        
        # Plain text version
        text = f"""
Hi!

{joiner_name} ({joiner_email}) has joined your study session:

Course: {session_details.get('course', 'N/A')}
Time: {session_details.get('time', 'N/A')}
Location: {session_details.get('building', 'N/A')}

You can reach out to coordinate details.

- StudyBuddy Team
"""
        
        # HTML version
        html = f"""
<html>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2d7a6b;">Someone joined your study session!</h2>
      <p><strong>{joiner_name}</strong> ({joiner_email}) has joined your session:</p>
      <div style="background: #f5f0e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Course:</strong> {session_details.get('course', 'N/A')}</p>
        <p style="margin: 5px 0;"><strong>Time:</strong> {session_details.get('time', 'N/A')}</p>
        <p style="margin: 5px 0;"><strong>Location:</strong> {session_details.get('building', 'N/A')}</p>
      </div>
      <p>You can reach out to coordinate details.</p>
      <p style="color: #888; font-size: 0.9em; margin-top: 30px;">- StudyBuddy Team</p>
    </div>
  </body>
</html>
"""
        
        # Attach both versions
        msg.attach(MIMEText(text, 'plain'))
        msg.attach(MIMEText(html, 'html'))
        
        # Send email (async in production)
        smtp_host = os.getenv('SMTP_HOST', 'localhost')
        smtp_port = int(os.getenv('SMTP_PORT', '587'))
        smtp_user = os.getenv('SMTP_USER')
        smtp_password = os.getenv('SMTP_PASSWORD')
        
        # Only attempt to send if SMTP is configured
        if smtp_user and smtp_password:
            with smtplib.SMTP(smtp_host, smtp_port) as server:
                server.starttls()
                server.login(smtp_user, smtp_password)
                server.send_message(msg)
            
            logger.info(f'Join notification sent to {session_owner_email}')
            return True
        else:
            logger.warning('SMTP not configured, email not sent (dev mode)')
            return False
            
    except Exception as e:
        logger.error(f'Failed to send join notification: {e}')
        # Don't raise - email failure shouldn't block join action
        return False
