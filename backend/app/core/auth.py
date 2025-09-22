"""
Authentication middleware and utilities for Supabase Auth integration
"""

import os
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

from app.core.config import settings
from app.models.database import User
from app.services.database import db_service

# HTTP Bearer token scheme
security = HTTPBearer()

# JWT Configuration
SUPABASE_JWT_SECRET = settings.supabase_jwt_secret
ALGORITHM = "HS256"


class AuthError(HTTPException):
    """Custom authentication error"""

    def __init__(self, detail: str = "Could not validate credentials"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )


def verify_jwt_token(token: str) -> dict:
    """
    Verify and decode Supabase JWT token

    Args:
        token: JWT token string

    Returns:
        Decoded token payload

    Raises:
        AuthError: If token is invalid
    """
    try:
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=[ALGORITHM],
            audience="authenticated",  # Supabase specific
        )

        # Extract user ID from 'sub' claim
        user_id = payload.get("sub")
        if user_id is None:
            raise AuthError("Token missing user ID")

        return payload

    except JWTError as e:
        raise AuthError(f"Invalid token: {str(e)}")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> User:
    """
    Dependency to get current authenticated user

    Args:
        credentials: HTTP Bearer credentials from request

    Returns:
        Current user from database

    Raises:
        AuthError: If user not found or inactive
    """
    # Verify token
    payload = verify_jwt_token(credentials.credentials)
    auth_user_id = payload.get("sub")

    # Get user from database
    user = await db_service.get_user_by_auth_id(auth_user_id)
    if not user:
        raise AuthError("User not found")

    if not user.is_active:
        raise AuthError("User account is inactive")

    return user


async def get_current_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Dependency to ensure current user is an admin

    Args:
        current_user: Current authenticated user

    Returns:
        Current user (verified as admin)

    Raises:
        AuthError: If user is not an admin
    """
    if not current_user.is_admin:
        raise AuthError("Admin privileges required")

    return current_user


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(
        HTTPBearer(auto_error=False)
    ),
) -> Optional[User]:
    """
    Optional authentication dependency - returns None if no token provided

    Args:
        credentials: Optional HTTP Bearer credentials

    Returns:
        Current user if authenticated, None otherwise
    """
    if not credentials:
        return None

    try:
        return await get_current_user(credentials)
    except AuthError:
        return None


def get_user_from_phone(phone_number: str) -> Optional[User]:
    """
    Get user by phone number (for WhatsApp authentication)

    Args:
        phone_number: Phone number to look up

    Returns:
        User if found, None otherwise
    """
    return db_service.get_user_by_phone(format_phone_number(phone_number))


def format_phone_number(phone: str) -> str:
    """
    Format phone number for consistent storage and lookup

    Args:
        phone: Raw phone number

    Returns:
        Formatted phone number
    """
    # Remove common prefixes and formatting
    clean_phone = (
        phone.replace("whatsapp:", "")
        .replace("+", "")
        .replace("-", "")
        .replace(" ", "")
        .replace(".", "")
    )

    return clean_phone
