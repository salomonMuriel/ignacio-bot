"""
Custom authentication exceptions for Auth0 JWT validation
"""

from fastapi import HTTPException, status


class AuthenticationException(HTTPException):
    """Base authentication exception"""
    pass


class InvalidTokenException(AuthenticationException):
    """Raised when JWT token is invalid or malformed"""

    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )


class ExpiredTokenException(AuthenticationException):
    """Raised when JWT token has expired"""

    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )


class MissingTokenException(AuthenticationException):
    """Raised when no authentication token is provided"""

    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required",
            headers={"WWW-Authenticate": "Bearer"},
        )


class UserNotFoundException(AuthenticationException):
    """Raised when authenticated user is not found in database"""

    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found in system",
        )


class InsufficientPermissionsException(AuthenticationException):
    """Raised when user doesn't have required permissions"""

    def __init__(self, detail: str = "Insufficient permissions"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
        )