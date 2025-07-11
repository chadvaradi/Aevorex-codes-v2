from __future__ import annotations

import hashlib
import json
from typing import Any


def generate_cache_key(
    data_type: str,
    source: str,
    symbol: str,
    *,
    params: dict[str, Any] | None = None,
    prefix: str = "finbot_cache"
) -> str:
    """
    Generates a consistent cache key from structured data. Sorts parameters
    to ensure that the same request always yields the same key.
    """
    key_parts = {
        "type": str(data_type).strip().lower(),
        "source": str(source).strip().lower(),
        "symbol": str(symbol).strip().upper()
    }

    if params:
        # Sort params by key to ensure consistent hash
        sorted_params = sorted(params.items())
        # Convert all param values to string for consistency
        str_params = {k: str(v) for k, v in sorted_params}
        key_parts["params"] = json.dumps(str_params, sort_keys=True)

    # Use compact JSON representation
    key_string = json.dumps(key_parts, sort_keys=True, separators=(',', ':'))

    # Use SHA256 for a strong, unique hash
    hash_object = hashlib.sha256(key_string.encode('utf-8'))
    
    return f"{prefix}:{hash_object.hexdigest()}" 