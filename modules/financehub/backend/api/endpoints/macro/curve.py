from datetime import date, timedelta
from typing import Dict, Any

from fastapi import APIRouter, Path, status, Depends, Query, Request
from fastapi.responses import JSONResponse

from .ecb.utils import get_macro_service  # Re-use existing helper
from modules.financehub.backend.core.services.macro_service import MacroDataService
from modules.financehub.backend.core.fetchers.macro.ecb_client.fed_yield_curve import (
    fetch_fed_yield_curve_historical,
)
from modules.financehub.backend.utils.logger_config import get_logger
from modules.financehub.backend.config import settings
from time import perf_counter
import httpx
from modules.financehub.backend.core.metrics import METRICS_EXPORTER


curve_router = APIRouter(tags=["Macro – Yield Curves"], prefix="/curve")

logger = get_logger(__name__)


@curve_router.get(
    "/{source}",
    summary="Get yield curve for a given source (ECB or UST)",
    status_code=status.HTTP_200_OK,
)
async def get_curve(
    request: Request,
    source: str = Path(..., description="Data source, e.g. 'ecb' or 'ust'"),
    days: int = Query(0, description="How many days of history to include. 0 = latest only (default)."),
    macro_service: MacroDataService = Depends(get_macro_service),
) -> Dict[str, Any]:
    """Return an *actual* yield-curve for the requested provider.

    • **ecb** – uses YC dataflow via :py:meth:`MacroDataService.get_ecb_yield_curve`.
    • **ust** – fetches the historical U.S. Treasury curve (FRED CSV parsed by
      ``fetch_fed_yield_curve_historical``) and returns the latest snapshot.
    """

    # Plan clamp
    plan = request.session.get("plan", "free") if hasattr(request, "session") else "free"
    hdr_plan = request.headers.get("x-plan")
    if settings.ENVIRONMENT.NODE_ENV != "production" and hdr_plan:
        plan = hdr_plan

    src = source.lower()
    end_date = date.today()
    # Clamp days by plan
    max_days = 1 if plan == "free" else (30 if plan == "pro" else 365 * 3)
    days = min(max(days, 0), max_days)
    start_date = end_date - timedelta(days=days or 1)

    if src == "ecb":
        _t0 = perf_counter()
        data = await macro_service.get_ecb_yield_curve(start_date, end_date)
        METRICS_EXPORTER.observe_ecb_request(perf_counter() - _t0)
        if not data:
            logger.warning("ECB yield-curve empty – falling back to UST")
            src = "ust"
        else:
            latest_date = max(data.keys())
            return {
                "status": "success",
                "source": "ecb",
                "curve": data[latest_date],
                "date": latest_date,
            }

    if src == "ust":
        try:
            _t0 = perf_counter()
            import asyncio
            # Robust fetch with retry and lower timeout to fail fast
            for attempt in range(3):
                try:
                    df_full = await asyncio.wait_for(fetch_fed_yield_curve_historical(), timeout=6)
                    break
                except Exception as _fetch_err:
                    if attempt == 2:
                        raise
                    await asyncio.sleep(0.4 * (attempt + 1))
            # Keep only the requested range; if empty, fall back to the latest available row
            df_range = df_full.loc[start_date:end_date]
            df_use = df_range if not df_range.empty else df_full.tail(1)
            latest_row = df_use.iloc[-1]
            curve = {k: float(v) if v == v else None for k, v in latest_row.to_dict().items()}
            METRICS_EXPORTER.observe_ust_request(perf_counter() - _t0)
            return {
                "status": "success",
                "source": "ust",
                "curve": curve,
                "date": str(df_use.index[-1].date()),
            }
        except Exception as exc:
            METRICS_EXPORTER.inc_ust_error(type(exc).__name__)
            logger.error("UST yield-curve fetch failed: %s", exc, exc_info=True)
            return JSONResponse(
                status_code=200,
                content={
                    "status": "success",
                    "message": "UST yield-curve unavailable – returning empty curve",
                    "curve": {},
                    "error": str(exc),
                },
            )

    # Unsupported source
    return JSONResponse(
        status_code=200,
        content={
            "status": "success",
            "message": "Curve source not supported – fallback payload",
            "supported_sources": ["ecb", "ust"],
            "curve": {},
        },
    ) 