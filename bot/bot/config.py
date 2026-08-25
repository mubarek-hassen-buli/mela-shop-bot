from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    TELEGRAM_BOT_TOKEN: str = "8910491771:AAH0wAGpUkCYUyKKAqfIr1dnnhRxxvdHZ_o"
    MINI_APP_URL: str = Field(
        default="https://mela-shop-miniapp.vercel.app",
        validation_alias=AliasChoices("MINI_APP_URL", "MINIAPP_URL")
    )
    BACKEND_API_URL: str = Field(
        default="https://mela-shop-bot-6xm1.onrender.com/api/v1",
        validation_alias=AliasChoices("BACKEND_API_URL", "API_BASE_URL", "API_URL")
    )
    BOT_ENV: str = "production"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
