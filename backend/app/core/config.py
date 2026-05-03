from pydantic_settings import BaseSettings
from pathlib import Path
from dotenv import load_dotenv

# Load the .env file from the project root (optional but useful for local development)
env_path = Path(__file__).resolve().parents[3] / ".env"
load_dotenv(dotenv_path=env_path)

class Settings(BaseSettings):
    DATABASE_URL: str  # Read from .env file
    SECRET_KEY: str # No default; raises error if missing from .env
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"  # Look for .env file in project root

settings = Settings()
