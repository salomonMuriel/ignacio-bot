"""
Auth-related data models
"""

from pydantic import BaseModel
from uuid import UUID


class AuthUser(BaseModel):
    """Represents an authenticated user"""
    id: UUID
    auth_user_id: str
    phone_number: str | None
    name: str | None
    is_admin: bool
    is_active: bool


class TokenPayload(BaseModel):
    """JWT token payload structure"""
    sub: str  # Auth0 user_id
    aud: str | list[str]  # Audience
    iss: str  # Issuer
    exp: int  # Expiration timestamp
    iat: int  # Issued at timestamp