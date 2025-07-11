from datetime import datetime
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

DEPRECATED_PATHS = {
    "/api/v1/macro/curve",  # prefix match
    "/api/v1/auth/google/authorize",
}

class DeprecatedRouteMonitorMiddleware(BaseHTTPMiddleware):
    """Increment Redis counters for deprecated endpoint hits."""

    def __init__(self, app, cache_service_factory):
        super().__init__(app)
        self._cache_factory = cache_service_factory

    async def dispatch(self, request: Request, call_next):  # type: ignore[override]
        path = request.url.path
        matched = None
        for deprecated in DEPRECATED_PATHS:
            if path.startswith(deprecated):
                matched = deprecated
                break

        if matched:
            # Lazy fetch cache (Redis) – tolerate absence
            try:
                cache = await self._cache_factory(request)
                key = f"deprecated:{matched}:{datetime.utcnow().date()}"
                await cache.set(key, (int(await cache.get(key) or 0) + 1), ttl=60 * 60 * 24 * 35)
            except Exception:  # noqa: BLE001
                pass
        # proceed
        response: Response = await call_next(request)
        return response 