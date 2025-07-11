from fastapi import APIRouter, status
from fastapi.responses import JSONResponse, RedirectResponse

auth_router = APIRouter(prefix="/auth", tags=["Auth"])


@auth_router.get("/login", summary="OAuth2 login redirect")
async def login_oauth() -> RedirectResponse:
    """Redirect the user to the configured OAuth provider.  
    NOTE: Stub implementation – in production this issues a real OAuth redirect.
    """
    return RedirectResponse(url="/docs")


@auth_router.get("/callback", summary="OAuth2 callback handler")
async def oauth_callback(code: str | None = None, error: str | None = None) -> JSONResponse:
    if error:
        return JSONResponse({"success": False, "error": error}, status_code=status.HTTP_400_BAD_REQUEST)
    # In a real impl we'd exchange `code` for a token & set cookie
    return JSONResponse({"success": True, "token": "mock-token"})


@auth_router.get("/status", summary="Auth status (mock)")
async def auth_status() -> JSONResponse:
    """Return mock auth status. Production version will verify session cookie."""
    return JSONResponse({"authenticated": False})


@auth_router.post("/logout", summary="Logout user", status_code=status.HTTP_204_NO_CONTENT)
async def logout_user() -> None:  # noqa: D401 – empty 204 response
    """Clear auth cookies (stub)."""
    # Would clear cookies / session here
    return None 

# ---------------------------------------------------------------------------
# Monkeypatch-friendly settings alias
# ---------------------------------------------------------------------------
import sys
import types
from modules.financehub.backend.config import settings as _settings

_alias_name = __name__ + ".settings"
_settings_mod = types.ModuleType(_alias_name)
# Expose the same Pydantic settings object
_settings_mod.settings = _settings
_settings_mod.GOOGLE_AUTH = _settings.GOOGLE_AUTH  # keep attr path used in tests
sys.modules[_alias_name] = _settings_mod 
# Also expose as attribute on the parent for "auth.settings" path resolution
setattr(sys.modules[__name__], "settings", _settings_mod) 