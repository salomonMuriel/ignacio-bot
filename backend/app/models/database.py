"""
Database models for Ignacio Bot
Based on the database schema defined in SPECS.md
"""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr


class MessageType(str, Enum):
    TEXT = "text"
    IMAGE = "image"
    AUDIO = "audio"
    VIDEO = "video"
    DOCUMENT = "document"


class ProjectType(str, Enum):
    STARTUP = "startup"
    COMPANY = "company"
    NGO = "ngo"
    FOUNDATION = "foundation"
    SPINOFF = "spinoff"
    INTERNAL = "internal"
    OTHER = "other"


class ProjectStage(str, Enum):
    IDEATION = "ideation"
    RESEARCH = "research"
    VALIDATION = "validation"
    DEVELOPMENT = "development"
    TESTING = "testing"
    LAUNCH = "launch"
    GROWTH = "growth"
    MATURE = "mature"


class SyncStatus(str, Enum):
    PENDING = "pending"
    SYNCING = "syncing"
    SYNCED = "synced"
    FAILED = "failed"
    EXPIRED = "expired"
    REMOVED = "removed"


class TemplateType(str, Enum):
    ADMIN = "admin"
    USER = "user"


# Base models for database tables
class UserBase(BaseModel):
    phone_number: str | None = None
    email: EmailStr | None = None
    name: str | None = None
    is_admin: bool = False
    is_active: bool = True
    auth_user_id: str


class User(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    created_at: datetime
    updated_at: datetime


class UserCreate(UserBase):
    pass


class UserUpdate(BaseModel):
    name: str | None = None
    phone_number: str | None = None
    email: str | None = None
    is_admin: bool | None = None
    is_active: bool | None = None


class ConversationBase(BaseModel):
    title: str | None = None
    project_id: UUID | None = None
    openai_session_id: str | None = None
    agent_state: Dict[str, Any] = {}
    project_context: Dict[str, Any] = {}
    language_preference: str = "es"


class Conversation(ConversationBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime


class ConversationCreate(ConversationBase):
    user_id: UUID


class ConversationUpdate(BaseModel):
    title: str | None = None
    project_id: UUID | None = None


class MessageBase(BaseModel):
    content: str | None = None
    message_type: MessageType = MessageType.TEXT
    file_path: str | None = None
    is_from_user: bool
    whatsapp_message_id: str | None = None
    attachments: List[UUID] = []  # List of file IDs attached to this message


class Message(MessageBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    conversation_id: UUID
    user_id: UUID
    created_at: datetime


class MessageCreate(MessageBase):
    conversation_id: UUID
    user_id: UUID


class UserSessionBase(BaseModel):
    session_token: str
    expires_at: datetime


class UserSession(UserSessionBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    created_at: datetime


class UserSessionCreate(UserSessionBase):
    user_id: UUID


class OTPCodeBase(BaseModel):
    phone_number: str
    code: str
    expires_at: datetime
    is_used: bool = False


class OTPCode(OTPCodeBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime


class OTPCodeCreate(OTPCodeBase):
    pass


class UserFileBase(BaseModel):
    file_name: str
    file_path: str
    file_type: str
    file_size: int
    conversation_id: UUID | None = None
    openai_file_id: str | None = None
    openai_vector_store_id: str | None = None
    openai_uploaded_at: datetime | None = None
    openai_sync_status: SyncStatus = SyncStatus.PENDING
    content_preview: str | None = None
    metadata: Dict[str, Any] = {}
    vector_store_id: str | None = None


class UserFile(UserFileBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    created_at: datetime


class UserFileCreate(UserFileBase):
    user_id: UUID


# Agent Interaction models
class AgentInteractionBase(BaseModel):
    agent_name: str
    input_text: str | None = None
    output_text: str | None = None
    tools_used: List[str] = []
    execution_time_ms: int | None = None


class AgentInteraction(AgentInteractionBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    conversation_id: UUID
    created_at: datetime


class AgentInteractionCreate(AgentInteractionBase):
    conversation_id: UUID


# User Project models
class ProjectBase(BaseModel):
    project_name: str
    project_type: ProjectType | None = None
    description: str | None = None
    current_stage: ProjectStage | None = None
    target_audience: str | None = None
    problem_statement: str | None = None
    solution_approach: str | None = None
    business_model: str | None = None
    context_data: Dict[str, Any] = {}


class Project(ProjectBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime


class ProjectCreate(ProjectBase):
    user_id: UUID | None = None


class ProjectUpdate(BaseModel):
    project_name: str | None = None
    project_type: ProjectType | None = None
    description: str | None = None
    current_stage: ProjectStage | None = None
    target_audience: str | None = None
    problem_statement: str | None = None
    solution_approach: str | None = None
    business_model: str | None = None
    context_data: Dict[str, Any] | None = None


# Response models for API
class ConversationWithMessages(Conversation):
    messages: list[Message] = []


class ConversationWithInteractions(Conversation):
    interactions: list[AgentInteraction] = []


class UserWithConversations(User):
    conversations: list[Conversation] = []


class UserWithProjects(User):
    projects: list[Project] = []


class MessageWithFiles(Message):
    files: list[UserFile] = []

class MessageWithAttachments(Message):
    attachment_files: list[UserFile] = []  # Files attached to this message


class UserProjectWithFiles(Project):
    files: list[UserFile] = []


# Agent SDK specific response models
class ConversationResult(BaseModel):
    """Result of agent conversation processing"""
    conversation_id: UUID
    response_text: str
    agent_used: str
    tools_called: List[str] = []
    confidence_score: float = 0.0
    suggested_actions: List[str] = []
    requires_followup: bool = False
    execution_time_ms: int = 0


class FileIntegrationResult(BaseModel):
    """Result of file integration with vector stores"""
    success: bool
    openai_file_id: str | None = None
    vector_store_updated: bool = False
    content_preview: str | None = None
    error_message: str | None = None


class ConversationSummary(BaseModel):
    """Summary of conversation for context management"""
    conversation_id: UUID
    total_messages: int
    agent_interactions: int
    tools_used: List[str] = []
    key_topics: List[str] = []
    project_context: Dict[str, Any] = {}
    last_activity: datetime


# Prompt Template models
class PromptTemplateBase(BaseModel):
    title: str
    content: str
    tags: List[str] = []
    is_active: bool = True
    template_type: TemplateType = TemplateType.USER


class PromptTemplate(PromptTemplateBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_by: UUID
    created_at: datetime
    updated_at: datetime


class PromptTemplateCreate(PromptTemplateBase):
    pass


class PromptTemplateUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    tags: List[str] | None = None
    is_active: bool | None = None
    template_type: TemplateType | None = None
