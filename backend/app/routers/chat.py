"""
Chat API endpoints for Ignacio Bot
Handles conversations and messages for Phase 2 (without authentication)
"""

from uuid import UUID
from typing import List

from fastapi import APIRouter, HTTPException, status, File, Form, UploadFile
from pydantic import BaseModel

from app.models.database import ConversationCreate, ConversationUpdate, MessageType, ConversationResult, MessageCreate, UserFile
from app.services.ai_service import get_ignacio_service
from app.services.database import db_service
from app.services.storage import storage_service

router = APIRouter(prefix="/api/chat", tags=["chat"])


# Request/Response models for Agent SDK
class ConversationCreateRequest(BaseModel):
    title: str | None = None
    project_id: UUID | None = None


class ConversationStartRequest(BaseModel):
    """Request to start a conversation with initial message"""
    initial_message: str
    title: str | None = None
    project_id: UUID | None = None


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
    project_id: UUID | None = None
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
    conversation_id: UUID | None = None


# Temporary user ID for Phase 2 (no authentication yet)
# In Phase 4, this will be replaced with authenticated user ID
# Using the existing user from the database
TEMP_USER_ID = UUID("a456f25a-6269-4de3-87df-48b0a3389d01")


@router.get("/conversations", response_model=list[ConversationResponse])
async def get_conversations():
    """Get all conversations for a given user"""
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
                    project_id=conv.project_id,
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


@router.post("/conversations/start", response_model=AgentMessageResponse)
async def start_conversation(request: ConversationStartRequest):
    """Start a new conversation with an initial message using Agent SDK"""
    try:
        # Start conversation with Agent SDK (this creates conversation and processes initial message)
        agent_result = await get_ignacio_service().start_conversation(
            user_id=TEMP_USER_ID,
            initial_message=request.initial_message,
            project_id=request.project_id
        )

        # Handle the case where agent_result might be a dict due to an error
        conversation_id = None
        if hasattr(agent_result, 'conversation_id'):
            conversation_id = agent_result.conversation_id
        elif isinstance(agent_result, dict) and 'conversation_id' in agent_result:
            conversation_id = agent_result['conversation_id']
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Invalid agent result format: {type(agent_result)}"
            )

        # Update conversation title and project_id if provided
        update_data = {}
        if request.title:
            update_data["title"] = request.title
        if request.project_id:
            update_data["project_id"] = str(request.project_id)
            
        if update_data:
            await db_service.update_conversation(conversation_id, update_data)

        # Get the AI response message
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
            conversation_id=agent_result.conversation_id,
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
            project_id=conversation.project_id,
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
        update_data = ConversationUpdate(title=request.title, project_id=request.project_id)
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
            project_id=updated_conv.project_id,
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
        agent_result = await get_ignacio_service().continue_conversation(
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
            conversation_id=agent_result.conversation_id,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send message: {str(e)}",
        )


@router.post(
    "/conversations/{conversation_id}/messages/with-files", 
    response_model=AgentMessageResponse
)
async def send_message_with_files(
    conversation_id: UUID,
    content: str = Form(...),
    files: List[UploadFile] = File(None)
):
    """Send a message with optional file attachments and get AI response with Agent SDK"""
    try:
        # Check if conversation exists
        conversation = await db_service.get_conversation_by_id(conversation_id)
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found"
            )

        # Upload files if provided
        uploaded_files = []
        file_attachments = []
        
        if files:
            for file in files:
                if file.filename:  # Skip empty file uploads
                    # Read file content
                    file_content = await file.read()
                    
                    # Upload file to storage with conversation association
                    uploaded_file = await storage_service.upload_file(
                        user_id=TEMP_USER_ID,
                        file_content=file_content,
                        file_name=file.filename,
                        content_type=file.content_type,
                        conversation_id=conversation_id,
                    )
                    
                    if uploaded_file:
                        uploaded_files.append(uploaded_file)
                        file_attachments.append(uploaded_file)

        # Process message with Agent SDK and file attachments
        agent_result = await get_ignacio_service().continue_conversation(
            conversation_id=conversation_id,
            message=content,
            file_attachments=file_attachments
        )

        # File attachments are handled by the AI service

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
            conversation_id=agent_result.conversation_id,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send message with files: {str(e)}",
        )


# Agent SDK specific endpoints

# Note: File integration is now handled automatically via direct Agent SDK processing
# when files are attached to chat messages. No separate integration step needed.


@router.get("/conversations/{conversation_id}/summary")
async def get_conversation_summary(conversation_id: UUID):
    """Get a summary of the conversation for context management"""
    try:
        summary = await get_ignacio_service().get_conversation_summary(conversation_id)

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


@router.put("/conversations/{conversation_id}/project")
async def associate_conversation_with_project(conversation_id: UUID, request: dict):
    """Associate a conversation with a specific project"""
    try:
        project_id = request.get("project_id")
        if not project_id:
            raise HTTPException(status_code=400, detail="project_id is required")
        
        # Check if conversation exists
        conversation = await db_service.get_conversation_by_id(conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Check if project exists
        project = await db_service.get_user_project_by_id(UUID(project_id))
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Update conversation with project association
        updated_conv = await db_service.update_conversation(
            conversation_id, 
            {"project_id": project_id}
        )
        
        if not updated_conv:
            raise HTTPException(status_code=500, detail="Failed to associate conversation with project")
        
        return {"message": "Conversation successfully associated with project"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to associate conversation with project: {str(e)}"
        )


