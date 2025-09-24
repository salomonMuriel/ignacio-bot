"""
User profile management endpoints
"""

from app.models.database import UserUpdate
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import logging

from app.auth.dependencies import get_current_user
from app.auth.models import AuthUser
from app.services.database import db_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["users"])


class MissingFields(BaseModel):
    name: bool
    phone_number: bool

class ProfileCompletionStatusResponse(BaseModel):
    is_complete: bool
    missing_fields: MissingFields

@router.put("/profile")
async def update_profile(
    profile_data: UserUpdate,
    current_user: AuthUser = Depends(get_current_user)
):
    """Update user profile information"""

    try:
        # Update user in database by unpacking the update_data dictionary
        # as keyword arguments. This is cleaner and more scalable.
        updated_user = await db_service.update_user(
            user_id=current_user.id,
            user_data=profile_data
        )

        if not updated_user:
            raise HTTPException(status_code=404, detail="User not found")

        return {
            "message": "Profile updated successfully",
            "user": {
                "id": str(updated_user.id),
                "name": updated_user.name,
                "phone_number": updated_user.phone_number,
                "email": updated_user.email,
                "is_admin": updated_user.is_admin,
                "is_active": updated_user.is_active
            }
        }

    except Exception as e:
        logger.error(f"Failed to update profile for user {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update profile") from e


@router.get("/profile", response_model=AuthUser)
async def get_profile(current_user: AuthUser = Depends(get_current_user)):
    """Get current user profile"""
    return current_user


@router.get("/profile/completion-status")
async def get_profile_completion_status(current_user: AuthUser = Depends(get_current_user)) -> ProfileCompletionStatusResponse:
    """Check if user profile is complete (has name and phone)"""
    is_complete = (
        current_user.name and current_user.name.strip() and
        current_user.phone_number and current_user.phone_number.strip()
    )


    return {
        "is_complete": bool(is_complete),
        "missing_fields": {
            "name": not bool(current_user.name and current_user.name.strip()),
            "phone_number": not bool(current_user.phone_number and current_user.phone_number.strip())
        }
    }
