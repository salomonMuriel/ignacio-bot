"""
Tests for chat API endpoints
"""

from unittest.mock import AsyncMock, patch
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient

from tests.utils.fixtures import TestDataFactory
from tests.utils.mocks import MockAIService


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
        """Test sending message and receiving AI response"""
        mock_ai_service = MockAIService()
        mock_ai_service.set_response("This is a test AI response", "general")

        with patch("app.routers.chat.TEMP_USER_ID", test_user.id):
            with patch("app.routers.chat.ai_service", mock_ai_service):
                message_data = {
                    "content": "Hello, how can you help me?",
                    "message_type": "text",
                }

                response = await async_client.post(
                    f"/api/chat/conversations/{test_conversation.id}/messages",
                    json=message_data,
                )

                assert response.status_code == 200
                data = response.json()
                assert data["content"] == "This is a test AI response"
                assert data["is_from_user"] is False
                assert data["message_type"] == "text"
                assert "id" in data
                assert "created_at" in data

                # Verify AI service was called
                mock_ai_service.process_message_and_respond.assert_called_once_with(
                    user_message="Hello, how can you help me?",
                    user_id=test_user.id,
                    conversation_id=test_conversation.id,
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
    async def test_send_message_ai_service_error(
        self, async_client: AsyncClient, test_user, test_conversation
    ):
        """Test handling AI service errors"""
        mock_ai_service = AsyncMock()
        mock_ai_service.process_message_and_respond.side_effect = Exception(
            "AI Service Error"
        )

        with patch("app.routers.chat.TEMP_USER_ID", test_user.id):
            with patch("app.routers.chat.ai_service", mock_ai_service):
                message_data = {"content": "Test message"}

                response = await async_client.post(
                    f"/api/chat/conversations/{test_conversation.id}/messages",
                    json=message_data,
                )

                assert response.status_code == 500


class TestChatAPIIntegration:
    """Integration tests for complete chat flows"""

    @pytest.mark.asyncio
    async def test_complete_conversation_flow(
        self, async_client: AsyncClient, test_user
    ):
        """Test complete conversation flow: create → send message → get messages"""
        mock_ai_service = MockAIService()
        mock_ai_service.set_response(
            "Welcome! I'm here to help with your project development.", "general"
        )

        with patch("app.routers.chat.TEMP_USER_ID", test_user.id):
            with patch("app.routers.chat.ai_service", mock_ai_service):
                # 1. Create conversation
                response = await async_client.post(
                    "/api/chat/conversations", json={"title": "Project Help"}
                )
                assert response.status_code == 200
                conversation = response.json()
                conv_id = conversation["id"]

                # 2. Send first message
                response = await async_client.post(
                    f"/api/chat/conversations/{conv_id}/messages",
                    json={"content": "Hi Ignacio, I need help with my startup idea."},
                )
                assert response.status_code == 200
                ai_response = response.json()
                assert "Welcome" in ai_response["content"]

                # 3. Get conversation with messages
                response = await async_client.get(f"/api/chat/conversations/{conv_id}")
                assert response.status_code == 200
                conv_detail = response.json()
                assert len(conv_detail["messages"]) >= 2  # User message + AI response

                # 4. Verify message order and content
                messages = conv_detail["messages"]
                user_msg = next(msg for msg in messages if msg["is_from_user"])
                ai_msg = next(msg for msg in messages if not msg["is_from_user"])

                assert "startup idea" in user_msg["content"]
                assert "Welcome" in ai_msg["content"]

    @pytest.mark.asyncio
    async def test_multiple_conversations_isolation(
        self, async_client: AsyncClient, test_user
    ):
        """Test that multiple conversations are isolated"""
        with patch("app.routers.chat.TEMP_USER_ID", test_user.id):
            # Create two conversations
            response1 = await async_client.post(
                "/api/chat/conversations", json={"title": "Conversation 1"}
            )
            conv1_id = response1.json()["id"]

            response2 = await async_client.post(
                "/api/chat/conversations", json={"title": "Conversation 2"}
            )
            conv2_id = response2.json()["id"]

            # Add message to first conversation
            from app.models.database import MessageCreate
            from app.services.database import db_service

            msg_data = MessageCreate(
                **TestDataFactory.message_data(
                    uuid4(conv1_id), test_user.id, content="Message in conv 1"
                )
            )
            await db_service.create_message(msg_data)

            # Verify second conversation is still empty
            response = await async_client.get(
                f"/api/chat/conversations/{conv2_id}/messages"
            )
            assert response.status_code == 200
            messages = response.json()
            # Should not contain message from conversation 1
            assert not any(
                "Message in conv 1" in msg.get("content", "") for msg in messages
            )

    @pytest.mark.asyncio
    async def test_conversation_update_and_retrieval(
        self, async_client: AsyncClient, test_user, test_conversation
    ):
        """Test updating conversation and retrieving updated data"""
        with patch("app.routers.chat.TEMP_USER_ID", test_user.id):
            # Update conversation title
            response = await async_client.put(
                f"/api/chat/conversations/{test_conversation.id}",
                json={"title": "Updated Project Discussion"},
            )
            assert response.status_code == 200

            # Verify title is updated in conversation list
            response = await async_client.get("/api/chat/conversations")
            conversations = response.json()

            updated_conv = next(
                conv
                for conv in conversations
                if conv["id"] == str(test_conversation.id)
            )
            assert updated_conv["title"] == "Updated Project Discussion"

            # Verify title is updated in conversation detail
            response = await async_client.get(
                f"/api/chat/conversations/{test_conversation.id}"
            )
            conv_detail = response.json()
            assert conv_detail["title"] == "Updated Project Discussion"


class TestChatAPIErrorHandling:
    """Test error handling scenarios"""

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
    async def test_large_message_content(
        self, async_client: AsyncClient, test_user, test_conversation
    ):
        """Test handling very large message content"""
        with patch("app.routers.chat.TEMP_USER_ID", test_user.id):
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
    async def test_concurrent_message_sending(
        self, async_client: AsyncClient, test_user, test_conversation
    ):
        """Test concurrent message sending to same conversation"""
        import asyncio

        mock_ai_service = MockAIService()
        mock_ai_service.set_response("Response to concurrent message", "general")

        with patch("app.routers.chat.TEMP_USER_ID", test_user.id):
            with patch("app.routers.chat.ai_service", mock_ai_service):
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
