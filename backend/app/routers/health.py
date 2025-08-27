from fastapi import APIRouter, HTTPException
from datetime import datetime
from app.core.database import supabase
from app.core.config import settings

router = APIRouter(
    prefix="/health",
    tags=["health"]
)

@router.get("/")
async def health_check():
    """Basic health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": settings.app_env,
        "version": "1.0.0"
    }

@router.get("/database")
async def database_health():
    """Check database connectivity"""
    try:
        # Simple query to test Supabase connection
        result = supabase.rpc('version').execute()
        
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail={
                "status": "unhealthy",
                "database": "disconnected",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
        )