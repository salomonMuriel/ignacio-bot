import os
from pydantic import ConfigDict
from pydantic_settings import BaseSettings


def get_env_file() -> str:
    """Determine which .env file to load based on APP_ENV environment variable."""
    app_env = os.getenv("APP_ENV", "development")
    if app_env == "production":
        return ".env.production"
    elif app_env == "test":
        return ".env.test"
    else:
        return ".env.local"


class Settings(BaseSettings):
    model_config = ConfigDict(
        env_file=get_env_file(),
        case_sensitive=False,
    )
    # Database
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str
    supabase_jwt_secret: str

    # OpenAI
    openai_api_key: str

    # WhatsApp
    whatsapp_access_token: str = ""
    whatsapp_phone_number_id: str = ""
    whatsapp_webhook_verify_token: str = ""

    # JWT
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 1440

    # Application
    app_env: str = "development"
    debug: bool = True
    cors_origins: str = "*"

    # Server
    backend_host: str = "localhost"
    backend_port: int = 8000

    # Security
    allowed_hosts: str = "localhost,127.0.0.1"
    secure_ssl_redirect: bool = False
    secure_proxy_ssl_header: str = ""

    # Logging
    log_level: str = "INFO"
    log_format: str = "text"

    # Performance
    uvicorn_workers: int = 1
    uvicorn_max_requests: int = 1000
    uvicorn_max_requests_jitter: int = 50

    # Health Check
    health_check_interval: int = 30
    health_check_timeout: int = 10

    # Rate Limiting (for future implementation)
    rate_limit_per_minute: int = 60
    rate_limit_burst: int = 10

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    @property
    def allowed_hosts_list(self) -> list[str]:
        """Convert ALLOWED_HOSTS comma-separated string to list."""
        if not self.allowed_hosts:
            return ["*"]
        return [host.strip() for host in self.allowed_hosts.split(",")]


settings = Settings()
