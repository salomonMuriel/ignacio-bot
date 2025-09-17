"""
Project Context Service for OpenAI Agent SDK Integration
Handles user project context for personalized AI conversations
"""

from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel
from agents import Agent, function_tool, RunContextWrapper

from app.models.database import ProjectType, ProjectStage
from app.services.database import db_service


class ProjectContext(BaseModel):
    """Project context model for OpenAI Agent SDK"""
    user_id: str
    user_name: str | None = None
    project_name: str | None = None
    project_type: ProjectType | None = None
    description: str | None = None
    current_stage: ProjectStage | None = None
    target_audience: str | None = None
    problem_statement: str | None = None
    solution_approach: str | None = None
    business_model: str | None = None
    key_challenges: List[str] = []
    recent_activities: List[str] = []
    goals: List[str] = []
    vector_store_id: str | None = None
    context_data: Dict[str, Any] = {}

    @classmethod
    async def from_user_id(cls, user_id: UUID) -> "ProjectContext":
        """Load project context from database for a user"""
        # Get user information to include name
        user = await db_service.get_user_by_id(user_id)
        user_name = user.name if user and user.name else None
        
        projects = await db_service.get_user_projects(user_id)
        
        if not projects:
            # Return empty context for users without projects
            return cls(user_id=str(user_id), user_name=user_name)
        
        # Use the first project (users typically have one main project)
        project = projects[0]
        
        # Extract dynamic data from context_data
        context_data = project.context_data or {}
        key_challenges = context_data.get("key_challenges", [])
        recent_activities = context_data.get("recent_activities", [])
        goals = context_data.get("goals", [])
        
        return cls(
            user_id=str(user_id),
            user_name=user_name,
            project_name=project.project_name,
            project_type=project.project_type,
            description=project.description,
            current_stage=project.current_stage,
            target_audience=project.target_audience,
            problem_statement=project.problem_statement,
            solution_approach=project.solution_approach,
            business_model=project.business_model,
            key_challenges=key_challenges,
            recent_activities=recent_activities,
            goals=goals,
            context_data=context_data
        )

    async def save_to_database(self) -> bool:
        """Save updated context back to database"""
        try:
            user_uuid = UUID(self.user_id)
            projects = await db_service.get_user_projects(user_uuid)
            
            # Prepare context_data with dynamic fields
            updated_context_data = self.context_data.copy()
            updated_context_data.update({
                "key_challenges": self.key_challenges,
                "recent_activities": self.recent_activities,
                "goals": self.goals
            })
            
            update_data = {
                "project_name": self.project_name,
                "project_type": self.project_type.value if self.project_type else None,
                "description": self.description,
                "current_stage": self.current_stage.value if self.current_stage else None,
                "target_audience": self.target_audience,
                "problem_statement": self.problem_statement,
                "solution_approach": self.solution_approach,
                "business_model": self.business_model,
                "context_data": updated_context_data
            }
            
            if projects:
                # Update existing project
                await db_service.update_user_project(projects[0].id, update_data)
            else:
                # Create new project
                update_data["user_id"] = user_uuid
                await db_service.create_user_project(update_data)
            
            return True
        except Exception as e:
            print(f"Error saving project context: {e}")
            return False


def create_base_personality_instructions() -> str:
    """Generate base personality instructions for all Ignacio agents"""
    print("[PROJECT_CONTEXT] Creating base personality instructions")
    return """You are Ignacio, a seasoned entrepreneur and mentor for Action Lab participants.

    BE SURE TO USE THE TOOLS AT YOUR DISPOSAL.

PROJECT DIVERSITY AWARENESS:
- ALL projects are entrepreneurial: NGOs, foundations, traditional companies, consultancies, NOT just tech startups
- Support diverse organizational forms with equal expertise and enthusiasm
- Recognize different success metrics: profit, impact, growth, sustainability, community benefit

SCRAPPY STARTUP MINDSET:
- ALL projects benefit from startup agility and go-getter attitude
- Emphasize rapid iteration, quick testing, and competitive advantage through speed
- NOT all projects aim for unicorn scale or VC funding - adapt advice accordingly
- Focus on bootstrapping, resourcefulness, and doing more with less

TECH-OPTIMIZATION FOR ALL:
- ALL project types should leverage technology to automate and improve processes
- Suggest tech tools appropriate to their domain, stage, and comfort level
- Emphasize efficiency gains and competitive advantages through smart tool usage
- Balance innovation with practicality based on resources and expertise

CORE APPROACH - ADAPTIVE MENTORING:
- Balance between Socratic questioning and direct assistance based on the situation
- Use guided questions for strategic thinking and self-discovery
- Provide direct answers for assistant tasks (document analysis, research, explanations)
- Always prioritize what helps the user most in their current context

WHEN TO ASK QUESTIONS VS GIVE ANSWERS:
- Strategic decisions → Ask questions to guide discovery ("What would success look like for you?")
- Assistant tasks → Provide direct help (analyzing documents, research, explanations)
- Technical guidance → Assess user's tech level first, then adapt approach
- Project updates → Always ask permission before updating project context

TECH-SAVVINESS ASSESSMENT:
- Early in conversations, ask: "How comfortable are you with technology and digital tools?"
- Adapt tool recommendations based on their comfort level:
  - Non-technical: No-code tools (Airtable, Fillout.com, Zapier, Bubble, Webflow)
  - Low-technical: Low-code tools (n8n, Retool, Glide, Notion)
  - Technical: More advanced solutions as appropriate

SPEED & RAPID ITERATION FOCUS:
- Emphasize quick prototyping and fast testing over perfect planning
- "Start small, learn fast, iterate quickly" mentality
- Help identify minimum viable approaches for rapid validation
- Encourage experimentation and learning from failure

COMMUNICATION STYLE:
- Friendly, encouraging, and concise (2-3 sentences initially)
- Use analogies from everyday life when explaining concepts
- Check understanding regularly: "Does this make sense?" "What questions do you have?"
- Match complexity to user's technical comfort level

PROJECT CONTEXT UPDATES:
- Monitor conversations for new project information
- When you identify something to update, say: "I noticed [specific info]. Would you like me to update this in your project profile? I'll add/change [specific details]."
- ALWAYS ask permission before using the update_project_context tool
- Be specific about what you'll update

SOCRATIC QUESTIONING (Strategic Contexts):
- "What problem are you really trying to solve?"
- "What would your ideal customer say about this?"
- "What's the simplest way to test this assumption?"
- "What would happen if we tried a different approach?"
- "What resources do you already have that could help?"
- "What would need to be true for this to work?"

Remember: Be their thinking partner for strategy, their assistant for tasks, and their guide for appropriate tools.
"""


def create_project_aware_instructions(
    run_context: RunContextWrapper[ProjectContext],
    agent: Agent[ProjectContext]
) -> str:
    """Generate dynamic instructions based on user project context"""
    context = run_context.context

    base_instructions = create_base_personality_instructions()
    
    if context.project_name:
        project_context = f"""
USER PROJECT CONTEXT:
- User Name: {context.user_name or 'Not provided'}
- Project: {context.project_name}
- Type: {context.project_type.value if context.project_type else 'Not specified'}
- Stage: {context.current_stage.value if context.current_stage else 'Not specified'}
- Description: {context.description or 'Not provided'}

TARGET AUDIENCE: {context.target_audience or 'Not specified'}

PROBLEM STATEMENT: {context.problem_statement or 'Not specified'}

SOLUTION APPROACH: {context.solution_approach or 'Not specified'}

BUSINESS MODEL: {context.business_model or 'Not specified'}

KEY CHALLENGES: {', '.join(context.key_challenges) if context.key_challenges else 'None specified'}

CURRENT GOALS: {', '.join(context.goals) if context.goals else 'None specified'}

RECENT ACTIVITIES: {', '.join(context.recent_activities[-3:]) if context.recent_activities else 'None recorded'}

PERSONALIZATION GUIDELINES:
- Always reference their specific project when relevant
- Tailor advice to their current project stage and type
- Address their stated challenges and goals
- Build upon their existing solution approach
- Consider their target audience in recommendations
"""
    else:
        project_context = f"""
USER PROJECT CONTEXT:
- User Name: {context.user_name or 'Not provided'}
- No project information available yet
- Help them define their project by asking about their idea, goals, and challenges
- Guide them through the Action Lab project development process
"""
    
    return base_instructions + project_context


def create_domain_specific_instructions(domain: str) -> str:
    """Generate domain-specific instructions for specialized agents"""
    print(f"[PROJECT_CONTEXT] Creating domain-specific instructions for: {domain}")

    from app.ai_system_prompts.marketing_expert_prompt import create_marketing_expert_instructions
    from app.ai_system_prompts.technology_domain_expert import create_technology_expert_instructions
    from app.ai_system_prompts.finance_expert_instructions import create_finance_expert_instructions
    from app.ai_system_prompts.sustainability_expert_prompt import create_sustainability_expert_instructions
    from app.ai_system_prompts.legal_compliance_expert_prompt import create_legal_compliance_expert_instructions
    from app.ai_system_prompts.research_operations_domain_prompt import create_operations_expert_instructions
    from app.ai_system_prompts.product_design_expert_prompt import create_product_design_expert_instructions
    from app.ai_system_prompts.sales_expert_prompt import create_sales_expert_instructions

    domain_map = {
        'marketing': create_marketing_expert_instructions,
        'technology': create_technology_expert_instructions,
        'finance': create_finance_expert_instructions,
        'sustainability': create_sustainability_expert_instructions,
        'legal': create_legal_compliance_expert_instructions,
        'operations': create_operations_expert_instructions,
        'product': create_product_design_expert_instructions,
        'sales': create_sales_expert_instructions
    }

    if domain.lower() in domain_map:
        instructions = domain_map[domain.lower()]()
        print(f"[PROJECT_CONTEXT] Generated {len(instructions)} characters of instructions for {domain}")
        return instructions
    else:
        available_domains = ', '.join(domain_map.keys())
        error_msg = f"Domain '{domain}' not found. Available domains: {available_domains}"
        print(f"[PROJECT_CONTEXT] ERROR: {error_msg}")
        return error_msg


# Project context tools for agents
@function_tool
async def update_project_context(
    context: RunContextWrapper[ProjectContext],
    field: str,
    value: str
) -> str:
    """Update user's project context based on conversation"""
    try:
        if field == "project_name":
            context.context.project_name = value
        elif field == "description":
            context.context.description = value
        elif field == "stage":
            try:
                context.context.current_stage = ProjectStage(value.lower())
            except ValueError:
                return f"Invalid project stage: {value}. Valid stages: {', '.join([s.value for s in ProjectStage])}"
        elif field == "target_audience":
            context.context.target_audience = value
        elif field == "problem_statement":
            context.context.problem_statement = value
        elif field == "solution_approach":
            context.context.solution_approach = value
        elif field == "business_model":
            context.context.business_model = value
        elif field == "challenge":
            if value not in context.context.key_challenges:
                context.context.key_challenges.append(value)
        elif field == "goal":
            if value not in context.context.goals:
                context.context.goals.append(value)
        elif field == "activity":
            context.context.recent_activities.append(value)
            # Keep only last 10 activities
            if len(context.context.recent_activities) > 10:
                context.context.recent_activities = context.context.recent_activities[-10:]
        else:
            return f"Unknown field: {field}"
        
        # Save to database
        await context.context.save_to_database()
        
        return f"Updated {field} in your project context"
    
    except Exception as e:
        return f"Error updating project context: {str(e)}"


@function_tool
async def get_project_summary(
    context: RunContextWrapper[ProjectContext]
) -> str:
    """Get a summary of the user's current project"""
    ctx = context.context
    
    if not ctx.project_name:
        return "No project information available. Let's start by defining your project - what's your main idea or goal?"
    
    summary_parts = [
        f"PROJECT: {ctx.project_name}",
        f"TYPE: {ctx.project_type.value if ctx.project_type else 'Not specified'}",
        f"STAGE: {ctx.current_stage.value if ctx.current_stage else 'Not specified'}"
    ]
    
    if ctx.description:
        summary_parts.append(f"DESCRIPTION: {ctx.description}")
    
    if ctx.target_audience:
        summary_parts.append(f"TARGET AUDIENCE: {ctx.target_audience}")
    
    if ctx.key_challenges:
        summary_parts.append(f"CHALLENGES: {', '.join(ctx.key_challenges)}")
    
    if ctx.goals:
        summary_parts.append(f"GOALS: {', '.join(ctx.goals)}")
    
    return "\n".join(summary_parts)


# Service class for managing project context
class ProjectContextService:
    """Service for managing user project context in AI conversations"""
    
    @staticmethod
    async def get_user_context(user_id: UUID) -> ProjectContext:
        """Get user project context for AI conversations"""
        return await ProjectContext.from_user_id(user_id)
    
    @staticmethod
    def get_context_tools() -> List:
        """Get all project context tools for agents"""
        return [
            update_project_context
        ]
    
    @staticmethod
    def create_project_aware_agent(
        agent_name: str,
        domain: str = None,
        additional_tools: List = None
    ) -> Agent[ProjectContext]:
        """Create an agent with project context awareness and optional domain specialization"""
        print(f"[PROJECT_CONTEXT] Creating project-aware agent: {agent_name}" + (f" (domain: {domain})" if domain else " (general)"))

        tools = ProjectContextService.get_context_tools()
        if additional_tools:
            tools.extend(additional_tools)
            print(f"[PROJECT_CONTEXT] Added {len(additional_tools)} additional tools")

        if domain:
            print(f"[PROJECT_CONTEXT] Creating domain-specific agent for {domain}")
            # Create combined instructions function for domain-specific agents
            def combined_instructions(
                run_context: RunContextWrapper[ProjectContext],
                agent: Agent[ProjectContext]
            ) -> str:
                context = run_context.context
                print(f"[PROJECT_CONTEXT] Generating combined instructions for {agent_name} ({domain})")

                # Get base personality and domain-specific instructions
                base_personality = create_base_personality_instructions()
                domain_specific = create_domain_specific_instructions(domain)

                # Add project context (similar to create_project_aware_instructions but without duplicating base personality)
                if context.project_name:
                    project_context = f"""
USER PROJECT CONTEXT:
- User Name: {context.user_name or 'Not provided'}
- Project: {context.project_name}
- Type: {context.project_type.value if context.project_type else 'Not specified'}
- Stage: {context.current_stage.value if context.current_stage else 'Not specified'}
- Description: {context.description or 'Not provided'}

TARGET AUDIENCE: {context.target_audience or 'Not specified'}

PROBLEM STATEMENT: {context.problem_statement or 'Not specified'}

SOLUTION APPROACH: {context.solution_approach or 'Not specified'}

BUSINESS MODEL: {context.business_model or 'Not specified'}

KEY CHALLENGES: {', '.join(context.key_challenges) if context.key_challenges else 'None specified'}

CURRENT GOALS: {', '.join(context.goals) if context.goals else 'None specified'}

RECENT ACTIVITIES: {', '.join(context.recent_activities[-3:]) if context.recent_activities else 'None recorded'}

PERSONALIZATION GUIDELINES:
- Always reference their specific project when relevant
- Tailor advice to their current project stage and type
- Address their stated challenges and goals
- Build upon their existing solution approach
- Consider their target audience in recommendations
"""
                else:
                    project_context = f"""
USER PROJECT CONTEXT:
- User Name: {context.user_name or 'Not provided'}
- No project information available yet
- Help them define their project by asking about their idea, goals, and challenges
- Guide them through the Action Lab project development process
"""

                combined = base_personality + "\n\n" + domain_specific + "\n\n" + project_context
                print(f"[PROJECT_CONTEXT] Combined instructions: {len(combined)} total characters")
                return combined

            agent = Agent[ProjectContext](
                name=agent_name,
                instructions=combined_instructions,
                tools=tools
            )
            print(f"[PROJECT_CONTEXT] Successfully created domain-specific agent: {agent_name}")
            return agent
        else:
            print(f"[PROJECT_CONTEXT] Creating general project-aware agent")
            # Use existing project-aware instructions for general agents
            agent = Agent[ProjectContext](
                name=agent_name,
                instructions=create_project_aware_instructions,
                tools=tools
            )
            print(f"[PROJECT_CONTEXT] Successfully created general agent: {agent_name}")
            return agent


# Global service instance
project_context_service = ProjectContextService()