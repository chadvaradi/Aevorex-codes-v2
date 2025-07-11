# =============================================================================
# === From: price_models.py ===
# =============================================================================
from datetime import datetime
from typing import List
from pydantic import BaseModel, Field
from .common import DividendData, StockSplitData

class ChartDataPoint(BaseModel):
    """Egyetlen adatpont a historikus árfolyamgrafikonhoz."""
    t: datetime = Field(..., alias="timestamp", description="Időbélyeg.")
    o: float = Field(..., alias="open", description="Nyitóár.")
    h: float = Field(..., alias="high", description="Maximum ár.")
    low: float = Field(..., alias="low", description="Minimum ár.")
    c: float = Field(..., alias="close", description="Záróár.")
    v: int = Field(..., alias="volume", description="Forgalom.")

class CompanyPriceHistoryEntry(BaseModel):
    """Egy napra vonatkozó historikus adatokat tartalmaz."""
    date: str = Field(..., description="Dátum 'YYYY-MM-DD' formátumban.")
    o: float = Field(..., description="Nyitóár.")
    h: float = Field(..., description="Maximum ár.")
    low: float = Field(..., description="Minimum ár.")
    c: float = Field(..., description="Záróár.")
    v: int = Field(..., description="Forgalom.")
    dividends: List[DividendData] = Field(default_factory=list)
    splits: List[StockSplitData] = Field(default_factory=list) 