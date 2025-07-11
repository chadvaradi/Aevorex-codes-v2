from __future__ import annotations

import logging
from urllib.parse import urlsplit, urlunsplit, quote, parse_qs, urlencode

from pydantic import HttpUrl, ValidationError

logger = logging.getLogger(__name__)


def normalize_url(url_input: str | None | HttpUrl, *, context: str = "") -> HttpUrl | None:
    """
    Normalizes a URL by ensuring it has a scheme, encoding path/query components,
    and sorting query parameters. Returns a Pydantic HttpUrl object on success.
    """
    if not url_input:
        return None

    url_str = str(url_input)

    try:
        # Basic validation with Pydantic first
        try:
            return HttpUrl(url_str)
        except ValidationError:
            pass # Continue to normalization logic

        parts = urlsplit(url_str)

        scheme = parts.scheme or 'https'
        netloc = parts.netloc
        path = quote(parts.path)

        query_params = parse_qs(parts.query)
        sorted_query = urlencode(sorted(query_params.items()), doseq=True)
        
        normalized_url_str = urlunsplit((scheme, netloc, path, sorted_query, parts.fragment))

        return HttpUrl(normalized_url_str)

    except (ValidationError, ValueError) as e:
        logger.warning(f"[{context}] URL validation/normalization failed for '{url_str}': {e}")
        return None
    except Exception as e:
        logger.error(f"[{context}] Unexpected error normalizing URL '{url_str}': {e}", exc_info=True)
        return None 