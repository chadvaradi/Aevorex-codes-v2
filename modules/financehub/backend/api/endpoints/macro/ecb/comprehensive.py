"""Slim FastAPI views delegating to comprehensive_logic (<60 LOC)."""

from __future__ import annotations

from datetime import date
from typing import Dict, Any, Optional

from fastapi import APIRouter, Depends, Query

from modules.financehub.backend.core.services.macro_service import MacroDataService
from .utils import get_macro_service

# ---------------------------------------------------------------------------
# Router
# ---------------------------------------------------------------------------

comprehensive_router = APIRouter()


# ---------------------------------------------------------------------------
# Endpoints – all heavy work delegated to comprehensive_logic helpers
# ---------------------------------------------------------------------------

@comprehensive_router.get("/comprehensive", summary="Get Comprehensive ECB Economic Data")
async def get_ecb_comprehensive_data(
    service: MacroDataService = Depends(get_macro_service),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    period: Optional[str] = Query(None),
) -> Dict[str, Any]:
    from .comprehensive_logic import get_comprehensive_response
    return await get_comprehensive_response(service, start_date, end_date, period)


@comprehensive_router.get("/monetary-aggregates", summary="Get ECB Monetary Aggregates")
async def get_ecb_monetary_aggregates(
    service: MacroDataService = Depends(get_macro_service),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    period: Optional[str] = Query(None),
) -> Dict[str, Any]:
    from .comprehensive_logic import get_monetary_aggregates_response
    return await get_monetary_aggregates_response(service, start_date, end_date, period)


@comprehensive_router.get("/inflation", summary="Get ECB Inflation Indicators")
async def get_ecb_inflation_indicators(
    service: MacroDataService = Depends(get_macro_service),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    period: Optional[str] = Query(None),
) -> Dict[str, Any]:
    from .comprehensive_logic import get_inflation_indicators_response
    return await get_inflation_indicators_response(service, start_date, end_date, period) 