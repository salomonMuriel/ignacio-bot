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

logger = logging.getLogger(__name__)


class UserAuthService:
    """Service for mapping Auth0 users to internal users"""

    async def get_user_by_auth_id(self, auth_user_id: str) -> AuthUser:
        """
        Get internal user by Auth0 user_id

        Args:
            auth_user_id: Auth0 user_id from JWT token

        Returns:
            AuthUser: Internal user mapped from database

        Raises:
            UserNotFoundException: User not found in database
        """
        try:
            # Query user by auth_user_id
            user_data = await db_service.fetch_one(
                """
                SELECT id, auth_user_id, phone_number, name, is_admin, is_active
                FROM users
                WHERE auth_user_id = $1 AND is_active = true
                """,
                auth_user_id
            )

            if not user_data:
                logger.warning(f"User not found for auth_user_id: {auth_user_id}")
                raise UserNotFoundException()

            # Convert to AuthUser model
            auth_user = AuthUser(
                id=user_data["id"],
                auth_user_id=user_data["auth_user_id"],
                phone_number=user_data["phone_number"],
                name=user_data["name"],
                is_admin=user_data["is_admin"] or False,
                is_active=user_data["is_active"]
            )

            logger.debug(f"Successfully retrieved user: {auth_user.id} for auth_id: {auth_user_id}")
            return auth_user

        except UserNotFoundException:
            raise

        except Exception as e:
            logger.error(f"Error retrieving user by auth_id {auth_user_id}: {str(e)}")
            raise UserNotFoundException()

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
            user_data = await db_service.fetch_one(
                """
                SELECT id, auth_user_id, phone_number, name, is_admin, is_active
                FROM users
                WHERE id = $1 AND is_active = true
                """,
                user_id
            )

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
            raise UserNotFoundException()


# Global service instance
user_auth_service = UserAuthService()