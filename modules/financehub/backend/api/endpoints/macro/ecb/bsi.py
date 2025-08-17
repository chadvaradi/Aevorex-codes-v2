"""ECB Monetary Aggregates (BSI) Endpoint
=====================================
Exposes M1–M3 aggregates via `/api/v1/macro/ecb/bsi`.
"""
from __future__ import annotations

from datetime import date, timedelta
from typing import Optional

import structlog
from fastapi import APIRouter, Depends, Query

from modules.financehub.backend.core.services.macro_service import MacroDataService
from .utils import get_macro_service

logger = structlog.get_logger(__name__)

router = APIRouter(prefix="/bsi", tags=["ECB Monetary Aggregates"])

@router.get("/", summary="Get ECB Monetary Aggregates (M1–M3)")
async def get_ecb_bsi(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD), default = 3Y ago"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD), default = today"),
    service: MacroDataService = Depends(get_macro_service),
):
    """Return monthly M1/M2/M3 series.

    Graceful degradation: on error returns informative JSON with `status:error` but HTTP 200.
    """
    try:
        if end_date is None:
            end_date = date.today()
        if start_date is None:
            start_date = end_date - timedelta(days=365 * 3)

        data = await service.get_ecb_bsi(start_date, end_date)
        from fastapi import HTTPException
        if not data:
            raise HTTPException(status_code=503, detail="ECB BSI data unavailable")

        return {
            "status": "success",
            "metadata": {
                "source": "ECB SDMX (BSI)",
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "records": len(data),
            },
            "data": data,
        }
    except Exception as exc:
        from fastapi import HTTPException
        logger.error("BSI endpoint error: %s", exc, exc_info=True)
        raise HTTPException(status_code=503, detail="ECB BSI endpoint error") 