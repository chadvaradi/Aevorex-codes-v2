"""
Ticker tape settings.
"""
from typing import Any
from pydantic import field_validator, BaseModel, Field
from pydantic.types import PositiveInt

from ._core import _parse_env_list_str_utility

class TickerTapeSettings(BaseModel):
    """Ticker szalag beállítások."""
    SYMBOLS: list[str] = Field(
        default_factory=lambda: ["^GSPC", "^GDAXI", "AAPL", "MSFT", "GOOGL", "OTP.BD", "EURHUF=X", "BTC-USD"]
    )
    UPDATE_INTERVAL_SECONDS: PositiveInt = Field(default=60)
    CACHE_KEY: str = Field(default="ticker_tape_data")
    CACHE_TTL_SECONDS: PositiveInt = Field(default=30)
    TICKER_TAPE_CACHE_KEY: str = Field(default="ticker_tape_data")
    TICKER_TAPE_TTL_SECONDS: PositiveInt = Field(default=30)

    @field_validator('SYMBOLS', mode="before")
    @classmethod
    def _parse_symbols_list(cls, v: Any) -> list[str]:
        return _parse_env_list_str_utility(v, 'TICKER_TAPE_SYMBOLS') 