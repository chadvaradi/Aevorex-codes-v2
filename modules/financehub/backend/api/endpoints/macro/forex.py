"""Forex endpoints.
Provides real-time FX pairs list and latest EUR-denominated exchange rate using live APIs.
"""
from __future__ import annotations

import os
import httpx
import datetime as _dt

# We no longer support historical query params – only real-time rate
from typing import Any, Dict

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from modules.financehub.backend.utils.logger_config import get_logger

# Initialize module logger
logger = get_logger(__name__)

# Alpha Vantage FX endpoint template
ALPHA_VANTAGE_URL = (
    "https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency={base}&to_currency={quote}&apikey={api_key}"
)

# Retrieve API key once at import time; fallback to env.local via os.getenv
_ALPHA_API_KEY = os.getenv("FINBOT_API_KEYS__ALPHA_VANTAGE") or os.getenv("ALPHA_VANTAGE_API_KEY")

# If key missing, we will transparently fall back to exchangerate.host (no API key required)
USE_EXR_HOST_FALLBACK = not bool(_ALPHA_API_KEY)


# Remove MacroDataService dependency – direct fetch ensures real-time data and avoids ECB mock fallbacks

router = APIRouter(prefix="/forex", tags=["Macro - Forex"])

SUPPORTED_CURRENCIES = ["USD", "GBP", "JPY", "CHF"]


@router.get("/pairs", summary="List supported FX pairs")
async def list_supported_pairs() -> Dict[str, Any]:
    """Return the list of supported currency pairs against EUR."""
    return {"pairs": [f"EUR/{c}" for c in SUPPORTED_CURRENCIES]}


@router.get("/{pair}", summary="Get FX rate for the given pair (e.g. EURUSD or EUR-USD)")
async def get_fx_rate(pair: str) -> Dict[str, Any]:
    """Fetch real-time FX rate using Alpha Vantage **or** fallback provider.

    Always returns HTTP 200. On failure returns `{ status: "error" }` payload.
    """

    try:
        # Normalise pair to EUR/XXX (only EUR base supported for now)
        if "/" in pair:
            base, _, quote = pair.upper().partition("/")
        else:
            # Accept EURUSD or EUR-USD
            pair_upper = pair.replace("-", "").upper()
            if pair_upper.startswith("EUR") and len(pair_upper) == 6:
                base, quote = "EUR", pair_upper[3:]
            else:
                raise HTTPException(status_code=400, detail="Invalid FX pair format. Use EUR/USD or EURUSD.")

        if base != "EUR" or quote not in SUPPORTED_CURRENCIES:
            raise HTTPException(status_code=400, detail="Only EUR base and USD/GBP/JPY/CHF quotes supported.")

        async with httpx.AsyncClient(timeout=10.0) as client:
            if USE_EXR_HOST_FALLBACK:
                # Key-less fallback – exchangerate.host (ECB-sourced)
                url = f"https://api.exchangerate.host/convert?from={base}&to={quote}"
                resp = await client.get(url)
                resp.raise_for_status()
                payload = resp.json()
                if not payload.get("success"):
                    raise HTTPException(status_code=502, detail="exchangerate.host responded with error")
                rate_val = float(payload.get("result"))
                ts_iso = payload.get("date")
                src_name = "exchangerate.host (ECB)"
            else:
                url = ALPHA_VANTAGE_URL.format(base=base, quote=quote, api_key=_ALPHA_API_KEY)
                resp = await client.get(url)
                resp.raise_for_status()
                data = resp.json()
                ex_rate_block = data.get("Realtime Currency Exchange Rate")
                if not ex_rate_block:
                    raise HTTPException(status_code=502, detail="Unexpected response from Alpha Vantage.")
                rate_str = ex_rate_block.get("5. Exchange Rate")
                if rate_str is None:
                    raise HTTPException(status_code=502, detail="Missing rate in Alpha Vantage response.")
                rate_val = float(rate_str)
                ts_iso = ex_rate_block.get("6. Last Refreshed")
                src_name = "Alpha Vantage FX"

        return {
            "status": "success",
            "pair": f"{base}/{quote}",
            "rate": rate_val,
            "timestamp": ts_iso,
            "source": src_name,
        }

    except HTTPException as exc:
        # Attempt secondary provider (open.er-api.com) if we received an upstream provider error (5xx)
        if exc.status_code >= 500:
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    er_resp = await client.get("https://open.er-api.com/v6/latest/EUR")
                    er_resp.raise_for_status()
                    er_json = er_resp.json()
                    rate_val = float(er_json["rates"].get(quote))
                    ts_iso = er_json.get("time_last_update_utc")
                    return {
                        "status": "success",
                        "pair": f"EUR/{quote}",
                        "rate": rate_val,
                        "timestamp": ts_iso,
                        "source": "open.er-api.com (backup)",
                    }
            except Exception as backup_err:
                logger.error("Backup FX provider failed: %s", backup_err)
        logger.error("FX rate error: %s", exc.detail)
        return JSONResponse(status_code=200, content={
            "status": "error",
            "message": exc.detail,
            "pair": pair.upper(),
            "data": {},
        })

    except Exception as err:
        # Final fallback – try open.er-api.com once before giving up
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                er_resp = await client.get("https://open.er-api.com/v6/latest/EUR")
                er_resp.raise_for_status()
                er_json = er_resp.json()
                quote = pair.upper().split("/")[-1] if "/" in pair else pair[-3:]
                rate_val = float(er_json["rates"].get(quote))
                ts_iso = er_json.get("time_last_update_utc")
                return {
                    "status": "success",
                    "pair": f"EUR/{quote}",
                    "rate": rate_val,
                    "timestamp": ts_iso,
                    "source": "open.er-api.com (backup)",
                }
        except Exception as final_err:
            logger.error("Unexpected FX rate error: %s", final_err, exc_info=True)
            return JSONResponse(status_code=200, content={
                "status": "error",
                "message": str(err),
                "pair": pair.upper(),
                "data": {},
            })

# ---------------------------------------------------------------------------
# Compatibility route: allow slash-separated path params (e.g. /forex/EUR/USD)
# ---------------------------------------------------------------------------


@router.get("/{base}/{quote}", summary="Get FX rate (base & quote segments)")
async def get_fx_rate_segments(base: str, quote: str):
    """Compatibility wrapper to accept URL formatted as /forex/EUR/USD."""
    return await get_fx_rate(f"{base}/{quote}")


# ---------------------------------------------------------------------------
# Historical rates helper – daily close for the last N days (max 30)
# ---------------------------------------------------------------------------


async def fetch_fx_history(pair: str, days: int = 30) -> list[dict]:
    """Return list[dict(date, open, high, low, close)] for EUR/XXX pair.

    Uses exchangerate.host timeseries endpoint (ECB-based), which provides
    daily close. High/Low proxies to max/min of open & close as approximation.
    """

    base, _, quote = pair.upper().partition("/")
    if base != "EUR" or quote not in SUPPORTED_CURRENCIES:
        raise HTTPException(status_code=400, detail="Only EUR base and USD/GBP/JPY/CHF quotes supported.")

    end_date = _dt.date.today()
    start_date = end_date - _dt.timedelta(days=days)
    url = (
        "https://api.exchangerate.host/timeseries"
        f"?start_date={start_date.isoformat()}&end_date={end_date.isoformat()}&base={base}&symbols={quote}"
    )

    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(url)
        resp.raise_for_status()
        payload = resp.json()
        if not payload.get("success"):
            raise HTTPException(status_code=502, detail="exchangerate.host timeseries error")

    rates = payload.get("rates", {})
    ohlc_list: list[dict] = []
    prev_close = None
    for day, rate_dict in sorted(rates.items()):
        close = float(rate_dict[quote])
        open_ = prev_close if prev_close is not None else close
        high = max(open_, close)
        low = min(open_, close)
        ohlc_list.append({
            "date": day,
            "open": open_,
            "high": high,
            "low": low,
            "close": close,
        })
        prev_close = close

    return ohlc_list


# ---------------------------------------------------------------------------
# New endpoint – historical candlestick data
# ---------------------------------------------------------------------------


@router.get("/{pair}/history", summary="Get historical FX rate (daily OHLC)")
async def get_fx_history(pair: str, days: int = 30) -> dict:
    """Return up to 30 days daily OHLC for EUR/XXX pair.

    `days` param limited to 30 to stay within free-tier API limits.
    """
    if days < 1 or days > 30:
        raise HTTPException(status_code=400, detail="days must be 1–30")

    try:
        data = await fetch_fx_history(pair, days)
        return {
            "status": "success",
            "pair": pair.upper(),
            "items": data,
            "source": "exchangerate.host (ECB)",
        }
    except HTTPException as exc:
        raise exc
    except Exception as err:  # pragma: no cover – unexpected errors
        logger.error("FX history error: %s", err, exc_info=True)
        return {
            "status": "error",
            "message": str(err),
            "pair": pair.upper(),
            "items": [],
        } 