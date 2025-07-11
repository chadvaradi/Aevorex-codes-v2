"""
ECB (European Central Bank) endpoints - Legacy Compatibility
===========================================================

This module provides backward compatibility imports from the new modular ECB endpoints structure.
The original 570+ line file has been split into focused modules under ecb/ directory.
"""

import logging

# Import from new modular structure
from .ecb import router, PeriodEnum, calculate_start_date, get_macro_service

logger = logging.getLogger(__name__)

# Re-export for backward compatibility
__all__ = [
    "router",
    "PeriodEnum",
    "calculate_start_date",
    "get_macro_service"
]

logger.info("ECB endpoints legacy compatibility module loaded - now using modular structure") 