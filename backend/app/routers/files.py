"""
File management API endpoints for Ignacio Bot
Handles file upload, download, and management operations
"""

import asyncio
import logging
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, File, Form, HTTPException, UploadFile, Depends
from fastapi.responses import Response, StreamingResponse

from supertokens_python.recipe.session import SessionContainer
from supertokens_python.recipe.session.framework.fastapi import verify_session

from app.models.database import UserFile
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
    file: UploadFile = File(...),
    session: SessionContainer = Depends(verify_session()),
):
    """Upload a file to authenticated user's storage

    Supported file types:
    - Images: All image formats (image/*)
    - PDFs: application/pdf
    """
    user_uuid = UUID(session.get_user_id())

    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    # Validate file type - only accept PDFs and images
    if not file.content_type:
        raise HTTPException(
            status_code=400, 
            detail=f"File type not detected for {file.filename}"
        )
    
    if not (file.content_type.startswith('image/') or file.content_type == 'application/pdf'):
        raise HTTPException(
            status_code=400,
            detail=f"File type {file.content_type} not supported. Only PDF and image files are accepted."
        )

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
async def get_file_metadata(file_id: str, session: SessionContainer = Depends(verify_session())):
    """Get file metadata for authenticated user"""
    try:
        file_uuid = UUID(file_id)
        user_uuid = UUID(session.get_user_id())
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
async def download_file(file_id: str, session: SessionContainer = Depends(verify_session())):
    """Download a file for authenticated user"""
    try:
        file_uuid = UUID(file_id)
        user_uuid = UUID(session.get_user_id())
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
async def get_file_url(file_id: str, expires_in: int = 3600, session: SessionContainer = Depends(verify_session())):
    """Get a signed URL for file access for authenticated user"""
    try:
        file_uuid = UUID(file_id)
        user_uuid = UUID(session.get_user_id())
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


@router.get("/user/me", response_model=list[UserFile])
async def get_user_files(session: SessionContainer = Depends(verify_session())):
    """Get all files for authenticated user"""
    try:
        user_uuid = UUID(session.get_user_id())
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    try:
        files = await storage_service.get_user_files(user_uuid)
        return files

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user files: {str(e)}")


@router.get("/conversation/{conversation_id}", response_model=list[UserFile])
async def get_conversation_files(conversation_id: str, session: SessionContainer = Depends(verify_session())):
    """Get all files for a conversation for authenticated user"""
    try:
        user_uuid = UUID(session.get_user_id())
        conv_uuid = UUID(conversation_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid conversation ID format")

    try:
        from app.services.database import db_service

        # Verify conversation ownership
        conversation = await db_service.get_conversation_by_id(conv_uuid)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        if conversation.user_id != user_uuid:
            raise HTTPException(status_code=403, detail="Access denied to conversation")

        files = await db_service.get_conversation_files(conv_uuid)
        return files

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get conversation files: {str(e)}")


@router.post("/conversations/{conversation_id}/files", response_model=UserFile)
async def upload_file_to_conversation(
    conversation_id: str,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    session: SessionContainer = Depends(verify_session()),
):
    """Upload a file and associate it with a conversation for authenticated user

    Supported file types:
    - Images: All image formats (image/*)
    - PDFs: application/pdf
    """
    try:
        conv_uuid = UUID(conversation_id)
        user_uuid = UUID(session.get_user_id())
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    # Validate file type - only accept PDFs and images
    if not file.content_type:
        raise HTTPException(
            status_code=400, 
            detail=f"File type not detected for {file.filename}"
        )
    
    if not (file.content_type.startswith('image/') or file.content_type == 'application/pdf'):
        raise HTTPException(
            status_code=400,
            detail=f"File type {file.content_type} not supported. Only PDF and image files are accepted."
        )

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
async def delete_file(file_id: str, session: SessionContainer = Depends(verify_session())):
    """Delete a file for authenticated user"""
    try:
        file_uuid = UUID(file_id)
        user_uuid = UUID(session.get_user_id())
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


@router.get("/{file_id}/conversations")
async def get_file_conversations(file_id: str, session: SessionContainer = Depends(verify_session())):
    """Get all conversations where a file has been used for authenticated user"""
    try:
        file_uuid = UUID(file_id)
        user_uuid = UUID(session.get_user_id())
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    try:
        from app.services.database import db_service

        # Verify user owns the file
        file_record = await db_service.get_file_by_id(file_uuid)
        if not file_record or file_record.user_id != user_uuid:
            raise HTTPException(status_code=403, detail="Access denied")

        conversations = await db_service.get_file_conversations(file_uuid)
        return conversations

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get file conversations: {str(e)}")


@router.post("/{file_id}/reuse")
async def reuse_file(file_id: str, conversation_id: str, session: SessionContainer = Depends(verify_session())):
    """Reuse an existing file in a conversation for authenticated user"""
    try:
        file_uuid = UUID(file_id)
        conv_uuid = UUID(conversation_id)
        user_uuid = UUID(session.get_user_id())
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    try:
        from app.services.database import db_service

        # Verify user owns the file
        file_record = await db_service.get_file_by_id(file_uuid)
        if not file_record or file_record.user_id != user_uuid:
            raise HTTPException(status_code=403, detail="Access denied")

        # Verify user owns the conversation
        conversation = await db_service.get_conversation_by_id(conv_uuid)
        if not conversation or conversation.user_id != user_uuid:
            raise HTTPException(status_code=403, detail="Access denied to conversation")

        # Add file to conversation
        success = await db_service.add_file_to_conversation(file_uuid, conv_uuid)

        if not success:
            raise HTTPException(status_code=500, detail="Failed to reuse file")

        return {"message": "File reused successfully", "file_id": file_id, "conversation_id": conversation_id}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reuse file: {str(e)}")


@router.get("/user/me/with-conversations")
async def get_user_files_with_conversations(session: SessionContainer = Depends(verify_session())):
    """Get all files for authenticated user with their conversation usage data"""
    try:
        user_uuid = UUID(session.get_user_id())
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    try:
        from app.services.database import db_service
        files_with_conversations = await db_service.get_user_files_with_conversations(user_uuid)
        return files_with_conversations

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user files with conversations: {str(e)}")