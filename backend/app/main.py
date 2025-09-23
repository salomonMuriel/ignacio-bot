from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from supertokens_python import get_all_cors_headers
from supertokens_python.framework.fastapi import get_middleware

# Load environment variables based on APP_ENV
import os
from pathlib import Path

def get_env_file_path() -> Path:
    """Get the path to the appropriate .env file based on APP_ENV."""
    app_env = os.getenv("APP_ENV", "development")
    if app_env == "production":
        filename = ".env.production"
    elif app_env == "test":
        filename = ".env.test"
    else:
        filename = ".env.local"
    return Path(__file__).parent.parent.parent / filename

env_path = get_env_file_path()
load_dotenv(env_path)

# Configure logging
import logging
import sys

def configure_logging():
    """Configure application logging based on settings."""
    from app.core.config import settings

    # Set log level
    log_level = getattr(logging, settings.log_level.upper(), logging.INFO)

    # Configure root logger
    logging.basicConfig(
        level=log_level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s' if settings.log_format == 'text'
               else '{"timestamp": "%(asctime)s", "name": "%(name)s", "level": "%(levelname)s", "message": "%(message)s"}',
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )

    # Set uvicorn logging level
    logging.getLogger("uvicorn").setLevel(log_level)
    logging.getLogger("uvicorn.access").setLevel(log_level)
    
    # Suppress verbose HTTP request logs from httpx (used by Supabase client)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    
    # Also suppress other noisy loggers in production
    if settings.app_env == "production":
        logging.getLogger("urllib3").setLevel(logging.WARNING)
        logging.getLogger("requests").setLevel(logging.WARNING)

configure_logging()

# Ensure OpenAI API key is set in environment for Agent SDK
if 'OPENAI_API_KEY' not in os.environ and hasattr(os.environ, 'get'):
    from app.core.config import Settings
    temp_settings = Settings()
    if temp_settings.openai_api_key:
        os.environ['OPENAI_API_KEY'] = temp_settings.openai_api_key

from app.core.config import settings
from app.core.supertokens_config import init_supertokens
from app.routers import auth, chat, files, health, project, prompt_templates

# Initialize SuperTokens
init_supertokens()

# Create FastAPI application
app = FastAPI(
    title="Ignacio Bot API",
    description="API for Ignacio, a chat assistant that helps users develop their projects as part of the Action Lab education program",
    version="1.0.0",
    debug=settings.debug,
)

# Add SuperTokens middleware
app.add_middleware(get_middleware())

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "PUT", "POST", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["Content-Type"] + get_all_cors_headers(),
)

# Add trusted host middleware for security
allowed_hosts = settings.allowed_hosts_list.copy()
# Always allow testserver for testing
allowed_hosts.append("testserver")
# Always include backend_host if not already present
if settings.backend_host not in allowed_hosts:
    allowed_hosts.append(settings.backend_host)

# In development, allow all hosts if not explicitly configured
if settings.app_env == "development" and settings.allowed_hosts == "localhost,127.0.0.1":
    allowed_hosts = ["*"]

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=allowed_hosts,
)

# Include routers
app.include_router(health.router)
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(chat.router)
app.include_router(files.router, prefix="/files", tags=["files"])
app.include_router(project.router)
app.include_router(prompt_templates.router)


@app.get("/")
async def root():
    return {
        "message": "Ignacio Bot API",
        "version": "1.0.0",
        "environment": settings.app_env,
    }
