from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

market_router = APIRouter(prefix="/market", tags=["Market"])

@market_router.get("/news", summary="Get latest market news", status_code=status.HTTP_200_OK)
async def get_market_news(limit: int = 20):
    """Return aggregated market news headlines (live).

    We fetch the public MarketWatch *Top Stories* RSS feed which does **not**
    require an API-key, ensuring that the endpoint always provides real data
    without violating the *no-mock* rule.
    """

    import httpx
    import xml.etree.ElementTree as ET

    RSS_URL = "https://feeds.marketwatch.com/marketwatch/topstories"

    async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
        resp = await client.get(RSS_URL)
        if resp.status_code != 200:
            return JSONResponse(
                status_code=status.HTTP_502_BAD_GATEWAY,
                content={
                    "status": "error",
                    "message": "MarketWatch RSS feed unavailable",
                    "code": resp.status_code,
                },
            )

    # Parse RSS XML
    root = ET.fromstring(resp.text)
    channel = root.find("channel")
    items = []
    if channel is not None:
        for item in channel.findall("item")[:limit]:
            headline = item.findtext("title")
            link = item.findtext("link")
            pub_date = item.findtext("pubDate")
            items.append({
                "headline": headline,
                "url": link,
                "published_date": pub_date,
                "source": "MarketWatch",
            })

    return {"items": items, "count": len(items)}

# ---------------------------------------------------------------------------
# /indices – Major market indices snapshot (reused from market_data.py)
# ---------------------------------------------------------------------------

import asyncio
from concurrent.futures import ThreadPoolExecutor
from typing import Any

try:
    import yfinance as _yf
except ImportError:  # pragma: no cover
    _yf = None  # type: ignore


@market_router.get(
    "/indices",
    summary="Get a snapshot of major market indices (price + daily change)",
    description="Returns latest price and daily change for S&P 500, Dow Jones and Nasdaq Composite.",
    response_description="List of index data dictionaries",
    status_code=status.HTTP_200_OK,
)
async def get_market_indices(limit: int | None = None):
    """Return latest price & daily change for the main US indices.

    Mirrors the implementation in `backend/api/market_data.py` but is kept here
    to ensure that the canonical *Market Router* exposes **all** market related
    endpoints in a single location.
    """

    if _yf is None:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "error",
                "message": "yfinance dependency unavailable on server",
            },
        )

    symbols = ["^GSPC", "^DJI", "^IXIC"]
    if limit:
        symbols = symbols[:limit]

    def _fetch() -> list[dict[str, Any]]:
        data: list[dict[str, Any]] = []
        for sym in symbols:
            ticker = _yf.Ticker(sym)
            price = ticker.info.get("regularMarketPrice")
            prev = ticker.info.get("regularMarketPreviousClose")
            if price is None or prev is None:
                continue
            change = price - prev
            pct = (change / prev) * 100 if prev else 0
            data.append(
                {
                    "symbol": sym,
                    "price": price,
                    "change": round(change, 2),
                    "change_percent": round(pct, 2),
                }
            )
        return data

    loop = asyncio.get_event_loop()
    with ThreadPoolExecutor() as pool:
        indices = await loop.run_in_executor(pool, _fetch)

    if not indices:
        return JSONResponse(
            status_code=status.HTTP_502_BAD_GATEWAY,
            content={
                "status": "error",
                "message": "Failed to fetch index data from provider (yfinance)",
            },
        )

    return {"status": "ok", "count": len(indices), "indices": indices} 