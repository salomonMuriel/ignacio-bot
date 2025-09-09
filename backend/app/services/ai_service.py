"""
Simple AI service using OpenAI Agent SDK for Ignacio Bot
Following the agents-as-tools pattern from examples.
Entry agent uses specialized sub-agents as tools.
Includes project context integration for personalized conversations.
"""

import asyncio
import time
from typing import Dict, List, Optional
from uuid import UUID

from agents import Agent, Runner
from app.models.database import ConversationResult, MessageCreate, MessageType
from app.services.database import db_service
from app.services.project_context_service import (
    project_context_service, 
    UserProjectContext, 
    create_project_aware_instructions
)


class IgnacioAgentService:
    """Simple OpenAI Agent SDK-based service for Ignacio Bot"""

    def __init__(self):
        self._setup_agents()

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

    async def start_conversation(self, user_id: UUID, initial_message: str) -> ConversationResult:
        """Start a new conversation with Ignacio"""
        start_time = time.time()

        # Create conversation in database
        conversation = await db_service.create_conversation({
            "user_id": user_id,
            "title": initial_message[:50] + "..." if len(initial_message) > 50 else initial_message,
            "language_preference": "es"
        })

        # Process the message
        result = await self.continue_conversation(conversation.id, initial_message)
        return result

    async def continue_conversation(self, conversation_id: UUID, message: str) -> ConversationResult:
        """Continue an existing conversation with project context"""
        start_time = time.time()

        try:
            # Get conversation
            conversation = await db_service.get_conversation(conversation_id)
            if not conversation:
                raise ValueError(f"Conversation {conversation_id} not found")

            # Load user project context
            project_context = await project_context_service.get_user_context(conversation.user_id)

            # Run the main agent with context
            result = await Runner.run(
                self.ignacio_agent, 
                message, 
                context=project_context
            )

            execution_time = int((time.time() - start_time) * 1000)

            # Create and store user message
            user_message = MessageCreate(
                conversation_id=conversation_id,
                user_id=conversation.user_id,
                content=message,
                message_type=MessageType.TEXT,
                is_from_user=True
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
