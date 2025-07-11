from __future__ import annotations

import logging
import math
import re
from typing import Any

import pandas as pd

logger = logging.getLogger(__name__)


def _clean_value(value: Any, *, context: str = "") -> Any | None:
    """
    Cleans and validates an input value. Removes placeholder values like None, NaN,
    Inf, and common placeholder strings. Returns a stripped string if the input is a string.
    """
    if value is None or pd.isna(value):
        return None

    if isinstance(value, float):
        if math.isnan(value) or math.isinf(value):
            return None
        return value

    if isinstance(value, str):
        stripped_value = value.strip()
        if not stripped_value:
            return None
        
        placeholder_strings = {
            'none', 'na', 'n/a', '-', '', '#n/a', 'null',
            'nan', 'nat', 'undefined', 'nil', '(blank)', '<na>'
        }
        if stripped_value.lower() in placeholder_strings:
            return None
        
        return stripped_value

    return value


def parse_optional_float(value: Any, *, context: str = "") -> float | None:
    """
    Safely parses a value to a float after cleaning. Handles currency symbols,
    thousand separators, parenthesized negative numbers, percentage signs, and
    K/M/B/T suffixes.
    """
    cleaned_value = _clean_value(value, context=f"{context}_clean_value_for_float")
    if cleaned_value is None:
        return None

    try:
        float_val: float
        if isinstance(cleaned_value, str):
            processed_str = cleaned_value
            processed_str = re.sub(r'[$\u20AC\u00A3\u00A5,]', '', processed_str).strip()
            
            if processed_str.startswith('(') and processed_str.endswith(')'):
                processed_str = '-' + processed_str[1:-1]
            
            if processed_str.endswith('%'):
                 processed_str = processed_str[:-1].strip()

            multipliers = {'k': 1e3, 'm': 1e6, 'b': 1e9, 't': 1e12}
            last_char = processed_str[-1:].lower() if processed_str else ''

            if last_char in multipliers and len(processed_str) > 1:
                num_part_str = processed_str[:-1]
                is_potentially_numeric = re.match(r"^-?\d*\.?\d+$", num_part_str)
                if is_potentially_numeric:
                    try:
                        num_part = float(num_part_str)
                        float_val = num_part * multipliers[last_char]
                    except ValueError:
                         logger.debug(f"Invalid numeric part '{num_part_str}' for multiplier. Original: '{value}'")
                         return None
                else:
                    float_val = float(processed_str)
            else:
                 float_val = float(processed_str)
        elif isinstance(cleaned_value, (int, float)):
            float_val = float(cleaned_value)
        else:
            logger.debug(f"Value '{cleaned_value}' of type {type(cleaned_value)} cannot be converted to float.")
            return None

        if math.isnan(float_val) or math.isinf(float_val):
            return None
            
        return float_val
    except (ValueError, TypeError):
        return None
    except Exception as unexpected_error:
        logger.error(f"Unexpected error parsing '{value}' to float: {unexpected_error}", exc_info=True)
        return None


def parse_optional_int(value: Any, *, context: str = "") -> int | None:
    """
    Safely parses a value to an integer by first converting it to a float
    and checking if it's a whole number within a tolerance.
    """
    float_val = parse_optional_float(value, context=f"{context}_parse_float_for_int")
    if float_val is None:
        return None

    tolerance = 1e-9
    if abs(float_val - round(float_val)) < tolerance:
        try:
            return int(round(float_val))
        except (ValueError, TypeError, OverflowError):
            return None
    else:
        return None

DEFAULT_NA = "N/A"

def safe_format_value(
    value: Any,
    *,
    prefix: str = "",
    suffix: str = "",
    decimals: int | None = None,
    multiplier: float = 1.0,
    na_value: str = DEFAULT_NA,
) -> str:
    """
    Safely formats a value into a string with various options, returning a
    placeholder if the value is None, invalid, or formatting fails.
    """
    if value is None:
        return na_value

    try:
        # First, try to convert the value to a float, applying the multiplier
        numeric_value = float(value) * multiplier

        if decimals is not None:
            formatted_value = f"{numeric_value:,.{decimals}f}"
        else:
            # If no decimals are specified, format as integer if it's a whole number
            if numeric_value == int(numeric_value):
                formatted_value = f"{int(numeric_value):,}"
            else:
                formatted_value = f"{numeric_value:,}" # Default float formatting
        
        return f"{prefix}{formatted_value}{suffix}"

    except (ValueError, TypeError):
        # If conversion to float fails, return the original value as a string
        # if it's not empty, otherwise return the na_value.
        str_value = str(value).strip()
        return str_value if str_value else na_value 