#!/usr/bin/env python3
"""
Quick Runtime Test for Agent System
Run this to quickly verify the agent system is working during development
"""


def quick_test():
    print("🧪 QUICK AGENT SYSTEM TEST")
    print("=" * 40)

    try:
        # Test domain instruction loading
        from app.services.project_context_service import (
            create_domain_specific_instructions,
        )

        marketing_len = len(create_domain_specific_instructions("marketing"))
        print(f"✓ Marketing instructions: {marketing_len} chars")

        # Test agent creation
        from app.services.project_context_service import project_context_service

        agent = project_context_service.create_project_aware_agent(
            agent_name="Test Agent", domain="marketing"
        )
        print(f"✓ Agent created: {agent.name}")

        # Test service initialization (mocked)
        import unittest.mock

        with unittest.mock.patch("app.services.ai_service.OpenAI"):
            from app.services.ai_service import IgnacioAgentService

            service = IgnacioAgentService()
            print(f"✓ Service ready: {len(service.ignacio_agent.tools)} tools")

        print("🎉 All systems operational!")

    except Exception as e:
        print(f"❌ Error: {e}")
        return False

    return True


if __name__ == "__main__":
    quick_test()
