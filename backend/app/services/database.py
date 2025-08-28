"""
Database service layer for Ignacio Bot
Provides CRUD operations for all database models using Supabase API
"""

from datetime import datetime
from uuid import UUID

from app.core.database import supabase
from app.models.database import (
    Conversation,
    ConversationCreate,
    ConversationUpdate,
    Message,
    MessageCreate,
    OTPCode,
    OTPCodeCreate,
    User,
    UserCreate,
    UserFile,
    UserFileCreate,
    UserSession,
    UserSessionCreate,
    UserUpdate,
)


class DatabaseService:
    """Service class for database operations using Supabase API"""

    def __init__(self):
        self.client = supabase

    # User operations
    async def create_user(self, user_data: UserCreate) -> User:
        """Create a new user"""
        response = (
            self.client.table("users")
            .insert(
                {
                    "phone_number": user_data.phone_number,
                    "name": user_data.name,
                    "is_admin": user_data.is_admin,
                    "is_active": user_data.is_active,
                }
            )
            .execute()
        )

        if response.data:
            return User(**response.data[0])
        raise Exception("Failed to create user")

    async def get_user_by_id(self, user_id: UUID) -> User | None:
        """Get user by ID"""
        response = (
            self.client.table("users").select("*").eq("id", str(user_id)).execute()
        )

        if response.data:
            return User(**response.data[0])
        return None

    async def get_user_by_phone(self, phone_number: str) -> User | None:
        """Get user by phone number"""
        response = (
            self.client.table("users")
            .select("*")
            .eq("phone_number", phone_number)
            .execute()
        )

        if response.data:
            return User(**response.data[0])
        return None

    async def get_users(self, limit: int = 100, offset: int = 0) -> list[User]:
        """Get all users with pagination"""
        response = (
            self.client.table("users")
            .select("*")
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )

        return [User(**row) for row in response.data]

    async def update_user(self, user_id: UUID, user_data: UserUpdate) -> User | None:
        """Update user"""
        update_dict = {}
        if user_data.name is not None:
            update_dict["name"] = user_data.name
        if user_data.is_admin is not None:
            update_dict["is_admin"] = user_data.is_admin
        if user_data.is_active is not None:
            update_dict["is_active"] = user_data.is_active

        if not update_dict:
            return await self.get_user_by_id(user_id)

        response = (
            self.client.table("users")
            .update(update_dict)
            .eq("id", str(user_id))
            .execute()
        )

        if response.data:
            return User(**response.data[0])
        return None

    async def delete_user(self, user_id: UUID) -> bool:
        """Delete user"""
        response = self.client.table("users").delete().eq("id", str(user_id)).execute()
        return len(response.data) > 0

    # Conversation operations
    async def create_conversation(self, conv_data: ConversationCreate) -> Conversation:
        """Create a new conversation"""
        response = (
            self.client.table("conversations")
            .insert({"user_id": str(conv_data.user_id), "title": conv_data.title})
            .execute()
        )

        if response.data:
            return Conversation(**response.data[0])
        raise Exception("Failed to create conversation")

    async def get_user_conversations(self, user_id: UUID) -> list[Conversation]:
        """Get all conversations for a user"""
        response = (
            self.client.table("conversations")
            .select("*")
            .eq("user_id", str(user_id))
            .order("updated_at", desc=True)
            .execute()
        )

        return [Conversation(**row) for row in response.data]

    async def get_conversation_by_id(self, conv_id: UUID) -> Conversation | None:
        """Get conversation by ID"""
        response = (
            self.client.table("conversations")
            .select("*")
            .eq("id", str(conv_id))
            .execute()
        )

        if response.data:
            return Conversation(**response.data[0])
        return None

    async def update_conversation(
        self, conv_id: UUID, conv_data: ConversationUpdate
    ) -> Conversation | None:
        """Update conversation"""
        update_dict = {}
        if conv_data.title is not None:
            update_dict["title"] = conv_data.title

        if not update_dict:
            return await self.get_conversation_by_id(conv_id)

        response = (
            self.client.table("conversations")
            .update(update_dict)
            .eq("id", str(conv_id))
            .execute()
        )

        if response.data:
            return Conversation(**response.data[0])
        return None

    # Message operations
    async def create_message(self, msg_data: MessageCreate) -> Message:
        """Create a new message"""
        response = (
            self.client.table("messages")
            .insert(
                {
                    "conversation_id": str(msg_data.conversation_id),
                    "user_id": str(msg_data.user_id),
                    "content": msg_data.content,
                    "message_type": msg_data.message_type.value,
                    "file_path": msg_data.file_path,
                    "is_from_user": msg_data.is_from_user,
                    "whatsapp_message_id": msg_data.whatsapp_message_id,
                }
            )
            .execute()
        )

        if response.data:
            return Message(**response.data[0])
        raise Exception("Failed to create message")

    async def get_conversation_messages(
        self, conv_id: UUID, limit: int = 50, offset: int = 0
    ) -> list[Message]:
        """Get messages for a conversation"""
        response = (
            self.client.table("messages")
            .select("*")
            .eq("conversation_id", str(conv_id))
            .order("created_at", desc=False)
            .range(offset, offset + limit - 1)
            .execute()
        )

        return [Message(**row) for row in response.data]

    # OTP operations
    async def create_otp(self, otp_data: OTPCodeCreate) -> OTPCode:
        """Create a new OTP code"""
        response = (
            self.client.table("otp_codes")
            .insert(
                {
                    "phone_number": otp_data.phone_number,
                    "code": otp_data.code,
                    "expires_at": otp_data.expires_at.isoformat(),
                    "is_used": otp_data.is_used,
                }
            )
            .execute()
        )

        if response.data:
            return OTPCode(**response.data[0])
        raise Exception("Failed to create OTP")

    async def verify_otp(self, phone_number: str, code: str) -> OTPCode | None:
        """Verify OTP code"""
        # Get valid, unused OTP
        response = (
            self.client.table("otp_codes")
            .select("*")
            .eq("phone_number", phone_number)
            .eq("code", code)
            .eq("is_used", False)
            .gt("expires_at", datetime.now().isoformat())
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )

        if not response.data:
            return None

        otp_record = response.data[0]

        # Mark OTP as used
        self.client.table("otp_codes").update({"is_used": True}).eq(
            "id", otp_record["id"]
        ).execute()

        return OTPCode(**otp_record)

    # Session operations
    async def create_session(self, session_data: UserSessionCreate) -> UserSession:
        """Create a new user session"""
        response = (
            self.client.table("user_sessions")
            .insert(
                {
                    "user_id": str(session_data.user_id),
                    "session_token": session_data.session_token,
                    "expires_at": session_data.expires_at.isoformat(),
                }
            )
            .execute()
        )

        if response.data:
            return UserSession(**response.data[0])
        raise Exception("Failed to create session")

    async def get_session_by_token(self, token: str) -> UserSession | None:
        """Get session by token"""
        response = (
            self.client.table("user_sessions")
            .select("*")
            .eq("session_token", token)
            .gt("expires_at", datetime.now().isoformat())
            .execute()
        )

        if response.data:
            return UserSession(**response.data[0])
        return None

    async def delete_session(self, token: str) -> bool:
        """Delete session"""
        response = (
            self.client.table("user_sessions")
            .delete()
            .eq("session_token", token)
            .execute()
        )
        return len(response.data) > 0

    # File operations
    async def create_user_file(self, file_data: UserFileCreate) -> UserFile:
        """Create a new user file record"""
        response = (
            self.client.table("user_files")
            .insert(
                {
                    "user_id": str(file_data.user_id),
                    "file_name": file_data.file_name,
                    "file_path": file_data.file_path,
                    "file_type": file_data.file_type,
                    "file_size": file_data.file_size,
                }
            )
            .execute()
        )

        if response.data:
            return UserFile(**response.data[0])
        raise Exception("Failed to create user file")

    async def get_user_files(self, user_id: UUID) -> list[UserFile]:
        """Get all files for a user"""
        response = (
            self.client.table("user_files")
            .select("*")
            .eq("user_id", str(user_id))
            .order("created_at", desc=True)
            .execute()
        )

        return [UserFile(**row) for row in response.data]

    async def get_file_by_id(self, file_id: UUID) -> UserFile | None:
        """Get file by ID"""
        response = (
            self.client.table("user_files").select("*").eq("id", str(file_id)).execute()
        )

        if response.data:
            return UserFile(**response.data[0])
        return None


# Global database service instance
db_service = DatabaseService()
