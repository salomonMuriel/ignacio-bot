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

from agents import Agent, Runner, RunHooks, RunContextWrapper, Tool
from openai import OpenAI
from app.models.database import ConversationResult, MessageCreate, MessageType, UserFile
from app.services.database import db_service
from app.services.project_context_service import (
    project_context_service,
    ProjectContext,
    create_project_aware_instructions,
)
from app.services.storage import storage_service


class IgnacioRunHooks(RunHooks[ProjectContext]):
    """Custom lifecycle hooks for monitoring agent handoffs and operations"""

    async def on_agent_start(
        self, context: RunContextWrapper[ProjectContext], agent: Agent[ProjectContext]
    ) -> None:
        """Called when an agent starts processing"""
        print(f"[AGENT_LIFECYCLE] 🚀 Agent started: {agent.name}")

    async def on_agent_end(
        self,
        context: RunContextWrapper[ProjectContext],
        agent: Agent[ProjectContext],
        output: str,
    ) -> None:
        """Called when an agent finishes processing"""
        print(
            f"[AGENT_LIFECYCLE] ✅ Agent completed: {agent.name} (output: {len(output)} chars)"
        )

    async def on_handoff(
        self,
        context: RunContextWrapper[ProjectContext],
        from_agent: Agent[ProjectContext],
        to_agent: Agent[ProjectContext],
    ) -> None:
        """Called when a handoff occurs between agents"""
        user_info = f"User: {context.context.user_name or context.context.user_id}"
        project_info = f"Project: {context.context.project_name or 'No project'}"

        print(f"[AGENT_HANDOFF] 🔄 Handoff detected!")
        print(f"[AGENT_HANDOFF]   From: {from_agent.name}")
        print(f"[AGENT_HANDOFF]   To: {to_agent.name}")
        print(f"[AGENT_HANDOFF]   Context: {user_info}, {project_info}")

    async def on_tool_start(
        self,
        context: RunContextWrapper[ProjectContext],
        agent: Agent[ProjectContext],
        tool: Tool,
    ) -> None:
        """Called when a tool starts executing"""
        # Get tool name for logging
        tool_name = getattr(tool, "name", str(tool))

        # Only log specialist agent tools (handoffs), not internal tools
        if tool_name.endswith("_expert"):
            print(f"[AGENT_TOOL] 🔧 {agent.name} calling specialist: {tool_name}")

    async def on_tool_end(
        self,
        context: RunContextWrapper[ProjectContext],
        agent: Agent[ProjectContext],
        tool: Tool,
        result: str,
    ) -> None:
        """Called when a tool finishes executing"""
        # Get tool name for logging
        tool_name = getattr(tool, "name", str(tool))

        # Only log specialist agent tools (handoffs), not internal tools
        if tool_name.endswith("_expert"):
            output_preview = result[:100] + "..." if len(result) > 100 else result
            print(f"[AGENT_TOOL] ✅ {tool_name} completed for {agent.name}")
            print(f"[AGENT_TOOL]   Output preview: {output_preview}")


class IgnacioAgentService:
    """Simple OpenAI Agent SDK-based service for Ignacio Bot"""

    def __init__(self):
        self._setup_agents()
        self.openai_client = OpenAI()

    def _setup_agents(self):
        """Create the main agent and sub-agents with project context awareness"""
        print("[AI_SERVICE] Setting up agents with new domain-specific system...")

        # Specialist sub-agents with project context and domain-specific instructions
        print("[AI_SERVICE] Creating Marketing Expert agent...")
        self.marketing_agent = project_context_service.create_project_aware_agent(
            agent_name="Marketing Expert", domain="marketing"
        )
        self.marketing_agent.handoff_description = "Marketing expert for market research, customer acquisition, and growth strategies"

        print("[AI_SERVICE] Creating Technology Expert agent...")
        self.tech_agent = project_context_service.create_project_aware_agent(
            agent_name="Technology Expert", domain="technology"
        )
        self.tech_agent.handoff_description = "Technology expert for tech stack selection, development, and architecture decisions"

        print("[AI_SERVICE] Creating Finance Expert agent...")
        self.finance_agent = project_context_service.create_project_aware_agent(
            agent_name="Finance Expert", domain="finance"
        )
        self.finance_agent.handoff_description = "Finance expert for business models, funding strategies, and financial planning"

        # New specialist agents
        print("[AI_SERVICE] Creating Sustainability Expert agent...")
        self.sustainability_agent = project_context_service.create_project_aware_agent(
            agent_name="Sustainability Expert", domain="sustainability"
        )
        self.sustainability_agent.handoff_description = "Sustainability expert for ESG strategies, impact measurement, and environmental considerations"

        print("[AI_SERVICE] Creating Legal & Compliance Expert agent...")
        self.legal_agent = project_context_service.create_project_aware_agent(
            agent_name="Legal & Compliance Expert", domain="legal"
        )
        self.legal_agent.handoff_description = "Legal and compliance expert for business formation, contracts, and regulatory requirements"

        print("[AI_SERVICE] Creating Operations Expert agent...")
        self.operations_agent = project_context_service.create_project_aware_agent(
            agent_name="Operations Expert", domain="operations"
        )
        self.operations_agent.handoff_description = "Operations expert for process optimization, supply chain, and workflow automation"

        print("[AI_SERVICE] Creating Product & Design Expert agent...")
        self.product_agent = project_context_service.create_project_aware_agent(
            agent_name="Product & Design Expert", domain="product"
        )
        self.product_agent.handoff_description = "Product and design expert for UX/UI design, product development, and user research"

        print("[AI_SERVICE] Creating Sales Expert agent...")
        self.sales_agent = project_context_service.create_project_aware_agent(
            agent_name="Sales Expert", domain="sales"
        )
        self.sales_agent.handoff_description = "Sales expert for sales strategy, pipeline management, and customer relationships"

        # Main entry agent with sub-agents as tools and project context awareness
        print("[AI_SERVICE] Creating main Ignacio agent with all 8 specialists...")
        context_tools = project_context_service.get_context_tools()
        specialist_tools = [
            self.marketing_agent.as_tool(
                tool_name="marketing_expert",
                tool_description="Consult marketing specialist for market research, customer acquisition, and growth strategies",
            ),
            self.tech_agent.as_tool(
                tool_name="tech_expert",
                tool_description="Consult technology specialist for tech decisions, development, and architecture",
            ),
            self.finance_agent.as_tool(
                tool_name="finance_expert",
                tool_description="Consult finance specialist for business models, funding, and financial planning",
            ),
            self.sustainability_agent.as_tool(
                tool_name="sustainability_expert",
                tool_description="Consult sustainability specialist for ESG strategies, impact measurement, and environmental considerations",
            ),
            self.legal_agent.as_tool(
                tool_name="legal_expert",
                tool_description="Consult legal and compliance specialist for business formation, contracts, and regulatory requirements",
            ),
            self.operations_agent.as_tool(
                tool_name="operations_expert",
                tool_description="Consult operations specialist for process optimization, supply chain, and workflow automation",
            ),
            self.product_agent.as_tool(
                tool_name="product_expert",
                tool_description="Consult product and design specialist for UX/UI design, product development, and user research",
            ),
            self.sales_agent.as_tool(
                tool_name="sales_expert",
                tool_description="Consult sales specialist for sales strategy, pipeline management, and customer relationships",
            ),
        ]

        all_tools = specialist_tools + context_tools
        print(
            f"[AI_SERVICE] Main agent configured with {len(specialist_tools)} specialist tools and {len(context_tools)} context tools"
        )

        self.ignacio_agent = Agent[ProjectContext](
            name="Ignacio",
            instructions=create_project_aware_instructions,
            tools=all_tools,
        )

        print(
            f"[AI_SERVICE] Agent setup complete! Main agent '{self.ignacio_agent.name}' ready with {len(all_tools)} total tools"
        )

    async def generate_conversation_title(self, initial_message: str) -> str:
        """Generate a conversation title using OpenAI's gpt-4o-mini model"""
        try:
            response = await asyncio.to_thread(
                self.openai_client.chat.completions.create,
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "Generate a short, descriptive title (max 6 words) for a conversation based on the user's first message. Focus on the main topic or question.",
                    },
                    {"role": "user", "content": initial_message},
                ],
                max_tokens=20,
                temperature=0.3,
            )

            title = response.choices[0].message.content.strip()
            # Remove quotes if present and ensure reasonable length
            title = title.strip("\"'").strip()
            return title[:60] if len(title) > 60 else title

        except Exception as e:
            # Fallback to truncated initial message if title generation fails
            return (
                initial_message[:50] + "..."
                if len(initial_message) > 50
                else initial_message
            )

    def _process_file_for_agent(
        self, file_content: bytes, file_name: str, file_type: str
    ) -> dict:
        """Process a file for Agent SDK input (only supports images and PDFs)"""
        try:
            if file_type.startswith("image/"):
                # Handle images with base64 encoding
                base64_image = base64.b64encode(file_content).decode("utf-8")
                return {
                    "type": "input_image",
                    "image_url": f"data:{file_type};base64,{base64_image}",
                }

            elif file_type == "application/pdf":
                # Handle PDFs with base64 encoding
                base64_file = base64.b64encode(file_content).decode("utf-8")
                return {
                    "type": "input_file",
                    "filename": file_name,
                    "file_data": f"data:{file_type};base64,{base64_file}",
                }

            else:
                # This should not happen due to validation in upload endpoints
                raise ValueError(f"Unsupported file type: {file_type}")

        except Exception as e:
            # If file processing fails, return a text description
            return {
                "type": "input_text",
                "text": f"[File attachment: {file_name} - Unable to process: {str(e)}]",
            }

    async def start_conversation(
        self,
        user_id: UUID,
        initial_message: str,
        project_id: UUID | None = None,
        file_contents: list[tuple[bytes, str, str]] | None = None,
    ) -> ConversationResult:
        """Start a new conversation with Ignacio"""
        start_time = time.time()

        # Generate conversation title using AI
        generated_title = await self.generate_conversation_title(initial_message)

        # Create conversation in database
        conversation_data = {
            "user_id": user_id,
            "title": generated_title,
            "language_preference": "es",
        }

        if project_id:
            conversation_data["project_id"] = project_id

        conversation = await db_service.create_conversation(conversation_data)

        # Process the message
        result = await self.continue_conversation(
            conversation.id, initial_message, file_contents=file_contents
        )
        return result

    async def continue_conversation(
        self,
        conversation_id: UUID,
        message: str,
        file_attachments: List[UserFile] = None,
        file_contents: List[tuple[bytes, str, str]] = None,
    ) -> ConversationResult:
        """Continue an existing conversation with project context"""
        start_time = time.time()

        try:
            # Get conversation
            conversation = await db_service.get_conversation(conversation_id)
            if not conversation:
                raise ValueError(f"Conversation {conversation_id} not found")

            # Get user information to include name in context
            user = await db_service.get_user_by_id(conversation.user_id)
            user_name = user.name if user and user.name else None

            # Load project context based on conversation's project association
            if conversation.project_id:
                # Load specific project context
                project = await db_service.get_project_by_id(conversation.project_id)
                if project:
                    # Create project context from the specific project
                    project_context = ProjectContext(
                        user_id=str(conversation.user_id),
                        user_name=user_name,
                        project_name=project.project_name,
                        project_type=project.project_type,
                        description=project.description,
                        current_stage=project.current_stage,
                        target_audience=project.target_audience,
                        problem_statement=project.problem_statement,
                        solution_approach=project.solution_approach,
                        business_model=project.business_model,
                        context_data=project.context_data or {},
                    )
                else:
                    # Fallback to user's general context if project not found
                    project_context = await project_context_service.get_user_context(
                        conversation.user_id
                    )
            else:
                # Load user's general project context (for backwards compatibility)
                project_context = await project_context_service.get_user_context(
                    conversation.user_id
                )

            # Prepare message content for Agent SDK
            message_content = []

            # Add file attachments if provided
            if file_contents:
                print(
                    f"[AI_SERVICE] Processing {len(file_contents)} file(s) for Agent SDK"
                )
                # Process files directly from content (more efficient)
                for file_content, file_name, file_type in file_contents:
                    print(
                        f"[AI_SERVICE] Processing file: {file_name} ({file_type}, {len(file_content)} bytes)"
                    )
                    file_input = self._process_file_for_agent(
                        file_content, file_name, file_type
                    )
                    print(
                        f"[AI_SERVICE] File processed as: {file_input.get('type', 'unknown')}"
                    )
                    message_content.append(file_input)
            elif file_attachments:
                # Legacy support: download from storage (less efficient)
                for file_attachment in file_attachments:
                    file_content = await storage_service.get_file_content(
                        file_attachment.file_path
                    )
                    file_input = self._process_file_for_agent(
                        file_content,
                        file_attachment.file_name,
                        file_attachment.file_type,
                    )
                    message_content.append(file_input)

            # Add text message
            message_content.append({"type": "input_text", "text": message})

            print(
                f"[AI_SERVICE] Final message content structure: {len(message_content)} items"
            )
            for i, item in enumerate(message_content):
                print(
                    f"[AI_SERVICE] Item {i}: {item.get('type', 'unknown')} - {item.get('filename', 'N/A') if 'filename' in item else 'text content'}"
                )

            # Create messages in Agent SDK format
            agent_messages = [{"role": "user", "content": message_content}]

            print(
                f"[AI_SERVICE] Calling Agent SDK with {len(agent_messages)} message(s)"
            )

            # Create lifecycle hooks for monitoring handoffs
            hooks = IgnacioRunHooks()
            print(f"[AI_SERVICE] Lifecycle hooks enabled for handoff monitoring")

            # Run the main agent with context, file attachments, and lifecycle hooks
            result = await Runner.run(
                self.ignacio_agent, agent_messages, context=project_context, hooks=hooks
            )
            print(f"[AI_SERVICE] Agent SDK completed successfully")

            execution_time = int((time.time() - start_time) * 1000)

            # Create and store user message (attachments temporarily disabled until database migration)
            user_message = MessageCreate(
                conversation_id=conversation_id,
                user_id=conversation.user_id,
                content=message,
                message_type=MessageType.TEXT,
                is_from_user=True,
            )
            await db_service.create_message(user_message)

            # Create and store AI response message
            ai_message = MessageCreate(
                conversation_id=conversation_id,
                user_id=conversation.user_id,
                content=result.final_output,
                message_type=MessageType.TEXT,
                is_from_user=False,
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
                execution_time_ms=execution_time,
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
