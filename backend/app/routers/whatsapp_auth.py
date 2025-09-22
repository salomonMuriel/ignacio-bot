"""
WhatsApp authentication endpoints for phone number-based user lookup
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.core.auth import get_user_from_phone, format_phone_number
from app.services.database import db_service

router = APIRouter(prefix="/auth/whatsapp", tags=["whatsapp-auth"])


class PhoneLookupRequest(BaseModel):
    """Request model for phone number lookup"""

    phone_number: str = Field(
        ..., description="Phone number to look up (with or without + prefix)"
    )


class PhoneLookupResponse(BaseModel):
    """Response model for phone number lookup"""

    user_id: int
    phone_number: str
    name: str
    is_active: bool
    is_admin: bool


@router.post("/lookup", response_model=PhoneLookupResponse)
async def lookup_user_by_phone(request: PhoneLookupRequest):
    """
    Look up user by phone number for WhatsApp authentication

    This endpoint is used by WhatsApp webhook handlers to authenticate
    users based on their phone number.

    Args:
        request: Phone lookup request containing phone number

    Returns:
        User information if found

    Raises:
        404: If user not found
        400: If phone number is invalid
    """
    # Format and validate phone number
    try:
        formatted_phone = format_phone_number(request.phone_number)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid phone number format",
        )

    # Look up user in database
    user = await db_service.get_user_by_phone(formatted_phone)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No user found with phone number {formatted_phone}",
        )

    return PhoneLookupResponse(
        user_id=user.id,
        phone_number=user.phone_number,
        name=user.name,
        is_active=user.is_active,
        is_admin=user.is_admin,
    )


@router.post("/validate")
async def validate_whatsapp_user(request: PhoneLookupRequest):
    """
    Validate if a phone number is registered and active

    Simpler endpoint that just returns success/failure for WhatsApp
    webhook validation without exposing user details.

    Args:
        request: Phone lookup request containing phone number

    Returns:
        Success response if user is valid and active

    Raises:
        404: If user not found or inactive
        400: If phone number is invalid
    """
    # Format and validate phone number
    try:
        formatted_phone = format_phone_number(request.phone_number)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid phone number format",
        )

    # Look up user in database
    user = await db_service.get_user_by_phone(formatted_phone)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found or inactive"
        )

    return {"status": "valid", "message": "User is registered and active"}
