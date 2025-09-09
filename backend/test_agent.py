"""
Simple test script to verify the new Agent SDK implementation
"""

import asyncio
import os
import sys
from dotenv import load_dotenv

# Load environment variables first before importing app modules
load_dotenv('.env.local')

from app.services.ai_service import IgnacioAgentService
from app.services.database import db_service
from app.models.database import UserCreate
from uuid import uuid4

async def test_basic_functionality():
    """Test basic agent functionality"""
    print("Testing basic Agent SDK functionality...")

    # Create the service
    service = IgnacioAgentService()

    # Create a test user first
    test_phone = f"+1555{str(uuid4())[:8]}"  # Generate unique phone number
    user_create = UserCreate(
        phone_number=test_phone,
        name="Test User",
        is_admin=False
    )
    user = await db_service.create_user(user_create)
    user_id = user.id
    print(f"Created test user: {user_id}")

    # Test simple conversation
    print("\n1. Testing simple conversation...")
    try:
        result = await service.start_conversation(
            user_id=user_id,
            initial_message="Hello, can you help me with my startup idea?"
        )

        print(f"Response type: {type(result)}")
        print(f"Response content: {result}")

        # Handle different response formats
        if hasattr(result, 'conversation_id'):
            conversation_id = result.conversation_id
        elif isinstance(result, dict) and 'conversation_id' in result:
            conversation_id = result['conversation_id']
        else:
            print(f"❌ Unexpected response format: {result}")
            return

        print(f"✅ Simple conversation works!")
        print(f"Conversation ID: {conversation_id}")

    except Exception as e:
        print(f"❌ Simple conversation failed: {e}")
        import traceback
        traceback.print_exc()
        return

    # Test marketing question (should use marketing agent as tool)
    print("\n2. Testing marketing-specific question...")
    try:
        result = await service.continue_conversation(
            conversation_id=conversation_id,
            message="What marketing strategy should I use for my tech startup?"
        )
        print(f"✅ Marketing question works!")
        print(f"Response type: {type(result)}")

    except Exception as e:
        print(f"❌ Marketing question failed: {e}")
        return

    # Test tech question (should use tech agent as tool)
    print("\n3. Testing tech-specific question...")
    try:
        result = await service.continue_conversation(
            conversation_id=conversation_id,
            message="Should I use React or Vue for my web app?"
        )
        print(f"✅ Tech question works!")
        print(f"Response type: {type(result)}")

    except Exception as e:
        print(f"❌ Tech question failed: {e}")
        return

    print("\n🎉 All tests passed! Agent SDK is working correctly.")

    # Clean up - delete the test user
    try:
        await db_service.delete_user(user_id)
        print(f"Cleaned up test user: {user_id}")
    except Exception as e:
        print(f"Failed to clean up test user: {e}")

if __name__ == "__main__":
    # Check if required environment variables are set
    if not os.getenv('OPENAI_API_KEY'):
        print("❌ OPENAI_API_KEY not found in environment variables")
        sys.exit(1)

    asyncio.run(test_basic_functionality())
