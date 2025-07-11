from __future__ import annotations

import logging
from datetime import datetime, timezone, tzinfo
from typing import Any

import pandas as pd

logger = logging.getLogger(__name__)

MIN_VALID_TIMESTAMP_THRESHOLD_SECONDS: float = 631152000.0  # 1990-01-01 00:00:00 UTC

def _clean_value(value: Any) -> Any | None:
    """Simplified cleaner for this context."""
    if value is None or pd.isna(value):
        return None
    if isinstance(value, str):
        stripped = value.strip()
        return stripped if stripped else None
    return value


def parse_string_to_aware_datetime(
    value: Any,
    *,
    context: str = "",
    target_tz: tzinfo = timezone.utc
) -> datetime | None:
    """
    Parses various input formats (string, int/float timestamp, datetime) into
    an aware Python datetime object in the specified target timezone (default UTC).
    """
    cleaned_value = _clean_value(value)
    if cleaned_value is None:
        return None

    dt_object: datetime | None = None

    try:
        if isinstance(cleaned_value, datetime):
            dt_object = cleaned_value
        elif isinstance(cleaned_value, (int, float)):
            numeric_ts = float(cleaned_value)
            if numeric_ts < MIN_VALID_TIMESTAMP_THRESHOLD_SECONDS:
                logger.warning(
                    f"[{context}] Numeric timestamp {numeric_ts:.3f} is below threshold. Original: '{value}'."
                )
                return None
            dt_object = datetime.fromtimestamp(numeric_ts, tz=timezone.utc)
        elif isinstance(cleaned_value, str):
            pd_ts = pd.to_datetime(cleaned_value, errors='coerce', utc=True)
            if not pd.isna(pd_ts):
                dt_object = pd_ts.to_pydatetime()

        if dt_object is None:
            return None

        if dt_object.tzinfo is None:
            dt_object = dt_object.replace(tzinfo=timezone.utc)

        return dt_object.astimezone(target_tz)

    except (ValueError, TypeError, pd.errors.ParserError) as e:
        logger.debug(f"Could not parse '{value}' to datetime: {e}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error parsing '{value}' to datetime: {e}", exc_info=True)
        return None

def parse_timestamp_to_iso_utc(timestamp: Any, *, default_tz: tzinfo | None = None, context: str = "") -> str | None:
    """
    Converts various timestamp formats to an ISO 8601 string in UTC.
    """
    aware_dt = parse_string_to_aware_datetime(timestamp, context=context)
    if aware_dt:
        return aware_dt.strftime('%Y-%m-%dT%H:%M:%SZ')
    return None


def _validate_date_string(v: Any, context: str = "") -> str | None:
    """
    Validates if a value can be parsed as a date and returns it in YYYY-MM-DD format.
    """
    if not isinstance(v, str):
        return None
    try:
        dt = pd.to_datetime(v)
        return dt.strftime('%Y-%m-%d')
    except (ValueError, TypeError):
        return None 