"""View layer for ECB rates – slim wrapper delegating heavy lifting to rates_logic."""

from datetime import date
from typing import Optional, Dict, Any

from fastapi import APIRouter, Depends, Query

# Shared helpers / enums
from modules.financehub.backend.utils.logger_config import get_logger

from .utils import get_macro_service
from . import rates_logic as rl  # short-end grid
from .rates_extended_logic import (
    monetary_policy_response,
    retail_rates_response,
)
from modules.financehub.backend.core.services.macro_service import MacroDataService

# Structured logger (≤160 LOC rule compliant)
logger = get_logger(__name__)

# ⬇ Only minimal code – keep <160 LOC (Rule #008)

rates_router = APIRouter()


@rates_router.get("/rates", summary="Get ECB Short-End Rates (BUBOR parity)")
async def get_ecb_rates(
    service: MacroDataService = Depends(get_macro_service),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    period: Optional[str] = Query(None, description="1d,1w,1m,6m,1y…"),
) -> Dict[str, Any]:
    """Return O/N … 12 M tenor-grid mapped from ECB FM dataflow."""
    return rl.get_short_end_rates(service, start_date, end_date, period)

@rates_router.get("/rates/all", include_in_schema=False)
async def get_ecb_rates_alias(
    service: MacroDataService = Depends(get_macro_service),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    period: Optional[str] = None,
):
    """Legacy alias → forwards params to primary handler."""
    return await get_ecb_rates(service, start_date, end_date, period)

@rates_router.get("/monetary-policy", summary="Get ECB Monetary Policy Info")
async def get_ecb_monetary_policy(service: MacroDataService = Depends(get_macro_service)) -> Dict[str, Any]:
    """Wrapper (≤60 LOC) delegating to extended logic."""
    return await monetary_policy_response(service)

@rates_router.get("/retail-rates", summary="Get ECB Retail Bank Interest Rates")
async def get_ecb_retail_rates(
    service: MacroDataService = Depends(get_macro_service),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    period: Optional[str] = Query(None),
) -> Dict[str, Any]:
    """Wrapper delegating to extended logic."""
    return await retail_rates_response(service, start_date, end_date, period) 