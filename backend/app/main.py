from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from app.core.config import settings
from app.routers import chat, health

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


@app.get("/")
async def root():
    return {
        "message": "Ignacio Bot API",
        "version": "1.0.0",
        "environment": settings.app_env,
    }
