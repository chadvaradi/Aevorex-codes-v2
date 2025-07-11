"""
ECB SDMX Client Package
======================

Modular ECB SDMX client for fetching European Central Bank data.
"""

from .client import ECBSDMXClient
from .fetchers import (
    fetch_ecb_policy_rates,
    fetch_ecb_yield_curve,
    fetch_ecb_fx_rates,
    fetch_ecb_comprehensive_data,
    fetch_ecb_bop_data,
    fetch_ecb_sts_data
)
from .config import ECB_DATAFLOWS, COMPREHENSIVE_ECB_SERIES
from .exceptions import ECBAPIError, ECBDataParsingError
from .hicp_fetcher import fetch_ecb_hicp_data  # noqa: F401
from .sec_fetcher import fetch_ecb_sec_data  # noqa: F401
from .ivf_fetcher import fetch_ecb_ivf_data  # noqa: F401
from .cbd_fetcher import fetch_ecb_cbd_data  # noqa: F401
from .rpp_fetcher import fetch_ecb_rpp_data  # noqa: F401
from .cpp_fetcher import fetch_ecb_cpp_data  # noqa: F401
from .bls_fetcher import fetch_ecb_bls_data  # noqa: F401
from .spf_fetcher import fetch_ecb_spf_data  # noqa: F401
from .ciss_fetcher import fetch_ecb_ciss_data  # noqa: F401
from .estr_fetcher import fetch_ecb_estr_rate  # noqa: F401

__all__ = [
    "ECBSDMXClient",
    "fetch_ecb_policy_rates",
    "fetch_ecb_yield_curve", 
    "fetch_ecb_fx_rates",
    "fetch_ecb_comprehensive_data",
    "fetch_ecb_bop_data",
    "fetch_ecb_sts_data",
    "ECB_DATAFLOWS",
    "COMPREHENSIVE_ECB_SERIES",
    "ECBAPIError",
    "ECBDataParsingError"
]

__all__ += [
    "fetch_ecb_sec_data",
    "fetch_ecb_ivf_data",
    "fetch_ecb_cbd_data",
    "fetch_ecb_rpp_data",
    "fetch_ecb_cpp_data",
    "fetch_ecb_bls_data",
    "fetch_ecb_spf_data",
    "fetch_ecb_ciss_data",
    "fetch_ecb_estr_rate",
]

__version__ = "1.0.0" 