# =============================================================================
# === From: response_models.py ===
# =============================================================================
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from .common import NewsItem
from .fundamentals import CompanyOverview, FinancialsData, EarningsData
from .indicator_models import TechnicalAnalysis

class LatestOHLCV(BaseModel):
    """A legfrissebb OHLCV adatokat és a változást tartalmazza."""
    c: Optional[float] = Field(None, description="Aktuális vagy utolsó záróár.")
    h: Optional[float] = Field(None, description="Napi maximum.")
    low: Optional[float] = Field(None, description="Napi minimum.")
    o: Optional[float] = Field(None, description="Napi nyitóár.")
    v: Optional[int] = Field(None, description="Napi forgalom.")
    pc: Optional[float] = Field(None, description="Előző napi záróár.")
    d: Optional[float] = Field(None, description="Változás.")
    dp: Optional[float] = Field(None, description="Százalékos változás.")
    c_timestamp: Optional[datetime] = Field(None, description="Az 'c' (ár) érték időbélyege.")

class NewsData(BaseModel):
    """Hírelemeket és aggregált hangulati adatokat tartalmazó modell."""
    items: List[NewsItem] = Field(default_factory=list)
    sentiment_score: Optional[float] = Field(None, description="Az aggregált hangulati pontszám a hírek alapján.")
    sentiment_label: Optional[str] = Field(None, description="Az aggregált hangulati címke ('bullish', 'neutral', 'bearish').")

class FinBotStockResponse(BaseModel):
    """
    A fő, egységesített válaszmodell egy adott részvény lekérdezéséhez.
    Ez a modell aggregálja az összes releváns adatpontot.
    """
    symbol: str = Field(..., description="A részvény egyedi szimbóluma.")
    company_overview: Optional[CompanyOverview] = None
    latest_ohlcv: Optional[LatestOHLCV] = None
    financials: Optional[FinancialsData] = None
    earnings: Optional[EarningsData] = None
    news: Optional[NewsData] = None
    technical_analysis: Optional[TechnicalAnalysis] = None 
    # --- Új mezők a kompatibilitásért ---
    request_timestamp_utc: Optional[datetime] = Field(
        None, description="A válasz építésekor rögzített UTC időbélyeg (offline / cache validáláshoz)."
    )
    data_source_info: Optional[str] = Field(
        None, description="Rövid meta információ a felhasznált adatforrás kombinációjáról (pl. 'mixed-sources-parallel')."
    )
    is_data_stale: Optional[bool] = Field(
        None, description="True, ha az adatok elavultak (pl. újbóli fetch szükséges)."
    )
    history_ohlcv: Optional[list[dict]] = Field(
        None, description="Teljes OHLCV idősor a chart-hoz előkészített formában."
    )
    latest_indicators: Optional[dict[str, float]] = Field(
        None, description="A legfrissebb technikai indikátor értékek kulcs-érték párokban."
    ) 