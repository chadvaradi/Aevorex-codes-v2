import pytest
from typing import TYPE_CHECKING

# Conditional imports for type checkers / linters only (avoid runtime cost)
if TYPE_CHECKING:  # pragma: no cover
    from fastapi.testclient import TestClient  # noqa: F401
    from unittest.mock import patch, MagicMock  # noqa: F401

# Runtime imports (used below but may be flagged as F401 in skipped tests)
from fastapi.testclient import TestClient  # noqa: F401
from unittest.mock import patch, MagicMock  # noqa: F401

# Disable entire module during CI until real Google OAuth flow is re-enabled.
pytest.skip("Google OAuth disabled – skipping auth test module", allow_module_level=True)

# Adjust the import path based on your project structure
from modules.financehub.backend.main import app 

# Use a TestClient that includes the auth router
# This assumes your main app instance is named 'app'
# and you can mount the auth_router to it for testing.
# A better approach might be to create a test-specific app instance.
client = TestClient(app)

# --- Mocks ---
MOCK_STATE = "mock_oauth_state"
MOCK_USER_INFO = {
    "email": "test.user@example.com",
    "name": "Test User",
    "picture": "https://example.com/picture.jpg",
}
MOCK_TOKEN = {
    "access_token": "mock_access_token",
    "refresh_token": "mock_refresh_token",
    "token_type": "Bearer",
    "expires_in": 3600,
}
MOCK_NEW_TOKEN = {
    "access_token": "new_mock_access_token",
    "refresh_token": "mock_refresh_token", # Refresh token might stay the same
    "token_type": "Bearer",
    "expires_in": 3600,
}

@pytest.fixture(scope="module")
def test_client_with_session():
    """
    Fixture to provide a single TestClient instance with a persistent session
    across the entire test module.
    """
    with TestClient(app) as client:
        # Enable auth for all tests using this client
        monkeypatch = pytest.MonkeyPatch()
        monkeypatch.setattr("modules.financehub.backend.api.endpoints.auth.settings.GOOGLE_AUTH.ENABLED", True)
        yield client
        monkeypatch.undo()

# --- Test Cases ---

def test_login_disabled_returns_404(monkeypatch):
    """
    Test that /login returns 404 if Google Auth is disabled in settings.
    """
    monkeypatch.setattr("modules.financehub.backend.api.endpoints.auth.settings.GOOGLE_AUTH.ENABLED", False)
    # Use a new client instance that doesn't have the module-scoped monkeypatch
    with TestClient(app) as disabled_client:
        response = disabled_client.get("/api/v1/auth/login")
        assert response.status_code == 404

@patch("modules.financehub.backend.api.endpoints.auth.OAuth2Session")
def test_full_login_flow_and_redirect(mock_oauth_session, test_client_with_session):
    """
    Tests the full login flow:
    1. Call /login with a 'next' parameter.
    2. Mock the Google response and call /callback.
    3. Verify the final redirect goes to the 'next' parameter URL.
    """
    # --- 1. Login Step ---
    mock_google_login = MagicMock()
    mock_google_login.authorization_url.return_value = ("https://accounts.google.com/auth", MOCK_STATE)
    mock_oauth_session.return_value = mock_google_login

    # Request login, intending to be redirected to /dashboard afterwards
    login_response = test_client_with_session.get("/api/v1/auth/login?next=/dashboard")
    assert login_response.status_code == 307
    
    # --- 2. Callback Step ---
    mock_google_callback = MagicMock()
    mock_google_callback.fetch_token.return_value = MOCK_TOKEN
    mock_google_callback.get.return_value.json.return_value = MOCK_USER_INFO
    # IMPORTANT: The mock needs to be reset for the callback context
    mock_oauth_session.return_value = mock_google_callback

    # Simulate the user coming back from Google
    callback_url = f"/api/v1/auth/callback?state={MOCK_STATE}&code=mock_code"
    callback_response = test_client_with_session.get(callback_url)

    # --- 3. Assertions ---
    # Assert we are redirected to the originally requested 'next' URL
    assert callback_response.status_code == 307
    assert callback_response.headers["location"] == "/dashboard"

    # Now, check the session status to confirm user is logged in
    status_response = test_client_with_session.get("/api/v1/auth/status")
    assert status_response.status_code == 200
    data = status_response.json()
    assert data["status"] == "authenticated"
    assert data["user"]["email"] == MOCK_USER_INFO["email"]


def test_callback_invalid_state(test_client_with_session):
    """
    Test that the /callback endpoint fails if the state is invalid.
    The session is already established by the previous test in the module.
    """
    # The session from the previous test should have 'oauth_state' set.
    # We call the callback with a different state.
    response = test_client_with_session.get("/api/v1/auth/callback?state=tampered_state&code=mock_code")
    assert response.status_code == 401


@patch("modules.financehub.backend.api.endpoints.auth.OAuth2Session")
def test_refresh_token_flow(mock_oauth_session, test_client_with_session):
    """
    Tests the token refresh flow. Assumes user is already logged in
    from the `test_full_login_flow_and_redirect` test case.
    """
    # --- Setup Mocks for Refresh ---
    mock_google_refresh = MagicMock()
    # Simulate an expired token by having .authorized return False
    type(mock_google_refresh).authorized = pytest.PropertyMock(return_value=False)
    mock_google_refresh.refresh_token.return_value = MOCK_NEW_TOKEN
    mock_oauth_session.return_value = mock_google_refresh

    # --- Call Refresh Endpoint ---
    response = test_client_with_session.post("/api/v1/auth/refresh-token")

    # --- Assertions ---
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "token_refreshed"
    assert data["token"]["access_token"] == MOCK_NEW_TOKEN["access_token"]

def test_logout(test_client_with_session):
    """
    Test that the /logout endpoint clears the user session after a login.
    """
    # The session should still be active from previous tests.
    # First, confirm status is authenticated.
    status_response = test_client_with_session.get("/api/v1/auth/status")
    assert status_response.json()["status"] == "authenticated"

    # Now, logout
    logout_response = test_client_with_session.post("/api/v1/auth/logout")
    assert logout_response.status_code == 200
    assert logout_response.json() == {"status": "logged_out"}

    # Finally, confirm status is unauthenticated
    final_status_response = test_client_with_session.get("/api/v1/auth/status")
    assert final_status_response.status_code == 200
    assert final_status_response.json()["status"] == "unauthenticated" 