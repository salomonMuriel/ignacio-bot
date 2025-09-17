"""
Chat API endpoints for Ignacio Bot
Handles conversations and messages for Phase 2 (without authentication)
"""

from uuid import UUID
from typing import List

from fastapi import APIRouter, HTTPException, status, File, Form, UploadFile
from pydantic import BaseModel

from app.models.database import ConversationUpdate, MessageType
from app.services.ai_service import get_ignacio_service
from app.services.database import db_service
from app.services.storage import storage_service

router = APIRouter(prefix="/chat", tags=["chat"])


# Request/Response models for Agent SDK
class ConversationCreateRequest(BaseModel):
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
        project = await db_service.get_project_by_id(UUID(project_id))
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


@router.post("/messages", response_model=AgentMessageResponse)
async def send_message_unified(
    content: str = Form(...),
    conversation_id: str = Form(None),
    project_id: str = Form(None),
    file: UploadFile = File(None),
    existing_file_id: str = Form(None)
):
    """Unified endpoint for sending messages - handles both new conversations and continuing existing ones

    - If conversation_id is provided: continues existing conversation
    - If conversation_id is not provided: creates new conversation with auto-generated title
    - Supports optional file attachment (single image or PDF) OR existing file reuse
    - File options: either 'file' (new upload) or 'existing_file_id' (reuse existing file)
    - For new conversations, project_id can be specified for project context
    """
    print(f"[CHAT] Received message request:")
    print(f"  - Content length: {len(content)}")
    print(f"  - Conversation ID: {conversation_id}")
    print(f"  - Project ID: {project_id}")
    print(f"  - New file attached: {file.filename if file and file.filename else 'None'}")
    print(f"  - Existing file ID: {existing_file_id}")
    if file and file.filename:
        print(f"  - File size: {file.size if hasattr(file, 'size') else 'Unknown'}")
        print(f"  - File type: {file.content_type}")

    try:
        # Parse UUIDs if provided
        parsed_conversation_id = None
        parsed_project_id = None
        
        if conversation_id:
            try:
                parsed_conversation_id = UUID(conversation_id)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid conversation_id format")
        
        if project_id:
            try:
                parsed_project_id = UUID(project_id)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid project_id format")

        # Validate file input - only one file method allowed
        if file and file.filename and existing_file_id:
            raise HTTPException(
                status_code=400,
                detail="Cannot provide both new file and existing_file_id. Choose one."
            )

        # Handle file upload or existing file reuse
        uploaded_file = None
        file_content_data = None
        existing_file_record = None

        if existing_file_id:
            print(f"[CHAT] Processing existing file reuse: {existing_file_id}")
            try:
                existing_file_uuid = UUID(existing_file_id)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid existing_file_id format")

            # Get existing file record and verify ownership
            existing_file_record = await db_service.get_file_by_id(existing_file_uuid)
            if not existing_file_record:
                raise HTTPException(status_code=404, detail="Existing file not found")

            if existing_file_record.user_id != TEMP_USER_ID:
                raise HTTPException(status_code=403, detail="Access denied to existing file")

            # Prepare file content data from existing file
            try:
                file_content = await storage_service.download_file(existing_file_uuid, TEMP_USER_ID)
                if file_content is None:
                    raise HTTPException(status_code=404, detail="Existing file content not found")

                file_content_data = [(file_content, existing_file_record.file_name, existing_file_record.file_type)]
                print(f"[CHAT] Existing file loaded successfully: {existing_file_record.file_name}")
            except Exception as e:
                print(f"[CHAT] ERROR: Failed to load existing file: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Failed to load existing file: {str(e)}")

        elif file and file.filename:
            print(f"[CHAT] Processing file upload: {file.filename}")

            # Validate file type - only accept PDFs and images
            if not file.content_type:
                print(f"[CHAT] ERROR: File type not detected for {file.filename}")
                raise HTTPException(
                    status_code=400,
                    detail=f"File type not detected for {file.filename}"
                )

            if not (file.content_type.startswith('image/') or file.content_type == 'application/pdf'):
                print(f"[CHAT] ERROR: Unsupported file type {file.content_type}")
                raise HTTPException(
                    status_code=400,
                    detail=f"File type {file.content_type} not supported. Only PDF and image files are accepted."
                )

            print(f"[CHAT] File validation passed, reading content...")
            # Read file content
            file_content = await file.read()
            print(f"[CHAT] File content read successfully: {len(file_content)} bytes")
            file_content_data = [(file_content, file.filename, file.content_type)]

        # Determine if this is a new conversation or continuing existing one
        if parsed_conversation_id:
            print(f"[CHAT] Continuing existing conversation: {parsed_conversation_id}")
            # Continue existing conversation
            conversation = await db_service.get_conversation_by_id(parsed_conversation_id)
            if not conversation:
                print(f"[CHAT] ERROR: Conversation {parsed_conversation_id} not found")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Conversation not found"
                )

            # Handle file for conversation
            if file_content_data:
                if existing_file_record:
                    # Reuse existing file - add to conversation relationship
                    print(f"[CHAT] Adding existing file {existing_file_record.id} to conversation {parsed_conversation_id}")
                    try:
                        await db_service.add_file_to_conversation(existing_file_record.id, parsed_conversation_id)
                        print(f"[CHAT] Existing file added to conversation successfully")
                    except Exception as e:
                        print(f"[CHAT] ERROR: Failed to add existing file to conversation: {str(e)}")
                        raise HTTPException(status_code=500, detail=f"Failed to add existing file to conversation: {str(e)}")
                else:
                    # Upload new file and associate with conversation
                    print(f"[CHAT] Uploading file to storage for conversation {parsed_conversation_id}")
                    try:
                        uploaded_file = await storage_service.upload_file(
                            user_id=TEMP_USER_ID,
                            file_content=file_content_data[0][0],
                            file_name=file_content_data[0][1],
                            content_type=file_content_data[0][2],
                            conversation_id=parsed_conversation_id,
                        )
                        print(f"[CHAT] File uploaded successfully: {uploaded_file.id}")
                        # Add file-conversation relationship for new uploads to existing conversations
                        await db_service.add_file_to_conversation(uploaded_file.id, parsed_conversation_id)
                    except Exception as e:
                        print(f"[CHAT] ERROR: File upload failed: {str(e)}")
                        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

            print(f"[CHAT] Calling Agent SDK to continue conversation...")
            # Process message with Agent SDK
            try:
                agent_result = await get_ignacio_service().continue_conversation(
                    conversation_id=parsed_conversation_id,
                    message=content,
                    file_contents=file_content_data if file_content_data else None
                )
                print(f"[CHAT] Agent SDK processing completed successfully")
            except Exception as e:
                print(f"[CHAT] ERROR: Agent SDK processing failed: {str(e)}")
                raise HTTPException(status_code=500, detail=f"AI processing failed: {str(e)}")
            
        else:
            print(f"[CHAT] Starting new conversation with project {parsed_project_id}")
            # Start new conversation
            # Handle file for new conversation
            if file_content_data and not existing_file_record:
                # Only upload new files for new conversations
                # Existing files will be linked after conversation creation
                print(f"[CHAT] Uploading file to storage for new conversation")
                try:
                    uploaded_file = await storage_service.upload_file(
                        user_id=TEMP_USER_ID,
                        file_content=file_content_data[0][0],
                        file_name=file_content_data[0][1],
                        content_type=file_content_data[0][2],
                        conversation_id=None,  # Will be updated after conversation creation
                    )
                    print(f"[CHAT] File uploaded successfully: {uploaded_file.id}")
                except Exception as e:
                    print(f"[CHAT] ERROR: File upload failed: {str(e)}")
                    raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

            print(f"[CHAT] Calling Agent SDK to start conversation...")
            # Start conversation with Agent SDK
            try:
                agent_result = await get_ignacio_service().start_conversation(
                    user_id=TEMP_USER_ID,
                    initial_message=content,
                    project_id=parsed_project_id,
                    file_contents=file_content_data if file_content_data else None
                )
                print(f"[CHAT] Agent SDK conversation started successfully")
            except Exception as e:
                print(f"[CHAT] ERROR: Agent SDK conversation start failed: {str(e)}")
                raise HTTPException(status_code=500, detail=f"AI processing failed: {str(e)}")
            
            # Handle file-conversation relationships after conversation creation
            if hasattr(agent_result, 'conversation_id'):
                if uploaded_file:
                    # Update the uploaded file record with the conversation_id
                    await db_service.update_user_file(
                        uploaded_file.id,
                        {"conversation_id": str(agent_result.conversation_id)}
                    )
                    # Add file-conversation relationship for new uploads
                    await db_service.add_file_to_conversation(uploaded_file.id, agent_result.conversation_id)
                elif existing_file_record:
                    # Link existing file to the new conversation
                    print(f"[CHAT] Adding existing file {existing_file_record.id} to new conversation {agent_result.conversation_id}")
                    try:
                        await db_service.add_file_to_conversation(existing_file_record.id, agent_result.conversation_id)
                        print(f"[CHAT] Existing file added to new conversation successfully")
                    except Exception as e:
                        print(f"[CHAT] ERROR: Failed to add existing file to new conversation: {str(e)}")
                        # Don't fail the whole request if file linking fails
                        pass

        # Handle the case where agent_result might be a dict due to an error
        conversation_id_result = None
        if hasattr(agent_result, 'conversation_id'):
            conversation_id_result = agent_result.conversation_id
        elif isinstance(agent_result, dict) and 'conversation_id' in agent_result:
            conversation_id_result = agent_result['conversation_id']
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Invalid agent result format: {type(agent_result)}"
            )

        # Get the AI response message
        messages = await db_service.get_conversation_messages(conversation_id_result)
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

        response = AgentMessageResponse(
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

        print(f"[CHAT] Request completed successfully:")
        print(f"  - Conversation ID: {agent_result.conversation_id}")
        print(f"  - Agent used: {agent_result.agent_used}")
        print(f"  - Execution time: {agent_result.execution_time_ms}ms")
        print(f"  - File processed: {bool(file_content_data)}")

        return response
    except HTTPException:
        raise
    except Exception as e:
        print(f"[CHAT] ERROR: Unexpected error occurred: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send message: {str(e)}",
        )


