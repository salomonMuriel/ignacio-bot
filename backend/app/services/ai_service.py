"""
AI service using PydanticAI for Ignacio Bot
Provides AI-powered conversation capabilities with structured response models
"""

from uuid import UUID

from pydantic import BaseModel, Field
from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIModel

from app.core.config import settings
from app.models.database import Message, MessageCreate, MessageType
from app.services.database import db_service


class ConversationContext(BaseModel):
    """Context for AI conversations"""

    user_id: UUID
    conversation_id: UUID
    user_name: str | None = None
    conversation_history: list[Message] = Field(default_factory=list)
    user_project_info: str | None = None


class AIResponse(BaseModel):
    """Structured AI response model"""

    content: str = Field(description="The main response content")
    response_type: str = Field(
        default="general",
        description="Type of response: general, marketing, technical, financial, project_management",
    )
    confidence: float = Field(
        default=1.0,
        ge=0.0,
        le=1.0,
        description="Confidence level of the response (0.0 to 1.0)",
    )
    requires_followup: bool = Field(
        default=False, description="Whether this response requires a follow-up question"
    )
    followup_suggestion: str | None = Field(
        default=None, description="Suggested follow-up question if applicable"
    )


class AIService:
    """AI service using PydanticAI framework"""

    def __init__(self):
        # Initialize OpenAI model with PydanticAI
        self.model = OpenAIModel("gpt-4", api_key=settings.openai_api_key)

        # Create the main AI agent
        self.agent = Agent(
            model=self.model,
            result_type=AIResponse,
            system_prompt=self._get_system_prompt(),
        )

    def _get_system_prompt(self) -> str:
        """Get the system prompt for Ignacio Bot"""
        return """
You are Ignacio, an AI assistant specialized in helping users develop their projects as part of the Action Lab education program.

The Action Lab is an innovative education program that teaches people how to build projects. These projects are typically:
- New companies or startups
- New NGOs or foundations
- Company spinoffs
- New projects inside companies that will help them grow to a new level

Your role is to:
1. Act as a knowledgeable advisor tailored to the specific question being asked
2. Provide expert guidance based on the type of question (marketing, technical, financial, project management, etc.)
3. Help users think through their project development systematically
4. Ask clarifying questions when needed to provide better advice
5. Be encouraging and supportive while being practical and realistic

Communication style:
- Be conversational and approachable
- Use clear, actionable language
- Ask follow-up questions to better understand their specific situation
- Provide concrete examples when helpful
- Be encouraging but realistic about challenges

When responding:
- Tailor your expertise to the question type (act as marketing expert for marketing questions, etc.)
- Reference their project context when available
- Provide structured, actionable advice
- Suggest next steps when appropriate

Remember: You're helping ambitious people build meaningful projects that can make a real impact.
        """.strip()

    async def generate_response(
        self, user_message: str, context: ConversationContext
    ) -> AIResponse:
        """Generate AI response using PydanticAI with conversation context"""

        # Prepare the context message
        context_info = self._prepare_context_message(context)

        # Combine context and user message
        full_message = f"{context_info}\n\nUser message: {user_message}"

        try:
            # Use PydanticAI to generate structured response
            result = await self.agent.run(full_message, message_history=[])
            return result.data
        except Exception as e:
            # Fallback response if AI fails
            return AIResponse(
                content=f"I apologize, but I'm having trouble processing your request right now. Could you please try rephrasing your question? Error: {str(e)}",
                response_type="error",
                confidence=0.0,
                requires_followup=True,
                followup_suggestion="Could you try asking your question in a different way?",
            )

    def _prepare_context_message(self, context: ConversationContext) -> str:
        """Prepare context information for the AI"""
        context_parts = []

        # Add user info if available
        if context.user_name:
            context_parts.append(f"User name: {context.user_name}")

        # Add project info if available
        if context.user_project_info:
            context_parts.append(f"User's project: {context.user_project_info}")

        # Add recent conversation history (last 10 messages)
        if context.conversation_history:
            context_parts.append("Recent conversation context:")
            recent_messages = (
                context.conversation_history[-10:]
                if len(context.conversation_history) > 10
                else context.conversation_history
            )

            for msg in recent_messages:
                role = "User" if msg.is_from_user else "Assistant"
                if msg.content:
                    context_parts.append(f"{role}: {msg.content}")

        return (
            "\n".join(context_parts)
            if context_parts
            else "No previous context available."
        )

    async def get_conversation_context(
        self, user_id: UUID, conversation_id: UUID
    ) -> ConversationContext:
        """Build conversation context from database"""

        # Get user info
        user = await db_service.get_user_by_id(user_id)

        # Get conversation history
        messages = await db_service.get_conversation_messages(conversation_id)

        return ConversationContext(
            user_id=user_id,
            conversation_id=conversation_id,
            user_name=user.name if user else None,
            conversation_history=messages,
            # TODO: Add user project info when user profiles are expanded
            user_project_info=None,
        )

    async def process_message_and_respond(
        self, user_message: str, user_id: UUID, conversation_id: UUID
    ) -> Message:
        """Process user message and generate AI response, saving both to database"""

        # Save user message first
        user_msg = await db_service.create_message(
            MessageCreate(
                conversation_id=conversation_id,
                user_id=user_id,
                content=user_message,
                message_type=MessageType.TEXT,
                is_from_user=True,
            )
        )

        # Get conversation context
        context = await self.get_conversation_context(user_id, conversation_id)

        # Generate AI response
        ai_response = await self.generate_response(user_message, context)

        # Save AI response to database
        ai_msg = await db_service.create_message(
            MessageCreate(
                conversation_id=conversation_id,
                user_id=user_id,
                content=ai_response.content,
                message_type=MessageType.TEXT,
                is_from_user=False,
            )
        )

        return ai_msg


# Global AI service instance
ai_service = AIService()
