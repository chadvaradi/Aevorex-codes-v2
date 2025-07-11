import pytest
from fastapi.testclient import TestClient

from modules.financehub.backend.main import app

client = TestClient(app)

@pytest.mark.parametrize("dataset", [
    "dividends",
    "splits",
    "fundamentals",
    "overview",  # alias → fundamentals
    "unknown_dataset",  # should gracefully succeed with empty items
])
def test_eodhd_dataset_return_success(dataset):
    """Ensure all supported *and unsupported* datasets return HTTP 200 with structured `status:success`."""
    response = client.get(f"/api/v1/eodhd/AAPL/{dataset}")
    assert response.status_code == 200, response.text
    data = response.json()
    assert data.get("status") == "success"
    assert data.get("symbol") == "AAPL"
    assert data.get("dataset") is not None
    assert "items" in data


def test_ticker_tape_root_always_success():
    """Basic sanity check – ticker tape root should always respond 200 and `status:success|error`."""
    response = client.get("/api/v1/stock/ticker-tape/?limit=12")
    assert response.status_code == 200, response.text
    payload = response.json()
    assert payload["status"] in {"success", "error"}
    # if success, ensure data list length <= requested limit
    if payload["status"] == "success":
        data = payload.get("data", [])
        assert isinstance(data, list)
        assert len(data) <= 12 


def test_ticker_tape_item_unknown_symbol():
    """/stock/ticker-tape/item without or with exotic symbol should still reply 200."""
    response = client.get("/api/v1/stock/ticker-tape/item?symbol=INVALIDSYM")
    assert response.status_code == 200, response.text
    payload = response.json()
    assert payload["status"] in {"success", "error"} 