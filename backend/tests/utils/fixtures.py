"""
Test data fixtures and factory functions
"""

import uuid
from datetime import datetime, timedelta
from typing import Any

from app.models.database import MessageType


class TestDataFactory:
    """Factory class for creating test data"""

    @staticmethod
    def user_data(**overrides: Any) -> dict[str, Any]:
        """Create user test data"""
        base_data = {
            "phone_number": f"+123456{uuid.uuid4().hex[:4]}",
            "name": "Test User",
            "is_admin": False,
            "is_active": True,
        }
        base_data.update(overrides)
        return base_data

    @staticmethod
    def admin_data(**overrides: Any) -> dict[str, Any]:
        """Create admin user test data"""
        base_data = {
            "phone_number": f"+987654{uuid.uuid4().hex[:4]}",
            "name": "Test Admin",
            "is_admin": True,
            "is_active": True,
        }
        base_data.update(overrides)
        return base_data

    @staticmethod
    def conversation_data(user_id: uuid.UUID, **overrides: Any) -> dict[str, Any]:
        """Create conversation test data"""
        base_data = {
            "user_id": user_id,
            "title": "Test Conversation",
        }
        base_data.update(overrides)
        return base_data

    @staticmethod
    def message_data(
        conversation_id: uuid.UUID,
        user_id: uuid.UUID,
        is_from_user: bool = True,
        **overrides: Any,
    ) -> dict[str, Any]:
        """Create message test data"""
        base_data = {
            "conversation_id": conversation_id,
            "user_id": user_id,
            "content": "Test message content",
            "message_type": MessageType.TEXT,
            "is_from_user": is_from_user,
            "file_path": None,
            "whatsapp_message_id": None,
        }
        base_data.update(overrides)
        return base_data

    @staticmethod
    def otp_data(phone_number: str, **overrides: Any) -> dict[str, Any]:
        """Create OTP test data"""
        base_data = {
            "phone_number": phone_number,
            "code": "123456",
            "expires_at": datetime.utcnow() + timedelta(minutes=10),
            "is_used": False,
        }
        base_data.update(overrides)
        return base_data

    @staticmethod
    def session_data(user_id: uuid.UUID, **overrides: Any) -> dict[str, Any]:
        """Create session test data"""
        base_data = {
            "user_id": user_id,
            "session_token": f"test_token_{uuid.uuid4().hex}",
            "expires_at": datetime.utcnow() + timedelta(hours=1),
        }
        base_data.update(overrides)
        return base_data

    @staticmethod
    def user_file_data(user_id: uuid.UUID, **overrides: Any) -> dict[str, Any]:
        """Create user file test data"""
        base_data = {
            "user_id": user_id,
            "file_name": "test_document.pdf",
            "file_path": f"users/{user_id}/test_document.pdf",
            "file_type": "application/pdf",
            "file_size": 1024,
        }
        base_data.update(overrides)
        return base_data


# Sample conversation flows for testing
SAMPLE_CONVERSATIONS = {
    "marketing_question": [
        {
            "role": "user",
            "content": "I need help with marketing my startup. What should I focus on first?",
        },
        {
            "role": "assistant",
            "content": "Great question! For startup marketing, I'd recommend focusing on these key areas first: 1) Clearly define your target audience, 2) Craft a compelling value proposition, 3) Choose 1-2 marketing channels to test initially. What type of startup are you working on?",
        },
    ],
    "technical_question": [
        {
            "role": "user",
            "content": "What technology stack should I use for my web application?",
        },
        {
            "role": "assistant",
            "content": "The choice of technology stack depends on several factors. Can you tell me more about: 1) What type of application you're building, 2) Your team's technical expertise, 3) Your scalability requirements, 4) Your timeline and budget constraints?",
        },
    ],
    "financial_question": [
        {"role": "user", "content": "How much funding do I need for my startup?"},
        {
            "role": "assistant",
            "content": "Funding needs vary greatly depending on your business model and growth plans. Let's break this down: 1) What are your main cost categories (development, marketing, operations)?, 2) How long do you want the funding to last?, 3) What milestones do you plan to achieve?",
        },
    ],
}

# Error scenarios for testing
ERROR_SCENARIOS = {
    "invalid_uuid": "not-a-uuid",
    "nonexistent_uuid": str(uuid.uuid4()),
    "invalid_phone": "invalid-phone",
    "expired_otp": {"expires_at": datetime.utcnow() - timedelta(minutes=5)},
    "used_otp": {"is_used": True},
}
