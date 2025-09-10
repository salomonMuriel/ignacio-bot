from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

# Load environment variables from .env.local
import os
from pathlib import Path
env_path = Path(__file__).parent.parent.parent / '.env.local'
load_dotenv(env_path)

# Ensure OpenAI API key is set in environment for Agent SDK
if 'OPENAI_API_KEY' not in os.environ and hasattr(os.environ, 'get'):
    from app.core.config import Settings
    temp_settings = Settings()
    if temp_settings.openai_api_key:
        os.environ['OPENAI_API_KEY'] = temp_settings.openai_api_key

from app.core.config import settings
from app.routers import chat, files, health, project

# Create FastAPI application
app = FastAPI(
    title="Ignacio Bot API",
    description="API for Ignacio, a chat assistant that helps users develop their projects as part of the Action Lab education program",
    version="1.0.0",
    debug=settings.debug,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add trusted host middleware for security
# Allow testserver for testing
allowed_hosts = ["localhost", "127.0.0.1", settings.backend_host, "testserver"]
if settings.app_env == "development":
    allowed_hosts.extend(["*"])  # Allow all hosts in development

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=allowed_hosts,
)

# Include routers
app.include_router(health.router)
app.include_router(chat.router)
app.include_router(files.router, prefix="/files", tags=["files"])
app.include_router(project.router)


@app.get("/")
async def root():
    return {
        "message": "Ignacio Bot API",
        "version": "1.0.0",
        "environment": settings.app_env,
    }
