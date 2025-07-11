"""
Adat-átalakító (parser) segédfüggvények az Aevorex FinBot alkalmazáshoz.

Ez a modul felelős az alapvető adattisztítási, konverziós és validálási
feladatokért, biztosítva, hogy a rendszer más részei (pl. service réteg,
data mappers) megbízható és konzisztens formátumú adatokat kapjanak.
"""

import logging
import math
import re
from datetime import datetime, timezone, tzinfo
from typing import Any
from urllib.parse import urlsplit, urlunsplit, quote, parse_qs, urlencode

import pandas as pd
from pydantic import HttpUrl, ValidationError

try:
    from .logger_config import get_logger
    package_logger = get_logger(f"aevorex_finbot.utils.{__name__}")
except ImportError:
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    package_logger = logging.getLogger(f"aevorex_finbot.utils_fallback.{__name__}")

MIN_VALID_TIMESTAMP_THRESHOLD_SECONDS: float = 631152000.0  # 1990-01-01 00:00:00 UTC

def _clean_value(value: Any, *, context: str = "") -> Any | None:
    """
    Tisztítja és validálja a bemeneti értéket. Eltávolítja a placeholder
    értékeket (None, NaN, Inf, üres/specifikus placeholder stringek).
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
    Biztonságosan megpróbál egy értéket float típusúvá konvertálni, tisztítás után.
    Kezeli a pénznem jeleket, ezres elválasztókat, zárójeles negatív számokat,
    százalékjelet és K/M/B/T szuffixumokat.
    """
    log_prefix = f"[{context}] " if context and context.strip() else ""
    cleaned_value = _clean_value(value, context=f"{log_prefix}_clean_value_for_float")
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
                if re.match(r"^-?\d*\.?\d+$", num_part_str):
                    num_part = float(num_part_str)
                    float_val = num_part * multipliers[last_char]
                else:
                    float_val = float(processed_str)
            else:
                 float_val = float(processed_str)
        elif isinstance(cleaned_value, (int, float)):
            float_val = float(cleaned_value)
        else:
            return None

        if math.isnan(float_val) or math.isinf(float_val):
            return None
        return float_val

    except (ValueError, TypeError):
        return None
    except Exception as unexpected_error:
        package_logger.error(f"{log_prefix}parse_optional_float: Unexpected error parsing '{value}' to float: {unexpected_error}", exc_info=True)
        return None

def parse_optional_int(value: Any, *, context: str = "") -> int | None:
    """
    Biztonságosan megpróbál egy értéket int típusúvá konvertálni (float-on keresztül).
    """
    log_prefix = f"[{context}] " if context and context.strip() else ""
    float_val = parse_optional_float(value, context=f"{log_prefix}parse_float_for_int")
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

def parse_string_to_aware_datetime(
    value: Any,
    *,
    context: str = "",
    target_tz: tzinfo = timezone.utc
) -> datetime | None:
    """
    Különböző bemeneti formátumokból (string, int/float timestamp, datetime)
    "aware" Python datetime objektumot hoz létre, a megadott cél időzónában (alapértelmezetten UTC).
    """
    log_prefix = f"[{context}] " if context and context.strip() else ""
    cleaned_value = _clean_value(value, context=f"{log_prefix}_clean_value_for_aware_dt")
    if cleaned_value is None:
        return None

    dt_object: datetime | None = None

    try:
        if isinstance(cleaned_value, datetime):
            dt_object = cleaned_value

        elif isinstance(cleaned_value, (int, float)):
            numeric_ts = float(cleaned_value)
            if numeric_ts < MIN_VALID_TIMESTAMP_THRESHOLD_SECONDS:
                return None
            dt_object = datetime.fromtimestamp(numeric_ts, tz=timezone.utc)

        elif isinstance(cleaned_value, str):
            pd_ts = pd.to_datetime(cleaned_value, errors='coerce', utc=True, infer_datetime_format=True, dayfirst=False)
            if pd.isna(pd_ts):
                return None
            else:
                dt_object = pd_ts.to_pydatetime()
        
        if dt_object is None:
            return None

        if dt_object.tzinfo is None:
            dt_object = dt_object.replace(tzinfo=target_tz)
        else:
            dt_object = dt_object.astimezone(target_tz)
        
        return dt_object

    except (ValueError, TypeError, pd.errors.ParserError):
        return None
    except Exception as e:
        package_logger.error(f"{log_prefix}parse_string_to_aware_datetime: Unexpected error parsing '{value}': {e}", exc_info=True)
        return None

def parse_timestamp_to_iso_utc(timestamp: Any, *, default_tz: tzinfo | None = None, context: str = "") -> str | None:
    """
    Bármilyen dátum-szerű inputot (timestamp, string, datetime) UTC ISO 8601 formátumú stringgé alakít.
    """
    log_prefix = f"[{context}] " if context and context.strip() else ""
    aware_dt = parse_string_to_aware_datetime(timestamp, context=log_prefix, target_tz=timezone.utc)
    if aware_dt:
        return aware_dt.isoformat().replace('+00:00', 'Z')
    return None

def _validate_date_string(v: Any, context: str = "") -> str | None:
    """
    Validálja, hogy egy érték érvényes dátumstring-e (YYYY-MM-DD), és visszaadja azt.
    """
    log_prefix = f"[{context}] " if context and context.strip() else ""
    if v is None:
        return None
    
    date_str = str(v).strip()
    try:
        datetime.strptime(date_str, "%Y-%m-%d")
        return date_str
    except ValueError:
        package_logger.debug(f"{log_prefix}_validate_date_string: Invalid date format for '{v}'. Expected YYYY-MM-DD.")
        return None

def normalize_url(url_input: str | None | HttpUrl, *, context: str = "") -> HttpUrl | None:
    """
    Normalizálja és validálja az URL-t, eltávolítva a felesleges lekérdezési paramétereket.
    """
    log_prefix = f"[{context}] " if context and context.strip() else ""
    
    if not url_input:
        return None
        
    try:
        # Pydantic-kal validáljuk és konvertáljuk az URL-t
        if isinstance(url_input, str):
            url_str = url_input.strip()
            if not url_str.startswith(('http://', 'https://')):
                url_str = 'https://' + url_str
            valid_url = HttpUrl(url_str)
        else:
            valid_url = url_input

        # URL darabolása a komponenseire
        parts = urlsplit(str(valid_url))
        
        # Lekérdezési paraméterek feldolgozása
        query_params = parse_qs(parts.query)
        
        # Normalizált komponensek összeállítása
        normalized_parts = (
            parts.scheme,
            parts.netloc,
            quote(parts.path),
            urlencode(query_params, doseq=True),
            ''  # fragment eltávolítása
        )
        
        # Visszaalakítás stringgé és újravalidálás
        final_url_str = urlunsplit(normalized_parts)
        final_url = HttpUrl(final_url_str)
        
        return final_url
        
    except (ValidationError, TypeError, ValueError) as e:
        package_logger.warning(f"{log_prefix}normalize_url: URL normalization failed for input '{url_input}'. Error: {e}", exc_info=False)
        return None
