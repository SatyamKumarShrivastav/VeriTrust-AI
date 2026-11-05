"""
VeriTrust AI — Application Configuration
Loads settings from environment variables. Never hardcode secrets here.
"""
import os
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import List, Optional


class Settings(BaseSettings):
    # ─── Application ────────────────────────────────
    APP_NAME: str = "VeriTrust AI"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    DEBUG: bool = False

    # ─── Database ───────────────────────────────────
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = "Kri&Satya$19@sql"
    DB_NAME: str = "veritrust_ai"

    @property
    def DATABASE_URL(self) -> str:
        from urllib.parse import quote_plus
        encoded_password = quote_plus(self.DB_PASSWORD)
        return (
            f"mysql+pymysql://{self.DB_USER}:{encoded_password}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
            f"?charset=utf8mb4"
        )

    # ─── Security ───────────────────────────────────
    SECRET_KEY: str = "veritrust-ai-dev-secret-key-change-in-production-32chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ─── CORS ───────────────────────────────────────
    FRONTEND_URL: str = "http://localhost:5173"
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    @property
    def CORS_ORIGINS_LIST(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    # ─── File Storage ───────────────────────────────
    UPLOAD_DIR: str = "./storage/evidence"
    REPORTS_DIR: str = "./storage/reports"
    KEYS_DIR: str = "./keys"
    MAX_UPLOAD_SIZE_MB: int = 500
    ALLOWED_EXTENSIONS: str = "mp4,avi,mov,mkv,webm,mpeg,mp4v"

    @property
    def ALLOWED_EXT_LIST(self) -> List[str]:
        return [e.strip().lower() for e in self.ALLOWED_EXTENSIONS.split(",")]

    @property
    def MAX_UPLOAD_BYTES(self) -> int:
        return self.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    # ─── Cryptography ───────────────────────────────
    SIGNING_KEY_PATH: str = "./keys/signing_key.pem"
    VERIFY_KEY_PATH: str = "./keys/verify_key.pem"

    # ─── Blockchain ─────────────────────────────────
    BLOCKCHAIN_NETWORK: str = "local"
    BLOCKCHAIN_RPC_URL: str = "http://localhost:8545"
    CONTRACT_ADDRESS: Optional[str] = None
    DEPLOYER_PRIVATE_KEY: Optional[str] = None
    BLOCKCHAIN_ENABLED: bool = False

    # ─── Generative AI ──────────────────────────────
    LLM_PROVIDER: str = "template"  # "openai", "gemini", "template"
    LLM_API_KEY: Optional[str] = None
    LLM_MODEL: str = "gpt-4o-mini"
    LLM_FALLBACK_MODE: str = "template"
    LLM_ENABLED: bool = False

    # ─── Logging ────────────────────────────────────
    LOG_LEVEL: str = "INFO"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
