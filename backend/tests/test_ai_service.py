"""
Tests for IgnacioAgentService using OpenAI Agent SDK
"""

import time
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest

from app.models.database import (
    ConversationResult,
    FileIntegrationResult,
    ProjectStage,
    ProjectType,
    SyncStatus,
)
from app.services.ai_service import IgnacioAgentService, ProjectContext, VectorStoreManager
from tests.utils.mocks import (
    MockIgnacioAgentService,
    MockOpenAIAgentClient,
    MockRunner,
    MockVectorStoreManager,
)


class TestProjectContext:
    """Test ProjectContext model"""

    def test_project_context_creation(self):
        """Test creating project context"""
        user_id = uuid4()
        context = ProjectContext(
            user_id=user_id,
            project_name="Test Startup",
            project_type=ProjectType.STARTUP,
            current_stage=ProjectStage.IDEATION,
            problem_statement="Solving efficiency problems",
            target_audience="Tech entrepreneurs",
            uploaded_files=["business_plan.pdf", "market_research.docx"],
            language_preference="es"
        )

        assert context.user_id == user_id
        assert context.project_name == "Test Startup"
        assert context.project_type == ProjectType.STARTUP
        assert context.current_stage == ProjectStage.IDEATION
        assert "efficiency" in context.problem_statement
        assert context.language_preference == "es"
        assert len(context.uploaded_files) == 2

    def test_project_context_to_dict(self):
        """Test converting project context to dictionary"""
        user_id = uuid4()
        context = ProjectContext(
            user_id=user_id,
            project_name="Tech Startup",
            project_type=ProjectType.STARTUP,
            current_stage=ProjectStage.RESEARCH,
            problem_statement="Solving data analytics problems",
            target_audience="Data scientists",
            uploaded_files=["data.csv"],
            language_preference="en"
        )

        context_dict = context.to_dict()

        assert context_dict["user_id"] == str(user_id)
        assert context_dict["project_name"] == "Tech Startup"
        assert context_dict["project_type"] == ProjectType.STARTUP
        assert context_dict["current_stage"] == ProjectStage.RESEARCH
        assert context_dict["language_preference"] == "en"
        assert "data.csv" in context_dict["uploaded_files"]


class TestVectorStoreManager:
    """Test VectorStoreManager functionality"""

    @pytest.fixture
    def mock_openai_client(self):
        """Mock OpenAI client for vector operations"""
        return MockOpenAIAgentClient()

    @pytest.fixture
    def vector_manager(self, mock_openai_client):
        """Vector store manager with mocked OpenAI client"""
        with patch("app.services.ai_service.OpenAI") as mock_openai_class:
            mock_openai_class.return_value = mock_openai_client
            manager = VectorStoreManager()
            manager.openai_client = mock_openai_client
            yield manager

    @pytest.mark.asyncio
    async def test_ensure_user_vector_store_new(self, vector_manager, test_user):
        """Test creating new vector store for user"""
        with patch("app.services.ai_service.db_service") as mock_db:
            mock_db.get_user_files.return_value = []

            vector_store_id = await vector_manager.ensure_user_vector_store(test_user.id)

            assert vector_store_id == "vs-test123"
            assert test_user.id in vector_manager._user_vector_stores

    @pytest.mark.asyncio
    async def test_ensure_user_vector_store_existing(self, vector_manager, test_user, test_user_file):
        """Test using existing vector store for user"""
        with patch("app.services.ai_service.db_service") as mock_db:
            test_user_file.vector_store_id = "vs-existing123"
            mock_db.get_user_files.return_value = [test_user_file]

            vector_store_id = await vector_manager.ensure_user_vector_store(test_user.id)

            assert vector_store_id == "vs-existing123"

    @pytest.mark.asyncio
    async def test_sync_file_to_vector_store_success(self, vector_manager, test_user, test_user_file):
        """Test successful file sync to vector store"""
        with patch("app.services.ai_service.db_service") as mock_db:
            mock_db.get_user_files.return_value = []
            mock_db.update_user_file.return_value = test_user_file

            success = await vector_manager.sync_file_to_vector_store(test_user.id, test_user_file)

            assert success is True
            assert mock_db.update_user_file.call_count >= 2  # SYNCING + SYNCED updates

    @pytest.mark.asyncio
    async def test_sync_file_to_vector_store_failure(self, vector_manager, test_user, test_user_file):
        """Test file sync failure handling"""
        with patch("app.services.ai_service.db_service") as mock_db:
            mock_db.get_user_files.return_value = []
            mock_db.update_user_file.return_value = test_user_file

            # Simulate OpenAI API failure
            vector_manager.openai_client.files.create.side_effect = Exception("OpenAI API Error")

            success = await vector_manager.sync_file_to_vector_store(test_user.id, test_user_file)

            assert success is False

    @pytest.mark.asyncio
    async def test_cleanup_expired_files(self, vector_manager, test_user, test_user_file):
        """Test cleaning up expired files"""
        with patch("app.services.ai_service.db_service") as mock_db:
            test_user_file.openai_sync_status = SyncStatus.EXPIRED
            mock_db.get_user_files.return_value = [test_user_file]
            mock_db.update_user_file.return_value = test_user_file

            expired_count = await vector_manager.cleanup_expired_files(test_user.id)

            assert expired_count == 1


class TestIgnacioAgentService:
    """Test IgnacioAgentService functionality"""

    @pytest.fixture
    def mock_vector_manager(self):
        """Mock VectorStoreManager"""
        return MockVectorStoreManager()

    @pytest.fixture
    def mock_runner(self):
        """Mock Agent SDK Runner"""
        with patch("app.services.ai_service.Runner") as mock_runner_class:
            mock_runner_class.run = MockRunner.run
            yield mock_runner_class

    @pytest.fixture
    def agent_service(self, mock_vector_manager, mock_runner):
        """IgnacioAgentService with mocked dependencies"""
        with patch("app.services.ai_service.VectorStoreManager") as mock_vm_class:
            mock_vm_class.return_value = mock_vector_manager
            service = IgnacioAgentService()
            service.vector_manager = mock_vector_manager
            yield service

    def test_agent_service_initialization(self, agent_service):
        """Test IgnacioAgentService initialization"""
        assert agent_service.vector_manager is not None
        assert isinstance(agent_service._sessions, dict)
        assert isinstance(agent_service._agents, dict)

        # Verify all expected agents are created
        expected_agents = [
            "ignacio", "design_thinking", "marketing", "sales",
            "agile_pm", "finance", "tech", "leadership", "translator"
        ]
        for agent_name in expected_agents:
            assert agent_name in agent_service._agents

    def test_agent_instructions_content(self, agent_service):
        """Test that agent instructions contain required elements"""
        ignacio_instructions = agent_service._agents["ignacio"].instructions

        assert "Ignacio" in ignacio_instructions
        assert "Action Lab" in ignacio_instructions
        assert "projects" in ignacio_instructions
        assert "file search" in ignacio_instructions
        assert "web search" in ignacio_instructions

        # Check specialist agent instructions
        marketing_instructions = agent_service._agents["marketing"].instructions
        assert "marketing" in marketing_instructions.lower()
        assert "market research" in marketing_instructions.lower()

        tech_instructions = agent_service._agents["tech"].instructions
        assert "technology" in tech_instructions.lower()
        assert "architecture" in tech_instructions.lower()

    @pytest.mark.asyncio
    async def test_get_project_context(self, agent_service, test_user, test_user_project, test_user_file):
        """Test building project context from database"""
        with patch("app.services.ai_service.db_service") as mock_db:
            mock_db.get_user_projects.return_value = [test_user_project]
            test_user_file.openai_sync_status = SyncStatus.SYNCED
            mock_db.get_user_files.return_value = [test_user_file]

            context = await agent_service._get_project_context(test_user.id)

            assert context.user_id == test_user.id
            assert context.project_name == test_user_project.project_name
            assert context.project_type == ProjectType.STARTUP
            assert context.current_stage == ProjectStage.IDEATION
            assert len(context.uploaded_files) == 1
            assert test_user_file.file_name in context.uploaded_files

    def test_determine_specialist_agent(self, agent_service, test_user):
        """Test agent routing based on message content"""
        context = ProjectContext(user_id=test_user.id)

        # Test marketing keywords
        marketing_message = "I need help with marketing my startup and customer acquisition"
        agent = agent_service._determine_specialist_agent(marketing_message, context)
        assert agent == "marketing"

        # Test technical keywords
        tech_message = "What technology stack should I use for my web application?"
        agent = agent_service._determine_specialist_agent(tech_message, context)
        assert agent == "tech"

        # Test sales keywords
        sales_message = "How can I improve my sales conversion rate?"
        agent = agent_service._determine_specialist_agent(sales_message, context)
        assert agent == "sales"

        # Test design thinking keywords
        design_message = "I need to understand my users better and do research"
        agent = agent_service._determine_specialist_agent(design_message, context)
        assert agent == "design_thinking"

        # Test finance keywords
        finance_message = "I need help with my business model and funding strategy"
        agent = agent_service._determine_specialist_agent(finance_message, context)
        assert agent == "finance"

        # Test leadership keywords
        leadership_message = "How can I build a better team culture?"
        agent = agent_service._determine_specialist_agent(leadership_message, context)
        assert agent == "leadership"

        # Test agile keywords
        agile_message = "I need help with project planning and scrum methodology"
        agent = agent_service._determine_specialist_agent(agile_message, context)
        assert agent == "agile_pm"

        # Test default case
        general_message = "Hello, how are you?"
        agent = agent_service._determine_specialist_agent(general_message, context)
        assert agent == "ignacio"

    @pytest.mark.asyncio
    async def test_start_conversation(self, agent_service, test_user, test_conversation):
        """Test starting a new conversation"""
        with patch("app.services.ai_service.db_service") as mock_db:
            mock_db.create_conversation.return_value = test_conversation
            mock_db.get_conversation.return_value = test_conversation
            mock_db.get_user_projects.return_value = []
            mock_db.get_user_files.return_value = []
            mock_db.create_message.return_value = MagicMock()
            mock_db.create_agent_interaction.return_value = MagicMock()

            # Mock session and agent response
            with patch("app.services.ai_service.OpenAIConversationsSession") as mock_session_class:
                mock_session = MagicMock()
                mock_session_class.return_value = mock_session

                result = await agent_service.start_conversation(
                    test_user.id, "Hello Ignacio, I need help with my startup"
                )

                assert isinstance(result, ConversationResult)
                assert result.conversation_id == test_conversation.id
                assert result.agent_used in agent_service._agents.keys()
                assert result.execution_time_ms > 0

    @pytest.mark.asyncio
    async def test_continue_conversation(self, agent_service, test_user, test_conversation):
        """Test continuing an existing conversation"""
        with patch("app.services.ai_service.db_service") as mock_db:
            mock_db.get_conversation.return_value = test_conversation
            mock_db.get_user_projects.return_value = []
            mock_db.get_user_files.return_value = []
            mock_db.create_message.return_value = MagicMock()
            mock_db.create_agent_interaction.return_value = MagicMock()

            # Mock session
            with patch("app.services.ai_service.OpenAIConversationsSession") as mock_session_class:
                mock_session = MagicMock()
                mock_session_class.return_value = mock_session
                agent_service._sessions[test_conversation.id] = mock_session

                result = await agent_service.continue_conversation(
                    test_conversation.id, "Tell me more about marketing strategies"
                )

                assert isinstance(result, ConversationResult)
                assert result.conversation_id == test_conversation.id
                assert result.response_text is not None
                assert result.execution_time_ms > 0

    @pytest.mark.asyncio
    async def test_continue_conversation_with_translation(self, agent_service, test_user, test_conversation):
        """Test conversation with Spanish translation"""
        with patch("app.services.ai_service.db_service") as mock_db:
            test_conversation.language_preference = "es"
            mock_db.get_conversation.return_value = test_conversation
            mock_db.get_user_projects.return_value = []
            mock_db.get_user_files.return_value = []
            mock_db.create_message.return_value = MagicMock()
            mock_db.create_agent_interaction.return_value = MagicMock()

            with patch("app.services.ai_service.OpenAIConversationsSession") as mock_session_class:
                mock_session = MagicMock()
                mock_session_class.return_value = mock_session

                result = await agent_service.continue_conversation(
                    test_conversation.id, "Necesito ayuda con marketing"
                )

                assert isinstance(result, ConversationResult)
                assert result.response_text is not None

    @pytest.mark.asyncio
    async def test_continue_conversation_error_handling(self, agent_service, test_conversation):
        """Test conversation error handling"""
        with patch("app.services.ai_service.db_service") as mock_db:
            mock_db.get_conversation.return_value = None  # Conversation not found

            with pytest.raises(ValueError, match="not found"):
                await agent_service.continue_conversation(
                    test_conversation.id, "Test message"
                )

    @pytest.mark.asyncio
    async def test_upload_file_to_context_success(self, agent_service, test_user, test_user_file):
        """Test successful file upload to context"""
        with patch("app.services.ai_service.db_service") as mock_db:
            mock_db.get_user_files.return_value = [test_user_file]

            agent_service.vector_manager.sync_file_to_vector_store.return_value = True
            test_user_file.openai_file_id = "file-123"
            test_user_file.content_preview = "Test content preview"

            result = await agent_service.upload_file_to_context(
                test_user.id, test_user_file.file_path
            )

            assert isinstance(result, FileIntegrationResult)
            assert result.success is True
            assert result.openai_file_id == "file-123"
            assert result.vector_store_updated is True

    @pytest.mark.asyncio
    async def test_upload_file_to_context_file_not_found(self, agent_service, test_user):
        """Test file upload when file not found"""
        with patch("app.services.ai_service.db_service") as mock_db:
            mock_db.get_user_files.return_value = []

            result = await agent_service.upload_file_to_context(
                test_user.id, "nonexistent/path.pdf"
            )

            assert isinstance(result, FileIntegrationResult)
            assert result.success is False
            assert "not found" in result.error_message

    @pytest.mark.asyncio
    async def test_upload_file_to_context_sync_failure(self, agent_service, test_user, test_user_file):
        """Test file upload when vector store sync fails"""
        with patch("app.services.ai_service.db_service") as mock_db:
            mock_db.get_user_files.return_value = [test_user_file]

            agent_service.vector_manager.sync_file_to_vector_store.return_value = False

            result = await agent_service.upload_file_to_context(
                test_user.id, test_user_file.file_path
            )

            assert isinstance(result, FileIntegrationResult)
            assert result.success is False
            assert "Failed to sync" in result.error_message

    @pytest.mark.asyncio
    async def test_get_conversation_summary(self, agent_service, test_user, test_conversation, test_message, test_agent_interaction):
        """Test getting conversation summary"""
        with patch("app.services.ai_service.db_service") as mock_db:
            mock_db.get_conversation.return_value = test_conversation
            mock_db.get_conversation_messages.return_value = [test_message]
            mock_db.get_conversation_interactions.return_value = [test_agent_interaction]

            summary = await agent_service.get_conversation_summary(test_conversation.id)

            assert summary.conversation_id == test_conversation.id
            assert summary.total_messages == 1
            assert summary.agent_interactions == 1
            assert len(summary.tools_used) > 0

    @pytest.mark.asyncio
    async def test_update_project_context(self, agent_service, test_user, test_user_project):
        """Test updating project context"""
        with patch("app.services.ai_service.db_service") as mock_db:
            mock_db.get_user_projects.return_value = [test_user_project]
            mock_db.update_user_project.return_value = test_user_project
            mock_db.get_user_conversations.return_value = []

            project_data = {
                "project_name": "Updated Startup",
                "current_stage": ProjectStage.DEVELOPMENT,
                "description": "Updated description"
            }

            await agent_service.update_project_context(test_user.id, project_data)

            mock_db.update_user_project.assert_called_once()

    @pytest.mark.asyncio
    async def test_log_interaction(self, agent_service, test_conversation):
        """Test logging agent interactions"""
        with patch("app.services.ai_service.db_service") as mock_db:
            mock_interaction = MagicMock()
            mock_db.create_agent_interaction.return_value = mock_interaction

            await agent_service._log_interaction(
                conversation_id=test_conversation.id,
                agent_name="ignacio",
                input_text="Test input",
                output_text="Test output",
                tools_used=["web_search"],
                execution_time_ms=1200
            )

            mock_db.create_agent_interaction.assert_called_once()
            call_args = mock_db.create_agent_interaction.call_args[0][0]
            assert call_args.conversation_id == test_conversation.id
            assert call_args.agent_name == "ignacio"
            assert call_args.execution_time_ms == 1200


class TestIgnacioAgentServiceIntegration:
    """Integration tests for IgnacioAgentService with different scenarios"""

    @pytest.fixture
    def mock_agent_service(self):
        """Mock IgnacioAgentService for integration testing"""
        return MockIgnacioAgentService()

    @pytest.mark.asyncio
    async def test_marketing_question_workflow(self, mock_agent_service, test_user, test_conversation):
        """Test complete workflow for marketing questions"""
        marketing_result = mock_agent_service.set_conversation_result(
            response_text="For startup marketing, focus on defining your target audience first. Consider these key strategies:\n\n1. Content marketing through blogs and social media\n2. SEO optimization for organic reach\n3. Email marketing campaigns\n4. Partnership and networking opportunities\n\nWould you like me to elaborate on any of these strategies?",
            agent_name="marketing",
            tools_called=["web_search", "file_search"],
            confidence_score=0.92
        )

        result = await mock_agent_service.start_conversation(
            test_user.id,
            "I need help with marketing my startup. What should I focus on first?"
        )

        assert result.agent_used == "marketing"
        assert "target audience" in result.response_text
        assert "web_search" in result.tools_called
        assert result.confidence_score >= 0.9

    @pytest.mark.asyncio
    async def test_technical_question_workflow(self, mock_agent_service, test_user, test_conversation):
        """Test complete workflow for technical questions"""
        tech_result = mock_agent_service.set_conversation_result(
            response_text="For web application technology stack, consider these factors:\n\n1. **Frontend**: React/Vue.js for user interfaces\n2. **Backend**: Node.js/Python for server logic\n3. **Database**: PostgreSQL for structured data\n4. **Cloud**: AWS/Google Cloud for scalable hosting\n\nKey considerations:\n- Team expertise and learning curve\n- Scalability requirements\n- Budget constraints\n- Time to market",
            agent_name="tech",
            tools_called=["web_search", "file_search"],
            confidence_score=0.88
        )

        result = await mock_agent_service.continue_conversation(
            test_conversation.id,
            "What technology stack should I use for my web application?"
        )

        assert result.agent_used == "tech"
        assert "technology stack" in result.response_text
        assert result.confidence_score >= 0.85

    @pytest.mark.asyncio
    async def test_file_integration_workflow(self, mock_agent_service, test_user):
        """Test file integration workflow"""
        file_result = mock_agent_service.set_file_integration_result(
            success=True,
            openai_file_id="file-business-plan-123",
            content_preview="Business Plan - Executive Summary: Our startup focuses on AI-powered solutions for small businesses..."
        )

        result = await mock_agent_service.upload_file_to_context(
            test_user.id,
            f"users/{test_user.id}/business_plan.pdf"
        )

        assert result.success is True
        assert result.openai_file_id.startswith("file-")
        assert result.vector_store_updated is True
        assert "Business Plan" in result.content_preview

    @pytest.mark.asyncio
    async def test_multi_agent_conversation_flow(self, mock_agent_service, test_user, test_conversation):
        """Test conversation flow through multiple agents"""
        # Start with general question (Ignacio)
        ignacio_result = mock_agent_service.set_conversation_result(
            response_text="I can help you with your startup! It sounds like you have questions about multiple areas. Let me address each one.",
            agent_name="ignacio",
            tools_called=["file_search"],
            confidence_score=0.9
        )

        general_result = await mock_agent_service.start_conversation(
            test_user.id,
            "I'm building a startup and need help with marketing, technology, and funding."
        )

        # Follow up with specific marketing question
        marketing_result = mock_agent_service.set_conversation_result(
            response_text="For marketing, let's start with market research and customer persona development...",
            agent_name="marketing",
            tools_called=["web_search", "file_search"],
            confidence_score=0.93
        )

        marketing_followup = await mock_agent_service.continue_conversation(
            test_conversation.id,
            "Tell me more about the marketing strategies you mentioned."
        )

        assert general_result.agent_used == "ignacio"
        assert marketing_followup.agent_used == "marketing"
        assert len(marketing_followup.tools_called) >= 1


class TestMockIgnacioAgentService:
    """Test the mock IgnacioAgentService for other tests"""

    def test_mock_service_creation(self):
        """Test creating mock IgnacioAgentService"""
        mock_service = MockIgnacioAgentService()

        assert mock_service.start_conversation is not None
        assert mock_service.continue_conversation is not None
        assert mock_service.upload_file_to_context is not None
        assert len(mock_service._agents) == 9  # 8 specialists + 1 translator

    def test_mock_service_set_conversation_result(self):
        """Test setting mock conversation result"""
        mock_service = MockIgnacioAgentService()

        result = mock_service.set_conversation_result(
            "Test response", "marketing", ["web_search"], 0.95
        )

        assert result.response_text == "Test response"
        assert result.agent_used == "marketing"
        assert result.tools_called == ["web_search"]
        assert result.confidence_score == 0.95

    def test_mock_service_set_file_integration_result(self):
        """Test setting mock file integration result"""
        mock_service = MockIgnacioAgentService()

        result = mock_service.set_file_integration_result(
            success=True,
            openai_file_id="file-test456",
            content_preview="Mock file content"
        )

        assert result.success is True
        assert result.openai_file_id == "file-test456"
        assert result.content_preview == "Mock file content"

    @pytest.mark.asyncio
    async def test_mock_service_conversation_methods(self):
        """Test mock service conversation methods"""
        mock_service = MockIgnacioAgentService()
        mock_service.set_conversation_result("Mock response")

        context = MagicMock()
        result = await mock_service.start_conversation(uuid4(), "Test input")

        assert result.response_text == "Mock response"
        mock_service.start_conversation.assert_called_once()
