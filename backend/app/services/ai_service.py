"""
AI service using OpenAI Agent SDK for Ignacio Bot
Provides AI-powered conversation capabilities with specialized agents
Each user gets one persistent session.
There is one entry agent and many subagents.
The entry agent is an all-around seasoned Entrepreneur.
The sub-agents are experts in Design Thinking, Marketing, Sales, Agile Mentality, Finances, Tech and Leadership.
The entry agent hands off the conversation to one of the subagents if it deems it necessary.
All agents can decide to search the web and look into files that have been uploaded to OpenAI as part of the session.
Even if queries from the user start in another language, all agent workflow and prompting should be in English.
There should be a final output agent that translates the output of the agentic workflow to the user language.
"""

import asyncio
import json
import time
from typing import Any, Dict, List, Optional
from uuid import UUID

from agents import Agent, FileSearchTool, OpenAIConversationsSession, Runner, WebSearchTool
from openai import OpenAI

from app.models.database import (
    AgentInteraction,
    AgentInteractionCreate,
    Conversation,
    ConversationResult,
    ConversationSummary,
    FileIntegrationResult,
    ProjectStage,
    ProjectType,
    SyncStatus,
    UserFile,
    UserProject,
)
from app.services.database import db_service
from app.core.config import settings


class ProjectContext:
    """Project context for Agent SDK conversations"""

    def __init__(self,
                 user_id: UUID,
                 project_name: Optional[str] = None,
                 project_type: Optional[ProjectType] = None,
                 current_stage: Optional[ProjectStage] = None,
                 problem_statement: Optional[str] = None,
                 target_audience: Optional[str] = None,
                 uploaded_files: List[str] = None,
                 language_preference: str = "es"):
        self.user_id = user_id
        self.project_name = project_name
        self.project_type = project_type
        self.current_stage = current_stage
        self.problem_statement = problem_statement
        self.target_audience = target_audience
        self.uploaded_files = uploaded_files or []
        self.language_preference = language_preference

    def to_dict(self) -> Dict[str, Any]:
        return {
            "user_id": str(self.user_id),
            "project_name": self.project_name,
            "project_type": self.project_type,
            "current_stage": self.current_stage,
            "problem_statement": self.problem_statement,
            "target_audience": self.target_audience,
            "uploaded_files": self.uploaded_files,
            "language_preference": self.language_preference,
        }


class VectorStoreManager:
    """Manages vector stores for file search capabilities"""

    def __init__(self):
        self.openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self._user_vector_stores: Dict[UUID, str] = {}

    async def ensure_user_vector_store(self, user_id: UUID) -> str:
        """Ensure user has a dedicated vector store for file search"""
        if user_id in self._user_vector_stores:
            return self._user_vector_stores[user_id]

        # Check if user already has a vector store in database
        user_files = await db_service.get_user_files(user_id)
        existing_vector_store = None

        for file in user_files:
            if file.vector_store_id:
                existing_vector_store = file.vector_store_id
                break

        if existing_vector_store:
            self._user_vector_stores[user_id] = existing_vector_store
            return existing_vector_store

        # Create new vector store
        vector_store = self.openai_client.vector_stores.create(
            name=f"User-{user_id}-Files"
        )

        self._user_vector_stores[user_id] = vector_store.id
        return vector_store.id

    async def sync_file_to_vector_store(self, user_id: UUID, file: UserFile) -> bool:
        """Sync Supabase file to user's OpenAI vector store"""
        try:
            vector_store_id = await self.ensure_user_vector_store(user_id)

            # Update file with sync in progress
            await db_service.update_user_file(
                file.id,
                {"openai_sync_status": SyncStatus.SYNCING.value}
            )

            # Read file content from Supabase Storage
            # TODO: Implement file content reading from Supabase Storage
            # For now, we'll create a placeholder implementation
            file_content = f"File: {file.file_name}\nType: {file.file_type}\nSize: {file.file_size} bytes"

            # Upload to OpenAI
            openai_file = self.openai_client.files.create(
                file=(file.file_name, file_content.encode('utf-8')),
                purpose="assistants"
            )

            # Add to vector store
            vector_file = self.openai_client.vector_stores.files.create_and_poll(
                vector_store_id=vector_store_id,
                file_id=openai_file.id
            )

            # Update database with success
            await db_service.update_user_file(file.id, {
                "openai_file_id": openai_file.id,
                "vector_store_id": vector_store_id,
                "openai_sync_status": SyncStatus.SYNCED.value,
                "openai_uploaded_at": time.time(),
                "content_preview": file_content[:500],
                "metadata": {"openai_vector_file_id": vector_file.id}
            })

            return True

        except Exception as e:
            # Update database with failure
            await db_service.update_user_file(
                file.id,
                {
                    "openai_sync_status": SyncStatus.FAILED.value,
                    "metadata": {"error": str(e)}
                }
            )
            return False

    async def cleanup_expired_files(self, user_id: UUID) -> int:
        """Remove expired files and re-upload if needed"""
        user_files = await db_service.get_user_files(user_id)
        expired_count = 0

        for file in user_files:
            if file.openai_sync_status == SyncStatus.EXPIRED:
                # Re-sync expired files
                success = await self.sync_file_to_vector_store(user_id, file)
                if success:
                    expired_count += 1

        return expired_count


class IgnacioAgentService:
    """
    OpenAI Agent SDK-based service for Ignacio Bot
    Manages multi-agent conversations with persistent context
    """

    def __init__(self):
        self.vector_manager = VectorStoreManager()
        self._sessions: Dict[UUID, OpenAIConversationsSession] = {}
        self._agents = self._create_agents()

    def _create_agents(self) -> Dict[str, Agent]:
        """Create and configure all agents"""
        agents = {}

        # Entry Agent (Ignacio)
        agents['ignacio'] = Agent(
            name="Ignacio",
            instructions="""You are Ignacio, a seasoned entrepreneur and mentor for Action Lab participants.

            You help people build impactful projects - new companies, NGOs, foundations, spinoffs, or internal innovations.

            **Core Responsibilities:**
            - Analyze user questions and determine if specialist expertise is needed
            - Maintain project context and progress tracking
            - Provide holistic guidance on project development
            - Use file search to reference user's uploaded documents
            - Use web search for current market insights and trends

            **When to consult specialists:**
            - Design Thinking: User research, problem definition, ideation challenges
            - Marketing: Market analysis, positioning, customer acquisition strategies
            - Sales: Sales process, conversion optimization, customer relationships
            - Agile/PM: Project planning, methodology, team coordination
            - Finance: Business models, funding strategies, financial planning
            - Tech: Technology decisions, architecture, technical implementation
            - Leadership: Team building, management, organizational challenges

            **Always:**
            - Reference user's project context when available
            - Search uploaded documents for relevant information
            - Use web search for current, relevant information
            - Provide actionable, specific advice
            - Respond in English (translation handled separately)
            """,
            tools=[
                FileSearchTool(max_num_results=5, include_search_results=True),
                WebSearchTool(user_location={"type": "approximate", "country": "Mexico"}),
            ]
        )

        # Specialist Agents
        agents['design_thinking'] = Agent(
            name="Design Thinking Expert",
            instructions="""You are a design thinking specialist helping Action Lab participants.

            **Expertise:**
            - Human-centered design methodology
            - User research and empathy mapping
            - Problem definition and framing
            - Ideation techniques and brainstorming
            - Prototyping and testing strategies
            - Journey mapping and service design

            **Always:**
            - Use design thinking frameworks (empathize, define, ideate, prototype, test)
            - Reference user research best practices
            - Suggest practical exercises and tools
            - Focus on user needs and pain points
            """,
            tools=[
                FileSearchTool(max_num_results=3, include_search_results=True),
                WebSearchTool(user_location={"type": "approximate", "country": "Mexico"}),
            ]
        )

        agents['marketing'] = Agent(
            name="Marketing Expert",
            instructions="""You are a marketing specialist for Action Lab participants.

            **Expertise:**
            - Market research and competitive analysis
            - Customer segmentation and personas
            - Value proposition development
            - Go-to-market strategies
            - Digital marketing channels and tactics
            - Brand positioning and messaging
            - Customer acquisition cost optimization
            - Growth strategies for startups/NGOs

            **Always:**
            - Use web search for current market trends
            - Reference user's project documents
            - Provide specific, measurable tactics
            - Consider Latin American market context
            - Suggest cost-effective marketing approaches
            """,
            tools=[
                FileSearchTool(max_num_results=3, include_search_results=True),
                WebSearchTool(user_location={"type": "approximate", "country": "Mexico"}),
            ]
        )

        agents['sales'] = Agent(
            name="Sales Expert",
            instructions="""You are a sales specialist for Action Lab participants.

            **Expertise:**
            - Sales process design and optimization
            - Lead generation and qualification
            - Conversion funnel analysis
            - Customer relationship management
            - Pricing strategies and negotiation
            - Sales team building and training
            - B2B and B2C sales approaches

            **Always:**
            - Focus on actionable sales tactics
            - Consider cultural aspects of Latin American sales
            - Provide templates and frameworks
            - Address both digital and traditional sales
            """,
            tools=[
                FileSearchTool(max_num_results=3, include_search_results=True),
                WebSearchTool(user_location={"type": "approximate", "country": "Mexico"}),
            ]
        )

        agents['agile_pm'] = Agent(
            name="Agile & Project Management Expert",
            instructions="""You are an agile methodology and project management specialist.

            **Expertise:**
            - Agile frameworks (Scrum, Kanban, Lean)
            - Project planning and execution
            - Team coordination and communication
            - Sprint planning and retrospectives
            - Risk management and mitigation
            - Resource allocation and timeline management
            - Remote team management

            **Always:**
            - Recommend practical agile tools and techniques
            - Consider team size and experience level
            - Provide templates for planning and tracking
            - Focus on continuous improvement
            """,
            tools=[
                FileSearchTool(max_num_results=3, include_search_results=True),
                WebSearchTool(user_location={"type": "approximate", "country": "Mexico"}),
            ]
        )

        agents['finance'] = Agent(
            name="Finance Expert",
            instructions="""You are a finance specialist for Action Lab participants.

            **Expertise:**
            - Business model development
            - Financial planning and forecasting
            - Funding strategies (bootstrapping, investors, grants)
            - Cost structure optimization
            - Revenue model design
            - Investment and ROI analysis
            - Financial controls and reporting

            **Always:**
            - Provide practical financial templates
            - Consider different funding options available in Latin America
            - Focus on sustainable financial models
            - Address both for-profit and non-profit structures
            """,
            tools=[
                FileSearchTool(max_num_results=3, include_search_results=True),
                WebSearchTool(user_location={"type": "approximate", "country": "Mexico"}),
            ]
        )

        agents['tech'] = Agent(
            name="Technology Expert",
            instructions="""You are a technology specialist for Action Lab participants.

            **Expertise:**
            - Technology stack selection
            - Software architecture and design
            - Development methodologies
            - Cloud platforms and infrastructure
            - Security and data protection
            - Integration and API strategies
            - Technology team building

            **Always:**
            - Recommend cost-effective technology solutions
            - Consider scalability and maintenance
            - Provide practical implementation guidance
            - Address both technical and business aspects
            """,
            tools=[
                FileSearchTool(max_num_results=3, include_search_results=True),
                WebSearchTool(user_location={"type": "approximate", "country": "Mexico"}),
            ]
        )

        agents['leadership'] = Agent(
            name="Leadership Expert",
            instructions="""You are a leadership and organizational development specialist.

            **Expertise:**
            - Team building and culture development
            - Leadership styles and approaches
            - Organizational structure design
            - Change management
            - Performance management
            - Communication and conflict resolution
            - Scaling teams and operations

            **Always:**
            - Focus on practical leadership tools
            - Consider cultural context of Latin America
            - Address both startup and established organization needs
            - Provide frameworks for decision-making
            """,
            tools=[
                FileSearchTool(max_num_results=3, include_search_results=True),
                WebSearchTool(user_location={"type": "approximate", "country": "Mexico"}),
            ]
        )

        # Output Translation Agent
        agents['translator'] = Agent(
            name="Output Translator",
            instructions="""You translate AI responses to the user's preferred language while maintaining:
            - Technical accuracy and business terminology
            - Professional tone appropriate for entrepreneurs/innovators
            - Cultural context for Latin American business environment
            - Action Lab program terminology and concepts

            Always preserve:
            - Specific metrics, numbers, and data
            - Tool names and technical terms
            - Action items and recommendations structure

            Translate naturally while keeping the expertise and authority of the original response.
            """,
        )

        return agents

    async def _get_session(self, conversation_id: UUID) -> OpenAIConversationsSession:
        """Get or create OpenAI session for conversation"""
        if conversation_id not in self._sessions:
            # Get conversation from database
            conversation = await db_service.get_conversation(conversation_id)

            if conversation and conversation.openai_session_id:
                # Use existing session
                session = OpenAIConversationsSession()
                # TODO: Load existing session state
                self._sessions[conversation_id] = session
            else:
                # Create new session
                session = OpenAIConversationsSession()
                self._sessions[conversation_id] = session

                # Update conversation with session ID
                await db_service.update_conversation(
                    conversation_id,
                    {"openai_session_id": f"session_{conversation_id}"}
                )

        return self._sessions[conversation_id]

    async def _get_project_context(self, user_id: UUID) -> ProjectContext:
        """Get user's project context"""
        # Get user's primary project
        user_projects = await db_service.get_user_projects(user_id)
        project = user_projects[0] if user_projects else None

        # Get user's files for context
        user_files = await db_service.get_user_files(user_id)
        file_names = [f.file_name for f in user_files if f.openai_sync_status == SyncStatus.SYNCED]

        return ProjectContext(
            user_id=user_id,
            project_name=project.project_name if project else None,
            project_type=project.project_type if project else None,
            current_stage=project.current_stage if project else None,
            problem_statement=project.problem_statement if project else None,
            target_audience=project.target_audience if project else None,
            uploaded_files=file_names,
            language_preference="es"  # Default to Spanish, will be configurable later
        )

    async def _determine_specialist_agent(self, message: str, context: ProjectContext) -> str:
        """Determine which specialist agent should handle the message"""
        # Simple keyword-based routing for now
        # TODO: Use AI to make this decision more intelligently

        message_lower = message.lower()

        if any(keyword in message_lower for keyword in [
            "usuario", "user", "research", "problema", "problem", "empatía", "empathy",
            "prototipo", "prototype", "testing", "diseño", "design"
        ]):
            return "design_thinking"

        elif any(keyword in message_lower for keyword in [
            "marketing", "mercado", "market", "cliente", "customer", "campaña", "campaign",
            "publicidad", "advertising", "brand", "marca", "posicionamiento", "positioning"
        ]):
            return "marketing"

        elif any(keyword in message_lower for keyword in [
            "ventas", "sales", "vender", "sell", "cliente", "customer", "conversión", "conversion",
            "precio", "price", "negociación", "negotiation"
        ]):
            return "sales"

        elif any(keyword in message_lower for keyword in [
            "agile", "scrum", "kanban", "proyecto", "project", "equipo", "team",
            "planning", "planificación", "sprint", "metodología", "methodology"
        ]):
            return "agile_pm"

        elif any(keyword in message_lower for keyword in [
            "finanzas", "finance", "dinero", "money", "inversión", "investment",
            "presupuesto", "budget", "costos", "costs", "ingresos", "revenue"
        ]):
            return "finance"

        elif any(keyword in message_lower for keyword in [
            "tecnología", "technology", "software", "desarrollo", "development",
            "programación", "programming", "sistema", "system", "app", "web"
        ]):
            return "tech"

        elif any(keyword in message_lower for keyword in [
            "liderazgo", "leadership", "equipo", "team", "gestión", "management",
            "cultura", "culture", "organización", "organization"
        ]):
            return "leadership"

        # Default to entry agent
        return "ignacio"

    async def _log_interaction(self, conversation_id: UUID, agent_name: str,
                             input_text: str, output_text: str, tools_used: List[str],
                             execution_time_ms: int) -> None:
        """Log agent interaction to database"""
        interaction = AgentInteractionCreate(
            conversation_id=conversation_id,
            agent_name=agent_name,
            input_text=input_text,
            output_text=output_text,
            tools_used=tools_used,
            execution_time_ms=execution_time_ms
        )

        await db_service.create_agent_interaction(interaction)

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
        result.conversation_id = conversation.id

        return result

    async def continue_conversation(self, conversation_id: UUID, message: str) -> ConversationResult:
        """Continue an existing conversation"""
        start_time = time.time()

        try:
            # Get conversation and user info
            conversation = await db_service.get_conversation(conversation_id)
            if not conversation:
                raise ValueError(f"Conversation {conversation_id} not found")

            # Get project context
            context = await self._get_project_context(conversation.user_id)

            # Determine which agent to use
            agent_name = await self._determine_specialist_agent(message, context)
            agent = self._agents[agent_name]

            # Set up vector store for file search
            vector_store_id = await self.vector_manager.ensure_user_vector_store(conversation.user_id)

            # Update agent tools with user-specific vector store
            if hasattr(agent, 'tools'):
                for tool in agent.tools:
                    if isinstance(tool, FileSearchTool):
                        tool.vector_store_ids = [vector_store_id]

            # Get session and run agent
            session = await self._get_session(conversation_id)

            # Add context to message
            contextual_message = f"""
            User Message: {message}

            Project Context:
            - Project: {context.project_name or 'Not specified'}
            - Type: {context.project_type or 'Not specified'}
            - Stage: {context.current_stage or 'Not specified'}
            - Problem: {context.problem_statement or 'Not specified'}
            - Target Audience: {context.target_audience or 'Not specified'}
            - Available Files: {', '.join(context.uploaded_files) if context.uploaded_files else 'None'}
            """

            # Run agent
            result = await Runner.run(agent, contextual_message, session=session)

            # Get tools used (simplified for now)
            tools_used = []
            if hasattr(result, 'new_items'):
                for item in result.new_items:
                    if hasattr(item, 'tool_name'):
                        tools_used.append(item.tool_name)

            # Translate if needed
            final_output = result.final_output
            if context.language_preference != "en":
                translator = self._agents['translator']
                translation_prompt = f"""
                Translate the following response to {context.language_preference}:

                {final_output}

                User's language preference: {context.language_preference}
                """

                translation_result = await Runner.run(translator, translation_prompt)
                final_output = translation_result.final_output

            execution_time = int((time.time() - start_time) * 1000)

            # Log interaction
            await self._log_interaction(
                conversation_id=conversation_id,
                agent_name=agent_name,
                input_text=message,
                output_text=final_output,
                tools_used=tools_used,
                execution_time_ms=execution_time
            )

            # Create and store user message
            await db_service.create_message({
                "conversation_id": conversation_id,
                "user_id": conversation.user_id,
                "content": message,
                "is_from_user": True
            })

            # Create and store AI response message
            await db_service.create_message({
                "conversation_id": conversation_id,
                "user_id": conversation.user_id,
                "content": final_output,
                "is_from_user": False
            })

            return ConversationResult(
                conversation_id=conversation_id,
                response_text=final_output,
                agent_used=agent_name,
                tools_called=tools_used,
                confidence_score=0.9,  # TODO: Implement confidence scoring
                suggested_actions=[],  # TODO: Extract suggested actions from response
                requires_followup=False,  # TODO: Determine if followup needed
                execution_time_ms=execution_time
            )

        except Exception as e:
            execution_time = int((time.time() - start_time) * 1000)

            # Log error interaction
            await self._log_interaction(
                conversation_id=conversation_id,
                agent_name="error_handler",
                input_text=message,
                output_text=f"Error: {str(e)}",
                tools_used=[],
                execution_time_ms=execution_time
            )

            raise e

    async def upload_file_to_context(self, user_id: UUID, file_path: str) -> FileIntegrationResult:
        """Upload file to user's context and sync with vector store"""
        try:
            # Get file from database
            user_files = await db_service.get_user_files(user_id)
            file = next((f for f in user_files if f.file_path == file_path), None)

            if not file:
                return FileIntegrationResult(
                    success=False,
                    error_message=f"File not found: {file_path}"
                )

            # Sync to vector store
            success = await self.vector_manager.sync_file_to_vector_store(user_id, file)

            if success:
                return FileIntegrationResult(
                    success=True,
                    openai_file_id=file.openai_file_id,
                    vector_store_updated=True,
                    content_preview=file.content_preview
                )
            else:
                return FileIntegrationResult(
                    success=False,
                    error_message="Failed to sync file to vector store"
                )

        except Exception as e:
            return FileIntegrationResult(
                success=False,
                error_message=str(e)
            )

    async def get_conversation_summary(self, conversation_id: UUID) -> ConversationSummary:
        """Get conversation summary for context management"""
        try:
            conversation = await db_service.get_conversation(conversation_id)
            if not conversation:
                raise ValueError(f"Conversation {conversation_id} not found")

            messages = await db_service.get_conversation_messages(conversation_id)
            interactions = await db_service.get_conversation_interactions(conversation_id)

            # Extract tools used
            tools_used = []
            for interaction in interactions:
                tools_used.extend(interaction.tools_used)
            tools_used = list(set(tools_used))  # Remove duplicates

            return ConversationSummary(
                conversation_id=conversation_id,
                total_messages=len(messages),
                agent_interactions=len(interactions),
                tools_used=tools_used,
                key_topics=[],  # TODO: Implement topic extraction
                project_context=conversation.project_context,
                last_activity=max(m.created_at for m in messages) if messages else conversation.created_at
            )

        except Exception as e:
            raise e

    async def update_project_context(self, user_id: UUID, project_data: dict) -> None:
        """Update user's project context"""
        # Create or update user project
        existing_projects = await db_service.get_user_projects(user_id)

        if existing_projects:
            # Update existing project
            await db_service.update_user_project(existing_projects[0].id, project_data)
        else:
            # Create new project
            project_data['user_id'] = user_id
            await db_service.create_user_project(project_data)

        # Update all user's conversations with new project context
        user_conversations = await db_service.get_user_conversations(user_id)
        context = await self._get_project_context(user_id)

        for conversation in user_conversations:
            await db_service.update_conversation(
                conversation.id,
                {"project_context": context.to_dict()}
            )


# Global service instance
ignacio_service = IgnacioAgentService()