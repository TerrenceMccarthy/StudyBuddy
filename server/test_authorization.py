"""
Unit tests for authorization module.

Tests the decorators and authorization logic for:
- require_auth
- require_moderator
- require_ownership_or_moderator

Requirements: 10.4, 10.5, 10.7, 20.1, 20.2, 20.3
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from flask import Flask, jsonify
from authorization import require_auth, require_moderator, require_ownership_or_moderator


@pytest.fixture
def app():
    """Create a test Flask app"""
    app = Flask(__name__)
    app.config['TESTING'] = True
    return app


@pytest.fixture
def client(app):
    """Create a test client"""
    return app.test_client()


def test_require_auth_no_header(app, client):
    """Test require_auth decorator rejects requests without Authorization header"""
    @app.route('/test')
    @require_auth
    def test_route(user):
        return jsonify(user_id=user['id'])
    
    response = client.get('/test')
    assert response.status_code == 401
    data = response.get_json()
    assert 'Unauthorized' in data['error']


def test_require_auth_invalid_token(app, client):
    """Test require_auth decorator rejects requests with invalid token"""
    with patch('authorization.verify_supabase_token', return_value=None):
        @app.route('/test')
        @require_auth
        def test_route(user):
            return jsonify(user_id=user['id'])
        
        response = client.get('/test', headers={'Authorization': 'Bearer invalid_token'})
        assert response.status_code == 401
        data = response.get_json()
        assert 'Invalid token' in data['error']


def test_require_auth_valid_token(app, client):
    """Test require_auth decorator allows requests with valid token"""
    mock_user = {'id': 'user_123', 'email': 'test@example.com', 'is_moderator': False}
    
    with patch('authorization.verify_supabase_token', return_value=mock_user):
        @app.route('/test')
        @require_auth
        def test_route(user):
            return jsonify(user_id=user['id'])
        
        response = client.get('/test', headers={'Authorization': 'Bearer valid_token'})
        assert response.status_code == 200
        data = response.get_json()
        assert data['user_id'] == 'user_123'


def test_require_moderator_non_moderator(app, client):
    """Test require_moderator decorator rejects non-moderator users"""
    mock_user = {'id': 'user_123', 'email': 'test@example.com', 'is_moderator': False}
    
    with patch('authorization.verify_supabase_token', return_value=mock_user):
        @app.route('/test')
        @require_auth
        @require_moderator
        def test_route(user):
            return jsonify(message='Success')
        
        response = client.get('/test', headers={'Authorization': 'Bearer valid_token'})
        assert response.status_code == 403
        data = response.get_json()
        assert 'Moderator access required' in data['error']


def test_require_moderator_with_moderator(app, client):
    """Test require_moderator decorator allows moderator users"""
    mock_user = {'id': 'mod_123', 'email': 'mod@example.com', 'is_moderator': True}
    
    with patch('authorization.verify_supabase_token', return_value=mock_user):
        @app.route('/test')
        @require_auth
        @require_moderator
        def test_route(user):
            return jsonify(message='Success')
        
        response = client.get('/test', headers={'Authorization': 'Bearer valid_token'})
        assert response.status_code == 200
        data = response.get_json()
        assert data['message'] == 'Success'


def test_require_ownership_or_moderator_owner(app, client):
    """Test require_ownership_or_moderator allows resource owner"""
    mock_user = {'id': 'user_123', 'email': 'test@example.com', 'is_moderator': False}
    mock_post = {'user_id': 'user_123', 'id': 1}
    
    with patch('authorization.verify_supabase_token', return_value=mock_user):
        with patch('authorization.supabase') as mock_supabase:
            # Mock the Supabase query chain
            mock_response = MagicMock()
            mock_response.data = mock_post
            mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_response
            
            @app.route('/test/<int:session_id>')
            @require_auth
            @require_ownership_or_moderator('post')
            def test_route(user, session_id):
                return jsonify(message='Success')
            
            response = client.get('/test/1', headers={'Authorization': 'Bearer valid_token'})
            assert response.status_code == 200


def test_require_ownership_or_moderator_moderator(app, client):
    """Test require_ownership_or_moderator allows moderator regardless of ownership"""
    mock_user = {'id': 'mod_123', 'email': 'mod@example.com', 'is_moderator': True}
    
    with patch('authorization.verify_supabase_token', return_value=mock_user):
        @app.route('/test/<int:session_id>')
        @require_auth
        @require_ownership_or_moderator('post')
        def test_route(user, session_id):
            return jsonify(message='Success')
        
        response = client.get('/test/1', headers={'Authorization': 'Bearer valid_token'})
        assert response.status_code == 200


def test_require_ownership_or_moderator_not_owner(app, client):
    """Test require_ownership_or_moderator rejects non-owner non-moderator"""
    mock_user = {'id': 'user_456', 'email': 'test@example.com', 'is_moderator': False}
    mock_post = {'user_id': 'user_123', 'id': 1}
    
    with patch('authorization.verify_supabase_token', return_value=mock_user):
        with patch('authorization.supabase') as mock_supabase:
            # Mock the Supabase query chain
            mock_response = MagicMock()
            mock_response.data = mock_post
            mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_response
            
            @app.route('/test/<int:session_id>')
            @require_auth
            @require_ownership_or_moderator('post')
            def test_route(user, session_id):
                return jsonify(message='Success')
            
            response = client.get('/test/1', headers={'Authorization': 'Bearer valid_token'})
            assert response.status_code == 403
            data = response.get_json()
            assert 'Not authorized' in data['error']


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
