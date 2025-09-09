"""
Project management router for Ignacio Bot
Handles user project context for AI conversations
"""

from uuid import UUID
from fastapi import APIRouter, HTTPException, Depends
from typing import List

from app.models.database import (
    UserProject, UserProjectCreate, UserProjectUpdate, 
    ProjectType, ProjectStage
)
from app.services.database import db_service
from app.services.project_context_service import project_context_service

router = APIRouter(prefix="/project", tags=["project"])


@router.get("/context/{user_id}")
async def get_user_project_context(user_id: UUID):
    """Get user's project context for AI conversations"""
    try:
        context = await project_context_service.get_user_context(user_id)
        return {
            "user_id": context.user_id,
            "project_name": context.project_name,
            "project_type": context.project_type.value if context.project_type else None,
            "description": context.description,
            "current_stage": context.current_stage.value if context.current_stage else None,
            "target_audience": context.target_audience,
            "problem_statement": context.problem_statement,
            "solution_approach": context.solution_approach,
            "business_model": context.business_model,
            "key_challenges": context.key_challenges,
            "recent_activities": context.recent_activities,
            "goals": context.goals,
            "context_data": context.context_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get project context: {str(e)}")


@router.put("/context/{user_id}")
async def update_user_project_context(user_id: UUID, project_data: dict):
    """Update user's project context"""
    try:
        # Get current context
        context = await project_context_service.get_user_context(user_id)
        
        # Update fields
        if "project_name" in project_data:
            context.project_name = project_data["project_name"]
        if "project_type" in project_data:
            try:
                context.project_type = ProjectType(project_data["project_type"])
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid project type: {project_data['project_type']}")
        if "description" in project_data:
            context.description = project_data["description"]
        if "current_stage" in project_data:
            try:
                context.current_stage = ProjectStage(project_data["current_stage"])
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid project stage: {project_data['current_stage']}")
        if "target_audience" in project_data:
            context.target_audience = project_data["target_audience"]
        if "problem_statement" in project_data:
            context.problem_statement = project_data["problem_statement"]
        if "solution_approach" in project_data:
            context.solution_approach = project_data["solution_approach"]
        if "business_model" in project_data:
            context.business_model = project_data["business_model"]
        if "key_challenges" in project_data:
            context.key_challenges = project_data["key_challenges"]
        if "goals" in project_data:
            context.goals = project_data["goals"]
        
        # Save to database
        success = await context.save_to_database()
        if not success:
            raise HTTPException(status_code=500, detail="Failed to save project context")
        
        return {"message": "Project context updated successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update project context: {str(e)}")


@router.get("/types")
async def get_project_types():
    """Get available project types"""
    return [{"value": pt.value, "label": pt.value.replace("_", " ").title()} for pt in ProjectType]


@router.get("/stages")
async def get_project_stages():
    """Get available project stages"""
    return [{"value": ps.value, "label": ps.value.replace("_", " ").title()} for ps in ProjectStage]


@router.get("/projects/{user_id}")
async def get_user_projects(user_id: UUID) -> List[UserProject]:
    """Get all projects for a user (database level)"""
    try:
        projects = await db_service.get_user_projects(user_id)
        return projects
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user projects: {str(e)}")


@router.post("/projects")
async def create_user_project(project_data: UserProjectCreate) -> UserProject:
    """Create a new project for a user (database level)"""
    try:
        # Validate project_type and current_stage if provided
        if project_data.project_type:
            try:
                ProjectType(project_data.project_type.value)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid project type: {project_data.project_type}")
        
        if project_data.current_stage:
            try:
                ProjectStage(project_data.current_stage.value)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid project stage: {project_data.current_stage}")
        
        # Convert to dict for database service
        data = {
            "user_id": project_data.user_id,
            "project_name": project_data.project_name,
            "project_type": project_data.project_type.value if project_data.project_type else None,
            "description": project_data.description,
            "current_stage": project_data.current_stage.value if project_data.current_stage else None,
            "target_audience": project_data.target_audience,
            "problem_statement": project_data.problem_statement,
            "solution_approach": project_data.solution_approach,
            "business_model": project_data.business_model,
            "context_data": project_data.context_data or {}
        }
        
        project = await db_service.create_user_project(data)
        return project
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create project: {str(e)}")


@router.get("/template")
async def get_project_template():
    """Get a project template for new users"""
    return {
        "project_name": "",
        "project_type": None,
        "description": "",
        "current_stage": "ideation",
        "target_audience": "",
        "problem_statement": "",
        "solution_approach": "",
        "business_model": "",
        "key_challenges": [],
        "goals": [],
        "guidance": {
            "project_name": "What's the name of your project or venture?",
            "description": "Briefly describe what your project is about",
            "problem_statement": "What problem are you solving?",
            "target_audience": "Who are you building this for?",
            "solution_approach": "How are you planning to solve the problem?",
            "business_model": "How will your project generate value/revenue?",
            "key_challenges": "What are the main challenges you're facing?",
            "goals": "What are your main objectives for this project?"
        }
    }