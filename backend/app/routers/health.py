from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Request

from app.core.config import settings
from app.core.database import supabase

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/")
@router.get("")
async def health_check():
    """Basic health check endpoint"""
    try:
        return {
            "status": "healthy",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "environment": settings.app_env,
            "version": "1.0.0",
        }
    except Exception as e:
        print(e.with_traceback())
        raise e



@router.get("/database")
async def database_health():
    """Check database connectivity"""
    try:
        # Simple query to test Supabase connection
        result = supabase.from_('users').select('id').limit(1).execute()

        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail={
                "status": "unhealthy",
                "database": "disconnected",
                "error": str(e),
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
        )
