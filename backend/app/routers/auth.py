from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from supertokens_python.recipe.session import SessionContainer
from supertokens_python.recipe.session.framework.fastapi import verify_session
from supertokens_python.recipe.userroles.asyncio import add_role_to_user, create_new_role_or_add_permissions, get_roles_for_user, delete_role, remove_user_role, get_all_roles
from supertokens_python.recipe.multifactorauth.asyncio import get_factors_setup_for_user
from supertokens_python.asyncio import get_user, get_users_oldest_first, delete_user

router = APIRouter()


class SessionInfoResponse(BaseModel):
    session_handle: str
    user_id: str
    access_token_payload: Dict[str, Any]
    user_roles: list[str]
    factors_setup: list[str]


class UserInfoResponse(BaseModel):
    user_id: str
    email: Optional[str] = None
    phone_number: Optional[str] = None
    user_roles: list[str]
    factors_setup: list[str]


@router.get("/sessioninfo", response_model=SessionInfoResponse)
async def get_session_info(session: SessionContainer = Depends(verify_session())):
    """Get information about the current session."""
    try:
        # Get user roles
        user_roles_response = await get_roles_for_user(session.get_user_id())
        user_roles = user_roles_response.roles if user_roles_response.status == "OK" else []

        # Get factors setup for user
        factors_response = await get_factors_setup_for_user(session.get_user_id())
        factors_setup = factors_response.factors if factors_response.status == "OK" else []

        return SessionInfoResponse(
            session_handle=session.get_handle(),
            user_id=session.get_user_id(),
            access_token_payload=session.get_access_token_payload(),
            user_roles=user_roles,
            factors_setup=factors_setup,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get session info: {str(e)}")


@router.get("/user-info", response_model=UserInfoResponse)
async def get_user_info(session: SessionContainer = Depends(verify_session())):
    """Get detailed information about the current user."""
    try:
        user_id = session.get_user_id()

        # Get user details
        user = await get_user(user_id)
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")

        # Get user roles
        user_roles_response = await get_roles_for_user(user_id)
        user_roles = user_roles_response.roles if user_roles_response.status == "OK" else []

        # Get factors setup for user
        factors_response = await get_factors_setup_for_user(user_id)
        factors_setup = factors_response.factors if factors_response.status == "OK" else []

        # Extract email and phone from user object
        email = None
        phone_number = None

        if hasattr(user, 'login_methods') and user.login_methods:
            for login_method in user.login_methods:
                if hasattr(login_method, 'email') and login_method.email:
                    email = login_method.email
                if hasattr(login_method, 'phone_number') and login_method.phone_number:
                    phone_number = login_method.phone_number

        return UserInfoResponse(
            user_id=user_id,
            email=email,
            phone_number=phone_number,
            user_roles=user_roles,
            factors_setup=factors_setup,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user info: {str(e)}")


class AdminActionResponse(BaseModel):
    success: bool
    message: str


@router.post("/admin/create-role", response_model=AdminActionResponse)
async def create_role(
    role: str,
    permissions: list[str] = [],
    session: SessionContainer = Depends(verify_session()),
):
    """Create a new role with optional permissions. Requires admin role."""
    try:
        # Check if user has admin role
        user_roles_response = await get_roles_for_user(session.get_user_id())
        if user_roles_response.status != "OK" or "admin" not in user_roles_response.roles:
            raise HTTPException(status_code=403, detail="Admin role required")

        # Create role
        response = await create_new_role_or_add_permissions(role, permissions)
        if response.status == "OK":
            return AdminActionResponse(success=True, message=f"Role '{role}' created successfully")
        else:
            return AdminActionResponse(success=False, message=f"Failed to create role: {response.status}")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create role: {str(e)}")


@router.post("/admin/assign-role", response_model=AdminActionResponse)
async def assign_role_to_user(
    user_id: str,
    role: str,
    session: SessionContainer = Depends(verify_session()),
):
    """Assign a role to a user. Requires admin role."""
    try:
        # Check if user has admin role
        user_roles_response = await get_roles_for_user(session.get_user_id())
        if user_roles_response.status != "OK" or "admin" not in user_roles_response.roles:
            raise HTTPException(status_code=403, detail="Admin role required")

        # Assign role to user
        response = await add_role_to_user(user_id, role)
        if response.status == "OK":
            return AdminActionResponse(success=True, message=f"Role '{role}' assigned to user {user_id}")
        elif response.status == "UNKNOWN_ROLE_ERROR":
            raise HTTPException(status_code=400, detail=f"Role '{role}' does not exist")
        else:
            return AdminActionResponse(success=False, message=f"Failed to assign role: {response.status}")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to assign role: {str(e)}")


@router.delete("/admin/delete-role", response_model=AdminActionResponse)
async def delete_role_endpoint(
    role: str,
    session: SessionContainer = Depends(verify_session()),
):
    """Delete a role. Requires admin role."""
    try:
        # Check if user has admin role
        user_roles_response = await get_roles_for_user(session.get_user_id())
        if user_roles_response.status != "OK" or "admin" not in user_roles_response.roles:
            raise HTTPException(status_code=403, detail="Admin role required")

        # Delete role
        response = await delete_role(role)
        if response.status == "OK":
            return AdminActionResponse(success=True, message=f"Role '{role}' deleted successfully")
        else:
            return AdminActionResponse(success=False, message=f"Failed to delete role: {response.status}")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete role: {str(e)}")


class UserListItem(BaseModel):
    user_id: str
    email: Optional[str] = None
    phone_number: Optional[str] = None
    user_roles: list[str]
    time_joined: int


class UserListResponse(BaseModel):
    users: list[UserListItem]
    next_pagination_token: Optional[str] = None


@router.get("/admin/users", response_model=UserListResponse)
async def list_users(
    limit: int = 100,
    pagination_token: Optional[str] = None,
    session: SessionContainer = Depends(verify_session()),
):
    """List all users. Requires admin role."""
    try:
        # Check if user has admin role
        user_roles_response = await get_roles_for_user(session.get_user_id())
        if user_roles_response.status != "OK" or "admin" not in user_roles_response.roles:
            raise HTTPException(status_code=403, detail="Admin role required")

        # Get users
        response = await get_users_oldest_first(
            limit=limit,
            pagination_token=pagination_token,
        )

        if response.status != "OK":
            raise HTTPException(status_code=500, detail="Failed to list users")

        user_list = []
        for user in response.users:
            # Get user roles
            user_roles_response = await get_roles_for_user(user.user_id)
            user_roles = user_roles_response.roles if user_roles_response.status == "OK" else []

            # Extract email and phone from user object
            email = None
            phone_number = None

            if hasattr(user, 'login_methods') and user.login_methods:
                for login_method in user.login_methods:
                    if hasattr(login_method, 'email') and login_method.email:
                        email = login_method.email
                    if hasattr(login_method, 'phone_number') and login_method.phone_number:
                        phone_number = login_method.phone_number

            user_list.append(UserListItem(
                user_id=user.user_id,
                email=email,
                phone_number=phone_number,
                user_roles=user_roles,
                time_joined=user.time_joined,
            ))

        return UserListResponse(
            users=user_list,
            next_pagination_token=response.next_pagination_token,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list users: {str(e)}")


@router.post("/admin/remove-role", response_model=AdminActionResponse)
async def remove_role_from_user_endpoint(
    user_id: str,
    role: str,
    session: SessionContainer = Depends(verify_session()),
):
    """Remove a role from a user. Requires admin role."""
    try:
        # Check if user has admin role
        user_roles_response = await get_roles_for_user(session.get_user_id())
        if user_roles_response.status != "OK" or "admin" not in user_roles_response.roles:
            raise HTTPException(status_code=403, detail="Admin role required")

        # Remove role from user
        response = await remove_user_role(user_id, role)
        if response.status == "OK":
            return AdminActionResponse(success=True, message=f"Role '{role}' removed from user {user_id}")
        elif response.status == "UNKNOWN_ROLE_ERROR":
            raise HTTPException(status_code=400, detail=f"Role '{role}' does not exist")
        else:
            return AdminActionResponse(success=False, message=f"Failed to remove role: {response.status}")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to remove role: {str(e)}")


@router.delete("/admin/delete-user", response_model=AdminActionResponse)
async def delete_user_endpoint(
    user_id: str,
    session: SessionContainer = Depends(verify_session()),
):
    """Delete a user. Requires admin role."""
    try:
        # Check if user has admin role
        user_roles_response = await get_roles_for_user(session.get_user_id())
        if user_roles_response.status != "OK" or "admin" not in user_roles_response.roles:
            raise HTTPException(status_code=403, detail="Admin role required")

        # Prevent self-deletion
        if user_id == session.get_user_id():
            raise HTTPException(status_code=400, detail="Cannot delete your own account")

        # Delete user
        response = await delete_user(user_id)
        if response.status == "OK":
            return AdminActionResponse(success=True, message=f"User {user_id} deleted successfully")
        else:
            return AdminActionResponse(success=False, message=f"Failed to delete user: {response.status}")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete user: {str(e)}")


class RoleListResponse(BaseModel):
    roles: list[str]


@router.get("/admin/roles", response_model=RoleListResponse)
async def list_roles(session: SessionContainer = Depends(verify_session())):
    """List all roles. Requires admin role."""
    try:
        # Check if user has admin role
        user_roles_response = await get_roles_for_user(session.get_user_id())
        if user_roles_response.status != "OK" or "admin" not in user_roles_response.roles:
            raise HTTPException(status_code=403, detail="Admin role required")

        # Get all roles
        response = await get_all_roles()
        if response.status == "OK":
            return RoleListResponse(roles=response.roles)
        else:
            raise HTTPException(status_code=500, detail="Failed to get roles")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list roles: {str(e)}")


@router.get("/admin/user/{user_id}", response_model=UserInfoResponse)
async def get_user_by_id_endpoint(
    user_id: str,
    session: SessionContainer = Depends(verify_session()),
):
    """Get information about a specific user by ID. Requires admin role."""
    try:
        # Check if user has admin role
        user_roles_response = await get_roles_for_user(session.get_user_id())
        if user_roles_response.status != "OK" or "admin" not in user_roles_response.roles:
            raise HTTPException(status_code=403, detail="Admin role required")

        # Get user details
        user = await get_user(user_id)
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")

        # Get user roles
        user_roles_response = await get_roles_for_user(user_id)
        user_roles = user_roles_response.roles if user_roles_response.status == "OK" else []

        # Get factors setup for user
        factors_response = await get_factors_setup_for_user(user_id)
        factors_setup = factors_response.factors if factors_response.status == "OK" else []

        # Extract email and phone from user object
        email = None
        phone_number = None

        if hasattr(user, 'login_methods') and user.login_methods:
            for login_method in user.login_methods:
                if hasattr(login_method, 'email') and login_method.email:
                    email = login_method.email
                if hasattr(login_method, 'phone_number') and login_method.phone_number:
                    phone_number = login_method.phone_number

        return UserInfoResponse(
            user_id=user_id,
            email=email,
            phone_number=phone_number,
            user_roles=user_roles,
            factors_setup=factors_setup,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user: {str(e)}")