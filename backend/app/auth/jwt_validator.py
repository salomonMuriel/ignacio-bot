"""
Auth0 JWT Token Validator
Based on modern FastAPI + Auth0 best practices
"""

import jwt
from jwt import PyJWKClient
from typing import Dict, Any
import logging

from app.core.config import settings
from app.auth.exceptions import InvalidTokenException, ExpiredTokenException
from app.auth.models import TokenPayload

logger = logging.getLogger(__name__)


class Auth0JWTValidator:
    """Validates Auth0 JWT tokens using RS256 algorithm"""

    def __init__(self):
        self.domain = settings.auth0_domain
        self.audience = settings.auth0_audience
        self.issuer = f"https://{self.domain}/"
        self.algorithm = "RS256"
        self.jwks_uri = f"{self.issuer}.well-known/jwks.json"

        # Initialize PyJWKClient for fetching Auth0 public keys
        self._jwks_client = PyJWKClient(self.jwks_uri)

    def validate_token(self, token: str) -> TokenPayload:
        """
        Validate Auth0 JWT token and return payload

        Args:
            token: JWT token string

        Returns:
            TokenPayload: Validated token payload

        Raises:
            InvalidTokenException: Token is malformed or invalid
            ExpiredTokenException: Token has expired
        """
        try:
            # Get the signing key from Auth0's JWKS endpoint
            signing_key = self._jwks_client.get_signing_key_from_jwt(token).key

            # Decode and validate the token
            payload = jwt.decode(
                token,
                signing_key,
                algorithms=[self.algorithm],
                audience=self.audience,
                issuer=self.issuer,
                options={
                    "verify_signature": True,
                    "verify_exp": True,
                    "verify_aud": True,
                    "verify_iss": True,
                }
            )

            logger.debug(f"Successfully validated token for user: {payload.get('sub', 'unknown')}")

            return TokenPayload(**payload)

        except jwt.ExpiredSignatureError:
            logger.warning("Token validation failed: expired signature")
            raise ExpiredTokenException()

        except jwt.InvalidTokenError as e:
            logger.warning(f"Token validation failed: {str(e)}")
            raise InvalidTokenException()

        except Exception as e:
            logger.error(f"Unexpected error during token validation: {str(e)}")
            raise InvalidTokenException()

    def get_auth0_user_id(self, token: str) -> str:
        """
        Extract Auth0 user_id from token

        Args:
            token: JWT token string

        Returns:
            str: Auth0 user_id from token 'sub' claim
        """
        payload = self.validate_token(token)
        return payload.sub