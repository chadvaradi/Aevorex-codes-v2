"""
ECB Yield Curve Endpoints
========================

API endpoints for ECB yield curve data.
"""

# ------------------------------
# Yield Curve view (≤160 LOC)
# ------------------------------
from datetime import date, timedelta
from typing import Optional, Annotated

from fastapi import APIRouter, Depends, Query, Request
from modules.financehub.backend.core.services.macro_service import MacroDataService

from .models import ECBPeriod
from .utils import get_macro_service

from .yield_curve_logic import build_yield_curve_response


yield_curve_router = APIRouter()


@yield_curve_router.get("/yield-curve", summary="Get ECB Yield Curve")
async def get_ecb_yield_curve(
    service: Annotated[MacroDataService, Depends(get_macro_service)],
    request: Request,
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    period: Optional[ECBPeriod] = Query(None, description="Relative period e.g. 1m,6m"),
):
    """Wrapper delegating business logic to `yield_curve_logic`."""
    # Soft paywall clamp based on plan (dev: header override allowed)
    plan = request.session.get("plan", "free") if hasattr(request, "session") else "free"
    try:
        from modules.financehub.backend.config import settings as _settings
        hdr_plan = request.headers.get("x-plan")
        if _settings.ENVIRONMENT.NODE_ENV != "production" and hdr_plan:
            plan = hdr_plan
    except Exception:
        pass

    if end_date and start_date:
        span_days = (end_date - start_date).days
        allowed_days = 7  # default free
        if plan in ("pro",):
            allowed_days = 30
        elif plan in ("team", "enterprise"):
            allowed_days = 365 * 3
        if span_days > allowed_days:
            start_date = end_date - timedelta(days=allowed_days)
    return await build_yield_curve_response(service, start_date, end_date, period)


# Removed obsolete lite variant (build_latest_yield_curve_response deprecated)
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