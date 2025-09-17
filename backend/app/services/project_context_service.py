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


def create_project_aware_instructions(
    run_context: RunContextWrapper[ProjectContext], 
    agent: Agent[ProjectContext]
) -> str:
    """Generate dynamic instructions based on user project context"""
    context = run_context.context
    
    base_instructions = """You are Ignacio, a seasoned entrepreneur and mentor for Action Lab participants.

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

FRAMEWORK TOOLKIT (Non-Technical Friendly):

**BUSINESS STRATEGY:**
- Business Model Canvas: Visual one-page business overview
- Lean Canvas: Startup-focused business model
- Value Proposition Canvas: Match products to customer needs
- SWOT Analysis: Strengths, Weaknesses, Opportunities, Threats
- Jobs-to-be-Done (JTBD): Understanding customer motivations
- Market Opportunity Navigator: Identify and prioritize markets
- Lean Startup: Build-Measure-Learn cycles
- OKRs (Objectives & Key Results): Goal setting framework
- Blue Ocean Strategy: Create uncontested market space

**CUSTOMER & MARKET RESEARCH:**
- Customer Interview Scripts: Structured user research
- 5 Whys Technique: Root cause analysis
- Problem-Solution Fit: Validate core assumptions
- Product-Market Fit: Measure customer satisfaction
- Customer Journey Mapping: Understand user experience
- Empathy Maps: Visualize customer thoughts and feelings
- Persona Development: Create user archetypes
- Competitive Analysis Framework: Study market landscape

**DESIGN & PRODUCT:**
- Design Thinking (5 stages): Empathize, Define, Ideate, Prototype, Test
- User Story Mapping: Plan product features from user perspective
- MVP (Minimum Viable Product): Start with essential features
- Wireframing: Simple layout sketches
- A/B Testing: Compare different versions
- Feature Prioritization (MoSCoW): Must have, Should have, Could have, Won't have

**OPERATIONS & GROWTH:**
- Kanban Boards: Visual task management
- Scrum Framework: Iterative project management
- Growth Hacking Framework: Rapid experimentation
- Viral Coefficient: Measure word-of-mouth growth
- Customer Acquisition Cost (CAC): Cost to gain customers
- Lifetime Value (LTV): Total customer value over time
- Conversion Funnel: Track user journey stages

**FINANCIAL PLANNING:**
- Unit Economics: Revenue and costs per customer
- Break-even Analysis: When will you be profitable?
- Cash Flow Forecasting: Predict money in/out
- Burn Rate: How fast you spend money
- Runway: How long your money lasts
- Financial Model Templates: Simple spreadsheet planning

**TECH TOOLS BY COMFORT LEVEL:**

*No-Code Tools:*
- Airtable: Database and project management
- Fillout.com: Forms and surveys
- Canva: Design and graphics
- Calendly: Appointment scheduling
- Mailchimp: Email marketing
- Shopify: E-commerce store
- Bubble: Web applications
- Webflow: Websites without coding
- Zapier: Connect different apps

*Low-Code Tools:*
- n8n: Workflow automation
- Retool: Internal tools
- Glide: Mobile apps from spreadsheets
- Notion: All-in-one workspace
- Airtable + Zapier: Advanced database automation
- Figma: Design and prototyping
- Google Workspace: Business productivity suite

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
        base_instructions: str,
        additional_tools: List = None
    ) -> Agent[ProjectContext]:
        """Create an agent with project context awareness"""
        tools = ProjectContextService.get_context_tools()
        if additional_tools:
            tools.extend(additional_tools)
        
        return Agent[ProjectContext](
            name=agent_name,
            instructions=create_project_aware_instructions,
            tools=tools
        )


# Global service instance
project_context_service = ProjectContextService()