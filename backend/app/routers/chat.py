"""
Chat API endpoints for Ignacio Bot
Handles conversations and messages for Phase 2 (without authentication)
"""

from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.models.database import (
    ConversationCreate,
    ConversationUpdate,
    MessageType,
)
from app.services.ai_service import ai_service
from app.services.database import db_service

router = APIRouter(prefix="/api/chat", tags=["chat"])


# Request/Response models for Phase 2
class ConversationCreateRequest(BaseModel):
    title: str | None = None


class MessageCreateRequest(BaseModel):
    content: str
    message_type: MessageType = MessageType.TEXT


class MessageResponse(BaseModel):
    id: UUID
    content: str | None
    message_type: MessageType
    is_from_user: bool
    created_at: str
    file_path: str | None = None


class ConversationResponse(BaseModel):
    id: UUID
    title: str | None
    created_at: str
    updated_at: str
    message_count: int = 0


class ConversationDetailResponse(ConversationResponse):
    messages: list[MessageResponse]


# Temporary user ID for Phase 2 (no authentication yet)
# In Phase 4, this will be replaced with authenticated user ID
# Using the existing user from the database
TEMP_USER_ID = UUID("a456f25a-6269-4de3-87df-48b0a3389d01")


@router.get("/conversations", response_model=list[ConversationResponse])
async def get_conversations():
    """Get all conversations for the temporary user"""
    try:
        conversations = await db_service.get_user_conversations(TEMP_USER_ID)

        # Get message count for each conversation
        result = []
        for conv in conversations:
            messages = await db_service.get_conversation_messages(conv.id)
            result.append(
                ConversationResponse(
                    id=conv.id,
                    title=conv.title,
                    created_at=conv.created_at.isoformat(),
                    updated_at=conv.updated_at.isoformat(),
                    message_count=len(messages),
                )
            )

        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get conversations: {str(e)}",
        )


@router.post("/conversations", response_model=ConversationResponse)
async def create_conversation(request: ConversationCreateRequest):
    """Create a new conversation"""
    try:
        conv_data = ConversationCreate(
            user_id=TEMP_USER_ID, title=request.title or "New Conversation"
        )

        conversation = await db_service.create_conversation(conv_data)

        return ConversationResponse(
            id=conversation.id,
            title=conversation.title,
            created_at=conversation.created_at.isoformat(),
            updated_at=conversation.updated_at.isoformat(),
            message_count=0,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create conversation: {str(e)}",
        )


@router.get(
    "/conversations/{conversation_id}", response_model=ConversationDetailResponse
)
async def get_conversation(conversation_id: UUID):
    """Get a specific conversation with its messages"""
    try:
        # Get conversation
        conversation = await db_service.get_conversation_by_id(conversation_id)
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found"
            )

        # Get messages
        messages = await db_service.get_conversation_messages(conversation_id)

        message_responses = [
            MessageResponse(
                id=msg.id,
                content=msg.content,
                message_type=msg.message_type,
                is_from_user=msg.is_from_user,
                created_at=msg.created_at.isoformat(),
                file_path=msg.file_path,
            )
            for msg in messages
        ]

        return ConversationDetailResponse(
            id=conversation.id,
            title=conversation.title,
            created_at=conversation.created_at.isoformat(),
            updated_at=conversation.updated_at.isoformat(),
            message_count=len(messages),
            messages=message_responses,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get conversation: {str(e)}",
        )


@router.put("/conversations/{conversation_id}", response_model=ConversationResponse)
async def update_conversation(
    conversation_id: UUID, request: ConversationCreateRequest
):
    """Update a conversation (mainly title)"""
    try:
        # Check if conversation exists
        conversation = await db_service.get_conversation_by_id(conversation_id)
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found"
            )

        # Update conversation
        update_data = ConversationUpdate(title=request.title)
        updated_conv = await db_service.update_conversation(
            conversation_id, update_data
        )

        if not updated_conv:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update conversation",
            )

        # Get message count
        messages = await db_service.get_conversation_messages(conversation_id)

        return ConversationResponse(
            id=updated_conv.id,
            title=updated_conv.title,
            created_at=updated_conv.created_at.isoformat(),
            updated_at=updated_conv.updated_at.isoformat(),
            message_count=len(messages),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update conversation: {str(e)}",
        )


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: UUID):
    """Delete a conversation and all its messages"""
    try:
        # Check if conversation exists
        conversation = await db_service.get_conversation_by_id(conversation_id)
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found"
            )

        # Note: In a real implementation, we'd want to delete messages first
        # For now, we'll rely on database cascade delete or implement it later

        return {"message": "Conversation deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete conversation: {str(e)}",
        )


@router.get(
    "/conversations/{conversation_id}/messages", response_model=list[MessageResponse]
)
async def get_messages(conversation_id: UUID, limit: int = 50, offset: int = 0):
    """Get messages for a conversation"""
    try:
        # Check if conversation exists
        conversation = await db_service.get_conversation_by_id(conversation_id)
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found"
            )

        messages = await db_service.get_conversation_messages(
            conversation_id, limit=limit, offset=offset
        )

        return [
            MessageResponse(
                id=msg.id,
                content=msg.content,
                message_type=msg.message_type,
                is_from_user=msg.is_from_user,
                created_at=msg.created_at.isoformat(),
                file_path=msg.file_path,
            )
            for msg in messages
        ]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get messages: {str(e)}",
        )


@router.post(
    "/conversations/{conversation_id}/messages", response_model=MessageResponse
)
async def send_message(conversation_id: UUID, request: MessageCreateRequest):
    """Send a message in a conversation and get AI response"""
    try:
        # Check if conversation exists
        conversation = await db_service.get_conversation_by_id(conversation_id)
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found"
            )

        # Process message and get AI response
        ai_response_msg = await ai_service.process_message_and_respond(
            user_message=request.content,
            user_id=TEMP_USER_ID,
            conversation_id=conversation_id,
        )

        return MessageResponse(
            id=ai_response_msg.id,
            content=ai_response_msg.content,
            message_type=ai_response_msg.message_type,
            is_from_user=ai_response_msg.is_from_user,
            created_at=ai_response_msg.created_at.isoformat(),
            file_path=ai_response_msg.file_path,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send message: {str(e)}",
        )
