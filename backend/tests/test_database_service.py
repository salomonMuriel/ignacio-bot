"""
Tests for database service layer
"""

from datetime import datetime, timedelta
from uuid import uuid4

import pytest

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
from app.services.database import db_service
from tests.utils.fixtures import TestDataFactory


class TestUserOperations:
    """Test user CRUD operations"""

    @pytest.mark.asyncio
    async def test_create_user_success(self):
        """Test successful user creation"""
        user_data = UserCreate(**TestDataFactory.user_data())

        user = await db_service.create_user(user_data)

        assert isinstance(user, User)
        assert user.phone_number == user_data.phone_number
        assert user.name == user_data.name
        assert user.is_admin == user_data.is_admin
        assert user.is_active == user_data.is_active
        assert user.id is not None

        # Cleanup
        await db_service.delete_user(user.id)

    @pytest.mark.asyncio
    async def test_create_user_duplicate_phone(self, test_user: User):
        """Test creating user with duplicate phone number fails"""
        duplicate_data = UserCreate(
            phone_number=test_user.phone_number, name="Duplicate User"
        )

        with pytest.raises(Exception):  # Should raise constraint violation
            await db_service.create_user(duplicate_data)

    @pytest.mark.asyncio
    async def test_get_user_by_id_success(self, test_user: User):
        """Test getting user by ID"""
        retrieved_user = await db_service.get_user_by_id(test_user.id)

        assert retrieved_user is not None
        assert retrieved_user.id == test_user.id
        assert retrieved_user.phone_number == test_user.phone_number

    @pytest.mark.asyncio
    async def test_get_user_by_id_not_found(self):
        """Test getting non-existent user returns None"""
        non_existent_id = uuid4()
        user = await db_service.get_user_by_id(non_existent_id)

        assert user is None

    @pytest.mark.asyncio
    async def test_get_user_by_phone_success(self, test_user: User):
        """Test getting user by phone number"""
        retrieved_user = await db_service.get_user_by_phone(test_user.phone_number)

        assert retrieved_user is not None
        assert retrieved_user.id == test_user.id
        assert retrieved_user.phone_number == test_user.phone_number

    @pytest.mark.asyncio
    async def test_get_user_by_phone_not_found(self):
        """Test getting user by non-existent phone returns None"""
        user = await db_service.get_user_by_phone("+999999999")

        assert user is None

    @pytest.mark.asyncio
    async def test_update_user_success(self, test_user: User):
        """Test updating user"""
        update_data = UserUpdate(name="Updated Name", is_admin=True)

        updated_user = await db_service.update_user(test_user.id, update_data)

        assert updated_user is not None
        assert updated_user.name == "Updated Name"
        assert updated_user.is_admin is True
        assert updated_user.phone_number == test_user.phone_number  # Unchanged

    @pytest.mark.asyncio
    async def test_delete_user_success(self):
        """Test deleting user"""
        # Create a user to delete
        user_data = UserCreate(**TestDataFactory.user_data())
        user = await db_service.create_user(user_data)

        # Delete the user
        result = await db_service.delete_user(user.id)

        assert result is True

        # Verify user is deleted
        deleted_user = await db_service.get_user_by_id(user.id)
        assert deleted_user is None


class TestConversationOperations:
    """Test conversation CRUD operations"""

    @pytest.mark.asyncio
    async def test_create_conversation_success(self, test_user: User):
        """Test successful conversation creation"""
        conv_data = ConversationCreate(
            **TestDataFactory.conversation_data(test_user.id)
        )

        conversation = await db_service.create_conversation(conv_data)

        assert isinstance(conversation, Conversation)
        assert conversation.user_id == test_user.id
        assert conversation.title == conv_data.title
        assert conversation.id is not None

    @pytest.mark.asyncio
    async def test_get_user_conversations(self, test_user: User):
        """Test getting user conversations"""
        # Create multiple conversations
        conv_data_1 = ConversationCreate(
            **TestDataFactory.conversation_data(test_user.id, title="Conv 1")
        )
        conv_data_2 = ConversationCreate(
            **TestDataFactory.conversation_data(test_user.id, title="Conv 2")
        )

        conv1 = await db_service.create_conversation(conv_data_1)
        conv2 = await db_service.create_conversation(conv_data_2)

        # Get conversations
        conversations = await db_service.get_user_conversations(test_user.id)

        assert len(conversations) >= 2
        conv_ids = [conv.id for conv in conversations]
        assert conv1.id in conv_ids
        assert conv2.id in conv_ids

    @pytest.mark.asyncio
    async def test_get_conversation_by_id_success(
        self, test_conversation: Conversation
    ):
        """Test getting conversation by ID"""
        retrieved_conv = await db_service.get_conversation_by_id(test_conversation.id)

        assert retrieved_conv is not None
        assert retrieved_conv.id == test_conversation.id
        assert retrieved_conv.title == test_conversation.title

    @pytest.mark.asyncio
    async def test_update_conversation_success(self, test_conversation: Conversation):
        """Test updating conversation"""
        update_data = ConversationUpdate(title="Updated Title")

        updated_conv = await db_service.update_conversation(
            test_conversation.id, update_data
        )

        assert updated_conv is not None
        assert updated_conv.title == "Updated Title"
        assert updated_conv.id == test_conversation.id


class TestMessageOperations:
    """Test message operations"""

    @pytest.mark.asyncio
    async def test_create_message_success(
        self, test_user: User, test_conversation: Conversation
    ):
        """Test successful message creation"""
        msg_data = MessageCreate(
            **TestDataFactory.message_data(test_conversation.id, test_user.id)
        )

        message = await db_service.create_message(msg_data)

        assert isinstance(message, Message)
        assert message.conversation_id == test_conversation.id
        assert message.user_id == test_user.id
        assert message.content == msg_data.content
        assert message.is_from_user == msg_data.is_from_user

    @pytest.mark.asyncio
    async def test_get_conversation_messages(
        self, test_user: User, test_conversation: Conversation
    ):
        """Test getting messages for a conversation"""
        # Create multiple messages
        msg_data_1 = MessageCreate(
            **TestDataFactory.message_data(
                test_conversation.id, test_user.id, content="First message"
            )
        )
        msg_data_2 = MessageCreate(
            **TestDataFactory.message_data(
                test_conversation.id, test_user.id, content="Second message"
            )
        )

        msg1 = await db_service.create_message(msg_data_1)
        msg2 = await db_service.create_message(msg_data_2)

        # Get messages
        messages = await db_service.get_conversation_messages(test_conversation.id)

        assert len(messages) >= 2
        message_ids = [msg.id for msg in messages]
        assert msg1.id in message_ids
        assert msg2.id in message_ids

    @pytest.mark.asyncio
    async def test_get_conversation_messages_with_pagination(
        self, test_user: User, test_conversation: Conversation
    ):
        """Test getting messages with pagination"""
        # Create multiple messages
        for i in range(5):
            msg_data = MessageCreate(
                **TestDataFactory.message_data(
                    test_conversation.id, test_user.id, content=f"Message {i}"
                )
            )
            await db_service.create_message(msg_data)

        # Get first 3 messages
        messages = await db_service.get_conversation_messages(
            test_conversation.id, limit=3, offset=0
        )

        assert len(messages) <= 3


class TestOTPOperations:
    """Test OTP operations"""

    @pytest.mark.asyncio
    async def test_create_otp_success(self):
        """Test OTP creation"""
        phone_number = "+1234567890"
        otp_data = OTPCodeCreate(**TestDataFactory.otp_data(phone_number))

        otp = await db_service.create_otp(otp_data)

        assert isinstance(otp, OTPCode)
        assert otp.phone_number == phone_number
        assert otp.code == otp_data.code
        assert otp.is_used is False

    @pytest.mark.asyncio
    async def test_verify_otp_success(self):
        """Test successful OTP verification"""
        phone_number = "+1234567890"
        code = "123456"
        otp_data = OTPCodeCreate(**TestDataFactory.otp_data(phone_number, code=code))

        # Create OTP
        await db_service.create_otp(otp_data)

        # Verify OTP
        verified_otp = await db_service.verify_otp(phone_number, code)

        assert verified_otp is not None
        assert verified_otp.phone_number == phone_number
        assert verified_otp.code == code

    @pytest.mark.asyncio
    async def test_verify_otp_invalid_code(self):
        """Test OTP verification with invalid code"""
        phone_number = "+1234567890"
        otp_data = OTPCodeCreate(
            **TestDataFactory.otp_data(phone_number, code="123456")
        )

        # Create OTP
        await db_service.create_otp(otp_data)

        # Try to verify with wrong code
        verified_otp = await db_service.verify_otp(phone_number, "wrong_code")

        assert verified_otp is None

    @pytest.mark.asyncio
    async def test_verify_otp_expired(self):
        """Test OTP verification with expired code"""
        phone_number = "+1234567890"
        code = "123456"
        otp_data = OTPCodeCreate(
            **TestDataFactory.otp_data(
                phone_number,
                code=code,
                expires_at=datetime.utcnow() - timedelta(minutes=5),  # Expired
            )
        )

        # Create expired OTP
        await db_service.create_otp(otp_data)

        # Try to verify expired OTP
        verified_otp = await db_service.verify_otp(phone_number, code)

        assert verified_otp is None


class TestSessionOperations:
    """Test session operations"""

    @pytest.mark.asyncio
    async def test_create_session_success(self, test_user: User):
        """Test session creation"""
        session_data = UserSessionCreate(**TestDataFactory.session_data(test_user.id))

        session = await db_service.create_session(session_data)

        assert isinstance(session, UserSession)
        assert session.user_id == test_user.id
        assert session.session_token == session_data.session_token

    @pytest.mark.asyncio
    async def test_get_session_by_token_success(self, test_user: User):
        """Test getting session by token"""
        session_data = UserSessionCreate(**TestDataFactory.session_data(test_user.id))
        created_session = await db_service.create_session(session_data)

        # Get session by token
        retrieved_session = await db_service.get_session_by_token(
            created_session.session_token
        )

        assert retrieved_session is not None
        assert retrieved_session.id == created_session.id
        assert retrieved_session.user_id == test_user.id

    @pytest.mark.asyncio
    async def test_get_session_by_token_expired(self, test_user: User):
        """Test getting expired session returns None"""
        session_data = UserSessionCreate(
            **TestDataFactory.session_data(
                test_user.id,
                expires_at=datetime.utcnow() - timedelta(hours=1),  # Expired
            )
        )
        created_session = await db_service.create_session(session_data)

        # Try to get expired session
        retrieved_session = await db_service.get_session_by_token(
            created_session.session_token
        )

        assert retrieved_session is None

    @pytest.mark.asyncio
    async def test_delete_session_success(self, test_user: User):
        """Test session deletion"""
        session_data = UserSessionCreate(**TestDataFactory.session_data(test_user.id))
        created_session = await db_service.create_session(session_data)

        # Delete session
        result = await db_service.delete_session(created_session.session_token)

        assert result is True

        # Verify session is deleted
        deleted_session = await db_service.get_session_by_token(
            created_session.session_token
        )
        assert deleted_session is None


class TestFileOperations:
    """Test file operations"""

    @pytest.mark.asyncio
    async def test_create_user_file_success(self, test_user: User):
        """Test user file creation"""
        file_data = UserFileCreate(**TestDataFactory.user_file_data(test_user.id))

        user_file = await db_service.create_user_file(file_data)

        assert isinstance(user_file, UserFile)
        assert user_file.user_id == test_user.id
        assert user_file.file_name == file_data.file_name
        assert user_file.file_path == file_data.file_path

    @pytest.mark.asyncio
    async def test_get_user_files(self, test_user: User):
        """Test getting user files"""
        # Create multiple files
        file_data_1 = UserFileCreate(
            **TestDataFactory.user_file_data(test_user.id, file_name="file1.pdf")
        )
        file_data_2 = UserFileCreate(
            **TestDataFactory.user_file_data(test_user.id, file_name="file2.docx")
        )

        file1 = await db_service.create_user_file(file_data_1)
        file2 = await db_service.create_user_file(file_data_2)

        # Get user files
        user_files = await db_service.get_user_files(test_user.id)

        assert len(user_files) >= 2
        file_ids = [f.id for f in user_files]
        assert file1.id in file_ids
        assert file2.id in file_ids

    @pytest.mark.asyncio
    async def test_get_file_by_id_success(self, test_user: User):
        """Test getting file by ID"""
        file_data = UserFileCreate(**TestDataFactory.user_file_data(test_user.id))
        created_file = await db_service.create_user_file(file_data)

        # Get file by ID
        retrieved_file = await db_service.get_file_by_id(created_file.id)

        assert retrieved_file is not None
        assert retrieved_file.id == created_file.id
        assert retrieved_file.file_name == created_file.file_name

    @pytest.mark.asyncio
    async def test_get_file_by_id_not_found(self):
        """Test getting non-existent file returns None"""
        non_existent_id = uuid4()
        file = await db_service.get_file_by_id(non_existent_id)

        assert file is None
