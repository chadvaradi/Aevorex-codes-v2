"""
Application meta-information settings.
"""
from pydantic import BaseModel, Field, model_validator

class ApplicationMetaSettings(BaseModel):
    """Általános alkalmazás meta-információk."""
    NAME: str = Field(default="Aevorex FinBot", description="Az alkalmazás belső neve.")
    VERSION: str = Field(default="2.2.0", description="Backend API verziója (Semantic Versioning).")
    TITLE: str = Field(default="AEVOREX FinBot Premium API", description="Publikus API cím (OpenAPI/Swagger).")
    DESCRIPTION: str = Field(
        default="Aevorex Financial Intelligence Bot API. Real-time stock data, AI-driven analysis, and insights.",
        description="Részletes leírás az API dokumentációhoz."
    )

    @model_validator(mode='after')
    def _update_title_with_version(self) -> 'ApplicationMetaSettings':
        """Frissíti a címet a verziószámmal."""
        if self.VERSION not in self.TITLE:
            self.TITLE = f"{self.TITLE} (v{self.VERSION})"
        return self 