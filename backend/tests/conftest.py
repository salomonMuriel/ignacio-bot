"""
Test configuration and fixtures for Ignacio Bot backend tests
"""

import asyncio
import uuid
from collections.abc import AsyncGenerator, Generator
from datetime import datetime
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient

from app.core.database import supabase
from app.main import app
from app.models.database import (
    Conversation,
    ConversationCreate,
    Message,
    MessageCreate,
    MessageType,
    User,
    UserCreate,
)
from app.services.ai_service import AIResponse
from app.services.database import db_service


@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """Create event loop for async tests"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def client() -> TestClient:
    """Create FastAPI test client"""
    return TestClient(app)


@pytest.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    """Create async HTTP client for testing"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client


# Test data fixtures
@pytest.fixture
def test_user_data() -> UserCreate:
    """Test user data"""
    return UserCreate(
        phone_number=f"+123456{uuid.uuid4().hex[:4]}",  # Unique phone number
        name="Test User",
        is_admin=False,
        is_active=True,
    )


@pytest.fixture
def test_admin_data() -> UserCreate:
    """Test admin user data"""
    return UserCreate(
        phone_number=f"+987654{uuid.uuid4().hex[:4]}",  # Unique phone number
        name="Test Admin",
        is_admin=True,
        is_active=True,
    )


@pytest.fixture
async def test_user(test_user_data: UserCreate) -> User:
    """Create a test user in database"""
    user = await db_service.create_user(test_user_data)
    yield user
    # Cleanup - delete test user
    try:
        await db_service.delete_user(user.id)
    except Exception:
        pass  # User may have already been deleted in test


@pytest.fixture
async def test_admin(test_admin_data: UserCreate) -> User:
    """Create a test admin user in database"""
    user = await db_service.create_user(test_admin_data)
    yield user
    # Cleanup
    try:
        await db_service.delete_user(user.id)
    except Exception:
        pass


@pytest.fixture
def test_conversation_data(test_user: User) -> ConversationCreate:
    """Test conversation data"""
    return ConversationCreate(
        user_id=test_user.id,
        title="Test Conversation",
    )


@pytest.fixture
async def test_conversation(
    test_user: User, test_conversation_data: ConversationCreate
) -> Conversation:
    """Create a test conversation in database"""
    conversation = await db_service.create_conversation(test_conversation_data)
    yield conversation
    # Note: Conversations will be cleaned up when users are deleted due to CASCADE


@pytest.fixture
def test_message_data(
    test_user: User, test_conversation: Conversation
) -> MessageCreate:
    """Test message data"""
    return MessageCreate(
        conversation_id=test_conversation.id,
        user_id=test_user.id,
        content="Test message content",
        message_type=MessageType.TEXT,
        is_from_user=True,
    )


@pytest.fixture
async def test_message(
    test_user: User, test_conversation: Conversation, test_message_data: MessageCreate
) -> Message:
    """Create a test message in database"""
    message = await db_service.create_message(test_message_data)
    yield message
    # Messages will be cleaned up when conversations are deleted


# Mock fixtures for external services
@pytest.fixture
def mock_openai_response() -> AIResponse:
    """Mock AI response"""
    return AIResponse(
        content="This is a test AI response",
        response_type="general",
        confidence=0.95,
        requires_followup=False,
        followup_suggestion=None,
    )


@pytest.fixture
def mock_ai_service(mock_openai_response: AIResponse) -> AsyncMock:
    """Mock AI service for testing"""
    mock_service = AsyncMock()
    mock_service.generate_response.return_value = mock_openai_response
    mock_service.process_message_and_respond.return_value = AsyncMock(
        id=uuid.uuid4(),
        content=mock_openai_response.content,
        message_type=MessageType.TEXT,
        is_from_user=False,
        created_at=datetime.utcnow(),
        file_path=None,
    )
    return mock_service


@pytest.fixture
def mock_supabase_client():
    """Mock Supabase client for isolated testing"""
    mock_client = MagicMock()

    # Mock table operations
    mock_table = MagicMock()
    mock_client.table.return_value = mock_table

    # Mock query chain
    mock_table.insert.return_value = mock_table
    mock_table.select.return_value = mock_table
    mock_table.update.return_value = mock_table
    mock_table.delete.return_value = mock_table
    mock_table.eq.return_value = mock_table
    mock_table.gt.return_value = mock_table
    mock_table.order.return_value = mock_table
    mock_table.range.return_value = mock_table
    mock_table.limit.return_value = mock_table

    # Mock execute with sample data
    mock_response = MagicMock()
    mock_response.data = []
    mock_table.execute.return_value = mock_response

    return mock_client


# Database cleanup utilities
async def cleanup_test_data():
    """Clean up test data from database"""
    try:
        # Get all test users (identifiable by phone numbers starting with +123456 or +987654)
        response = (
            supabase.table("users")
            .select("id")
            .like("phone_number", "+123456%")
            .execute()
        )
        if response.data:
            user_ids = [user["id"] for user in response.data]
            for user_id in user_ids:
                await db_service.delete_user(uuid.UUID(user_id))

        response = (
            supabase.table("users")
            .select("id")
            .like("phone_number", "+987654%")
            .execute()
        )
        if response.data:
            user_ids = [user["id"] for user in response.data]
            for user_id in user_ids:
                await db_service.delete_user(uuid.UUID(user_id))

    except Exception as e:
        print(f"Warning: Could not clean up test data: {e}")


@pytest.fixture(autouse=True)
async def cleanup_after_test():
    """Automatically cleanup after each test"""
    yield
    await cleanup_test_data()


# Pytest configuration
def pytest_configure(config):
    """Configure pytest"""
    config.addinivalue_line("markers", "asyncio: mark test as async")
    config.addinivalue_line("markers", "integration: mark test as integration test")
    config.addinivalue_line("markers", "unit: mark test as unit test")
