"""
Simple AI service using OpenAI Agent SDK for Ignacio Bot
Following the agents-as-tools pattern from examples.
Entry agent uses specialized sub-agents as tools.
Includes project context integration for personalized conversations.
"""

import asyncio
import base64
import time
from typing import Dict, List, Optional
from uuid import UUID

from agents import Agent, Runner
from openai import OpenAI
from app.models.database import ConversationResult, MessageCreate, MessageType, UserFile
from app.services.database import db_service
from app.services.project_context_service import (
    project_context_service, 
    UserProjectContext, 
    create_project_aware_instructions
)
from app.services.storage import storage_service


class IgnacioAgentService:
    """Simple OpenAI Agent SDK-based service for Ignacio Bot"""

    def __init__(self):
        self._setup_agents()
        self.openai_client = OpenAI()

    def _setup_agents(self):
        """Create the main agent and sub-agents with project context awareness"""

        # Specialist sub-agents with project context
        self.marketing_agent = project_context_service.create_project_aware_agent(
            agent_name="Marketing Expert",
            base_instructions="You are a marketing specialist for Action Lab participants. Focus on practical, actionable marketing advice tailored to their specific project context.",
        )
        self.marketing_agent.handoff_description = "Marketing expert for market research, customer acquisition, and growth strategies"

        self.tech_agent = project_context_service.create_project_aware_agent(
            agent_name="Technology Expert",
            base_instructions="You are a technology specialist for Action Lab participants. Provide practical technical guidance tailored to their specific project and stage.",
        )
        self.tech_agent.handoff_description = "Technology expert for tech stack selection, development, and architecture decisions"

        self.finance_agent = project_context_service.create_project_aware_agent(
            agent_name="Finance Expert",
            base_instructions="You are a finance specialist for Action Lab participants. Help with business models, funding, and financial planning based on their specific project context.",
        )
        self.finance_agent.handoff_description = "Finance expert for business models, funding strategies, and financial planning"

        # Main entry agent with sub-agents as tools and project context awareness
        context_tools = project_context_service.get_context_tools()
        self.ignacio_agent = Agent[UserProjectContext](
            name="Ignacio",
            instructions=create_project_aware_instructions,
            tools=[
                self.marketing_agent.as_tool(
                    tool_name="marketing_expert",
                    tool_description="Consult marketing specialist for market research, customer acquisition, and growth strategies"
                ),
                self.tech_agent.as_tool(
                    tool_name="tech_expert",
                    tool_description="Consult technology specialist for tech decisions, development, and architecture"
                ),
                self.finance_agent.as_tool(
                    tool_name="finance_expert",
                    tool_description="Consult finance specialist for business models, funding, and financial planning"
                )
            ] + context_tools
        )

    async def _process_file_for_agent(self, user_file: UserFile) -> dict:
        """Process a file for Agent SDK input"""
        try:
            # Download file content from storage
            file_content = await storage_service.get_file_content(user_file.file_path)
            
            # Determine file type and create appropriate input
            if user_file.file_type.startswith('image/'):
                # Handle images with base64 encoding
                base64_image = base64.b64encode(file_content).decode('utf-8')
                mime_type = user_file.file_type
                return {
                    "type": "input_image",
                    "image_url": f"data:{mime_type};base64,{base64_image}"
                }
            
            elif user_file.file_type in ['application/pdf', 'text/plain', 'application/msword', 
                                       'application/vnd.openxmlformats-officedocument.wordprocessingml.document']:
                # Handle documents with base64 encoding
                base64_file = base64.b64encode(file_content).decode('utf-8')
                return {
                    "type": "input_file",
                    "filename": user_file.file_name,
                    "file_data": f"data:{user_file.file_type};base64,{base64_file}"
                }
            
            else:
                # For other file types, upload to OpenAI and use file_id
                file_obj = self.openai_client.files.create(
                    file=(user_file.file_name, file_content),
                    purpose="user_data"
                )
                return {
                    "type": "input_file", 
                    "file_id": file_obj.id
                }
                
        except Exception as e:
            # If file processing fails, return a text description
            return {
                "type": "input_text",
                "text": f"[File attachment: {user_file.file_name} - Unable to process: {str(e)}]"
            }

    async def start_conversation(self, user_id: UUID, initial_message: str, project_id: UUID | None = None) -> ConversationResult:
        """Start a new conversation with Ignacio"""
        start_time = time.time()

        # Create conversation in database
        conversation_data = {
            "user_id": user_id,
            "title": initial_message[:50] + "..." if len(initial_message) > 50 else initial_message,
            "language_preference": "es"
        }
        
        if project_id:
            conversation_data["project_id"] = project_id
            
        conversation = await db_service.create_conversation(conversation_data)

        # Process the message
        result = await self.continue_conversation(conversation.id, initial_message)
        return result

    async def continue_conversation(self, conversation_id: UUID, message: str, file_attachments: List[UserFile] = None) -> ConversationResult:
        """Continue an existing conversation with project context"""
        start_time = time.time()

        try:
            # Get conversation
            conversation = await db_service.get_conversation(conversation_id)
            if not conversation:
                raise ValueError(f"Conversation {conversation_id} not found")

            # Load project context based on conversation's project association
            if conversation.project_id:
                # Load specific project context
                project = await db_service.get_user_project_by_id(conversation.project_id)
                if project:
                    # Create project context from the specific project
                    project_context = UserProjectContext(
                        user_id=conversation.user_id,
                        project_name=project.project_name,
                        project_type=project.project_type,
                        description=project.description,
                        current_stage=project.current_stage,
                        target_audience=project.target_audience,
                        problem_statement=project.problem_statement,
                        solution_approach=project.solution_approach,
                        business_model=project.business_model,
                        context_data=project.context_data or {}
                    )
                else:
                    # Fallback to user's general context if project not found
                    project_context = await project_context_service.get_user_context(conversation.user_id)
            else:
                # Load user's general project context (for backwards compatibility)
                project_context = await project_context_service.get_user_context(conversation.user_id)

            # Prepare message content for Agent SDK
            message_content = []
            
            # Add file attachments if provided
            if file_attachments:
                for file_attachment in file_attachments:
                    file_input = await self._process_file_for_agent(file_attachment)
                    message_content.append(file_input)
            
            # Add text message
            message_content.append({
                "type": "input_text",
                "text": message
            })
            
            # Create messages in Agent SDK format
            agent_messages = [
                {
                    "role": "user",
                    "content": message_content
                }
            ]
            
            # Run the main agent with context and file attachments
            result = await Runner.run(
                self.ignacio_agent,
                agent_messages,
                context=project_context
            )

            execution_time = int((time.time() - start_time) * 1000)

            # Create and store user message with attachments
            user_message = MessageCreate(
                conversation_id=conversation_id,
                user_id=conversation.user_id,
                content=message,
                message_type=MessageType.TEXT,
                is_from_user=True,
                attachments=[f.id for f in file_attachments] if file_attachments else []
            )
            await db_service.create_message(user_message)

            # Create and store AI response message
            ai_message = MessageCreate(
                conversation_id=conversation_id,
                user_id=conversation.user_id,
                content=result.final_output,
                message_type=MessageType.TEXT,
                is_from_user=False
            )
            await db_service.create_message(ai_message)

            return ConversationResult(
                conversation_id=conversation_id,
                response_text=result.final_output,
                agent_used="ignacio",
                tools_called=[],
                confidence_score=0.9,
                suggested_actions=[],
                requires_followup=False,
                execution_time_ms=execution_time
            )

        except Exception as e:
            execution_time = int((time.time() - start_time) * 1000)
            raise e


# Global service instance
ignacio_service = None

def get_ignacio_service() -> IgnacioAgentService:
    """Get or create the global Ignacio service instance"""
    global ignacio_service
    if ignacio_service is None:
        ignacio_service = IgnacioAgentService()
    return ignacio_service
