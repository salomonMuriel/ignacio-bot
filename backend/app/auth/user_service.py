"""
User Authentication Service
Handles mapping between Auth0 users and internal users
"""

from uuid import UUID
from typing import Optional
import logging

from app.services.database import db_service
from app.auth.models import AuthUser
from app.auth.exceptions import UserNotFoundException
from app.models.database import UserCreate

logger = logging.getLogger(__name__)


class UserAuthService:
    """Service for mapping Auth0 users to internal users"""

    async def get_user_by_auth_id(self, auth_user_id: str, user_profile: Optional[dict] = None) -> AuthUser:
        """
        Get internal user by Auth0 user_id, creating if not found (JIT creation)

        Args:
            auth_user_id: Auth0 user_id from JWT token
            user_profile: Optional user profile data for JIT creation

        Returns:
            AuthUser: Internal user mapped from database

        Raises:
            UserNotFoundException: User creation failed after multiple attempts
        """
        try:
            # First try to get existing user
            user_data = await db_service.get_user_by_auth_id(auth_user_id)

            if user_data:
                # Convert to AuthUser model
                auth_user = AuthUser(
                    id=user_data.id,
                    auth_user_id=user_data.auth_user_id,
                    phone_number=user_data.phone_number,
                    name=user_data.name,
                    is_admin=user_data.is_admin or False,
                    is_active=user_data.is_active
                )

                logger.debug(f"Successfully retrieved existing user: {auth_user.id} for auth_id: {auth_user_id}")
                return auth_user

            # User doesn't exist, create via JIT
            logger.info(f"User not found for auth_user_id: {auth_user_id}, creating via JIT")
            return await self._create_user_jit(auth_user_id, user_profile or {})

        except UserNotFoundException:
            raise

        except Exception as e:
            logger.error(f"Error retrieving user by auth_id {auth_user_id}: {str(e)}")
            raise UserNotFoundException() from e

    async def _create_user_jit(self, auth_user_id: str, user_profile: dict) -> AuthUser:
        """
        Create user via Just-In-Time (JIT) provisioning

        Args:
            auth_user_id: Auth0 user_id
            user_profile: User profile data from Auth0 token

        Returns:
            AuthUser: Newly created user

        Raises:
            UserNotFoundException: User creation failed
        """
        try:
            # Extract user information from profile
            name = user_profile.get("name") or user_profile.get("nickname")
            phone_number = user_profile.get("phone_number", "")

            # If no phone number in profile, try email as fallback
            if not phone_number and user_profile.get("email"):
                phone_number = user_profile["email"]

            # Create user data
            user_create = UserCreate(
                auth_user_id=auth_user_id,
                name=name,
                phone_number=phone_number,
                is_admin=False,
                is_active=True
            )

            # Create user in database
            user_data = await db_service.create_user(user_create)

            # Convert to AuthUser model
            auth_user = AuthUser(
                id=user_data.id,
                auth_user_id=user_data.auth_user_id,
                phone_number=user_data.phone_number,
                name=user_data.name,
                is_admin=user_data.is_admin or False,
                is_active=user_data.is_active
            )

            logger.info(f"Successfully created JIT user: {auth_user.id} for auth_id: {auth_user_id}")
            return auth_user

        except Exception as e:
            # Handle potential race condition - try to get user again
            try:
                user_data = await db_service.get_user_by_auth_id(auth_user_id)
                if user_data:
                    logger.info(f"User created by concurrent request for auth_id: {auth_user_id}")
                    return AuthUser(
                        id=user_data.id,
                        auth_user_id=user_data.auth_user_id,
                        phone_number=user_data.phone_number,
                        name=user_data.name,
                        is_admin=user_data.is_admin or False,
                        is_active=user_data.is_active
                    )
            except Exception:
                pass

            logger.error(f"Failed to create JIT user for auth_id {auth_user_id}: {str(e)}")
            raise UserNotFoundException() from e

    async def get_user_by_id(self, user_id: UUID) -> AuthUser:
        """
        Get internal user by internal user ID

        Args:
            user_id: Internal user UUID

        Returns:
            AuthUser: Internal user from database

        Raises:
            UserNotFoundException: User not found in database
        """
        try:
            user_data = await db_service.get_user_by_id(user_id)

            if not user_data:
                logger.warning(f"User not found for user_id: {user_id}")
                raise UserNotFoundException()

            auth_user = AuthUser(
                id=user_data["id"],
                auth_user_id=user_data["auth_user_id"],
                phone_number=user_data["phone_number"],
                name=user_data["name"],
                is_admin=user_data["is_admin"] or False,
                is_active=user_data["is_active"]
            )

            return auth_user

        except UserNotFoundException:
            raise

        except Exception as e:
            logger.error(f"Error retrieving user by id {user_id}: {str(e)}")
            raise UserNotFoundException() from e


# Global service instance
user_auth_service = UserAuthService()
