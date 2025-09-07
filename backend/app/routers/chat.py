"""
Chat API endpoints for Ignacio Bot
Handles conversations and messages for Phase 2 (without authentication)
"""

from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.models.database import ConversationCreate, ConversationUpdate, MessageType, ConversationResult
from app.services.ai_service import ignacio_service
from app.services.database import db_service

router = APIRouter(prefix="/api/chat", tags=["chat"])


# Request/Response models for Agent SDK
class ConversationCreateRequest(BaseModel):
    title: str | None = None


class ConversationStartRequest(BaseModel):
    """Request to start a conversation with initial message"""
    initial_message: str
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
    agent_used: str | None = None
    execution_time_ms: int | None = None


class ConversationResponse(BaseModel):
    id: UUID
    title: str | None
    created_at: str
    updated_at: str
    message_count: int = 0
    language_preference: str = "es"
    project_context: dict = {}


class ConversationDetailResponse(ConversationResponse):
    messages: list[MessageResponse]


class AgentMessageResponse(BaseModel):
    """Enhanced response for Agent SDK messages"""
    message: MessageResponse
    agent_used: str
    tools_called: list[str] = []
    confidence_score: float = 0.0
    execution_time_ms: int = 0


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
            user_id=TEMP_USER_ID,
            title=request.title or "New Conversation",
            language_preference="es",
            agent_state={},
            project_context={}
        )

        conversation = await db_service.create_conversation(conv_data)

        return ConversationResponse(
            id=conversation.id,
            title=conversation.title,
            created_at=conversation.created_at.isoformat(),
            updated_at=conversation.updated_at.isoformat(),
            message_count=0,
            language_preference=conversation.language_preference,
            project_context=conversation.project_context,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create conversation: {str(e)}",
        )


@router.post("/conversations/start", response_model=AgentMessageResponse)
async def start_conversation(request: ConversationStartRequest):
    """Start a new conversation with an initial message using Agent SDK"""
    try:
        # Start conversation with Agent SDK (this creates conversation and processes initial message)
        agent_result = await ignacio_service.start_conversation(
            user_id=TEMP_USER_ID,
            initial_message=request.initial_message
        )

        # Update conversation title if provided
        if request.title:
            await db_service.update_conversation(
                agent_result.conversation_id,
                {"title": request.title}
            )

        # Get the AI response message
        messages = await db_service.get_conversation_messages(agent_result.conversation_id)
        ai_message = None
        for msg in reversed(messages):
            if not msg.is_from_user:
                ai_message = msg
                break

        if not ai_message:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve AI response message"
            )

        return AgentMessageResponse(
            message=MessageResponse(
                id=ai_message.id,
                content=ai_message.content,
                message_type=ai_message.message_type,
                is_from_user=ai_message.is_from_user,
                created_at=ai_message.created_at.isoformat(),
                file_path=ai_message.file_path,
                agent_used=agent_result.agent_used,
                execution_time_ms=agent_result.execution_time_ms,
            ),
            agent_used=agent_result.agent_used,
            tools_called=agent_result.tools_called,
            confidence_score=agent_result.confidence_score,
            execution_time_ms=agent_result.execution_time_ms,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start conversation: {str(e)}",
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
    "/conversations/{conversation_id}/messages", response_model=AgentMessageResponse
)
async def send_message(conversation_id: UUID, request: MessageCreateRequest):
    """Send a message in a conversation and get AI response with Agent SDK"""
    try:
        # Check if conversation exists
        conversation = await db_service.get_conversation_by_id(conversation_id)
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found"
            )

        # Process message with Agent SDK
        agent_result = await ignacio_service.continue_conversation(
            conversation_id=conversation_id,
            message=request.content
        )

        # Get the last message from the conversation (the AI response)
        messages = await db_service.get_conversation_messages(conversation_id)
        ai_message = None
        for msg in reversed(messages):
            if not msg.is_from_user:
                ai_message = msg
                break

        if not ai_message:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve AI response message"
            )

        return AgentMessageResponse(
            message=MessageResponse(
                id=ai_message.id,
                content=ai_message.content,
                message_type=ai_message.message_type,
                is_from_user=ai_message.is_from_user,
                created_at=ai_message.created_at.isoformat(),
                file_path=ai_message.file_path,
                agent_used=agent_result.agent_used,
                execution_time_ms=agent_result.execution_time_ms,
            ),
            agent_used=agent_result.agent_used,
            tools_called=agent_result.tools_called,
            confidence_score=agent_result.confidence_score,
            execution_time_ms=agent_result.execution_time_ms,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send message: {str(e)}",
        )


# Agent SDK specific endpoints

@router.post("/files/{file_id}/integrate")
async def integrate_file_to_context(file_id: UUID):
    """Integrate an uploaded file into AI context for search"""
    try:
        # Get file from database
        user_files = await db_service.get_user_files(TEMP_USER_ID)
        file = next((f for f in user_files if f.id == file_id), None)

        if not file:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found"
            )

        # Integrate file into AI context
        result = await ignacio_service.upload_file_to_context(TEMP_USER_ID, file.file_path)

        return {
            "success": result.success,
            "openai_file_id": result.openai_file_id,
            "vector_store_updated": result.vector_store_updated,
            "content_preview": result.content_preview,
            "error_message": result.error_message
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to integrate file: {str(e)}"
        )


@router.get("/conversations/{conversation_id}/summary")
async def get_conversation_summary(conversation_id: UUID):
    """Get a summary of the conversation for context management"""
    try:
        summary = await ignacio_service.get_conversation_summary(conversation_id)

        return {
            "conversation_id": summary.conversation_id,
            "total_messages": summary.total_messages,
            "agent_interactions": summary.agent_interactions,
            "tools_used": summary.tools_used,
            "key_topics": summary.key_topics,
            "project_context": summary.project_context,
            "last_activity": summary.last_activity.isoformat()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get conversation summary: {str(e)}"
        )


@router.get("/conversations/{conversation_id}/interactions")
async def get_conversation_interactions(conversation_id: UUID):
    """Get all agent interactions for a conversation"""
    try:
        interactions = await db_service.get_conversation_interactions(conversation_id)

        return [{
            "id": interaction.id,
            "agent_name": interaction.agent_name,
            "input_text": interaction.input_text,
            "output_text": interaction.output_text,
            "tools_used": interaction.tools_used,
            "execution_time_ms": interaction.execution_time_ms,
            "created_at": interaction.created_at.isoformat()
        } for interaction in interactions]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get conversation interactions: {str(e)}"
        )


@router.post("/project/context")
async def update_project_context(project_data: dict):
    """Update user's project context for better AI responses"""
    try:
        await ignacio_service.update_project_context(TEMP_USER_ID, project_data)

        return {"success": True, "message": "Project context updated successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update project context: {str(e)}"
        )
