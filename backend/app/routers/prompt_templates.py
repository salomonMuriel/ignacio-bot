"""
Prompt Templates router for Ignacio Bot
Handles CRUD operations for admin-created prompt templates
"""

from uuid import UUID
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional

from app.models.database import (
    PromptTemplate,
    PromptTemplateCreate,
    PromptTemplateUpdate,
    TemplateType,
)
from app.services.database import db_service

router = APIRouter(prefix="/api/prompt-templates", tags=["prompt-templates"])


@router.get("/")
async def get_prompt_templates(
    active_only: bool = Query(True, description="Filter to active templates only"),
    tags: List[str] = Query(None, description="Filter by tags"),
    template_type: Optional[TemplateType] = Query(
        None, description="Filter by template type (admin/user)"
    ),
    user_id: Optional[UUID] = Query(
        None, description="Filter by user (for user templates)"
    ),
) -> List[PromptTemplate]:
    """Get prompt templates with optional filtering"""
    try:
        if tags:
            templates = await db_service.get_prompt_templates_by_tags(tags, active_only)
            # Additional filtering by type and user if specified
            if template_type:
                templates = [
                    t for t in templates if t.template_type == template_type.value
                ]
            if user_id:
                templates = [t for t in templates if t.created_by == user_id]
        else:
            templates = await db_service.get_prompt_templates(
                active_only=active_only,
                template_type=template_type.value if template_type else None,
                user_id=user_id,
            )
        return templates
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to get prompt templates: {str(e)}"
        )


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
        raise HTTPException(
            status_code=500, detail=f"Failed to get prompt template: {str(e)}"
        )


@router.post("/")
async def create_prompt_template(template_data: PromptTemplateCreate) -> PromptTemplate:
    """Create a new prompt template"""
    try:
        # Get user to determine template type
        user = await db_service.get_user_by_id(template_data.created_by)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Set template type based on user's admin status
        if user.is_admin:
            template_data.template_type = TemplateType.ADMIN
        else:
            template_data.template_type = TemplateType.USER

        template = await db_service.create_prompt_template(template_data)
        return template
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to create prompt template: {str(e)}"
        )


@router.put("/{template_id}")
async def update_prompt_template(
    template_id: UUID,
    template_data: PromptTemplateUpdate,
    user_id: UUID = Query(..., description="ID of user making the update"),
) -> PromptTemplate:
    """Update a prompt template (with ownership validation)"""
    try:
        # Check if template exists
        existing_template = await db_service.get_prompt_template_by_id(template_id)
        if not existing_template:
            raise HTTPException(status_code=404, detail="Prompt template not found")

        # Verify user can modify this template
        can_modify = await db_service.can_user_modify_template(template_id, user_id)
        if not can_modify:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to modify this template",
            )

        template = await db_service.update_prompt_template(template_id, template_data)
        if not template:
            raise HTTPException(
                status_code=500, detail="Failed to update prompt template"
            )

        return template
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to update prompt template: {str(e)}"
        )


@router.delete("/{template_id}")
async def delete_prompt_template(
    template_id: UUID,
    user_id: UUID = Query(..., description="ID of user making the deletion"),
) -> dict:
    """Delete a prompt template (with ownership validation)"""
    try:
        # Check if template exists
        existing_template = await db_service.get_prompt_template_by_id(template_id)
        if not existing_template:
            raise HTTPException(status_code=404, detail="Prompt template not found")

        # Verify user can modify this template
        can_modify = await db_service.can_user_modify_template(template_id, user_id)
        if not can_modify:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to delete this template",
            )

        success = await db_service.delete_prompt_template(template_id)
        if not success:
            raise HTTPException(
                status_code=500, detail="Failed to delete prompt template"
            )

        return {"message": "Prompt template deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to delete prompt template: {str(e)}"
        )


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
        raise HTTPException(
            status_code=500, detail=f"Failed to get template tags: {str(e)}"
        )
