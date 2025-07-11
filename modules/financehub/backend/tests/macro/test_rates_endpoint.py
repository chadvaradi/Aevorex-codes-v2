import types
import sys
from fastapi.testclient import TestClient

# ------------------------------------------------------------------
# Legacy import patch – certain ECB modules still reference the old
# `macro_data_service` path.  We inject a dummy module to keep the app
# importable until those files get refactored (MR-12).
# ------------------------------------------------------------------
dummy_mod = types.ModuleType("macro_data_service_dummy")
setattr(dummy_mod, "MacroDataService", object)
setattr(dummy_mod, "get_macro_data_service", lambda: None)
sys.modules["modules.financehub.backend.core.services.macro_data_service"] = dummy_mod

from modules.financehub.backend.app_factory import create_app

app = create_app()
client = TestClient(app)

EXPECTED_TENORS = [
    "on",
    "1w",
    "2w",
    "1m",
    "2m",
    "3m",
    "4m",
    "5m",
    "6m",
    "7m",
    "8m",
    "9m",
    "10m",
    "11m",
    "12m",
]


def test_rates_endpoint_structure():
    response = client.get("/api/v1/macro/ecb/rates")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "success"
    rates = data["data"]["rates"]

    # Ensure at least one date entry exists
    assert isinstance(rates, dict) and len(rates) > 0

    # Take first record to validate tenor keys
    first_row = next(iter(rates.values()))
    for tenor in EXPECTED_TENORS:
        assert tenor in first_row, f"Missing tenor key: {tenor}" 