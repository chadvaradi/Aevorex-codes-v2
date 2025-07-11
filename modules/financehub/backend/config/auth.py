"""
Settings for Google OAuth2 Authentication.
"""
from typing import Optional, ClassVar
from pydantic import Field
from pydantic.types import SecretStr
from pydantic.networks import AnyHttpUrl
from pydantic_settings import BaseSettings, SettingsConfigDict

# Use a shared logger instance for consistency
from modules.financehub.backend.utils.logger_config import get_logger

logger = get_logger(__name__)

class GoogleAuthSettings(BaseSettings):
    """Settings for Google OAuth2."""
    model_config = SettingsConfigDict(env_prefix="FINBOT_GOOGLE_AUTH__", case_sensitive=False)

    ENABLED: bool = True
    CLIENT_ID: Optional[str] = Field("DUMMY_CLIENT_ID", description="Google OAuth Client ID")
    CLIENT_SECRET: Optional[SecretStr] = Field("DUMMY_CLIENT_SECRET", description="Google OAuth Client Secret")
    REDIRECT_URI: Optional[AnyHttpUrl] = Field("http://localhost:8084/api/v1/auth/callback", description="Google OAuth Redirect URI")
    SECRET_KEY: Optional[SecretStr] = Field("DUMMY_SECRET_KEY", description="Secret key for signing session cookies")

    # Static URLs, not configured by user
    AUTHORIZATION_URL: ClassVar[str] = "https://accounts.google.com/o/oauth2/v2/auth"
    TOKEN_URL: ClassVar[str] = "https://www.googleapis.com/oauth2/v4/token"

    # @field_validator("ENABLED")
    # @classmethod
    # def check_enabled_dependencies(cls, v, values):
    #     # Bypass this check during OpenAPI schema generation
    #     if os.getenv("IS_OPENAPI_GENERATION") == "true":
    #         return v
            
    #     if v and not all([
    #         values.data.get('CLIENT_ID'),
    #         values.data.get('CLIENT_SECRET'),
    #         values.data.get('REDIRECT_URI'),
    #         values.data.get('SECRET_KEY')
    #     ]):
    #         raise ValueError(
    #             "If Google Auth is enabled, CLIENT_ID, CLIENT_SECRET, "
    #             "REDIRECT_URI, and SECRET_KEY must all be set."
    #         )
    #     return v 