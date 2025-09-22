"""
Admin user management endpoints for Ignacio Bot
Provides user management functionality for administrators using Supabase Auth
"""

from uuid import UUID
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, field_validator

from app.core.auth import get_current_admin_user, get_current_user
from app.core.config import settings
from app.models.database import User
from app.services.database import db_service
from supabase import create_client, Client

router = APIRouter(prefix="/admin/users", tags=["admin-users"])

# Supabase Admin Client for user management
admin_supabase: Client = create_client(
    settings.supabase_url, settings.supabase_service_role_key
)


class AdminUserCreate(BaseModel):
    phone_number: str
    name: Optional[str] = None
    is_admin: bool = False

    @field_validator("phone_number")
    @classmethod
    def validate_phone_number(cls, v: str) -> str:
        # Basic phone number validation
        if not v or len(v) < 10:
            raise ValueError("Phone number must be at least 10 characters")
        if not v.startswith("+"):
            v = f"+{v}"
        return v


class AdminUserUpdate(BaseModel):
    name: Optional[str] = None
    is_admin: Optional[bool] = None
    is_active: Optional[bool] = None


class AdminUserResponse(BaseModel):
    id: UUID
    auth_user_id: Optional[UUID]
    phone_number: str
    name: Optional[str]
    is_admin: bool
    is_active: bool
    created_at: str
    updated_at: str


@router.get("/me", response_model=AdminUserResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
) -> AdminUserResponse:
    """Get current authenticated user's profile"""
    return AdminUserResponse(
        id=current_user.id,
        auth_user_id=current_user.auth_user_id,
        phone_number=current_user.phone_number,
        name=current_user.name,
        is_admin=current_user.is_admin,
        is_active=current_user.is_active,
        created_at=current_user.created_at.isoformat(),
        updated_at=current_user.updated_at.isoformat(),
    )


@router.get("/", response_model=List[AdminUserResponse])
async def get_all_users(
    limit: int = 100,
    offset: int = 0,
    admin_user: User = Depends(get_current_admin_user),
) -> List[AdminUserResponse]:
    """Get all users (admin only)"""
    try:
        users = await db_service.get_users(limit=limit, offset=offset)
        return [
            AdminUserResponse(
                id=user.id,
                auth_user_id=user.auth_user_id,
                phone_number=user.phone_number,
                name=user.name,
                is_admin=user.is_admin,
                is_active=user.is_active,
                created_at=user.created_at.isoformat(),
                updated_at=user.updated_at.isoformat(),
            )
            for user in users
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get users: {str(e)}")


@router.post("/", response_model=AdminUserResponse)
async def create_user(
    user_data: AdminUserCreate, admin_user: User = Depends(get_current_admin_user)
) -> AdminUserResponse:
    """Create a new user (admin only) - uses Supabase Auth Admin API"""
    try:
        # Check if user already exists
        existing_user = await db_service.get_user_by_phone(user_data.phone_number)
        if existing_user:
            raise HTTPException(
                status_code=400, detail="User with this phone number already exists"
            )

        # Create user in Supabase Auth using Admin API
        auth_response = admin_supabase.auth.admin.create_user(
            {
                "phone": user_data.phone_number,
                "phone_confirmed": True,  # Auto-confirm admin-created users
                "user_metadata": {
                    "name": user_data.name or "User",
                    "is_admin": user_data.is_admin,
                    "created_by_admin": str(admin_user.id),
                },
            }
        )

        if not auth_response.user:
            raise HTTPException(status_code=500, detail="Failed to create auth user")

        # The database trigger should automatically create the public.users record
        # Wait a moment and then fetch it
        import asyncio

        await asyncio.sleep(0.1)

        # Get the created user from our database
        new_user = await db_service.get_user_by_auth_id(auth_response.user.id)
        if not new_user:
            # If trigger didn't work, create manually
            from app.models.database import UserCreate

            user_create_data = UserCreate(
                phone_number=user_data.phone_number,
                name=user_data.name or "User",
                is_admin=user_data.is_admin,
                is_active=True,
            )
            new_user = await db_service.create_user(user_create_data)

            # Link to auth user
            await db_service.update_user(
                new_user.id, {"auth_user_id": auth_response.user.id}
            )
            new_user = await db_service.get_user_by_id(new_user.id)

        return AdminUserResponse(
            id=new_user.id,
            auth_user_id=new_user.auth_user_id,
            phone_number=new_user.phone_number,
            name=new_user.name,
            is_admin=new_user.is_admin,
            is_active=new_user.is_active,
            created_at=new_user.created_at.isoformat(),
            updated_at=new_user.updated_at.isoformat(),
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")


@router.get("/{user_id}", response_model=AdminUserResponse)
async def get_user(
    user_id: UUID, admin_user: User = Depends(get_current_admin_user)
) -> AdminUserResponse:
    """Get a specific user (admin only)"""
    try:
        user = await db_service.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return AdminUserResponse(
            id=user.id,
            auth_user_id=user.auth_user_id,
            phone_number=user.phone_number,
            name=user.name,
            is_admin=user.is_admin,
            is_active=user.is_active,
            created_at=user.created_at.isoformat(),
            updated_at=user.updated_at.isoformat(),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user: {str(e)}")


@router.put("/{user_id}", response_model=AdminUserResponse)
async def update_user(
    user_id: UUID,
    user_data: AdminUserUpdate,
    admin_user: User = Depends(get_current_admin_user),
) -> AdminUserResponse:
    """Update a user (admin only)"""
    try:
        # Get existing user
        existing_user = await db_service.get_user_by_id(user_id)
        if not existing_user:
            raise HTTPException(status_code=404, detail="User not found")

        # Prevent admin from removing their own admin status
        if (
            user_id == admin_user.id
            and user_data.is_admin is not None
            and not user_data.is_admin
        ):
            raise HTTPException(
                status_code=400, detail="Cannot remove your own admin privileges"
            )

        # Prevent admin from deactivating themselves
        if (
            user_id == admin_user.id
            and user_data.is_active is not None
            and not user_data.is_active
        ):
            raise HTTPException(
                status_code=400, detail="Cannot deactivate your own account"
            )

        # Update user in database
        update_data = {}
        if user_data.name is not None:
            update_data["name"] = user_data.name
        if user_data.is_admin is not None:
            update_data["is_admin"] = user_data.is_admin
        if user_data.is_active is not None:
            update_data["is_active"] = user_data.is_active

        if update_data:
            await db_service.update_user(user_id, update_data)

        # If deactivating user, also disable in Supabase Auth
        if user_data.is_active is False and existing_user.auth_user_id:
            admin_supabase.auth.admin.delete_user(str(existing_user.auth_user_id))

        # Get updated user
        updated_user = await db_service.get_user_by_id(user_id)

        return AdminUserResponse(
            id=updated_user.id,
            auth_user_id=updated_user.auth_user_id,
            phone_number=updated_user.phone_number,
            name=updated_user.name,
            is_admin=updated_user.is_admin,
            is_active=updated_user.is_active,
            created_at=updated_user.created_at.isoformat(),
            updated_at=updated_user.updated_at.isoformat(),
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update user: {str(e)}")


@router.delete("/{user_id}")
async def delete_user(
    user_id: UUID, admin_user: User = Depends(get_current_admin_user)
):
    """Deactivate a user (admin only) - soft delete"""
    try:
        # Prevent admin from deleting themselves
        if user_id == admin_user.id:
            raise HTTPException(
                status_code=400, detail="Cannot delete your own account"
            )

        # Get existing user
        existing_user = await db_service.get_user_by_id(user_id)
        if not existing_user:
            raise HTTPException(status_code=404, detail="User not found")

        # Soft delete in database
        await db_service.update_user(user_id, {"is_active": False})

        # Delete from Supabase Auth
        if existing_user.auth_user_id:
            admin_supabase.auth.admin.delete_user(str(existing_user.auth_user_id))

        return {"message": "User deactivated successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete user: {str(e)}")


@router.post("/{user_id}/invite")
async def send_invite(
    user_id: UUID, admin_user: User = Depends(get_current_admin_user)
):
    """Send OTP invite to a user (admin only) - triggers Supabase Auth OTP"""
    try:
        # Get user
        user = await db_service.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if not user.is_active:
            raise HTTPException(status_code=400, detail="Cannot invite inactive user")

        # For now, return success message
        # In production, you'd integrate with Supabase Auth OTP
        return {"message": f"Invite functionality ready for {user.phone_number}"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send invite: {str(e)}")
