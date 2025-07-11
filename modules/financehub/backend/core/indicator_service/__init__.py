# backend/core.indicator_service/__init__.py
# Public API for the indicator_service module
from .service import calculate_and_format_indicators

__all__ = [
    "calculate_and_format_indicators"
]
