from datetime import datetime
from pydantic import BaseModel


class TickerTapeItem(BaseModel):
    """Egyetlen ticker tape elem adatmodellje."""
    symbol: str
    price: float | None = None
    change: float | None = None
    change_percent: float | None = None
    volume: int | None = None
    market_cap: str | int | None = None
    currency: str | None = "USD"
    exchange: str | None = None
    last_updated: datetime | None = None


class TickerTapeMetadata(BaseModel):
    """Ticker tape metaadat modellje."""
    total_symbols: int
    requested_limit: int
    data_source: str
    last_updated: datetime
    response_time_ms: float | None = None


class TickerTapeResponse(BaseModel):
    """Ticker tape API válasz modellje."""
    status: str = "success"
    data: list[TickerTapeItem]
    metadata: TickerTapeMetadata
    errors: list[str] | None = None 