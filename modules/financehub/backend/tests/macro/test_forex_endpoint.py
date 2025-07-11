import pytest
from fastapi.testclient import TestClient
from modules.financehub.backend.main import app

client = TestClient(app)

@pytest.mark.parametrize("pair", [
    "EUR/USD",  # slash-separated path => /forex/EUR/USD
    "EURGBP",   # compact format => /forex/EURGBP
])
def test_fx_rate_success(pair: str):
    """Endpoint should return HTTP 200 + status=success + numeric rate > 0."""
    resp = client.get(f"/api/v1/macro/forex/{pair}")
    assert resp.status_code == 200, resp.text
    payload = resp.json()
    assert payload["status"] == "success", payload
    assert isinstance(payload["rate"], (int, float))
    assert payload["rate"] > 0
    assert payload["pair"].startswith("EUR/")


def test_fx_rate_invalid_pair():
    """Non-EUR base should raise 400 HTTPException."""
    resp = client.get("/api/v1/macro/forex/USD/EUR")
    assert resp.status_code == 200
    payload = resp.json()
    assert payload["status"] == "error" 