import json
from datetime import date, timedelta
from financehub.backend.core.fetchers.macro.ecb_client import _download_ecb_sdmx, _parse_ecb_json
from financehub.backend.core.services.macro_service import ECBAPIError

class ECBSDMXClient:
    def __init__(self, cache, cache_ttl_seconds):
        self.cache = cache
        self.cache_ttl_seconds = cache_ttl_seconds

    async def get_yield_curve(self) -> dict[str, dict[str, float]]:
        """
        Fetches and parses the ECB yield curve for a recent period.
        """
        cache_key = "ecb_yield_curve_historical_v1" # New cache key for historical data
        if self.cache:
            cached_data = await self.cache.get(cache_key)
            if cached_data:
                logger.info("Returning cached ECB historical yield curve.")
                return json.loads(cached_data)

        try:
            # Fetch data for the last 5 years to provide a good historical range
            start_date = date.today() - timedelta(days=1825)
            raw_data = await _download_ecb_sdmx(KEY_ECB_YIELD_CURVE_FILTER, start_date)
            parsed_data = _parse_ecb_json(raw_data)

            if not parsed_data:
                logger.warning("Parsing ECB yield curve resulted in an empty dictionary. Not caching.")
                raise ECBAPIError("Failed to parse yield curve from ECB API; result was empty.")

            # Return the full historical data, not just the latest curve
            if self.cache:
                logger.info(f"Caching new ECB historical yield curve under key: {cache_key}")
                await self.cache.set(
                    cache_key, json.dumps(parsed_data), ttl=self.cache_ttl_seconds
                )
            
            return parsed_data
        except ECBAPIError as e:
            raise e
        except Exception as e:
            logger.error(f"An unexpected error occurred in ECBSDMXClient get_yield_curve: {e}", exc_info=True)
            raise ECBAPIError(f"An unexpected error occurred: {e}") from e

    async def fetch_ecb_policy_rates(self):
        # Fallback logic can be added here if needed, e.g., serve from cache
        return None

    async def get_ecb_monetary_policy_info(self):
        """
        Returns a placeholder for monetary policy info.
        NOTE: A structured SDMX data source for this qualitative information was not found
        in the ECB Data Portal. This requires NLP analysis of press conferences, which is
        beyond the scope of a simple fetcher.
        """
        return {
            "current_stance": "data-dependent",
            "summary": "Future policy decisions will be based on incoming economic data and the evolving inflation outlook.",
            "data_source": "Placeholder - Qualitative assessment"
        }

    async def get_bubor_history(self, start_date: date, end_date: date):
        """
        Fetches BUBOR history. Raises BUBORAPIError on failure, no fallback.
        """
        # ... existing code ... 