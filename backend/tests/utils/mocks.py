"""
Mock objects and utilities for testing
"""

from datetime import datetime
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

from app.models.database import MessageType
from app.services.ai_service import AIResponse


class MockAIService:
    """Mock AI service for testing"""

    def __init__(self):
        self.generate_response = AsyncMock()
        self.process_message_and_respond = AsyncMock()
        self.get_conversation_context = AsyncMock()

    def set_response(self, content: str, response_type: str = "general"):
        """Set mock AI response"""
        mock_response = AIResponse(
            content=content,
            response_type=response_type,
            confidence=0.95,
            requires_followup=False,
            followup_suggestion=None,
        )
        self.generate_response.return_value = mock_response

        # Mock message object
        mock_message = MagicMock()
        mock_message.id = uuid4()
        mock_message.content = content
        mock_message.message_type = MessageType.TEXT
        mock_message.is_from_user = False
        mock_message.created_at = datetime.utcnow()
        mock_message.file_path = None

        self.process_message_and_respond.return_value = mock_message
        return mock_response


class MockSupabaseClient:
    """Mock Supabase client for testing"""

    def __init__(self):
        self.table_data = {}
        self.current_table = None
        self.query_filters = []

    def table(self, table_name: str):
        """Mock table method"""
        self.current_table = table_name
        if table_name not in self.table_data:
            self.table_data[table_name] = []
        return self

    def insert(self, data):
        """Mock insert method"""
        # Add ID and timestamps if not present
        if isinstance(data, dict):
            if "id" not in data:
                data["id"] = str(uuid4())
            if "created_at" not in data:
                data["created_at"] = datetime.utcnow().isoformat()
            if "updated_at" not in data:
                data["updated_at"] = datetime.utcnow().isoformat()

            self.table_data[self.current_table].append(data.copy())

        return self

    def select(self, columns="*"):
        """Mock select method"""
        return self

    def update(self, data):
        """Mock update method"""
        # This would need more logic for real updates
        return self

    def delete(self):
        """Mock delete method"""
        return self

    def eq(self, column, value):
        """Mock eq filter"""
        self.query_filters.append(("eq", column, value))
        return self

    def gt(self, column, value):
        """Mock gt filter"""
        self.query_filters.append(("gt", column, value))
        return self

    def order(self, column, desc=False):
        """Mock order method"""
        return self

    def range(self, start, end):
        """Mock range method"""
        return self

    def limit(self, count):
        """Mock limit method"""
        return self

    def execute(self):
        """Mock execute method"""
        mock_response = MagicMock()

        # Apply filters to get relevant data
        data = self.table_data.get(self.current_table, [])

        # Simple filtering logic for common cases
        for filter_type, column, value in self.query_filters:
            if filter_type == "eq":
                data = [row for row in data if str(row.get(column)) == str(value)]

        mock_response.data = data
        self.query_filters = []  # Reset filters

        return mock_response


class MockOpenAIClient:
    """Mock OpenAI client for testing"""

    def __init__(self):
        self.chat = MagicMock()
        self.completions = MagicMock()

        # Mock chat completions
        mock_completion = MagicMock()
        mock_completion.choices = [MagicMock()]
        mock_completion.choices[0].message.content = "Mock AI response"

        self.chat.completions.create.return_value = mock_completion

    def set_response(self, content: str):
        """Set mock response content"""
        mock_completion = MagicMock()
        mock_completion.choices = [MagicMock()]
        mock_completion.choices[0].message.content = content
        self.chat.completions.create.return_value = mock_completion


def create_mock_database_response(data, error=None):
    """Create mock database response"""
    mock_response = MagicMock()
    mock_response.data = data if not error else []
    mock_response.error = error
    return mock_response


def create_mock_user_data():
    """Create mock user data"""
    return {
        "id": str(uuid4()),
        "phone_number": "+1234567890",
        "name": "Test User",
        "is_admin": False,
        "is_active": True,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }


def create_mock_conversation_data(user_id: str = None):
    """Create mock conversation data"""
    return {
        "id": str(uuid4()),
        "user_id": user_id or str(uuid4()),
        "title": "Test Conversation",
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }


def create_mock_message_data(conversation_id: str = None, user_id: str = None):
    """Create mock message data"""
    return {
        "id": str(uuid4()),
        "conversation_id": conversation_id or str(uuid4()),
        "user_id": user_id or str(uuid4()),
        "content": "Test message",
        "message_type": "text",
        "is_from_user": True,
        "created_at": datetime.utcnow().isoformat(),
        "file_path": None,
        "whatsapp_message_id": None,
    }
