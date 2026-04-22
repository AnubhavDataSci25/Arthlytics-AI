from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    ENV: str = "development"
    APP_NAME: str = "Arthlytics AI"
    DEBUG: bool = True

    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]

    DATABASE_URL: str = "postgresql://user:password@localhost:5432/arthlytics_db"

    REDIS_URL: str = "redis://localhost:6379"

    ###### JWT ############
    JWT_SECRET_KEY: str = "ANUBHAV_SECRET_KEY_CHANGE_ME"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    ###### AI Models API #######


    ###### File Storage #######
    UPLOAD_DIR: str = "./uploads"
    REPORTS_DIR: str = "./reports"
    MAX_UPLOAD_SIZE_MB: int = 10

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()