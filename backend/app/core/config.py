from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str
    
    # OpenAI
    openai_api_key: str
    
    # WhatsApp
    whatsapp_access_token: str = ""
    whatsapp_phone_number_id: str = ""
    whatsapp_webhook_verify_token: str = ""
    
    # JWT
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    
    # Application
    app_env: str = "development"
    debug: bool = True
    cors_origins: str = "http://localhost:3000"
    
    # Server
    backend_host: str = "localhost"
    backend_port: int = 8000
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    class Config:
        env_file = ".env.local"
        case_sensitive = False


settings = Settings()