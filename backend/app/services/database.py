"""
Database service layer for Ignacio Bot
Provides CRUD operations for all database models using Supabase API
"""

from datetime import datetime
from uuid import UUID

from app.core.database import supabase
from app.models.database import (
    AgentInteraction,
    AgentInteractionCreate,
    Conversation,
    ConversationCreate,
    ConversationUpdate,
    Message,
    MessageCreate,
    MessageWithAttachments,
    OTPCode,
    OTPCodeCreate,
    PromptTemplate,
    PromptTemplateCreate,
    PromptTemplateUpdate,
    User,
    UserCreate,
    UserFile,
    UserFileCreate,
    Project,
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
                    "auth_user_id": user_data.auth_user_id,
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

    async def get_user_by_auth_id(self, auth_id: UUID) -> User | None:
        """Get user by ID"""
        response = (
            self.client.table("users")
            .select("*")
            .eq("auth_user_id", str(auth_id))
            .execute()
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
    async def create_conversation(
        self, conv_data: ConversationCreate | dict
    ) -> Conversation:
        """Create a new conversation with Agent SDK support"""
        if isinstance(conv_data, dict):
            # Handle dict input from Agent SDK
            insert_data = {
                "user_id": str(conv_data["user_id"]),
                "title": conv_data.get("title", "New Conversation"),
                "project_id": str(conv_data["project_id"])
                if conv_data.get("project_id")
                else None,
                "language_preference": conv_data.get("language_preference", "es"),
                "agent_state": conv_data.get("agent_state", {}),
                "project_context": conv_data.get("project_context", {}),
            }
        else:
            # Handle ConversationCreate model
            insert_data = {
                "user_id": str(conv_data.user_id),
                "title": conv_data.title,
                "project_id": str(conv_data.project_id)
                if conv_data.project_id
                else None,
                "language_preference": getattr(conv_data, "language_preference", "es"),
                "agent_state": getattr(conv_data, "agent_state", {}),
                "project_context": getattr(conv_data, "project_context", {}),
            }

        response = self.client.table("conversations").insert(insert_data).execute()

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
        self, conv_id: UUID, conv_data: ConversationUpdate | dict
    ) -> Conversation | None:
        """Update conversation with Agent SDK support"""
        if isinstance(conv_data, dict):
            # Handle dict input from Agent SDK
            update_dict = conv_data
        else:
            # Handle ConversationUpdate model
            update_dict = {}
            if conv_data.title is not None:
                update_dict["title"] = conv_data.title
            if conv_data.project_id is not None:
                update_dict["project_id"] = str(conv_data.project_id)

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
        insert_data = {
            "conversation_id": str(msg_data.conversation_id),
            "user_id": str(msg_data.user_id),
            "content": msg_data.content,
            "message_type": msg_data.message_type.value,
            "file_path": msg_data.file_path,
            "is_from_user": msg_data.is_from_user,
            "whatsapp_message_id": msg_data.whatsapp_message_id,
        }

        # Add attachments if provided
        if hasattr(msg_data, "attachments") and msg_data.attachments:
            insert_data["attachments"] = [
                str(file_id) for file_id in msg_data.attachments
            ]

        response = self.client.table("messages").insert(insert_data).execute()

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

    async def get_message_with_attachments(
        self, message_id: UUID
    ) -> MessageWithAttachments | None:
        """Get a message with its attached files"""
        # Get the message
        message_response = (
            self.client.table("messages")
            .select("*")
            .eq("id", str(message_id))
            .execute()
        )

        if not message_response.data:
            return None

        message_data = message_response.data[0]

        # Get attached files if any
        attachment_files = []
        if message_data.get("attachments"):
            for file_id in message_data["attachments"]:
                file_record = await self.get_file_by_id(UUID(file_id))
                if file_record:
                    attachment_files.append(file_record)

        message = Message(**message_data)
        return MessageWithAttachments(
            **message.model_dump(), attachment_files=attachment_files
        )

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
        insert_data = {
            "user_id": str(file_data.user_id),
            "file_name": file_data.file_name,
            "file_path": file_data.file_path,
            "file_type": file_data.file_type,
            "file_size": file_data.file_size,
        }

        # Add conversation_id if provided
        if file_data.conversation_id:
            insert_data["conversation_id"] = str(file_data.conversation_id)

        response = self.client.table("user_files").insert(insert_data).execute()

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

    async def get_conversation_files(self, conversation_id: UUID) -> list[UserFile]:
        """Get all files for a conversation"""
        response = (
            self.client.table("user_files")
            .select("*")
            .eq("conversation_id", str(conversation_id))
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

    async def update_file_openai_info(
        self,
        file_id: UUID,
        openai_file_id: str | None = None,
        vector_store_id: str | None = None,
        sync_status: str | None = None,
        uploaded_at: datetime | None = None,
    ) -> bool:
        """Update OpenAI-related information for a file"""
        update_data = {}

        if openai_file_id is not None:
            update_data["openai_file_id"] = openai_file_id
        if vector_store_id is not None:
            update_data["openai_vector_store_id"] = vector_store_id
        if sync_status is not None:
            update_data["openai_sync_status"] = sync_status
        if uploaded_at is not None:
            update_data["openai_uploaded_at"] = uploaded_at.isoformat()

        if not update_data:
            return False

        response = (
            self.client.table("user_files")
            .update(update_data)
            .eq("id", str(file_id))
            .execute()
        )

        return len(response.data) > 0

    async def delete_user_file(self, file_id: UUID) -> bool:
        """Delete a user file record"""
        response = (
            self.client.table("user_files").delete().eq("id", str(file_id)).execute()
        )
        return len(response.data) > 0

    # Enhanced methods for Agent SDK

    async def get_conversation(self, conversation_id: UUID) -> Conversation | None:
        """Get conversation by ID (alias for get_conversation_by_id for Agent SDK compatibility)"""
        return await self.get_conversation_by_id(conversation_id)

    async def update_user_file(self, file_id: UUID, update_data: dict) -> bool:
        """Update user file with arbitrary data"""
        response = (
            self.client.table("user_files")
            .update(update_data)
            .eq("id", str(file_id))
            .execute()
        )
        return len(response.data) > 0

    # Agent Interaction operations
    async def create_agent_interaction(
        self, interaction_data: AgentInteractionCreate
    ) -> AgentInteraction:
        """Create a new agent interaction"""
        response = (
            self.client.table("agent_interactions")
            .insert(
                {
                    "conversation_id": str(interaction_data.conversation_id),
                    "agent_name": interaction_data.agent_name,
                    "input_text": interaction_data.input_text,
                    "output_text": interaction_data.output_text,
                    "tools_used": interaction_data.tools_used,
                    "execution_time_ms": interaction_data.execution_time_ms,
                }
            )
            .execute()
        )

        if response.data:
            return AgentInteraction(**response.data[0])
        else:
            raise Exception("Failed to create agent interaction")

    async def get_conversation_interactions(
        self, conversation_id: UUID
    ) -> list[AgentInteraction]:
        """Get all agent interactions for a conversation"""
        response = (
            self.client.table("agent_interactions")
            .select("*")
            .eq("conversation_id", str(conversation_id))
            .order("created_at", desc=False)
            .execute()
        )

        return [AgentInteraction(**item) for item in response.data]

    # User Project operations
    async def get_user_projects(self, user_id: UUID) -> list[Project]:
        """Get all projects for a user"""
        print(str(user_id))
        response = (
            self.client.table("user_projects")
            .select("*")
            .eq("user_id", str(user_id))
            .order("created_at", desc=True)
            .execute()
        )

        return [Project(**item) for item in response.data]

    async def create_user_project(self, project_data: dict) -> Project:
        """Create a new user project"""
        # Convert UUID to string if needed
        if "user_id" in project_data:
            project_data["user_id"] = str(project_data["user_id"])

        response = self.client.table("user_projects").insert(project_data).execute()

        if response.data:
            return Project(**response.data[0])
        else:
            raise Exception("Failed to create user project")

    async def update_project(
        self, project_id: UUID, update_data: dict
    ) -> Project | None:
        """Update a user project"""
        response = (
            self.client.table("user_projects")
            .update(update_data)
            .eq("id", str(project_id))
            .execute()
        )
        if response.data:
            return Project(**response.data[0])
        return None

    async def get_project_by_id(self, project_id: UUID) -> Project | None:
        """Get a specific user project by ID"""
        response = (
            self.client.table("user_projects")
            .select("*")
            .eq("id", str(project_id))
            .execute()
        )
        if response.data:
            return Project(**response.data[0])
        return None

    async def delete_project(self, project_id: UUID) -> bool:
        """Delete a user project"""
        response = (
            self.client.table("user_projects")
            .delete()
            .eq("id", str(project_id))
            .execute()
        )
        return len(response.data) > 0

    async def get_project_conversations(self, project_id: UUID) -> list[Conversation]:
        """Get all conversations for a specific project"""
        response = (
            self.client.table("conversations")
            .select("*")
            .eq("project_id", str(project_id))
            .order("updated_at", desc=True)
            .execute()
        )
        return [Conversation(**item) for item in response.data]

    # Prompt Template operations
    async def create_prompt_template(
        self, template_data: PromptTemplateCreate
    ) -> PromptTemplate:
        """Create a new prompt template"""
        response = (
            self.client.table("prompt_templates")
            .insert(
                {
                    "title": template_data.title,
                    "content": template_data.content,
                    "tags": template_data.tags,
                    "created_by": str(template_data.created_by),
                    "is_active": template_data.is_active,
                    "template_type": template_data.template_type.value,
                }
            )
            .execute()
        )

        if response.data:
            return PromptTemplate(**response.data[0])
        raise Exception("Failed to create prompt template")

    async def get_prompt_templates(
        self,
        active_only: bool = True,
        template_type: str | None = None,
        user_id: UUID | None = None,
    ) -> list[PromptTemplate]:
        """Get prompt templates with optional filtering by type and user"""
        query = self.client.table("prompt_templates").select("*")

        if active_only:
            query = query.eq("is_active", True)

        if template_type:
            query = query.eq("template_type", template_type)

        if user_id:
            query = query.eq("created_by", str(user_id))

        response = query.order("created_at", desc=True).execute()
        return [PromptTemplate(**item) for item in response.data]

    async def get_prompt_template_by_id(
        self, template_id: UUID
    ) -> PromptTemplate | None:
        """Get a specific prompt template by ID"""
        response = (
            self.client.table("prompt_templates")
            .select("*")
            .eq("id", str(template_id))
            .execute()
        )

        if response.data:
            return PromptTemplate(**response.data[0])
        return None

    async def update_prompt_template(
        self, template_id: UUID, template_data: PromptTemplateUpdate
    ) -> PromptTemplate | None:
        """Update a prompt template"""
        update_dict = {}
        if template_data.title is not None:
            update_dict["title"] = template_data.title
        if template_data.content is not None:
            update_dict["content"] = template_data.content
        if template_data.tags is not None:
            update_dict["tags"] = template_data.tags
        if template_data.is_active is not None:
            update_dict["is_active"] = template_data.is_active
        if template_data.template_type is not None:
            update_dict["template_type"] = template_data.template_type.value

        if not update_dict:
            return await self.get_prompt_template_by_id(template_id)

        response = (
            self.client.table("prompt_templates")
            .update(update_dict)
            .eq("id", str(template_id))
            .execute()
        )

        if response.data:
            return PromptTemplate(**response.data[0])
        return None

    async def delete_prompt_template(self, template_id: UUID) -> bool:
        """Delete a prompt template (admin only)"""
        response = (
            self.client.table("prompt_templates")
            .delete()
            .eq("id", str(template_id))
            .execute()
        )
        return len(response.data) > 0

    async def can_user_modify_template(self, template_id: UUID, user_id: UUID) -> bool:
        """Check if user can modify a template (owns it or is admin modifying admin template)"""
        template = await self.get_prompt_template_by_id(template_id)
        if not template:
            return False

        # Get user info to check admin status
        user = await self.get_user_by_id(user_id)
        if not user:
            return False

        # Users can modify their own user templates
        if template.template_type == "user" and template.created_by == user_id:
            return True

        # Admins can modify admin templates they created or any admin template
        if template.template_type == "admin" and user.is_admin:
            return True

        return False

    async def get_prompt_templates_by_tags(
        self, tags: list[str], active_only: bool = True
    ) -> list[PromptTemplate]:
        """Get prompt templates that contain any of the specified tags"""
        query = self.client.table("prompt_templates").select("*")

        if active_only:
            query = query.eq("is_active", True)

        # Use overlap operator to find templates with any matching tags
        if tags:
            query = query.filter("tags", "ov", tags)

        response = query.order("created_at", desc=True).execute()
        return [PromptTemplate(**item) for item in response.data]

    # File-Conversation relationship operations
    async def add_file_to_conversation(
        self, file_id: UUID, conversation_id: UUID
    ) -> bool:
        """Add a file to a conversation (creates file_conversations relationship)"""
        try:
            response = (
                self.client.table("file_conversations")
                .insert(
                    {"file_id": str(file_id), "conversation_id": str(conversation_id)}
                )
                .execute()
            )
            return len(response.data) > 0
        except Exception:
            # Relationship might already exist due to UNIQUE constraint
            return True

    async def get_file_conversations(self, file_id: UUID) -> list[dict]:
        """Get all conversations where a file has been used"""
        response = (
            self.client.table("file_conversations")
            .select("conversation_id, created_at, conversations(id, title)")
            .eq("file_id", str(file_id))
            .order("created_at", desc=True)
            .execute()
        )

        return [
            {
                "conversation_id": item["conversation_id"],
                "conversation_title": item["conversations"]["title"]
                if item["conversations"]
                else "Untitled",
                "used_at": item["created_at"],
            }
            for item in response.data
        ]

    async def get_user_files_with_conversations(self, user_id: UUID) -> list[dict]:
        """Get all user files with their conversation usage data"""
        # First get all user files
        files_response = (
            self.client.table("user_files")
            .select("*")
            .eq("user_id", str(user_id))
            .order("created_at", desc=True)
            .execute()
        )

        files_with_conversations = []
        for file_data in files_response.data:
            file_obj = UserFile(**file_data)

            # Get conversation data for this file
            conversations_data = await self.get_file_conversations(file_obj.id)

            files_with_conversations.append(
                {
                    **file_obj.model_dump(),
                    "conversations": conversations_data,
                    "usage_count": len(conversations_data),
                }
            )

        return files_with_conversations


# Global database service instance
db_service = DatabaseService()
