import os
from typing import List, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Cloud Lost & Found Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    MATCH_THRESHOLD: float = 80.0
    
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite+aiosqlite:///./lost_found.db"
    )
    
    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
        "http://127.0.0.1:5173",
    ]
    
    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    # Storage — "local" for Docker Compose, "s3" for Kubernetes (MinIO)
    STORAGE_TYPE: str = os.getenv("STORAGE_TYPE", "local")
    UPLOAD_DIR: str = "uploads"  # used when STORAGE_TYPE=local

    # S3 / MinIO settings (used when STORAGE_TYPE=s3)
    S3_ENDPOINT: str = os.getenv("S3_ENDPOINT", "")
    S3_BUCKET: str = os.getenv("S3_BUCKET", "lost-found-uploads")
    S3_REGION: str = os.getenv("S3_REGION", "us-east-1")
    S3_ACCESS_KEY: str = os.getenv("S3_ACCESS_KEY", "")
    S3_SECRET_KEY: str = os.getenv("S3_SECRET_KEY", "")

    # SMTP Email Configuration
    SUPPORT_EMAIL: str = "cloudlostfound.platform@gmail.com"
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_TLS: bool = True
    SMTP_FROM: str = "cloudlostfound.platform@gmail.com"
    MOCK_SMTP: bool = False

    class Config:
        case_sensitive = True
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
