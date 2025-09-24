"""
FastAPI Dependencies for Auth0 JWT Authentication
"""

from fastapi import Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional

from app.auth.jwt_validator import Auth0JWTValidator
from app.auth.user_service import user_auth_service
from app.auth.models import AuthUser
from app.auth.exceptions import (
    MissingTokenException,
    InsufficientPermissionsException,
    UserNotFoundException
)

# Security scheme for bearer token extraction
security = HTTPBearer(auto_error=False)

# Global JWT validator instance
jwt_validator = Auth0JWTValidator()


def get_bearer_token(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> str:
    """
    Extract bearer token from Authorization header

    Returns:
        str: JWT token

    Raises:
        MissingTokenException: No token provided
    """
    if not credentials or not credentials.credentials:
        raise MissingTokenException()

    return credentials.credentials


async def get_auth0_user_id(token: str = Depends(get_bearer_token)) -> str:
    """
    Validate JWT token and extract Auth0 user_id

    Args:
        token: JWT token from Authorization header

    Returns:
        str: Auth0 user_id

    Raises:
        InvalidTokenException: Token validation failed
        ExpiredTokenException: Token expired
    """
    return jwt_validator.get_auth0_user_id(token)


async def get_current_user(auth0_user_id: str = Depends(get_auth0_user_id)) -> AuthUser:
    """
    Get current authenticated user from database

    Args:
        auth0_user_id: Auth0 user_id from validated token

    Returns:
        AuthUser: Authenticated user

    Raises:
        UserNotFoundException: User not found in database
    """
    return await user_auth_service.get_user_by_auth_id(auth0_user_id)


async def get_current_active_user(user: AuthUser = Depends(get_current_user)) -> AuthUser:
    """
    Get current authenticated and active user

    Args:
        user: Authenticated user

    Returns:
        AuthUser: Active authenticated user

    Raises:
        InsufficientPermissionsException: User is not active
    """
    if not user.is_active:
        raise InsufficientPermissionsException("User account is inactive")

    return user


async def get_admin_user(user: AuthUser = Depends(get_current_active_user)) -> AuthUser:
    """
    Require user to have admin permissions using internal is_admin column

    Args:
        user: Authenticated active user

    Returns:
        AuthUser: Admin user

    Raises:
        InsufficientPermissionsException: User is not admin
    """
    if not user.is_admin:
        raise InsufficientPermissionsException("Admin privileges required")

    return user


# Optional dependency for endpoints that may have authenticated users
async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[AuthUser]:
    """
    Optional authentication dependency - returns None if no valid token

    Returns:
        AuthUser | None: Authenticated user or None
    """
    if not credentials or not credentials.credentials:
        return None

    try:
        auth0_user_id = jwt_validator.get_auth0_user_id(credentials.credentials)
        return await user_auth_service.get_user_by_auth_id(auth0_user_id)
    except Exception:
        # Return None for any authentication failures in optional mode
        return None