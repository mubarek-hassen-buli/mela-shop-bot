from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    TELEGRAM_BOT_TOKEN: str = "8910491771:AAH0wAGpUkCYUyKKAqfIr1dnnhRxxvdHZ_o"
    MINI_APP_URL: str = "https://your-miniapp-url.com"
    BACKEND_API_URL: str = "http://localhost:8000/api/v1"
    BOT_ENV: str = "development"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
