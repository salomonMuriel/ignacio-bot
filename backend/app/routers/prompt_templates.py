"""
Prompt Templates router for Ignacio Bot
Handles CRUD operations for admin-created prompt templates
"""

from uuid import UUID
from fastapi import APIRouter, HTTPException, Query
from typing import List

from app.models.database import (
    PromptTemplate, 
    PromptTemplateCreate, 
    PromptTemplateUpdate
)
from app.services.database import db_service

router = APIRouter(prefix="/api/prompt-templates", tags=["prompt-templates"])


async def verify_admin(user_id: UUID) -> bool:
    """Helper function to verify if user is admin"""
    user = await db_service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return True


@router.get("/")
async def get_prompt_templates(
    active_only: bool = Query(True, description="Filter to active templates only"),
    tags: List[str] = Query(None, description="Filter by tags")
) -> List[PromptTemplate]:
    """Get all prompt templates (public endpoint)"""
    try:
        if tags:
            templates = await db_service.get_prompt_templates_by_tags(tags, active_only)
        else:
            templates = await db_service.get_prompt_templates(active_only)
        return templates
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get prompt templates: {str(e)}")


@router.get("/{template_id}")
async def get_prompt_template(template_id: UUID) -> PromptTemplate:
    """Get a specific prompt template by ID"""
    try:
        template = await db_service.get_prompt_template_by_id(template_id)
        if not template:
            raise HTTPException(status_code=404, detail="Prompt template not found")
        return template
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get prompt template: {str(e)}")


@router.post("/")
async def create_prompt_template(
    template_data: PromptTemplateCreate
) -> PromptTemplate:
    """Create a new prompt template (admin only)"""
    try:
        # Verify admin access
        await verify_admin(template_data.created_by)
        
        template = await db_service.create_prompt_template(template_data)
        return template
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create prompt template: {str(e)}")


@router.put("/{template_id}")
async def update_prompt_template(
    template_id: UUID,
    template_data: PromptTemplateUpdate,
    admin_user_id: UUID = Query(..., description="ID of admin user making the update")
) -> PromptTemplate:
    """Update a prompt template (admin only)"""
    try:
        # Verify admin access
        await verify_admin(admin_user_id)
        
        # Check if template exists
        existing_template = await db_service.get_prompt_template_by_id(template_id)
        if not existing_template:
            raise HTTPException(status_code=404, detail="Prompt template not found")
        
        template = await db_service.update_prompt_template(template_id, template_data)
        if not template:
            raise HTTPException(status_code=500, detail="Failed to update prompt template")
        
        return template
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update prompt template: {str(e)}")


@router.delete("/{template_id}")
async def delete_prompt_template(
    template_id: UUID,
    admin_user_id: UUID = Query(..., description="ID of admin user making the deletion")
) -> dict:
    """Delete a prompt template (admin only)"""
    try:
        # Verify admin access
        await verify_admin(admin_user_id)
        
        # Check if template exists
        existing_template = await db_service.get_prompt_template_by_id(template_id)
        if not existing_template:
            raise HTTPException(status_code=404, detail="Prompt template not found")
        
        success = await db_service.delete_prompt_template(template_id)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete prompt template")
        
        return {"message": "Prompt template deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete prompt template: {str(e)}")


@router.get("/tags/all")
async def get_all_tags() -> List[str]:
    """Get all unique tags used in prompt templates"""
    try:
        templates = await db_service.get_prompt_templates(active_only=True)
        all_tags = set()
        for template in templates:
            all_tags.update(template.tags)
        return sorted(list(all_tags))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get template tags: {str(e)}")