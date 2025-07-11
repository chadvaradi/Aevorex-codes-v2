"""
Data source settings.
"""
from pydantic import field_validator, BaseModel, Field

from ._core import logger

class DataSourceSettings(BaseModel):
    """Adatforrásokra vonatkozó beállítások."""
    PRIMARY: str = Field(default="yfinance", description="Elsődleges adatforrás.")
    SECONDARY: str | None = Field(default="eodhd", description="Másodlagos adatforrás.")
    INFO_TEXT: str = Field(default="Data sources configuration", description="Információs szöveg.")

    @field_validator('PRIMARY', 'SECONDARY')
    @classmethod
    def _validate_and_normalize_source(cls, v: str | None) -> str | None:
        if v is None:
            return None
        source = v.strip().lower()
        if not source:
            logger.warning("Data source identifier is empty.")
            return None
        return source 