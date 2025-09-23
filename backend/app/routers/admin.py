"""
Admin API endpoints for Ignacio Bot
Handles administrative tasks like file synchronization and system maintenance
"""

import logging
from uuid import UUID

from fastapi import APIRouter, HTTPException, Depends

from supertokens_python.recipe.session import SessionContainer
from supertokens_python.recipe.session.framework.fastapi import verify_session
from supertokens_python.recipe.userroles.asyncio import get_roles_for_user


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/admin", tags=["admin"])


async def verify_admin_role(session: SessionContainer = Depends(verify_session())) -> str:
    """Verify that the authenticated user has admin role"""
    user_id = session.get_user_id()

    # Check if user has admin role
    user_roles_response = await get_roles_for_user(user_id)
    if user_roles_response.status != "OK" or "admin" not in user_roles_response.roles:
        raise HTTPException(status_code=403, detail="Admin role required")

    return user_id


@router.post("/sync-files/{user_id}")
async def sync_user_files(user_id: str, admin_user_id: str = Depends(verify_admin_role)):
    """Manually trigger file sync for a user (admin only)"""
    try:
        user_uuid = UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    try:
        # TODO: Import correct file sync service when available
        # sync_result = await openai_file_service.sync_user_files(user_uuid)
        logger.info(f"Admin {admin_user_id} triggered file sync for user {user_id}")

        return {
            "user_id": user_id,
            "sync_result": "File sync service not yet implemented",
            "message": "File sync request logged successfully",
            "admin_user": admin_user_id
        }
    except Exception as e:
        logger.error(f"File sync failed for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"File sync failed: {str(e)}")


@router.post("/sync-all-files")
async def sync_all_user_files(admin_user_id: str = Depends(verify_admin_role)):
    """Sync files for all users (maintenance endpoint - admin only)"""
    try:
        from app.services.database import db_service

        # Get all users (simplified - in real implementation, paginate this)
        result = {
            "users_processed": 0,
            "total_uploaded": 0,
            "total_re_uploaded": 0,
            "total_failed": 0,
            "total_skipped": 0,
            "errors": []
        }

        # For now, this is a placeholder since we don't have user enumeration
        # In a real implementation, you'd get all users from the database
        logger.info(f"Admin {admin_user_id} called sync all files endpoint - implementation pending user enumeration")

        return {
            "message": "Sync all files endpoint - implementation pending",
            "result": result
        }

    except Exception as e:
        logger.error(f"Sync all files failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Sync all files failed: {str(e)}")


@router.get("/file-sync-status/{user_id}")
async def get_user_file_sync_status(user_id: str, admin_user_id: str = Depends(verify_admin_role)):
    """Get file synchronization status for a user (admin only)"""
    try:
        user_uuid = UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    try:
        from app.services.database import db_service

        logger.info(f"Admin {admin_user_id} requesting file sync status for user {user_id}")
        user_files = await db_service.get_user_files(user_uuid)

        status_counts = {
            "pending": 0,
            "synced": 0,
            "failed": 0,
            "expired": 0
        }

        files_detail = []

        for file in user_files:
            status_counts[file.openai_sync_status] = status_counts.get(file.openai_sync_status, 0) + 1

            files_detail.append({
                "file_id": str(file.id),
                "file_name": file.file_name,
                "file_type": file.file_type,
                "sync_status": file.openai_sync_status,
                "openai_file_id": file.openai_file_id,
                "openai_uploaded_at": file.openai_uploaded_at.isoformat() if file.openai_uploaded_at else None,
                "created_at": file.created_at.isoformat()
            })

        return {
            "user_id": user_id,
            "total_files": len(user_files),
            "status_counts": status_counts,
            "files": files_detail
        }

    except Exception as e:
        logger.error(f"Failed to get sync status for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get sync status: {str(e)}")