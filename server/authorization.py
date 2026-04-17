"""
Authorization module for StudyBuddy application.

This module provides decorators for role-based access control:
- require_auth: Ensures user is authenticated
- require_moderator: Ensures user has moderator role
- require_ownership_or_moderator: Ensures user owns resource or is moderator

Requirements: 10.4, 10.5, 10.7, 20.1, 20.2, 20.3
"""

from functools import wraps
from flask import request, jsonify
import os
from supabase import create_client, Client

# Initialize Supabase client
SUPABASE_URL = os.environ.get('SUPABASE_URL', '')
SUPABASE_SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_KEY', '')
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY) if SUPABASE_URL else None


def verify_supabase_token(auth_header):
    """
    Verify Supabase JWT token and return user data.
    
    Args:
        auth_header: Authorization header value (e.g., "Bearer <token>")
    
    Returns:
        dict: User data including id, email, and is_moderator flag
        None: If token is invalid or user not found
    """
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header.replace('Bearer ', '')
    
    try:
        # Verify JWT token with Supabase
        if not supabase:
            # Fallback for testing without Supabase
            return None
        
        # Get user from token
        user_response = supabase.auth.get_user(token)
        if not user_response or not user_response.user:
            return None
        
        user_id = user_response.user.id
        
        # Fetch user profile to get is_moderator flag
        profile_response = supabase.table('profiles').select('*').eq('id', user_id).single().execute()
        
        if not profile_response.data:
            return None
        
        return {
            'id': user_id,
            'email': user_response.user.email,
            'is_moderator': profile_response.data.get('is_moderator', False)
        }
    
    except Exception as e:
        print(f"Token verification error: {e}")
        return None


def require_auth(f):
    """
    Decorator to require authentication.
    
    Verifies the user has a valid JWT token and injects user data
    into the decorated function.
    
    Requirements: 20.1
    
    Usage:
        @app.route('/api/protected')
        @require_auth
        def protected_route(user):
            return jsonify(user_id=user['id'])
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify(error='Unauthorized: No authorization header'), 401
        
        user = verify_supabase_token(auth_header)
        
        if not user:
            return jsonify(error='Unauthorized: Invalid token'), 401
        
        return f(user=user, *args, **kwargs)
    
    return decorated


def require_moderator(f):
    """
    Decorator to require moderator role.
    
    Must be used in combination with @require_auth.
    Verifies the authenticated user has moderator privileges.
    
    Requirements: 10.4, 10.5, 20.2
    
    Usage:
        @app.route('/api/moderation/action')
        @require_auth
        @require_moderator
        def moderator_action(user):
            return jsonify(message='Moderator action performed')
    """
    @wraps(f)
    def decorated(user, *args, **kwargs):
        if not user.get('is_moderator'):
            return jsonify(error='Forbidden: Moderator access required'), 403
        
        return f(user=user, *args, **kwargs)
    
    return decorated


def require_ownership_or_moderator(resource_type='post'):
    """
    Decorator factory to require ownership or moderator role.
    
    Must be used in combination with @require_auth.
    Verifies the authenticated user either owns the resource or is a moderator.
    
    Requirements: 10.7, 20.3
    
    Args:
        resource_type: Type of resource to check ownership for ('post', 'profile', etc.)
    
    Usage:
        @app.route('/api/sessions/<int:session_id>')
        @require_auth
        @require_ownership_or_moderator('post')
        def edit_session(user, session_id):
            return jsonify(message='Session updated')
    """
    def decorator(f):
        @wraps(f)
        def decorated(user, *args, **kwargs):
            # Extract resource ID from kwargs
            resource_id = kwargs.get(f'{resource_type}_id') or kwargs.get('session_id') or kwargs.get('id')
            
            if not resource_id:
                return jsonify(error='Bad Request: Resource ID not provided'), 400
            
            # Check if user is moderator (bypass ownership check)
            if user.get('is_moderator'):
                return f(user=user, *args, **kwargs)
            
            # Check ownership based on resource type
            if resource_type == 'post' or resource_type == 'session':
                # Fetch post/session from database
                if not supabase:
                    return jsonify(error='Service unavailable'), 503
                
                try:
                    post_response = supabase.table('posts').select('user_id').eq('id', resource_id).single().execute()
                    
                    if not post_response.data:
                        return jsonify(error='Resource not found'), 404
                    
                    if post_response.data['user_id'] != user['id']:
                        return jsonify(error='Forbidden: Not authorized to access this resource'), 403
                
                except Exception as e:
                    print(f"Ownership check error: {e}")
                    return jsonify(error='Internal server error'), 500
            
            elif resource_type == 'profile':
                # For profiles, resource_id should match user_id
                if str(resource_id) != str(user['id']):
                    return jsonify(error='Forbidden: Not authorized to access this profile'), 403
            
            return f(user=user, *args, **kwargs)
        
        return decorated
    
    return decorator


def get_post_owner(post_id):
    """
    Helper function to get post owner ID.
    
    Args:
        post_id: ID of the post
    
    Returns:
        str: User ID of post owner
        None: If post not found
    """
    if not supabase:
        return None
    
    try:
        post_response = supabase.table('posts').select('user_id').eq('id', post_id).single().execute()
        return post_response.data['user_id'] if post_response.data else None
    except Exception:
        return None
