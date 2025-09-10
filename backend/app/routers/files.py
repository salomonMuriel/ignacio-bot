"""
File management API endpoints for Ignacio Bot
Handles file upload, download, and management operations
"""

import asyncio
import logging
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, File, Form, HTTPException, UploadFile
from fastapi.responses import Response, StreamingResponse

from app.models.database import UserFile
from app.services.openai_file_service import openai_file_service
from app.services.storage import storage_service

logger = logging.getLogger(__name__)

router = APIRouter()


async def sync_file_to_openai(user_id: UUID, file_id: UUID):
    """Background task to sync a specific file to OpenAI vector stores (only for non-chat files)"""
    try:
        # Get the file to find its conversation
        from app.services.database import db_service
        file_record = await db_service.get_file_by_id(file_id)
        
        if not file_record:
            logger.error(f"File {file_id} not found for OpenAI sync")
            return
            
        # Skip sync for chat files - they are processed directly by Agent SDK
        if file_record.conversation_id:
            logger.info(f"File {file_id} is a chat attachment, skipping vector store sync (handled by Agent SDK)")
            return
        
        # Only sync files that are not part of conversations (legacy user files)
        logger.info(f"Starting OpenAI sync for user file {file_id}")
        # For user files without conversation_id, we'd need to implement user-based sync
        # For now, we'll skip since we're moving away from vector stores for chat
        logger.info(f"Vector store sync skipped - using direct Agent SDK processing")
            
    except Exception as e:
        logger.error(f"OpenAI sync failed for file {file_id}: {str(e)}")


@router.post("/upload", response_model=UserFile)
async def upload_file(
    background_tasks: BackgroundTasks,
    user_id: str = Form(...),
    file: UploadFile = File(...),
):
    """Upload a file to user's storage"""
    try:
        user_uuid = UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    # Read file content
    try:
        file_content = await file.read()
    except Exception:
        raise HTTPException(status_code=400, detail="Failed to read file content")

    try:
        # Upload file using storage service
        uploaded_file = await storage_service.upload_file(
            user_id=user_uuid,
            file_content=file_content,
            file_name=file.filename,
            content_type=file.content_type,
        )

        if not uploaded_file:
            raise HTTPException(status_code=500, detail="Failed to upload file")

        # Schedule background task to sync file to OpenAI
        background_tasks.add_task(sync_file_to_openai, user_uuid, uploaded_file.id)

        return uploaded_file

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{file_id}", response_model=UserFile)
async def get_file_metadata(file_id: str, user_id: str):
    """Get file metadata"""
    try:
        file_uuid = UUID(file_id)
        user_uuid = UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    try:
        from app.services.database import db_service
        file_record = await db_service.get_file_by_id(file_uuid)

        if not file_record:
            raise HTTPException(status_code=404, detail="File not found")

        # Check user ownership
        if file_record.user_id != user_uuid:
            raise HTTPException(status_code=403, detail="Access denied")

        return file_record

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get file: {str(e)}")


@router.get("/{file_id}/download")
async def download_file(file_id: str, user_id: str):
    """Download a file"""
    try:
        file_uuid = UUID(file_id)
        user_uuid = UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    try:
        # Get file metadata first
        from app.services.database import db_service
        file_record = await db_service.get_file_by_id(file_uuid)

        if not file_record:
            raise HTTPException(status_code=404, detail="File not found")

        # Check user ownership
        if file_record.user_id != user_uuid:
            raise HTTPException(status_code=403, detail="Access denied")

        # Download file content
        file_content = await storage_service.download_file(file_uuid, user_uuid)

        if file_content is None:
            raise HTTPException(status_code=404, detail="File content not found")

        # Return file as streaming response
        def generate_file():
            yield file_content

        return StreamingResponse(
            generate_file(),
            media_type=file_record.file_type,
            headers={
                "Content-Disposition": f"attachment; filename={file_record.file_name}"
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to download file: {str(e)}")


@router.get("/{file_id}/url")
async def get_file_url(file_id: str, user_id: str, expires_in: int = 3600):
    """Get a signed URL for file access"""
    try:
        file_uuid = UUID(file_id)
        user_uuid = UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    try:
        signed_url = await storage_service.get_file_url(file_uuid, user_uuid, expires_in)

        if not signed_url:
            raise HTTPException(status_code=404, detail="File not found or access denied")

        return {"url": signed_url, "expires_in": expires_in}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get file URL: {str(e)}")


@router.get("/user/{user_id}", response_model=list[UserFile])
async def get_user_files(user_id: str):
    """Get all files for a user"""
    try:
        user_uuid = UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    try:
        files = await storage_service.get_user_files(user_uuid)
        return files

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user files: {str(e)}")


@router.get("/conversation/{conversation_id}", response_model=list[UserFile])
async def get_conversation_files(conversation_id: str):
    """Get all files for a conversation"""
    try:
        conv_uuid = UUID(conversation_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid conversation ID format")

    try:
        from app.services.database import db_service
        files = await db_service.get_conversation_files(conv_uuid)
        return files

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get conversation files: {str(e)}")


@router.post("/conversations/{conversation_id}/files", response_model=UserFile)
async def upload_file_to_conversation(
    conversation_id: str,
    background_tasks: BackgroundTasks,
    user_id: str = Form(...),
    file: UploadFile = File(...),
):
    """Upload a file and associate it with a conversation"""
    try:
        conv_uuid = UUID(conversation_id)
        user_uuid = UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    # Read file content
    try:
        file_content = await file.read()
    except Exception:
        raise HTTPException(status_code=400, detail="Failed to read file content")

    try:
        # Upload file using storage service with conversation_id
        uploaded_file = await storage_service.upload_file(
            user_id=user_uuid,
            file_content=file_content,
            file_name=file.filename,
            content_type=file.content_type,
            conversation_id=conv_uuid,
        )

        if not uploaded_file:
            raise HTTPException(status_code=500, detail="Failed to upload file")

        # Schedule background task to sync file to OpenAI
        background_tasks.add_task(sync_file_to_openai, user_uuid, uploaded_file.id)

        return uploaded_file

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{file_id}")
async def delete_file(file_id: str, user_id: str):
    """Delete a file"""
    try:
        file_uuid = UUID(file_id)
        user_uuid = UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    try:
        success = await storage_service.delete_file(file_uuid, user_uuid)

        if not success:
            raise HTTPException(status_code=404, detail="File not found or access denied")

        return {"message": "File deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete file: {str(e)}")