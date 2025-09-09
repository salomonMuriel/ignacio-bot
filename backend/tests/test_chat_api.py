"""
Tests for chat API endpoints with Agent SDK integration
"""

from unittest.mock import AsyncMock, patch
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient

from tests.utils.fixtures import TestDataFactory
from tests.utils.mocks import MockIgnacioAgentService


class TestConversationEndpoints:
    """Test conversation-related API endpoints"""

    def test_get_conversations_empty(self, client: TestClient):
        """Test getting conversations when none exist"""
        response = client.get("/api/chat/conversations")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    @pytest.mark.asyncio
    async def test_create_conversation_success(
        self, async_client: AsyncClient, test_user
    ):
        """Test successful conversation creation"""
        # Update the temp user ID in the router to match our test user
        with patch("app.routers.chat.TEMP_USER_ID", test_user.id):
            conversation_data = {"title": "Test Conversation"}

            response = await async_client.post(
                "/api/chat/conversations", json=conversation_data
            )

            assert response.status_code == 200
            data = response.json()
            assert data["title"] == "Test Conversation"
            assert "id" in data
            assert data["message_count"] == 0
            assert data["language_preference"] == "es"

    @pytest.mark.asyncio
    async def test_create_conversation_no_title(
        self, async_client: AsyncClient, test_user
    ):
        """Test creating conversation without title"""
        with patch("app.routers.chat.TEMP_USER_ID", test_user.id):
            response = await async_client.post("/api/chat/conversations", json={})

            assert response.status_code == 200
            data = response.json()
            assert data["title"] == "New Conversation"

    @pytest.mark.asyncio
    async def test_get_conversation_by_id_success(
        self, async_client: AsyncClient, test_user, test_conversation
    ):
        """Test getting specific conversation"""
        with patch("app.routers.chat.TEMP_USER_ID", test_user.id):
            response = await async_client.get(
                f"/api/chat/conversations/{test_conversation.id}"
            )

            assert response.status_code == 200
            data = response.json()
            assert data["id"] == str(test_conversation.id)
            assert data["title"] == test_conversation.title
            assert "messages" in data
            assert isinstance(data["messages"], list)

    @pytest.mark.asyncio
    async def test_get_conversation_by_id_not_found(self, async_client: AsyncClient):
        """Test getting non-existent conversation"""
        non_existent_id = uuid4()

        response = await async_client.get(f"/api/chat/conversations/{non_existent_id}")

        assert response.status_code == 404
        data = response.json()
        assert "not found" in data["detail"].lower()

    @pytest.mark.asyncio
    async def test_get_conversation_invalid_uuid(self, async_client: AsyncClient):
        """Test getting conversation with invalid UUID"""
        response = await async_client.get("/api/chat/conversations/not-a-uuid")

        assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_update_conversation_success(
        self, async_client: AsyncClient, test_user, test_conversation
    ):
        """Test updating conversation title"""
        with patch("app.routers.chat.TEMP_USER_ID", test_user.id):
            update_data = {"title": "Updated Title"}

            response = await async_client.put(
                f"/api/chat/conversations/{test_conversation.id}", json=update_data
            )

            assert response.status_code == 200
            data = response.json()
            assert data["title"] == "Updated Title"
            assert data["id"] == str(test_conversation.id)

    @pytest.mark.asyncio
    async def test_update_conversation_not_found(self, async_client: AsyncClient):
        """Test updating non-existent conversation"""
        non_existent_id = uuid4()
        update_data = {"title": "Updated Title"}

        response = await async_client.put(
            f"/api/chat/conversations/{non_existent_id}", json=update_data
        )

        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_delete_conversation_success(
        self, async_client: AsyncClient, test_user, test_conversation
    ):
        """Test deleting conversation"""
        with patch("app.routers.chat.TEMP_USER_ID", test_user.id):
            response = await async_client.delete(
                f"/api/chat/conversations/{test_conversation.id}"
            )

            assert response.status_code == 200
            data = response.json()
            assert "deleted successfully" in data["message"]

    @pytest.mark.asyncio
    async def test_delete_conversation_not_found(self, async_client: AsyncClient):
        """Test deleting non-existent conversation"""
        non_existent_id = uuid4()

        response = await async_client.delete(
            f"/api/chat/conversations/{non_existent_id}"
        )

        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_get_conversations_with_messages(
        self, async_client: AsyncClient, test_user, test_conversation, test_message
    ):
        """Test getting conversations with message counts"""
        with patch("app.routers.chat.TEMP_USER_ID", test_user.id):
            response = await async_client.get("/api/chat/conversations")

            assert response.status_code == 200
            data = response.json()
            assert isinstance(data, list)

            # Find our test conversation
            test_conv = next(
                (conv for conv in data if conv["id"] == str(test_conversation.id)), None
            )
            assert test_conv is not None
            assert test_conv["message_count"] >= 1


class TestMessageEndpoints:
    """Test message-related API endpoints"""

    @pytest.mark.asyncio
    async def test_get_messages_empty_conversation(
        self, async_client: AsyncClient, test_user, test_conversation
    ):
        """Test getting messages from empty conversation"""
        with patch("app.routers.chat.TEMP_USER_ID", test_user.id):
            response = await async_client.get(
                f"/api/chat/conversations/{test_conversation.id}/messages"
            )

            assert response.status_code == 200
            data = response.json()
            assert isinstance(data, list)

    @pytest.mark.asyncio
    async def test_get_messages_with_content(
        self, async_client: AsyncClient, test_user, test_conversation, test_message
    ):
        """Test getting messages with content"""
        with patch("app.routers.chat.TEMP_USER_ID", test_user.id):
            response = await async_client.get(
                f"/api/chat/conversations/{test_conversation.id}/messages"
            )

            assert response.status_code == 200
            data = response.json()
            assert len(data) >= 1

            # Check message structure
            message = data[0] if data else None
            assert message is not None
            assert "id" in message
            assert "content" in message
            assert "message_type" in message
            assert "is_from_user" in message
            assert "created_at" in message

    @pytest.mark.asyncio
    async def test_get_messages_pagination(
        self, async_client: AsyncClient, test_user, test_conversation
    ):
        """Test message pagination"""
        with patch("app.routers.chat.TEMP_USER_ID", test_user.id):
            # Create multiple messages first
            from app.models.database import MessageCreate
            from app.services.database import db_service

            for i in range(5):
                msg_data = MessageCreate(
                    **TestDataFactory.message_data(
                        test_conversation.id, test_user.id, content=f"Message {i}"
                    )
                )
                await db_service.create_message(msg_data)

            # Test pagination
            response = await async_client.get(
                f"/api/chat/conversations/{test_conversation.id}/messages?limit=3&offset=0"
            )

            assert response.status_code == 200
            data = response.json()
            assert len(data) <= 3

    @pytest.mark.asyncio
    async def test_get_messages_conversation_not_found(self, async_client: AsyncClient):
        """Test getting messages from non-existent conversation"""
        non_existent_id = uuid4()

        response = await async_client.get(
            f"/api/chat/conversations/{non_existent_id}/messages"
        )

        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_send_message_success(
        self, async_client: AsyncClient, test_user, test_conversation
    ):
        """Test sending message and receiving AI response via Agent SDK"""
        mock_agent_service = MockIgnacioAgentService()
        mock_agent_service.set_conversation_result(
            response_text="This is a test AI response from Agent SDK",
            agent_name="ignacio",
            tools_called=["web_search"],
            confidence_score=0.95
        )

        # Mock the message retrieval after agent processing
        mock_message = type('Message', (), {
            'id': uuid4(),
            'content': "This is a test AI response from Agent SDK",
            'message_type': 'text',
            'is_from_user': False,
            'created_at': type('datetime', (), {'isoformat': lambda: '2023-01-01T00:00:00'})(),
            'file_path': None
        })

        with patch("app.routers.chat.TEMP_USER_ID", test_user.id):
            with patch("app.routers.chat.get_ignacio_service", return_value=mock_agent_service):
                with patch("app.services.database.db_service") as mock_db:
                    mock_db.get_conversation_by_id.return_value = test_conversation
                    mock_db.get_conversation_messages.return_value = [mock_message]

                    message_data = {
                        "content": "Hello Ignacio, how can you help me?",
                        "message_type": "text",
                    }

                    response = await async_client.post(
                        f"/api/chat/conversations/{test_conversation.id}/messages",
                        json=message_data,
                    )

                    assert response.status_code == 200
                    data = response.json()

                    # Check AgentMessageResponse structure
                    assert "message" in data
                    assert "agent_used" in data
                    assert "tools_called" in data
                    assert "confidence_score" in data
                    assert "execution_time_ms" in data

                    # Check message content
                    message_resp = data["message"]
                    assert "This is a test AI response" in message_resp["content"]
                    assert message_resp["is_from_user"] is False

                    # Check agent information
                    assert data["agent_used"] == "ignacio"
                    assert "web_search" in data["tools_called"]
                    assert data["confidence_score"] == 0.95

                    # Verify agent service was called
                    mock_agent_service.continue_conversation.assert_called_once_with(
                        conversation_id=test_conversation.id,
                        message="Hello Ignacio, how can you help me?"
                    )

    @pytest.mark.asyncio
    async def test_send_message_conversation_not_found(self, async_client: AsyncClient):
        """Test sending message to non-existent conversation"""
        non_existent_id = uuid4()
        message_data = {"content": "Test message"}

        response = await async_client.post(
            f"/api/chat/conversations/{non_existent_id}/messages", json=message_data
        )

        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_send_message_empty_content(
        self, async_client: AsyncClient, test_user, test_conversation
    ):
        """Test sending message with empty content"""
        with patch("app.routers.chat.TEMP_USER_ID", test_user.id):
            message_data = {"content": ""}

            response = await async_client.post(
                f"/api/chat/conversations/{test_conversation.id}/messages",
                json=message_data,
            )

            # Should still work, AI can handle empty messages
            assert response.status_code in [200, 422]  # Depends on validation

    @pytest.mark.asyncio
    async def test_send_message_invalid_json(
        self, async_client: AsyncClient, test_user, test_conversation
    ):
        """Test sending message with invalid JSON"""
        with patch("app.routers.chat.TEMP_USER_ID", test_user.id):
            response = await async_client.post(
                f"/api/chat/conversations/{test_conversation.id}/messages",
                content="invalid json",
                headers={"Content-Type": "application/json"},
            )

            assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_send_message_missing_content(
        self, async_client: AsyncClient, test_user, test_conversation
    ):
        """Test sending message without content field"""
        with patch("app.routers.chat.TEMP_USER_ID", test_user.id):
            message_data = {"message_type": "text"}

            response = await async_client.post(
                f"/api/chat/conversations/{test_conversation.id}/messages",
                json=message_data,
            )

            assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_send_message_agent_service_error(
        self, async_client: AsyncClient, test_user, test_conversation
    ):
        """Test handling Agent SDK service errors"""
        mock_agent_service = AsyncMock()
        mock_agent_service.continue_conversation.side_effect = Exception(
            "Agent Service Error"
        )

        with patch("app.routers.chat.TEMP_USER_ID", test_user.id):
            with patch("app.routers.chat.get_ignacio_service", return_value=mock_agent_service):
                with patch("app.services.database.db_service") as mock_db:
                    mock_db.get_conversation_by_id.return_value = test_conversation

                    message_data = {"content": "Test message"}

                    response = await async_client.post(
                        f"/api/chat/conversations/{test_conversation.id}/messages",
                        json=message_data,
                    )

                    assert response.status_code == 500


class TestAgentSDKEndpoints:
    """Test new Agent SDK-specific endpoints"""

    @pytest.mark.asyncio
    async def test_start_conversation_success(
        self, async_client: AsyncClient, test_user
    ):
        """Test starting conversation with Agent SDK"""
        mock_agent_service = MockIgnacioAgentService()
        conversation_result = mock_agent_service.set_conversation_result(
            response_text="Hello! I'm Ignacio, ready to help with your project.",
            agent_name="ignacio",
            tools_called=["file_search"],
            confidence_score=0.9
        )

        # Mock the message retrieval
        mock_message = type('Message', (), {
            'id': uuid4(),
            'content': "Hello! I'm Ignacio, ready to help with your project.",
            'message_type': 'text',
            'is_from_user': False,
            'created_at': type('datetime', (), {'isoformat': lambda: '2023-01-01T00:00:00'})(),
            'file_path': None
        })

        with patch("app.routers.chat.TEMP_USER_ID", test_user.id):
            with patch("app.routers.chat.get_ignacio_service", return_value=mock_agent_service):
                with patch("app.services.database.db_service") as mock_db:
                    mock_db.update_conversation.return_value = None
                    mock_db.get_conversation_messages.return_value = [mock_message]

                    request_data = {
                        "initial_message": "Hi Ignacio, I need help with my startup",
                        "title": "Startup Help Session"
                    }

                    response = await async_client.post(
                        "/api/chat/conversations/start",
                        json=request_data
                    )

                    assert response.status_code == 200
                    data = response.json()

                    assert "message" in data
                    assert "agent_used" in data
                    assert data["agent_used"] == "ignacio"
                    assert "I'm Ignacio" in data["message"]["content"]
                    assert "file_search" in data["tools_called"]

    @pytest.mark.asyncio
    async def test_integrate_file_to_context_success(
        self, async_client: AsyncClient, test_user, test_user_file
    ):
        """Test integrating file into AI context"""
        mock_agent_service = MockIgnacioAgentService()
        mock_agent_service.set_file_integration_result(
            success=True,
            openai_file_id="file-business-plan-123",
            content_preview="Business Plan - Executive Summary..."
        )

        with patch("app.routers.chat.TEMP_USER_ID", test_user.id):
            with patch("app.routers.chat.get_ignacio_service", return_value=mock_agent_service):
                with patch("app.services.database.db_service") as mock_db:
                    mock_db.get_user_files.return_value = [test_user_file]

                    response = await async_client.post(
                        f"/api/chat/files/{test_user_file.id}/integrate"
                    )

                    assert response.status_code == 200
                    data = response.json()

                    assert data["success"] is True
                    assert data["openai_file_id"] == "file-business-plan-123"
                    assert data["vector_store_updated"] is True
                    assert "Business Plan" in data["content_preview"]

    @pytest.mark.asyncio
    async def test_integrate_file_not_found(
        self, async_client: AsyncClient, test_user
    ):
        """Test integrating non-existent file"""
        with patch("app.routers.chat.TEMP_USER_ID", test_user.id):
            with patch("app.services.database.db_service") as mock_db:
                mock_db.get_user_files.return_value = []

                file_id = uuid4()
                response = await async_client.post(
                    f"/api/chat/files/{file_id}/integrate"
                )

                assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_get_conversation_summary(
        self, async_client: AsyncClient, test_conversation
    ):
        """Test getting conversation summary"""
        mock_agent_service = MockIgnacioAgentService()

        # Mock conversation summary
        mock_summary = type('ConversationSummary', (), {
            'conversation_id': test_conversation.id,
            'total_messages': 5,
            'agent_interactions': 3,
            'tools_used': ['web_search', 'file_search'],
            'key_topics': ['marketing', 'strategy'],
            'project_context': {'project_type': 'startup'},
            'last_activity': type('datetime', (), {
                'isoformat': lambda: '2023-01-01T00:00:00'
            })()
        })

        with patch("app.routers.chat.get_ignacio_service", return_value=mock_agent_service):
            mock_agent_service.get_conversation_summary.return_value = mock_summary

            response = await async_client.get(
                f"/api/chat/conversations/{test_conversation.id}/summary"
            )

            assert response.status_code == 200
            data = response.json()

            assert data["conversation_id"] == str(test_conversation.id)
            assert data["total_messages"] == 5
            assert data["agent_interactions"] == 3
            assert "web_search" in data["tools_used"]
            assert "marketing" in data["key_topics"]

    @pytest.mark.asyncio
    async def test_get_conversation_interactions(
        self, async_client: AsyncClient, test_conversation, test_agent_interaction
    ):
        """Test getting conversation interactions"""
        with patch("app.services.database.db_service") as mock_db:
            mock_db.get_conversation_interactions.return_value = [test_agent_interaction]

            response = await async_client.get(
                f"/api/chat/conversations/{test_conversation.id}/interactions"
            )

            assert response.status_code == 200
            data = response.json()

            assert len(data) == 1
            interaction = data[0]
            assert interaction["agent_name"] == test_agent_interaction.agent_name
            assert interaction["input_text"] == test_agent_interaction.input_text
            assert interaction["output_text"] == test_agent_interaction.output_text
            assert interaction["tools_used"] == test_agent_interaction.tools_used

    @pytest.mark.asyncio
    async def test_update_project_context(
        self, async_client: AsyncClient, test_user
    ):
        """Test updating project context"""
        mock_agent_service = MockIgnacioAgentService()

        with patch("app.routers.chat.TEMP_USER_ID", test_user.id):
            with patch("app.routers.chat.get_ignacio_service", return_value=mock_agent_service):
                project_data = {
                    "project_name": "My Startup",
                    "project_type": "startup",
                    "current_stage": "ideation",
                    "problem_statement": "Solving efficiency problems"
                }

                response = await async_client.post(
                    "/api/chat/project/context",
                    json=project_data
                )

                assert response.status_code == 200
                data = response.json()
                assert data["success"] is True
                assert "updated successfully" in data["message"]

                # Verify service was called
                mock_agent_service.update_project_context.assert_called_once_with(
                    test_user.id, project_data
                )


class TestChatAPIIntegration:
    """Integration tests for complete chat flows with Agent SDK"""

    @pytest.mark.asyncio
    async def test_complete_conversation_flow_with_agents(
        self, async_client: AsyncClient, test_user
    ):
        """Test complete conversation flow with Agent SDK"""
        mock_agent_service = MockIgnacioAgentService()

        # Setup responses for different stages
        start_result = mock_agent_service.set_conversation_result(
            response_text="Welcome! I'm Ignacio, here to help with your project development.",
            agent_name="ignacio",
            tools_called=["file_search"],
            confidence_score=0.9
        )

        marketing_result = mock_agent_service.set_conversation_result(
            response_text="For marketing, let's focus on understanding your target audience first. What type of customers are you trying to reach?",
            agent_name="marketing",
            tools_called=["web_search", "file_search"],
            confidence_score=0.92
        )

        with patch("app.routers.chat.TEMP_USER_ID", test_user.id):
            with patch("app.routers.chat.get_ignacio_service", return_value=mock_agent_service):
                with patch("app.services.database.db_service") as mock_db:
                    # Mock database responses
                    mock_conv = type('Conversation', (), {
                        'id': uuid4(),
                        'title': 'Project Help',
                        'created_at': type('datetime', (), {'isoformat': lambda: '2023-01-01T00:00:00'})(),
                        'updated_at': type('datetime', (), {'isoformat': lambda: '2023-01-01T00:00:00'})(),
                        'user_id': test_user.id
                    })

                    mock_messages = [
                        type('Message', (), {
                            'id': uuid4(),
                            'content': "Hi Ignacio, I need help with my startup idea.",
                            'message_type': 'text',
                            'is_from_user': True,
                            'created_at': type('datetime', (), {'isoformat': lambda: '2023-01-01T00:00:00'})(),
                            'file_path': None
                        }),
                        type('Message', (), {
                            'id': uuid4(),
                            'content': "Welcome! I'm Ignacio, here to help with your project development.",
                            'message_type': 'text',
                            'is_from_user': False,
                            'created_at': type('datetime', (), {'isoformat': lambda: '2023-01-01T00:00:00'})(),
                            'file_path': None
                        })
                    ]

                    mock_db.update_conversation.return_value = None
                    mock_db.get_conversation_messages.return_value = [mock_messages[1]]  # AI response
                    mock_db.get_conversation_by_id.return_value = mock_conv

                    # 1. Start conversation with Agent SDK
                    response = await async_client.post(
                        "/api/chat/conversations/start",
                        json={
                            "initial_message": "Hi Ignacio, I need help with my startup idea.",
                            "title": "Project Help"
                        }
                    )
                    assert response.status_code == 200
                    start_data = response.json()
                    assert start_data["agent_used"] == "ignacio"
                    assert "Welcome" in start_data["message"]["content"]

                    # 2. Continue conversation with marketing question
                    mock_db.get_conversation_messages.return_value = [
                        type('Message', (), {
                            'id': uuid4(),
                            'content': "For marketing, let's focus on understanding your target audience first.",
                            'message_type': 'text',
                            'is_from_user': False,
                            'created_at': type('datetime', (), {'isoformat': lambda: '2023-01-01T00:00:00'})(),
                            'file_path': None
                        })
                    ]

                    mock_agent_service.set_conversation_result(
                        response_text="For marketing, let's focus on understanding your target audience first.",
                        agent_name="marketing",
                        tools_called=["web_search", "file_search"],
                        confidence_score=0.92
                    )

                    response = await async_client.post(
                        f"/api/chat/conversations/{mock_conv.id}/messages",
                        json={"content": "I need help with marketing strategies for my tech startup."}
                    )
                    assert response.status_code == 200
                    marketing_data = response.json()
                    assert marketing_data["agent_used"] == "marketing"
                    assert "marketing" in marketing_data["message"]["content"].lower()
                    assert "web_search" in marketing_data["tools_called"]

    @pytest.mark.asyncio
    async def test_multiple_agent_workflow(
        self, async_client: AsyncClient, test_user, test_conversation
    ):
        """Test workflow involving multiple specialized agents"""
        mock_agent_service = MockIgnacioAgentService()

        with patch("app.routers.chat.TEMP_USER_ID", test_user.id):
            with patch("app.routers.chat.get_ignacio_service", return_value=mock_agent_service):
                with patch("app.services.database.db_service") as mock_db:
                    mock_db.get_conversation_by_id.return_value = test_conversation

                    # Test marketing agent
                    mock_agent_service.set_conversation_result(
                        response_text="For marketing, focus on customer personas and value proposition.",
                        agent_name="marketing",
                        tools_called=["web_search"],
                        confidence_score=0.9
                    )
                    mock_db.get_conversation_messages.return_value = [
                        type('Message', (), {
                            'id': uuid4(),
                            'content': "For marketing, focus on customer personas and value proposition.",
                            'message_type': 'text',
                            'is_from_user': False,
                            'created_at': type('datetime', (), {'isoformat': lambda: '2023-01-01T00:00:00'})(),
                            'file_path': None
                        })
                    ]

                    response = await async_client.post(
                        f"/api/chat/conversations/{test_conversation.id}/messages",
                        json={"content": "Help me with marketing strategies"}
                    )
                    assert response.status_code == 200
                    marketing_response = response.json()
                    assert marketing_response["agent_used"] == "marketing"

                    # Test tech agent
                    mock_agent_service.set_conversation_result(
                        response_text="For technology stack, consider scalability and team expertise.",
                        agent_name="tech",
                        tools_called=["web_search", "file_search"],
                        confidence_score=0.88
                    )
                    mock_db.get_conversation_messages.return_value = [
                        type('Message', (), {
                            'id': uuid4(),
                            'content': "For technology stack, consider scalability and team expertise.",
                            'message_type': 'text',
                            'is_from_user': False,
                            'created_at': type('datetime', (), {'isoformat': lambda: '2023-01-01T00:00:00'})(),
                            'file_path': None
                        })
                    ]

                    response = await async_client.post(
                        f"/api/chat/conversations/{test_conversation.id}/messages",
                        json={"content": "What technology stack should I use?"}
                    )
                    assert response.status_code == 200
                    tech_response = response.json()
                    assert tech_response["agent_used"] == "tech"

    @pytest.mark.asyncio
    async def test_file_integration_workflow(
        self, async_client: AsyncClient, test_user, test_conversation, test_user_file
    ):
        """Test complete file integration workflow"""
        mock_agent_service = MockIgnacioAgentService()

        with patch("app.routers.chat.TEMP_USER_ID", test_user.id):
            with patch("app.routers.chat.get_ignacio_service", return_value=mock_agent_service):
                with patch("app.services.database.db_service") as mock_db:
                    # 1. Integrate file into context
                    mock_agent_service.set_file_integration_result(
                        success=True,
                        openai_file_id="file-business-plan-123",
                        content_preview="Business Plan - Our startup focuses on AI-powered solutions..."
                    )
                    mock_db.get_user_files.return_value = [test_user_file]

                    response = await async_client.post(
                        f"/api/chat/files/{test_user_file.id}/integrate"
                    )
                    assert response.status_code == 200
                    integration_data = response.json()
                    assert integration_data["success"] is True

                    # 2. Ask question that can use the integrated file
                    mock_agent_service.set_conversation_result(
                        response_text="Based on your business plan, I see you're targeting small businesses with AI solutions. This is a strong market opportunity.",
                        agent_name="ignacio",
                        tools_called=["file_search", "web_search"],
                        confidence_score=0.93
                    )
                    mock_db.get_conversation_by_id.return_value = test_conversation
                    mock_db.get_conversation_messages.return_value = [
                        type('Message', (), {
                            'id': uuid4(),
                            'content': "Based on your business plan, I see you're targeting small businesses with AI solutions. This is a strong market opportunity.",
                            'message_type': 'text',
                            'is_from_user': False,
                            'created_at': type('datetime', (), {'isoformat': lambda: '2023-01-01T00:00:00'})(),
                            'file_path': None
                        })
                    ]

                    response = await async_client.post(
                        f"/api/chat/conversations/{test_conversation.id}/messages",
                        json={"content": "What do you think about my business plan?"}
                    )
                    assert response.status_code == 200
                    chat_response = response.json()
                    assert "file_search" in chat_response["tools_called"]
                    assert "business plan" in chat_response["message"]["content"].lower()


class TestChatAPIErrorHandling:
    """Test error handling scenarios with Agent SDK"""

    def test_invalid_http_methods(self, client: TestClient):
        """Test invalid HTTP methods on endpoints"""
        conv_id = uuid4()

        # PATCH not supported on conversations
        response = client.patch(f"/api/chat/conversations/{conv_id}")
        assert response.status_code == 405  # Method not allowed

    @pytest.mark.asyncio
    async def test_malformed_request_bodies(
        self, async_client: AsyncClient, test_user, test_conversation
    ):
        """Test various malformed request bodies"""
        with patch("app.routers.chat.TEMP_USER_ID", test_user.id):
            # Invalid JSON structure for conversation creation
            response = await async_client.post(
                "/api/chat/conversations", json={"invalid_field": "value"}
            )
            # Should still work as title is optional
            assert response.status_code == 200

            # Invalid message type
            response = await async_client.post(
                f"/api/chat/conversations/{test_conversation.id}/messages",
                json={"content": "test", "message_type": "invalid_type"},
            )
            assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_agent_service_timeout_handling(
        self, async_client: AsyncClient, test_user, test_conversation
    ):
        """Test handling Agent SDK timeouts"""
        import asyncio

        mock_agent_service = AsyncMock()
        mock_agent_service.continue_conversation.side_effect = asyncio.TimeoutError("Agent timeout")

        with patch("app.routers.chat.TEMP_USER_ID", test_user.id):
            with patch("app.routers.chat.get_ignacio_service", return_value=mock_agent_service):
                with patch("app.services.database.db_service") as mock_db:
                    mock_db.get_conversation_by_id.return_value = test_conversation

                    response = await async_client.post(
                        f"/api/chat/conversations/{test_conversation.id}/messages",
                        json={"content": "Test message"}
                    )

                    assert response.status_code == 500

    @pytest.mark.asyncio
    async def test_large_message_content_with_agents(
        self, async_client: AsyncClient, test_user, test_conversation
    ):
        """Test handling very large message content with Agent SDK"""
        mock_agent_service = MockIgnacioAgentService()

        with patch("app.routers.chat.TEMP_USER_ID", test_user.id):
            with patch("app.routers.chat.get_ignacio_service", return_value=mock_agent_service):
                with patch("app.services.database.db_service") as mock_db:
                    mock_db.get_conversation_by_id.return_value = test_conversation

                    # Very large message (10KB)
                    large_content = "A" * 10000

                    response = await async_client.post(
                        f"/api/chat/conversations/{test_conversation.id}/messages",
                        json={"content": large_content},
                    )

                    # Should handle large content gracefully
                    assert response.status_code in [
                        200,
                        413,
                        422,
                    ]  # OK, Payload too large, or Validation error

    @pytest.mark.asyncio
    async def test_concurrent_message_sending_with_agents(
        self, async_client: AsyncClient, test_user, test_conversation
    ):
        """Test concurrent message sending with Agent SDK"""
        import asyncio

        mock_agent_service = MockIgnacioAgentService()
        mock_agent_service.set_conversation_result(
            response_text="Response to concurrent message",
            agent_name="ignacio",
            confidence_score=0.9
        )

        mock_message = type('Message', (), {
            'id': uuid4(),
            'content': "Response to concurrent message",
            'message_type': 'text',
            'is_from_user': False,
            'created_at': type('datetime', (), {'isoformat': lambda: '2023-01-01T00:00:00'})(),
            'file_path': None
        })

        with patch("app.routers.chat.TEMP_USER_ID", test_user.id):
            with patch("app.routers.chat.get_ignacio_service", return_value=mock_agent_service):
                with patch("app.services.database.db_service") as mock_db:
                    mock_db.get_conversation_by_id.return_value = test_conversation
                    mock_db.get_conversation_messages.return_value = [mock_message]

                    # Send multiple messages concurrently
                    tasks = []
                    for i in range(3):
                        task = async_client.post(
                            f"/api/chat/conversations/{test_conversation.id}/messages",
                            json={"content": f"Concurrent message {i}"},
                        )
                        tasks.append(task)

                    responses = await asyncio.gather(*tasks, return_exceptions=True)

                    # All should succeed or handle gracefully
                    for response in responses:
                        if not isinstance(response, Exception):
                            assert response.status_code == 200
