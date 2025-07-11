"""
EODHD-specific feature settings.
"""
from pydantic import BaseModel, Field, model_validator
from pydantic_settings import SettingsConfigDict

from ._core import logger

class EODHDFeaturesSettings(BaseModel):
    """EODHD specifikus funkciók beállításai."""
    USE_FOR_COMPANY_INFO: bool = Field(default=False)
    USE_FOR_FINANCIALS: bool = Field(default=False)
    USE_FOR_OHLCV_DAILY: bool = Field(default=False)
    USE_FOR_OHLCV_INTRADAY: bool = Field(default=False)

    @model_validator(mode='after')
    def _log_enabled_eodhd_features(self) -> 'EODHDFeaturesSettings':
        """Engedélyezett EODHD funkciók logolása."""
        enabled_features = [
            field.replace("USE_FOR_", "").lower().replace("_", " ")
            for field in self.model_fields
            if field.startswith("USE_FOR_") and getattr(self, field)
        ]
        
        if enabled_features:
            logger.info(f"EODHD Features: Enabled: {', '.join(enabled_features)}")
        else:
            logger.info("EODHD Features: All features are DISABLED.")
        
        return self

    model_config = SettingsConfigDict(env_prefix='FINBOT_EODHD_FEATURES__') 