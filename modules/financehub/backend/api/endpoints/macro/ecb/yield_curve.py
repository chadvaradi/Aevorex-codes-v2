"""
ECB Yield Curve Endpoints
========================

API endpoints for ECB yield curve data.
"""

# ------------------------------
# Yield Curve view (≤160 LOC)
# ------------------------------
from datetime import date
from typing import Optional, Annotated

from fastapi import APIRouter, Depends, Query
from modules.financehub.backend.core.services.macro_service import MacroDataService

from .models import ECBPeriod
from .utils import get_macro_service

from .yield_curve_logic import (
    build_yield_curve_response,
    build_latest_yield_curve_response,
)


yield_curve_router = APIRouter()


@yield_curve_router.get("/yield-curve", summary="Get ECB Yield Curve")
async def get_ecb_yield_curve(
    service: Annotated[MacroDataService, Depends(get_macro_service)],
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    period: Optional[ECBPeriod] = Query(None, description="Relative period e.g. 1m,6m"),
):
    """Wrapper delegating business logic to `yield_curve_logic`."""
    return await build_yield_curve_response(service, start_date, end_date, period)


# Lite variant – always success (Rule #008)
@yield_curve_router.get("/yield-curve/lite", summary="Get latest ECB Yield Curve (always-success)")
async def get_latest_ecb_yield_curve(
    service: Annotated[MacroDataService, Depends(get_macro_service)],
):
    return await build_latest_yield_curve_response(service)

# Historical US-Treasury passthrough (kept for backward-compat, thin wrapper).
@yield_curve_router.get("/historical-yield-curve", summary="Get Historical U.S. Treasury Yield Curve")
async def get_us_treasury_historical_yield_curve(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
):
    from .yield_curve_logic import build_yield_curve_response
    from modules.financehub.backend.core.services.macro_service import MacroDataService

    dummy_service = MacroDataService()  # logic handles Fed fallback without ECB.
    return await build_yield_curve_response(dummy_service, start_date, end_date, None) 