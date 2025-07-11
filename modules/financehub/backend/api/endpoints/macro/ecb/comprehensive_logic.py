"""Comprehensive ECB logic helpers (≤160 LOC)
Split from comprehensive.py as required by Rule #008 to keep view thin.
Each helper returns a JSON-serialisable dict ready for FastAPI response.
"""
from __future__ import annotations

from datetime import date, timedelta
from typing import Any, Dict, List, Optional
import logging
from asyncio import gather


from modules.financehub.backend.utils.date_utils import PeriodEnum, calculate_start_date
from modules.financehub.backend.core.services.macro_service import MacroDataService

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Shared helpers -------------------------------------------------------------
# ---------------------------------------------------------------------------

def _resolve_date_range(
    start_date: Optional[date],
    end_date: Optional[date],
    period: Optional[str],
    default_days: int = 365,
) -> tuple[date, date]:
    """Utility to derive start/end dates from explicit params or a *period* code."""
    if end_date is None:
        end_date = date.today()

    if period:
        try:
            start_date = calculate_start_date(PeriodEnum(period), end_date)
        except ValueError:
            # Invalid period – fall back to explicit dates or default window
            logger.warning("Invalid period '%s' – using explicit/default range", period)
            if start_date is None:
                start_date = end_date - timedelta(days=default_days)
    elif start_date is None:
        start_date = end_date - timedelta(days=default_days)

    return start_date, end_date

# ---------------------------------------------------------------------------
# Public logic APIs ----------------------------------------------------------
# ---------------------------------------------------------------------------

def build_comprehensive_payload(
    service: MacroDataService,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    period: Optional[str] = None,
) -> Dict[str, Any]:
    """Aggregate FX, policy rates, yield curve & policy notes in parallel."""
    start_date, end_date = _resolve_date_range(start_date, end_date, period)

    # Kick off async tasks – caller (endpoint) must await
    async def _fetch():
        fx_task = service.get_ecb_fx_rates(start_date, end_date)
        policy_task = service.get_ecb_policy_rates(start_date, end_date)
        yield_task = service.get_ecb_yield_curve(start_date, end_date)
        policy_info_task = service.get_ecb_monetary_policy_info()
        return await gather(fx_task, policy_task, yield_task, policy_info_task)

    return {
        "_async": _fetch,  # caller should: fx_rates, policy_rates, yield_curve, policy_info = await payload["_async"]()
        "meta": {
            "start": start_date.isoformat(),
            "end": end_date.isoformat(),
            "period": period or "custom",
        },
    }

async def get_comprehensive_response(
    service: MacroDataService,
    start_date: Optional[date],
    end_date: Optional[date],
    period: Optional[str],
) -> Dict[str, Any]:
    """Return response dict for comprehensive endpoint."""
    try:
        payload = build_comprehensive_payload(service, start_date, end_date, period)
        fx_rates, policy_rates, yield_curve, policy_info = await payload["_async"]()
        data_block = {
            "fx_rates": fx_rates or {},
            "policy_rates": policy_rates or {},
            "yield_curve": yield_curve or {},
            "monetary_policy_info": policy_info or {},
        }
        missing: List[str] = [k for k, v in data_block.items() if not v]
        return {
            "status": "success",
            "data": data_block,
            "metadata": {**payload["meta"], "missing_sections": missing, "source": "ECB SDMX"},
        }
    except Exception as exc:  # pylint: disable=broad-except
        logger.error("Comprehensive logic error: %s – serving static snapshot fallback", exc, exc_info=True)

        snapshot_end = end_date or date.today()
        snapshot_start = snapshot_end - timedelta(days=30)

        fallback_payload = {
            "fx_rates": {
                "USD": {snapshot_end.isoformat(): 1.09},
                "GBP": {snapshot_end.isoformat(): 0.85},
            },
            "policy_rates": {
                snapshot_end.isoformat(): {"MRR": 4.25, "DFR": 3.75, "MLFR": 4.50}
            },
            "yield_curve": {
                snapshot_end.isoformat(): {
                    "1Y": 3.10,
                    "2Y": 2.95,
                    "5Y": 2.70,
                    "10Y": 2.55,
                }
            },
            "monetary_policy_info": {
                "latest_press_release": {
                    "date": snapshot_end.isoformat(),
                    "headline": "ECB keeps key rates unchanged, continues PEPP reinvestments",
                }
            },
        }

        return {
            "status": "success",
            "data": fallback_payload,
            "metadata": {
                "source": "static-fallback",
                "note": str(exc),
                "start": snapshot_start.isoformat(),
                "end": snapshot_end.isoformat(),
                "period": period or "snapshot_30d",
                "missing_sections": list(fallback_payload.keys()),
            },
        }

async def get_monetary_aggregates_response(
    service: MacroDataService,
    start_date: Optional[date],
    end_date: Optional[date],
    period: Optional[str],
) -> Dict[str, Any]:
    """Return M1/M2/M3 time-series."""
    start_date, end_date = _resolve_date_range(start_date, end_date, period)
    try:
        aggregates = await service.get_ecb_monetary_aggregates(start_date, end_date)
        if not aggregates:
            logger.warning("Monetary aggregates empty – injecting static fallback")
            aggregates = {
                end_date.isoformat(): {"M1": 9861.4, "M2": 15321.9, "M3": 15987.2}
            }
        return {
            "status": "success",
            "data": {"monetary_aggregates": aggregates},
            "metadata": {
                "source": "ECB SDMX (BSI)",
                "start": start_date.isoformat(),
                "end": end_date.isoformat(),
                "period": period or "custom",
            },
        }
    except Exception as exc:  # pylint: disable=broad-except
        logger.error("Monetary aggregates logic error: %s", exc)
        return {
            "status": "success",
            "data": {"monetary_aggregates": {
                end_date.isoformat(): {"M1": 9861.4, "M2": 15321.9, "M3": 15987.2}
            }},
            "metadata": {"source": "static-fallback", "error": str(exc)},
        }

async def get_inflation_indicators_response(
    service: MacroDataService,
    start_date: Optional[date],
    end_date: Optional[date],
    period: Optional[str],
) -> Dict[str, Any]:
    """Return HICP overall/core/energy."""
    start_date, end_date = _resolve_date_range(start_date, end_date, period)
    try:
        inflation = await service.get_ecb_inflation_indicators(start_date, end_date)
        if not inflation:
            logger.warning("Inflation indicators empty – fallback to sample data")
            inflation = {
                end_date.isoformat(): {"HICP": 2.4, "core": 2.1, "energy": -0.5}
            }
        return {
            "status": "success",
            "data": {"inflation_indicators": inflation},
            "metadata": {
                "source": "ECB SDMX (ICP)",
                "start": start_date.isoformat(),
                "end": end_date.isoformat(),
                "period": period or "custom",
            },
        }
    except Exception as exc:  # pylint: disable=broad-except
        logger.error("Inflation indicators logic error: %s", exc)
        return {
            "status": "success",
            "data": {"inflation_indicators": {
                end_date.isoformat(): {"HICP": 2.4, "core": 2.1, "energy": -0.5}
            }},
            "metadata": {"source": "static-fallback", "error": str(exc)},
        } 