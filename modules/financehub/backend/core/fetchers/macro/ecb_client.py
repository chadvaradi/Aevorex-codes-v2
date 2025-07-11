"""
ECB SDMX Client - Legacy Compatibility
=====================================

This module provides backward compatibility imports from the new modular ECB client structure.
The original 800+ line file has been split into focused modules under ecb_client/ directory.
"""

import logging

# Import from new modular structure
from .ecb_client import (
    ECBSDMXClient,
    ECB_DATAFLOWS,
    COMPREHENSIVE_ECB_SERIES,
    ECBAPIError
)
from .ecb_client.parsers import (
    parse_ecb_policy_rates_json,
    parse_ecb_yield_curve_json,
    parse_ecb_fx_rates_json,
    parse_ecb_comprehensive_json
)
from .ecb_client.fetchers import (
    fetch_ecb_policy_rates,
    fetch_ecb_fx_rates
)

# Legacy imports for backward compatibility
from .ecb_client.config import (
    ECB_POLICY_DATAFLOW,
    ECB_YIELD_DATAFLOW,
    ECB_FX_DATAFLOW,
    ECB_MONETARY_DATAFLOW,
    ECB_INFLATION_DATAFLOW,
    ECB_EMPLOYMENT_DATAFLOW,
    ECB_GDP_DATAFLOW,
    ECB_BUSINESS_DATAFLOW,
    ECB_MIR_DATAFLOW,
    KEY_ECB_POLICY_RATES,
    KEY_ECB_POLICY_RATES_DAILY,
    KEY_ECB_YIELD_CURVE,
    KEY_ECB_FX_RATES_MAJOR,
    INDIVIDUAL_POLICY_SERIES,
    build_ecb_series_key as _build_ecb_series_key
)

logger = logging.getLogger(__name__)

# Re-export for backward compatibility
__all__ = [
    "ECBSDMXClient",
    "ECBAPIError",
    "fetch_ecb_policy_rates",
    "fetch_ecb_fx_rates",
    "parse_ecb_policy_rates_json",
    "parse_ecb_yield_curve_json", 
    "parse_ecb_fx_rates_json",
    "parse_ecb_comprehensive_json",
    "ECB_DATAFLOWS",
    "COMPREHENSIVE_ECB_SERIES",
    # Legacy constants
    "ECB_POLICY_DATAFLOW",
    "ECB_YIELD_DATAFLOW",
    "ECB_FX_DATAFLOW",
    "ECB_MONETARY_DATAFLOW",
    "ECB_INFLATION_DATAFLOW",
    "ECB_EMPLOYMENT_DATAFLOW",
    "ECB_GDP_DATAFLOW",
    "ECB_BUSINESS_DATAFLOW",
    "ECB_MIR_DATAFLOW",
    "KEY_ECB_POLICY_RATES",
    "KEY_ECB_POLICY_RATES_DAILY",
    "KEY_ECB_YIELD_CURVE",
    "KEY_ECB_FX_RATES_MAJOR",
    "INDIVIDUAL_POLICY_SERIES"
]

# Legacy function name mapping
_build_ecb_series_key = _build_ecb_series_key

logger.info("ECB SDMX Client legacy compatibility module loaded - now using modular structure")