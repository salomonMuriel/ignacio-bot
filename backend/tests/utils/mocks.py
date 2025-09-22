"""
Mock objects and utilities for testing
"""

from datetime import datetime
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

from app.models.database import (
    ConversationResult,
    FileIntegrationResult,
    MessageType,
    ProjectStage,
    ProjectType,
    SyncStatus,
)


class MockIgnacioAgentService:
    """Mock IgnacioAgentService for testing"""

    def __init__(self):
        self.start_conversation = AsyncMock()
        self.continue_conversation = AsyncMock()
        self.upload_file_to_context = AsyncMock()
        self.get_conversation_summary = AsyncMock()
        self.update_project_context = AsyncMock()
        self.vector_manager = MagicMock()
        self._sessions = {}
        self._agents = {
            "ignacio": MagicMock(),
            "marketing": MagicMock(),
            "sales": MagicMock(),
            "tech": MagicMock(),
            "finance": MagicMock(),
            "leadership": MagicMock(),
            "agile_pm": MagicMock(),
            "design_thinking": MagicMock(),
            "translator": MagicMock(),
        }

    def set_conversation_result(
        self,
        response_text: str,
        agent_name: str = "ignacio",
        tools_called: list = None,
        confidence_score: float = 0.95,
    ) -> ConversationResult:
        """Set mock conversation result"""
        conversation_id = uuid4()
        mock_result = ConversationResult(
            conversation_id=conversation_id,
            response_text=response_text,
            agent_used=agent_name,
            tools_called=tools_called or ["web_search"],
            confidence_score=confidence_score,
            suggested_actions=["Review project goals"],
            requires_followup=False,
            execution_time_ms=1200,
        )

        self.start_conversation.return_value = mock_result
        self.continue_conversation.return_value = mock_result
        return mock_result

    def set_file_integration_result(
        self,
        success: bool = True,
        openai_file_id: str = "file-test123",
        content_preview: str = "Test file content...",
    ) -> FileIntegrationResult:
        """Set mock file integration result"""
        mock_result = FileIntegrationResult(
            success=success,
            openai_file_id=openai_file_id if success else None,
            vector_store_updated=success,
            content_preview=content_preview if success else None,
            error_message=None if success else "File integration failed",
        )

        self.upload_file_to_context.return_value = mock_result
        return mock_result


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


class MockOpenAIAgentClient:
    """Mock OpenAI Agent SDK client for testing"""

    def __init__(self):
        self.vector_stores = MagicMock()
        self.files = MagicMock()

        # Mock vector store operations
        mock_vector_store = MagicMock()
        mock_vector_store.id = "vs-test123"
        self.vector_stores.create.return_value = mock_vector_store

        # Mock file operations
        mock_file = MagicMock()
        mock_file.id = "file-test123"
        self.files.create.return_value = mock_file

        # Mock vector store files
        mock_vector_file = MagicMock()
        mock_vector_file.id = "vf-test123"
        self.vector_stores.files.create_and_poll.return_value = mock_vector_file

    def set_vector_store_response(self, vector_store_id: str):
        """Set mock vector store response"""
        mock_vector_store = MagicMock()
        mock_vector_store.id = vector_store_id
        self.vector_stores.create.return_value = mock_vector_store
        return mock_vector_store

    def set_file_response(self, file_id: str):
        """Set mock file response"""
        mock_file = MagicMock()
        mock_file.id = file_id
        self.files.create.return_value = mock_file
        return mock_file


class MockRunner:
    """Mock Agent SDK Runner for testing"""

    @staticmethod
    async def run(agent, message, session=None):
        """Mock Agent SDK run method"""
        mock_result = MagicMock()
        mock_result.final_output = f"Agent {agent.name} processed: {message[:50]}..."
        mock_result.new_items = []
        return mock_result


class MockVectorStoreManager:
    """Mock VectorStoreManager for testing"""

    def __init__(self):
        self.ensure_user_vector_store = AsyncMock(return_value="vs-test123")
        self.sync_file_to_vector_store = AsyncMock(return_value=True)
        self.cleanup_expired_files = AsyncMock(return_value=0)
        self._user_vector_stores = {}


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


def create_mock_agent_interaction_data(conversation_id: str = None):
    """Create mock agent interaction data"""
    return {
        "id": str(uuid4()),
        "conversation_id": conversation_id or str(uuid4()),
        "agent_name": "ignacio",
        "input_text": "Test user input",
        "output_text": "Test agent response",
        "tools_used": ["web_search", "file_search"],
        "execution_time_ms": 1500,
        "created_at": datetime.utcnow().isoformat(),
    }


def create_mock_user_project_data(user_id: str = None):
    """Create mock user project data"""
    return {
        "id": str(uuid4()),
        "user_id": user_id or str(uuid4()),
        "project_name": "Test Project",
        "project_type": ProjectType.STARTUP,
        "description": "A test project description",
        "current_stage": ProjectStage.IDEATION,
        "target_audience": "Tech entrepreneurs",
        "problem_statement": "Solving efficiency problems",
        "solution_approach": "AI-powered solutions",
        "business_model": "SaaS subscription",
        "context_data": {"industry": "tech", "location": "Mexico"},
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }


def create_mock_user_file_data(user_id: str = None):
    """Create mock user file data"""
    return {
        "id": str(uuid4()),
        "user_id": user_id or str(uuid4()),
        "file_name": "test_document.pdf",
        "file_path": f"users/{user_id or 'test'}/test_document.pdf",
        "file_type": "application/pdf",
        "file_size": 1024576,
        "openai_file_id": "file-test123",
        "openai_vector_store_id": "vs-test123",
        "openai_uploaded_at": datetime.utcnow().isoformat(),
        "openai_sync_status": SyncStatus.SYNCED,
        "content_preview": "This is a test document...",
        "metadata": {"pages": 5, "language": "en"},
        "vector_store_id": "vs-test123",
        "created_at": datetime.utcnow().isoformat(),
    }
