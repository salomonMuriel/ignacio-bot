"""
Tests for AI service
"""

from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest

from app.services.ai_service import AIResponse, AIService, ConversationContext
from tests.utils.mocks import MockAIService


class TestAIResponse:
    """Test AIResponse model validation"""

    def test_ai_response_creation_valid(self):
        """Test creating valid AIResponse"""
        response = AIResponse(
            content="Test response",
            response_type="marketing",
            confidence=0.85,
            requires_followup=True,
            followup_suggestion="Would you like to know more about target audience research?",
        )

        assert response.content == "Test response"
        assert response.response_type == "marketing"
        assert response.confidence == 0.85
        assert response.requires_followup is True
        assert "target audience" in response.followup_suggestion

    def test_ai_response_defaults(self):
        """Test AIResponse with default values"""
        response = AIResponse(content="Simple response")

        assert response.content == "Simple response"
        assert response.response_type == "general"
        assert response.confidence == 1.0
        assert response.requires_followup is False
        assert response.followup_suggestion is None

    def test_ai_response_confidence_validation(self):
        """Test confidence value validation"""
        # Valid confidence values
        AIResponse(content="Test", confidence=0.0)
        AIResponse(content="Test", confidence=1.0)
        AIResponse(content="Test", confidence=0.5)

        # Invalid confidence values should be handled by Pydantic
        with pytest.raises(ValueError):
            AIResponse(content="Test", confidence=1.5)

        with pytest.raises(ValueError):
            AIResponse(content="Test", confidence=-0.1)


class TestConversationContext:
    """Test ConversationContext model"""

    def test_conversation_context_creation(self, test_user, test_conversation):
        """Test creating conversation context"""
        context = ConversationContext(
            user_id=test_user.id,
            conversation_id=test_conversation.id,
            user_name=test_user.name,
            conversation_history=[],
            user_project_info="E-commerce startup in fintech space",
        )

        assert context.user_id == test_user.id
        assert context.conversation_id == test_conversation.id
        assert context.user_name == test_user.name
        assert len(context.conversation_history) == 0
        assert "fintech" in context.user_project_info

    def test_conversation_context_with_history(
        self, test_user, test_conversation, test_message
    ):
        """Test conversation context with message history"""
        context = ConversationContext(
            user_id=test_user.id,
            conversation_id=test_conversation.id,
            conversation_history=[test_message],
        )

        assert len(context.conversation_history) == 1
        assert context.conversation_history[0].id == test_message.id


class TestAIService:
    """Test AI service functionality"""

    @pytest.fixture
    def mock_openai_model(self):
        """Mock OpenAI model"""
        with patch("app.services.ai_service.OpenAIModel") as mock_model_class:
            mock_model = MagicMock()
            mock_model_class.return_value = mock_model
            yield mock_model

    @pytest.fixture
    def mock_agent(self):
        """Mock PydanticAI agent"""
        with patch("app.services.ai_service.Agent") as mock_agent_class:
            mock_agent = AsyncMock()
            mock_result = MagicMock()
            mock_result.data = AIResponse(
                content="Mocked AI response", response_type="general", confidence=0.95
            )
            mock_agent.run.return_value = mock_result
            mock_agent_class.return_value = mock_agent
            yield mock_agent

    def test_ai_service_initialization(self, mock_openai_model, mock_agent):
        """Test AI service initialization"""
        service = AIService()

        assert service.model is not None
        assert service.agent is not None

    def test_system_prompt_content(self):
        """Test that system prompt contains required elements"""
        service = AIService()
        system_prompt = service._get_system_prompt()

        assert "Ignacio" in system_prompt
        assert "Action Lab" in system_prompt
        assert "projects" in system_prompt
        assert "marketing" in system_prompt
        assert "technical" in system_prompt
        assert "financial" in system_prompt

    @pytest.mark.asyncio
    async def test_generate_response_success(
        self, mock_openai_model, mock_agent, test_user, test_conversation
    ):
        """Test successful AI response generation"""
        service = AIService()
        context = ConversationContext(
            user_id=test_user.id,
            conversation_id=test_conversation.id,
            user_name=test_user.name,
        )

        response = await service.generate_response("Hello Ignacio!", context)

        assert isinstance(response, AIResponse)
        assert response.content == "Mocked AI response"
        assert response.response_type == "general"
        assert response.confidence == 0.95

    @pytest.mark.asyncio
    async def test_generate_response_error_handling(
        self, mock_openai_model, test_user, test_conversation
    ):
        """Test AI service error handling"""
        with patch("app.services.ai_service.Agent") as mock_agent_class:
            mock_agent = AsyncMock()
            mock_agent.run.side_effect = Exception("API Error")
            mock_agent_class.return_value = mock_agent

            service = AIService()
            context = ConversationContext(
                user_id=test_user.id, conversation_id=test_conversation.id
            )

            response = await service.generate_response("Test message", context)

            assert isinstance(response, AIResponse)
            assert "trouble processing" in response.content
            assert response.response_type == "error"
            assert response.confidence == 0.0
            assert response.requires_followup is True

    def test_prepare_context_message_empty(self, test_user, test_conversation):
        """Test context message preparation with minimal data"""
        service = AIService()
        context = ConversationContext(
            user_id=test_user.id, conversation_id=test_conversation.id
        )

        context_msg = service._prepare_context_message(context)

        assert "No previous context available" in context_msg

    def test_prepare_context_message_full(
        self, test_user, test_conversation, test_message
    ):
        """Test context message preparation with full data"""
        service = AIService()
        context = ConversationContext(
            user_id=test_user.id,
            conversation_id=test_conversation.id,
            user_name="John Doe",
            user_project_info="SaaS platform for small businesses",
            conversation_history=[test_message],
        )

        context_msg = service._prepare_context_message(context)

        assert "John Doe" in context_msg
        assert "SaaS platform" in context_msg
        assert "Recent conversation context" in context_msg
        assert test_message.content in context_msg

    def test_prepare_context_message_long_history(self, test_user, test_conversation):
        """Test context message with long conversation history (>10 messages)"""
        service = AIService()

        # Create 15 mock messages
        messages = []
        for i in range(15):
            mock_message = MagicMock()
            mock_message.content = f"Message {i}"
            mock_message.is_from_user = i % 2 == 0
            messages.append(mock_message)

        context = ConversationContext(
            user_id=test_user.id,
            conversation_id=test_conversation.id,
            conversation_history=messages,
        )

        context_msg = service._prepare_context_message(context)

        # Should only include last 10 messages
        assert "Message 14" in context_msg  # Latest message
        assert "Message 5" in context_msg  # 10th from last
        assert "Message 4" not in context_msg  # 11th from last (excluded)

    @pytest.mark.asyncio
    async def test_get_conversation_context(self, test_user, test_conversation):
        """Test building conversation context from database"""
        with patch("app.services.ai_service.db_service") as mock_db:
            mock_db.get_user_by_id.return_value = test_user
            mock_db.get_conversation_messages.return_value = []

            service = AIService()
            context = await service.get_conversation_context(
                test_user.id, test_conversation.id
            )

            assert context.user_id == test_user.id
            assert context.conversation_id == test_conversation.id
            assert context.user_name == test_user.name
            assert len(context.conversation_history) == 0

            # Verify database calls
            mock_db.get_user_by_id.assert_called_once_with(test_user.id)
            mock_db.get_conversation_messages.assert_called_once_with(
                test_conversation.id
            )

    @pytest.mark.asyncio
    async def test_get_conversation_context_no_user(self, test_conversation):
        """Test building conversation context when user not found"""
        with patch("app.services.ai_service.db_service") as mock_db:
            mock_db.get_user_by_id.return_value = None
            mock_db.get_conversation_messages.return_value = []

            service = AIService()
            context = await service.get_conversation_context(
                uuid4(), test_conversation.id
            )

            assert context.user_name is None

    @pytest.mark.asyncio
    async def test_process_message_and_respond_success(
        self, mock_openai_model, mock_agent, test_user, test_conversation
    ):
        """Test complete message processing flow"""
        with patch("app.services.ai_service.db_service") as mock_db:
            # Mock user message creation
            mock_user_msg = MagicMock()
            mock_user_msg.id = uuid4()
            mock_user_msg.content = "Test user message"
            mock_user_msg.is_from_user = True
            mock_db.create_message.return_value = mock_user_msg

            # Mock user and conversation data
            mock_db.get_user_by_id.return_value = test_user
            mock_db.get_conversation_messages.return_value = []

            # Mock AI message creation
            mock_ai_msg = MagicMock()
            mock_ai_msg.id = uuid4()
            mock_ai_msg.content = "Mocked AI response"
            mock_ai_msg.is_from_user = False

            # Set up return values for multiple create_message calls
            mock_db.create_message.side_effect = [mock_user_msg, mock_ai_msg]

            service = AIService()
            result = await service.process_message_and_respond(
                "Test user message", test_user.id, test_conversation.id
            )

            assert result == mock_ai_msg
            assert mock_db.create_message.call_count == 2  # User message + AI response

    @pytest.mark.asyncio
    async def test_process_message_and_respond_with_context(
        self, mock_openai_model, mock_agent, test_user, test_conversation, test_message
    ):
        """Test message processing with existing conversation context"""
        with patch("app.services.ai_service.db_service") as mock_db:
            # Mock database responses
            mock_db.get_user_by_id.return_value = test_user
            mock_db.get_conversation_messages.return_value = [test_message]

            mock_user_msg = MagicMock()
            mock_ai_msg = MagicMock()
            mock_db.create_message.side_effect = [mock_user_msg, mock_ai_msg]

            service = AIService()
            await service.process_message_and_respond(
                "Follow-up question", test_user.id, test_conversation.id
            )

            # Verify that agent.run was called with context that includes previous message
            mock_agent.run.assert_called_once()
            call_args = mock_agent.run.call_args[0]
            assert "Follow-up question" in call_args[0]


class TestAIServiceIntegration:
    """Integration tests for AI service with different scenarios"""

    @pytest.mark.asyncio
    async def test_marketing_question_scenario(
        self, mock_openai_model, test_user, test_conversation
    ):
        """Test AI service with marketing-focused question"""
        with patch("app.services.ai_service.Agent") as mock_agent_class:
            mock_agent = AsyncMock()
            mock_result = MagicMock()
            mock_result.data = AIResponse(
                content="For startup marketing, focus on defining your target audience first...",
                response_type="marketing",
                confidence=0.92,
                requires_followup=True,
                followup_suggestion="What type of business are you building?",
            )
            mock_agent.run.return_value = mock_result
            mock_agent_class.return_value = mock_agent

            service = AIService()
            context = ConversationContext(
                user_id=test_user.id,
                conversation_id=test_conversation.id,
                user_project_info="E-commerce startup",
            )

            response = await service.generate_response(
                "I need help with marketing my startup. What should I focus on first?",
                context,
            )

            assert "target audience" in response.content
            assert response.response_type == "marketing"
            assert response.requires_followup is True

    @pytest.mark.asyncio
    async def test_technical_question_scenario(
        self, mock_openai_model, test_user, test_conversation
    ):
        """Test AI service with technical question"""
        with patch("app.services.ai_service.Agent") as mock_agent_class:
            mock_agent = AsyncMock()
            mock_result = MagicMock()
            mock_result.data = AIResponse(
                content="For web application technology stack, consider these factors...",
                response_type="technical",
                confidence=0.88,
            )
            mock_agent.run.return_value = mock_result
            mock_agent_class.return_value = mock_agent

            service = AIService()
            context = ConversationContext(
                user_id=test_user.id, conversation_id=test_conversation.id
            )

            response = await service.generate_response(
                "What technology stack should I use for my web application?", context
            )

            assert "technology stack" in response.content
            assert response.response_type == "technical"


class TestMockAIService:
    """Test the mock AI service for other tests"""

    def test_mock_ai_service_creation(self):
        """Test creating mock AI service"""
        mock_service = MockAIService()

        assert mock_service.generate_response is not None
        assert mock_service.process_message_and_respond is not None

    def test_mock_ai_service_set_response(self):
        """Test setting mock response"""
        mock_service = MockAIService()

        response = mock_service.set_response("Test response", "marketing")

        assert response.content == "Test response"
        assert response.response_type == "marketing"
        assert response.confidence == 0.95

    @pytest.mark.asyncio
    async def test_mock_ai_service_generate_response(self):
        """Test mock generate_response method"""
        mock_service = MockAIService()
        mock_service.set_response("Mock response")

        context = MagicMock()
        response = await mock_service.generate_response("Test input", context)

        assert response.content == "Mock response"
        mock_service.generate_response.assert_called_once_with("Test input", context)
