# =============================================================================
# === From: common.py ===
# =============================================================================

import logging
from datetime import date as Date, datetime
from typing import Optional, Any, List
from pydantic import (
    BaseModel, Field, field_validator, ConfigDict,
    StrictStr, AwareDatetime
)
from ...utils.helpers import _clean_value

# --- Logger Beállítása ---
logger = logging.getLogger("aevorex_finbot.models.stock_common")

# --- Konstansok ---
VALID_SENTIMENT_LABELS = {"bullish", "neutral", "bearish"}

class TickerSentiment(BaseModel):
    """Egy adott tickerhez tartozó hangulati adatokat tárolja."""
    model_config = ConfigDict(extra='ignore', validate_assignment=True)

    symbol: StrictStr
    sentiment_score: Optional[float] = Field(None, description="A hangulati pontszám (-1 és 1 között).")
    sentiment_label: Optional[str] = Field(None, description="A hangulati címke ('bullish', 'neutral', 'bearish').")
    last_updated: Optional[AwareDatetime] = Field(None, description="Az utolsó frissítés időpontja.")

    @field_validator('symbol', mode='before')
    @classmethod
    def validate_and_normalize_ticker(cls, v: Any) -> str:
        if not isinstance(v, str) or not v.strip():
            raise ValueError("Ticker must be a non-empty string.")
        return v.strip().upper()

    @field_validator('sentiment_label', mode='before')
    @classmethod
    def validate_sentiment_label(cls, v: Any) -> Optional[str]:
        cleaned_v = _clean_value(v)
        if cleaned_v is None:
            return None
        lower_v = str(cleaned_v).lower()
        if lower_v not in VALID_SENTIMENT_LABELS:
            logger.warning(f"Invalid sentiment label '{v}'. Setting to None.")
            return None
        return lower_v

class StockSplitData(BaseModel):
    """Részvényfelaprózási adatokat tartalmaz."""
    execution_date: Date = Field(..., alias='executionDate')
    from_factor: float = Field(..., alias='fromFactor')
    to_factor: float = Field(..., alias='toFactor')

class DividendData(BaseModel):
    """Osztalékadatokat tartalmaz."""
    ex_date: Date = Field(..., alias='exDate')
    payment_date: Date = Field(..., alias='paymentDate')
    record_date: Date = Field(..., alias='recordDate')
    value: float = Field(..., alias='value')
    currency: str = Field(..., alias='currency')

class ErrorResponse(BaseModel):
    """Általános hibaüzenet modell."""
    error: str = Field(..., description="A hibaüzenet leírása.")
    details: Optional[Any] = None

class NewsItem(BaseModel):
    """Egyetlen hírelemet reprezentáló modell."""
    model_config = ConfigDict(populate_by_name=True, extra='ignore')

    id: Optional[str] = Field(None, description="A hír egyedi azonosítója.")
    title: Optional[str] = Field(None, description="A hír címe.")
    publisher: Optional[str] = Field(None, description="A kiadó neve.")
    link: Optional[str] = Field(None, alias='article_url', description="URL a teljes cikkhez.")
    published_utc: Optional[AwareDatetime] = Field(None, alias='published_utc', description="A publikálás időpontja UTC-ben.")
    tickers: List[str] = Field(default_factory=list, description="A hírhez kapcsolódó tickerek.")
    summary: Optional[str] = Field(None, alias='description', description="A hír rövid összefoglalója.")
    image_url: Optional[str] = Field(None, alias='image_url', description="A hírhez tartozó kép URL-je.")

    @field_validator('published_utc', mode='before')
    @classmethod
    def validate_published_date(cls, v: Any) -> AwareDatetime:
        if isinstance(v, (datetime, Date)):
            return v
        if isinstance(v, str):
            return datetime.fromisoformat(v.replace('Z', '+00:00'))
        raise ValueError(f"Cannot parse date: {v}")

class StockQuote(BaseModel):
    """
    Represents a real-time stock quote.
    """
    symbol: str
    price: float
    change: float
    change_percent: float
    timestamp: datetime

class ForexQuote(BaseModel):
    """Placeholder model for forex quote data."""
    symbol: str
    rate: float
    timestamp: str
    
    class Config:
        extra = "allow" 