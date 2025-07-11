"""Placeholder technical indicator models.

TODO: Replace with full-featured models once technical-analysis service is integrated.
"""
from enum import Enum
from pydantic import BaseModel

class IndicatorType(str, Enum):
    """Enumeration of supported indicator types."""
    EMA_CROSS = "ema_cross"
    SMA_CROSS = "sma_cross"
    RSI = "rsi"
    MACD = "macd"
    STOCH = "stoch"
    BBANDS = "bbands"

class IndicatorMetadata(BaseModel):
    """Basic metadata describing an indicator series."""
    indicator: IndicatorType
    description: str | None = None

class EmaCross(BaseModel):
    """Simple representation of an EMA cross signal."""
    date: str
    short_ema: float
    long_ema: float
    signal: str  # 'bullish' | 'bearish' 