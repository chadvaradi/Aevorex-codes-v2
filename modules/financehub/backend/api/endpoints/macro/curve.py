from datetime import date, timedelta
from typing import Dict, Any

from fastapi import APIRouter, Path, status, Depends, Query
from fastapi.responses import JSONResponse

from .ecb.utils import get_macro_service  # Re-use existing helper
from modules.financehub.backend.core.services.macro_service import MacroDataService
from modules.financehub.backend.core.fetchers.macro.fed_yield_curve import (
    fetch_fed_yield_curve_historical,
)
from modules.financehub.backend.utils.logger_config import get_logger


curve_router = APIRouter(tags=["Macro – Yield Curves"], prefix="/curve")

logger = get_logger(__name__)


@curve_router.get(
    "/{source}",
    summary="Get yield curve for a given source (ECB or UST)",
    status_code=status.HTTP_200_OK,
)
async def get_curve(
    source: str = Path(..., description="Data source, e.g. 'ecb' or 'ust'"),
    days: int = Query(0, description="How many days of history to include. 0 = latest only (default)."),
    macro_service: MacroDataService = Depends(get_macro_service),
) -> Dict[str, Any]:
    """Return an *actual* yield-curve for the requested provider.

    • **ecb** – uses YC dataflow via :py:meth:`MacroDataService.get_ecb_yield_curve`.
    • **ust** – fetches the historical U.S. Treasury curve (FRED CSV parsed by
      ``fetch_fed_yield_curve_historical``) and returns the latest snapshot.
    """

    src = source.lower()
    end_date = date.today()
    start_date = end_date - timedelta(days=days or 1)

    if src == "ecb":
        data = await macro_service.get_ecb_yield_curve(start_date, end_date)
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
            import asyncio
            df = await asyncio.wait_for(fetch_fed_yield_curve_historical(), timeout=8)
            # Keep only the requested range, default latest row
            df = df.loc[start_date:end_date]
            if df.empty:
                raise ValueError("UST curve dataframe is empty for requested range")
            latest_row = df.iloc[-1]
            curve = {k: float(v) if v == v else None for k, v in latest_row.to_dict().items()}
            return {
                "status": "success",
                "source": "ust",
                "curve": curve,
                "date": str(df.index[-1].date()),
            }
        except Exception as exc:
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