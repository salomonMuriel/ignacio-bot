"""
Admin API endpoints for Ignacio Bot
Handles administrative tasks like file synchronization and system maintenance
"""

import logging
from fastapi import APIRouter


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/admin", tags=["admin"])

