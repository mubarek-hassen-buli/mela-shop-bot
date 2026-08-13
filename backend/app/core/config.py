from typing import List, Union
import json
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    PROJECT_NAME: str = "Mela Shop API"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "change_this_to_a_super_secret_32_character_string_min"

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    @field_validator("CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, str) and v.startswith("["):
            return json.loads(v)
        elif isinstance(v, list):
            return v
        raise ValueError(v)

    # Database
    MYSQL_SERVER: str = "localhost"
    MYSQL_PORT: int = 3306
    MYSQL_USER: str = "melashop_user"
    MYSQL_PASSWORD: str = "melashop_secure_password"
    MYSQL_DB: str = "melashop_db"
    DATABASE_URL: str = "sqlite+aiosqlite:///./test.db"

    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30

    # JWT Authentication
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    JWT_ALGORITHM: str = "HS256"

    # Telegram Integration
    TELEGRAM_BOT_TOKEN: str = "123456789:ABCdefGHIjklMNOpqrsTUVwxyZ"
    TELEGRAM_INIT_DATA_MAX_AGE: int = 86400

    # Cloudinary Integration
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
