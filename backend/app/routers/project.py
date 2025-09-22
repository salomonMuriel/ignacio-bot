"""
Project management router for Ignacio Bot
Handles user project context for AI conversations with authentication
"""

from uuid import UUID
from fastapi import APIRouter, HTTPException, Depends
from typing import List

from app.core.auth import get_current_user
from app.models.database import (
    Project,
    ProjectCreate,
    ProjectUpdate,
    ProjectType,
    ProjectStage,
    User,
)
from app.services.database import db_service
from app.services.project_context_service import project_context_service

router = APIRouter(prefix="/project", tags=["project"])


@router.get("/types")
async def get_project_types():
    """Get available project types"""
    return [
        {"value": pt.value, "label": pt.value.replace("_", " ").title()}
        for pt in ProjectType
    ]


@router.get("/stages")
async def get_project_stages():
    """Get available project stages"""
    return [
        {"value": ps.value, "label": ps.value.replace("_", " ").title()}
        for ps in ProjectStage
    ]


@router.get("/by_user/{user_id}")
async def get_user_projects_by_id(
    user_id: UUID, current_user: User = Depends(get_current_user)
) -> List[Project]:
    """Get all projects for a specific user (admin only or own projects)"""
    # Allow users to access their own projects, or admins to access any projects
    if user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Access denied")

    try:
        projects = await db_service.get_user_projects(user_id)
        return projects
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to get user projects: {str(e)}"
        )


@router.get("/")
async def get_my_projects(
    current_user: User = Depends(get_current_user),
) -> List[Project]:
    """Get all projects for the authenticated user"""
    try:
        projects = await db_service.get_user_projects(current_user.id)
        return projects
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to get user projects: {str(e)}"
        )


@router.post("/")
async def create_project(
    project_data: ProjectCreate, current_user: User = Depends(get_current_user)
) -> Project:
    """Create a new project for a user (database level)"""
    try:
        # Validate project_type and current_stage if provided
        if project_data.project_type:
            try:
                ProjectType(project_data.project_type.value)
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid project type: {project_data.project_type}",
                )

        if project_data.current_stage:
            try:
                ProjectStage(project_data.current_stage.value)
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid project stage: {project_data.current_stage}",
                )

        # Convert to dict for database service
        data = {
            "user_id": current_user.id,
            "project_name": project_data.project_name,
            "project_type": project_data.project_type.value
            if project_data.project_type
            else None,
            "description": project_data.description,
            "current_stage": project_data.current_stage.value
            if project_data.current_stage
            else None,
            "target_audience": project_data.target_audience,
            "problem_statement": project_data.problem_statement,
            "solution_approach": project_data.solution_approach,
            "business_model": project_data.business_model,
            "context_data": project_data.context_data or {},
        }

        project = await db_service.create_user_project(data)
        return project

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to create project: {str(e)}"
        )


@router.get("/{project_id}")
async def get_project_by_id(project_id: UUID) -> Project:
    """Get a specific project by ID"""
    try:
        project = await db_service.get_project_by_id(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        return project
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get project: {str(e)}")


@router.put("/{project_id}")
async def update_project(project_id: UUID, project_data: ProjectUpdate) -> Project:
    """Update a specific project"""
    try:
        # Check if project exists
        existing_project = await db_service.get_project_by_id(project_id)
        if not existing_project:
            raise HTTPException(status_code=404, detail="Project not found")

        # Prepare update data
        update_data = {}
        if project_data.project_name is not None:
            update_data["project_name"] = project_data.project_name
        if project_data.project_type is not None:
            update_data["project_type"] = project_data.project_type.value
        if project_data.description is not None:
            update_data["description"] = project_data.description
        if project_data.current_stage is not None:
            update_data["current_stage"] = project_data.current_stage.value
        if project_data.target_audience is not None:
            update_data["target_audience"] = project_data.target_audience
        if project_data.problem_statement is not None:
            update_data["problem_statement"] = project_data.problem_statement
        if project_data.solution_approach is not None:
            update_data["solution_approach"] = project_data.solution_approach
        if project_data.business_model is not None:
            update_data["business_model"] = project_data.business_model
        if project_data.context_data is not None:
            update_data["context_data"] = project_data.context_data

        # Update project
        updated_project = await db_service.update_project(project_id, update_data)
        if not updated_project:
            raise HTTPException(status_code=500, detail="Failed to update project")

        return updated_project
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to update project: {str(e)}"
        )


@router.delete("/{project_id}")
async def delete_user_project(project_id: UUID):
    """Delete a specific project"""
    try:
        # Check if project exists
        existing_project = await db_service.get_project_by_id(project_id)
        if not existing_project:
            raise HTTPException(status_code=404, detail="Project not found")

        # Delete project
        success = await db_service.delete_project(project_id)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete project")

        return {"message": "Project deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to delete project: {str(e)}"
        )


@router.get("/conversations/{project_id}")
async def get_project_conversations(project_id: UUID):
    """Get all conversations for a specific project"""
    try:
        # Check if project exists
        existing_project = await db_service.get_project_by_id(project_id)
        if not existing_project:
            raise HTTPException(status_code=404, detail="Project not found")

        # Get conversations for the project
        conversations = await db_service.get_project_conversations(project_id)

        # Return conversation data without message count to avoid N+1 queries
        result = []
        for conv in conversations:
            result.append(
                {
                    "id": conv.id,
                    "title": conv.title,
                    "created_at": conv.created_at.isoformat(),
                    "updated_at": conv.updated_at.isoformat(),
                    "language_preference": conv.language_preference,
                    "project_context": conv.project_context,
                }
            )

        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to get project conversations: {str(e)}"
        )


@router.get("/{project_id}/context")
async def get_project_context(project_id: UUID):
    """Get project context for AI conversations"""
    try:
        project = await db_service.get_project_by_id(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        return {
            "project_id": project.id,
            "project_name": project.project_name,
            "project_type": project.project_type.value
            if project.project_type
            else None,
            "description": project.description,
            "current_stage": project.current_stage.value
            if project.current_stage
            else None,
            "target_audience": project.target_audience,
            "problem_statement": project.problem_statement,
            "solution_approach": project.solution_approach,
            "business_model": project.business_model,
            "context_data": project.context_data,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to get project context: {str(e)}"
        )


@router.put("/{project_id}/context")
async def update_project_context(project_id: UUID, context_data: dict):
    """Update project context"""
    try:
        # Check if project exists
        existing_project = await db_service.get_project_by_id(project_id)
        if not existing_project:
            raise HTTPException(status_code=404, detail="Project not found")

        # Update project context
        update_data = {"context_data": context_data}
        updated_project = await db_service.update_project(project_id, update_data)

        if not updated_project:
            raise HTTPException(
                status_code=500, detail="Failed to update project context"
            )

        return {"message": "Project context updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to update project context: {str(e)}"
        )
