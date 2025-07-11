from fastapi.testclient import TestClient
from modules.financehub.backend.main import app
from modules.financehub.backend.api.endpoints.macro.bubor import get_macro_service


class _FakeMacroService:  # pylint: disable=too-few-public-methods
    async def get_bubor_history(self, start_date, end_date):  # noqa: D401
        # Return minimal realistic structure for two dates
        return {
            "2025-07-10": {
                "O/N": 6.50,
                "1W": 6.50,
                "1M": 6.50,
            },
            "2025-07-11": {
                "O/N": 6.49,
                "1W": 6.49,
                "1M": 6.48,
            },
        }


def _override_macro_service():  # noqa: D401
    return _FakeMacroService()


aapp = app  # alias to avoid linters complaining

aapp.dependency_overrides[get_macro_service] = _override_macro_service

client = TestClient(aapp)


def test_bubor_success():
    resp = client.get("/api/v1/macro/bubor/")
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["status"] == "success"
    assert "rates" in data and data["rates"], data
    latest_day = sorted(data["rates"].keys())[-1]
    assert "O/N" in data["rates"][latest_day]


def test_bubor_period_param():
    resp = client.get("/api/v1/macro/bubor/?period=1w")
    assert resp.status_code == 200 