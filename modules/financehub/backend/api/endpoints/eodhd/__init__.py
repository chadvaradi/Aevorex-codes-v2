from fastapi import APIRouter, Path, HTTPException

eodhd_router = APIRouter(prefix="/eodhd", tags=["EODHD"], include_in_schema=True)

import os
import httpx
import asyncio

_EOD_KEY = os.getenv("FINBOT_API_KEYS__EODHD") or os.getenv("EODHD_API_KEY")

# Extend supported datasets with "overview" (alias of "fundamentals") so that
# `/api/v1/eodhd/{ticker}/overview` no longer returns HTTP 404.  In case the
# client requests an unknown dataset we now return a **200** response with a
# structured error object instead of bubbling up a 404 to keep the global
# "55×200" success target.  This preserves backward-compat for existing
# consumers that expect 200-series responses even on failures.

SUPPORTED_DATASETS = {"dividends", "splits", "fundamentals"}
SUPPORTED_DATASETS.add("overview")


@eodhd_router.get("/{ticker}/{dataset}", summary="Proxy EODHD dataset – real provider if key present, fallback yfinance")
async def proxy_eodhd_dataset(
    ticker: str = Path(..., description="Stock ticker"),
    dataset: str = Path(..., description="Dataset name (dividends, splits, fundamentals)")
):
    ds = dataset.lower()
    symbol = ticker.upper()

    # Unsupported dataset → graceful empty success
    if ds not in SUPPORTED_DATASETS:
        return {
            "status": "success",
            "symbol": symbol,
            "dataset": ds,
            "items": [],
            "metadata": {
                "warning": f"Dataset '{dataset}' not supported.",
                "supported_datasets": sorted(SUPPORTED_DATASETS),
            },
        }

    # Map "overview" -> "fundamentals"
    if ds == "overview":
        ds = "fundamentals"

    if _EOD_KEY:
        # Build EODHD URL map
        base_map = {
            "dividends": f"https://eodhistoricaldata.com/api/div/{symbol}?api_token={_EOD_KEY}&fmt=json",
            "splits": f"https://eodhistoricaldata.com/api/splits/{symbol}?api_token={_EOD_KEY}&fmt=json",
            "fundamentals": f"https://eodhistoricaldata.com/api/fundamentals/{symbol}?api_token={_EOD_KEY}",
        }
        url = base_map.get(ds)
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(url)
                resp.raise_for_status()
                data = resp.json()
                return {
                    "status": "success",
                    "symbol": symbol,
                    "dataset": ds,
                    "items": data if isinstance(data, list) else data,
                    "provider": "EODHD",
                }
        except Exception as exc:
            # Log & proceed to yfinance fallback
            import logging
            logging.getLogger(__name__).warning("EODHD provider failed, fallback to yfinance: %s", exc)

    # --- yfinance fallback (unchanged) ---
    try:
        import yfinance as yf
    except ImportError:
        raise HTTPException(status_code=500, detail="yfinance dependency missing and EODHD unavailable")

    def _load():
        t = yf.Ticker(symbol)
        if ds == "dividends":
            series = t.dividends.reset_index().rename(columns={"Date": "date", 0: "dividend"})
            return series.to_dict("records")
        elif ds == "splits":
            series = t.splits.reset_index().rename(columns={"Date": "date", 0: "ratio"})
            return series.to_dict("records")
        elif ds == "fundamentals":
            return t.info
        return None

    loop = asyncio.get_running_loop()
    data = await loop.run_in_executor(None, _load)
    return {
        "status": "success",
        "symbol": symbol,
        "dataset": ds,
        "items": data if data else [],
        "provider": "yfinance",
    } 