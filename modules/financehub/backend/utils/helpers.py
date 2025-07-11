# backend/utils/helpers.py
"""
Aevorex FinBot segédfüggvények gyűjtőmodulja.

Ez a modul egyetlen belépési pontként szolgál a `utils` csomagban található
összes specializált segédfüggvényhez. Re-exportálja a funkciókat a
`helpers_parser`, `helpers_service`, és `helpers_client` modulokból,
így a hívó kódnak csak egyetlen helyről kell importálnia.

Példa a használatra:
`from ...utils import helpers`
`float_value = helpers.parse_optional_float("1,234.56")`
"""

# Parser modulból származó függvények importálása
from modules.financehub.backend.utils.helpers_parser import (
    _clean_value,
    parse_optional_float,
    parse_optional_int,
    parse_string_to_aware_datetime,
    parse_timestamp_to_iso_utc,
    _validate_date_string,
    normalize_url,
)

# Service modulból származó függvények importálása
from modules.financehub.backend.utils.helpers_service import (
    get_api_key,
    generate_cache_key,
    get_from_cache_or_fetch,
    safe_get,
    _ensure_datetime_index,
)

# Client modulból származó függvények importálása
from modules.financehub.backend.utils.helpers_client import (
    make_api_request,
)

# Opcionális: __all__ definiálása a tiszta `import *` viselkedésért
__all__ = [
    # parsers
    "_clean_value",
    "parse_optional_float",
    "parse_optional_int",
    "parse_string_to_aware_datetime",
    "parse_timestamp_to_iso_utc",
    "_validate_date_string",
    "normalize_url",
    # services
    "get_api_key",
    "generate_cache_key",
    "get_from_cache_or_fetch",
    "safe_get",
    "_ensure_datetime_index",
    # clients
    "make_api_request",
]
