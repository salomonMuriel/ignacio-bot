"""
Database models for Ignacio Bot
Based on the database schema defined in SPECS.md
"""
from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class MessageType(str, Enum):
    TEXT = "text"
    IMAGE = "image"
    AUDIO = "audio"
    VIDEO = "video"
    DOCUMENT = "document"


# Base models for database tables
class UserBase(BaseModel):
    phone_number: str
    name: Optional[str] = None
    is_admin: bool = False
    is_active: bool = True


class User(UserBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserCreate(UserBase):
    pass


class UserUpdate(BaseModel):
    name: Optional[str] = None
    is_admin: Optional[bool] = None
    is_active: Optional[bool] = None


class ConversationBase(BaseModel):
    title: Optional[str] = None


class Conversation(ConversationBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ConversationCreate(ConversationBase):
    user_id: UUID


class ConversationUpdate(BaseModel):
    title: Optional[str] = None


class MessageBase(BaseModel):
    content: Optional[str] = None
    message_type: MessageType = MessageType.TEXT
    file_path: Optional[str] = None
    is_from_user: bool
    whatsapp_message_id: Optional[str] = None


class Message(MessageBase):
    id: UUID
    conversation_id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class MessageCreate(MessageBase):
    conversation_id: UUID
    user_id: UUID


class UserSessionBase(BaseModel):
    session_token: str
    expires_at: datetime


class UserSession(UserSessionBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class UserSessionCreate(UserSessionBase):
    user_id: UUID


class OTPCodeBase(BaseModel):
    phone_number: str
    code: str
    expires_at: datetime
    is_used: bool = False


class OTPCode(OTPCodeBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class OTPCodeCreate(OTPCodeBase):
    pass


class UserFileBase(BaseModel):
    file_name: str
    file_path: str
    file_type: str
    file_size: int


class UserFile(UserFileBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class UserFileCreate(UserFileBase):
    user_id: UUID


# Response models for API
class ConversationWithMessages(Conversation):
    messages: list[Message] = []


class UserWithConversations(User):
    conversations: list[Conversation] = []


class MessageWithFiles(Message):
    files: list[UserFile] = []