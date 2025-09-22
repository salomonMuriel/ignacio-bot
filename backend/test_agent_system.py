#!/usr/bin/env python3
"""
Manual Test Script for Agent Instruction System Refactor
Run this to test the new domain-specific agent system manually
"""

import sys
import os
import unittest.mock

# Add the app directory to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), "app"))


def test_domain_instructions():
    """Test domain-specific instruction generation"""
    print("=" * 60)
    print("TESTING DOMAIN-SPECIFIC INSTRUCTIONS")
    print("=" * 60)

    from app.services.project_context_service import (
        create_domain_specific_instructions,
        create_base_personality_instructions,
    )

    # Test base personality
    print("\n1. Testing base personality instructions:")
    base = create_base_personality_instructions()
    print(f"   ✓ Generated {len(base)} characters")

    # Test all domain instructions
    domains = [
        "marketing",
        "technology",
        "finance",
        "sustainability",
        "legal",
        "operations",
        "product",
        "sales",
    ]

    print("\n2. Testing domain-specific instructions:")
    for domain in domains:
        try:
            instructions = create_domain_specific_instructions(domain)
            print(f"   ✓ {domain.title()}: {len(instructions)} characters")
        except Exception as e:
            print(f"   ✗ {domain.title()}: ERROR - {e}")

    # Test invalid domain
    print("\n3. Testing invalid domain:")
    invalid_result = create_domain_specific_instructions("invalid_domain")
    print(f"   ✓ Invalid domain handled: {invalid_result[:100]}...")


def test_agent_creation():
    """Test project-aware agent creation"""
    print("\n" + "=" * 60)
    print("TESTING AGENT CREATION")
    print("=" * 60)

    from app.services.project_context_service import project_context_service

    # Test general agent creation
    print("\n1. Testing general agent creation:")
    try:
        general_agent = project_context_service.create_project_aware_agent(
            agent_name="Test General Agent"
        )
        print(f"   ✓ General agent created: {general_agent.name}")
    except Exception as e:
        print(f"   ✗ General agent failed: {e}")

    # Test domain-specific agent creation
    print("\n2. Testing domain-specific agent creation:")
    domains = [
        "marketing",
        "technology",
        "finance",
        "sustainability",
        "legal",
        "operations",
        "product",
        "sales",
    ]

    agents = {}
    for domain in domains:
        try:
            agent = project_context_service.create_project_aware_agent(
                agent_name=f"{domain.title()} Expert", domain=domain
            )
            agents[domain] = agent
            print(f"   ✓ {domain.title()} agent: {agent.name}")
        except Exception as e:
            print(f"   ✗ {domain.title()} agent failed: {e}")

    print(f"\n   Successfully created {len(agents)}/8 specialized agents")


def test_ai_service_setup():
    """Test AI service initialization (without OpenAI client)"""
    print("\n" + "=" * 60)
    print("TESTING AI SERVICE SETUP")
    print("=" * 60)

    # We need to mock the OpenAI client to avoid API key requirement
    import unittest.mock

    with unittest.mock.patch("app.services.ai_service.OpenAI"):
        try:
            from app.services.ai_service import IgnacioAgentService

            print("\n1. Testing AI service initialization:")
            service = IgnacioAgentService()

            # Check all agents were created
            agents = [
                ("marketing_agent", "Marketing Expert"),
                ("tech_agent", "Technology Expert"),
                ("finance_agent", "Finance Expert"),
                ("sustainability_agent", "Sustainability Expert"),
                ("legal_agent", "Legal & Compliance Expert"),
                ("operations_agent", "Operations Expert"),
                ("product_agent", "Product & Design Expert"),
                ("sales_agent", "Sales Expert"),
                ("ignacio_agent", "Ignacio"),
            ]

            print("\n2. Verifying all agents created:")
            for attr_name, expected_name in agents:
                agent = getattr(service, attr_name)
                if agent.name == expected_name:
                    print(f"   ✓ {attr_name}: {agent.name}")
                else:
                    print(
                        f"   ✗ {attr_name}: Expected '{expected_name}', got '{agent.name}'"
                    )

            # Check main agent tools
            print(
                f"\n3. Main agent tools: {len(service.ignacio_agent.tools)} total tools"
            )

            # Check handoff descriptions
            print("\n4. Verifying handoff descriptions:")
            specialist_agents = [
                (service.marketing_agent, "marketing"),
                (service.tech_agent, "technology"),
                (service.finance_agent, "finance"),
                (service.sustainability_agent, "sustainability"),
                (service.legal_agent, "legal"),
                (service.operations_agent, "operations"),
                (service.product_agent, "product"),
                (service.sales_agent, "sales"),
            ]

            for agent, domain in specialist_agents:
                if hasattr(agent, "handoff_description") and agent.handoff_description:
                    print(f"   ✓ {domain}: {agent.handoff_description[:50]}...")
                else:
                    print(f"   ✗ {domain}: Missing handoff description")

            print(
                f"\n   ✓ AI Service successfully initialized with all 8 specialists + main agent"
            )

        except Exception as e:
            print(f"   ✗ AI Service initialization failed: {e}")
            import traceback

            traceback.print_exc()


def test_instruction_combination():
    """Test how instructions are combined for domain agents"""
    print("\n" + "=" * 60)
    print("TESTING INSTRUCTION COMBINATION")
    print("=" * 60)

    from app.services.project_context_service import (
        create_base_personality_instructions,
        create_domain_specific_instructions,
    )

    print("\n1. Testing instruction component sizes:")
    base = create_base_personality_instructions()
    print(f"   Base personality: {len(base)} characters")

    marketing = create_domain_specific_instructions("marketing")
    print(f"   Marketing domain: {len(marketing)} characters")

    combined_length = len(base) + len(marketing) + 100  # rough estimate with separators
    print(f"   Combined estimate: ~{combined_length} characters")

    print("\n2. Checking for key components in base instructions:")
    base_keywords = [
        "PROJECT DIVERSITY AWARENESS",
        "SCRAPPY STARTUP MINDSET",
        "TECH-OPTIMIZATION",
        "ADAPTIVE MENTORING",
        "Action Lab",
    ]

    for keyword in base_keywords:
        if keyword in base:
            print(f"   ✓ Found: {keyword}")
        else:
            print(f"   ✗ Missing: {keyword}")


def test_handoff_hooks():
    """Test handoff lifecycle hooks integration"""
    print("\n" + "=" * 60)
    print("TESTING HANDOFF LIFECYCLE HOOKS")
    print("=" * 60)

    try:
        # Test importing the hooks class
        from app.services.ai_service import IgnacioRunHooks

        print("\n1. Testing hooks class:")
        hooks = IgnacioRunHooks()
        print("   ✓ IgnacioRunHooks class created successfully")

        # Test hook methods exist
        print("\n2. Testing hook methods:")
        hook_methods = [
            "on_agent_start",
            "on_agent_end",
            "on_handoff",
            "on_tool_start",
            "on_tool_end",
        ]

        for method_name in hook_methods:
            if hasattr(hooks, method_name) and callable(getattr(hooks, method_name)):
                print(f"   ✓ {method_name} method available")
            else:
                print(f"   ✗ {method_name} method missing or not callable")

        # Test service integration
        print("\n3. Testing service integration with hooks:")
        with unittest.mock.patch("app.services.ai_service.OpenAI"):
            from app.services.ai_service import IgnacioAgentService

            service = IgnacioAgentService()
            print("   ✓ AI Service initialized with handoff hooks support")

        print("\n   Handoff hooks successfully integrated!")

    except Exception as e:
        print(f"   ✗ Handoff hooks integration failed: {e}")


def run_all_tests():
    """Run all manual tests"""
    print("IGNACIO BOT - AGENT SYSTEM MANUAL TESTS")
    print("=" * 60)
    print("This script tests the new domain-specific agent instruction system")
    print("with handoff monitoring capabilities")
    print("All tests should show ✓ for success or ✗ for failures")
    print("=" * 60)

    try:
        test_domain_instructions()
        test_agent_creation()
        test_instruction_combination()
        test_ai_service_setup()
        test_handoff_hooks()

        print("\n" + "=" * 60)
        print("MANUAL TESTING COMPLETE")
        print("=" * 60)
        print("✓ If all tests show ✓, the agent system refactor is working correctly")
        print("✗ If any tests show ✗, check the error messages above")
        print("\nRuntime behavior you'll see during conversations:")
        print("- [PROJECT_CONTEXT] logs during agent creation")
        print("- [AI_SERVICE] logs during service operations")
        print("- [AGENT_LIFECYCLE] logs when agents start/end")
        print("- [AGENT_HANDOFF] logs when handoffs occur between specialists")
        print("- [AGENT_TOOL] logs when specialist tools are called")
        print("\nTo test with actual conversations:")
        print("1. Set up OpenAI API key in environment")
        print("2. Start the backend server")
        print("3. Test through the web interface or API calls")
        print("4. Watch console for detailed handoff logs")

    except Exception as e:
        print(f"\n✗ CRITICAL ERROR: {e}")
        import traceback

        traceback.print_exc()


if __name__ == "__main__":
    run_all_tests()
