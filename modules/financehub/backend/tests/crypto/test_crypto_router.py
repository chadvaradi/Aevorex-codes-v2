import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch

from modules.financehub.backend.main import app
from modules.financehub.backend.api.deps import get_cache_service

# ---------------------------------------------------------------------------
# In-memory cache stub (reuse pattern from macro tests)
# ---------------------------------------------------------------------------
class InMemoryCache:  # noqa: D401 – simple helper for tests
    def __init__(self):
        self._store = {}

    async def get(self, key):
        return self._store.get(key)

    async def set(self, key, value, **kwargs):
        self._store[key] = value

    async def delete(self, key):
        self._store.pop(key, None)


@pytest.fixture(scope="module", autouse=True)
def override_cache_dependency():
    cache = InMemoryCache()

    async def _get_cache():
        return cache

    app.dependency_overrides[get_cache_service] = _get_cache
    yield
    app.dependency_overrides.clear()


client = TestClient(app)

# ---------------------------------------------------------------------------
# Helper: build dummy HTTP response object compatible with httpx
# ---------------------------------------------------------------------------
class DummyResponse:
    def __init__(self, status_code: int, json_data):
        self.status_code = status_code
        self._json = json_data

    def json(self):
        return self._json


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

@patch("modules.financehub.backend.api.endpoints.crypto.crypto.httpx.AsyncClient.get")
@pytest.mark.asyncio
async def test_get_crypto_symbols(mock_get):
    # Mock CoinGecko /coins/markets
    dummy_symbols = [
        {"symbol": "btc"},
        {"symbol": "eth"},
        {"symbol": "sol"},
    ]
    mock_get.return_value = DummyResponse(200, dummy_symbols)

    response = client.get("/api/v1/crypto/symbols")
    assert response.status_code == 200, response.text
    data = response.json()
    assert "symbols" in data
    assert "BTC-USD" in data["symbols"]
    assert len(data["symbols"]) == 3


@patch("modules.financehub.backend.api.endpoints.crypto.crypto.httpx.AsyncClient.get")
@pytest.mark.asyncio
async def test_get_crypto_rate(mock_get):
    # The endpoint issues one HTTP request to /simple/price with params,
    # Return quote for bitcoin
    def _mocked_get(url, params=None, **kwargs):  # noqa: D401
        if "simple/price" in url:
            return DummyResponse(200, {"bitcoin": {"usd": 60000}})
        elif "coins/list" in url:
            return DummyResponse(200, [{"id": "bitcoin", "symbol": "btc"}])
        else:
            return DummyResponse(404, {})

    mock_get.side_effect = _mocked_get

    response = client.get("/api/v1/crypto/BTC-USD")
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["status"] == "success"
    assert data["rate"] == 60000
    assert data["metadata"]["symbol"] == "BTC-USD" 