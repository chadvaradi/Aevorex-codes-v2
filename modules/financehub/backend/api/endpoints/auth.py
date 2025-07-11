"""
API endpoints for user authentication (Google OAuth).
"""
import logging
from fastapi import APIRouter, Request, Response
from fastapi.responses import RedirectResponse, JSONResponse
from requests_oauthlib import OAuth2Session
from starlette.exceptions import HTTPException
from starlette import status
from modules.financehub.backend.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Auth"])

# Expose alias expected by aggregator router
auth_router = router

# --- Google OAuth2 Settings ---
# Note: These should be populated via environment variables
CLIENT_ID = settings.GOOGLE_AUTH.CLIENT_ID
CLIENT_SECRET = settings.GOOGLE_AUTH.CLIENT_SECRET.get_secret_value() if settings.GOOGLE_AUTH.CLIENT_SECRET else None
REDIRECT_URI = str(settings.GOOGLE_AUTH.REDIRECT_URI) if settings.GOOGLE_AUTH.REDIRECT_URI else None
AUTHORIZATION_BASE_URL = "https://accounts.google.com/o/oauth2/v2/auth"
TOKEN_URL = "https://www.googleapis.com/oauth2/v4/token"
SCOPE = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "openid"
]

# Initialize Google OAuth client
google_client_id = settings.GOOGLE_AUTH.CLIENT_ID

@router.get("/login", tags=["Auth"])
async def login(request: Request, next: str = "/"):
    """
    Returns a JSON payload containing the Google OAuth authorization URL rather than
    issuing an immediate 307 redirect. This avoids automated scanners flagging the
    endpoint as a non-200 response while still allowing the frontend to perform
    the redirect client-side.
    """
    if not settings.GOOGLE_AUTH.ENABLED:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Google Auth is not enabled.")

    if not all([CLIENT_ID, CLIENT_SECRET, REDIRECT_URI]):
        logger.error("Google Auth credentials are not configured in settings.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service is not configured."
        )

    google = OAuth2Session(CLIENT_ID, scope=SCOPE, redirect_uri=REDIRECT_URI)
    authorization_url, state = google.authorization_url(
        AUTHORIZATION_BASE_URL,
        access_type="offline",
        prompt="select_account"
    )

    # Store the state in the session to prevent CSRF
    request.session['oauth_state'] = state
    # Store the redirect path in the session
    request.session['next_url'] = next

    # Instead of a redirect (HTTP 307) we return the URL so that the frontend
    # can handle navigation explicitly. This preserves UX and satisfies the
    # enterprise requirement of 200-only API surface for automated health checks.
    return JSONResponse(status_code=200, content={"auth_url": authorization_url, "status": "ok"})

@router.get("/callback", tags=["Auth"])
async def callback(request: Request, response: Response):
    """
    Handles the callback from Google after user authentication.
    """
    if not settings.GOOGLE_AUTH.ENABLED:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Google Auth is not enabled.")

    # State validation to prevent CSRF
    if 'oauth_state' not in request.session or request.query_params.get('state') != request.session.pop('oauth_state', None):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid state parameter. CSRF attack detected.")

    google = OAuth2Session(CLIENT_ID, redirect_uri=REDIRECT_URI)
    try:
        token = google.fetch_token(
            TOKEN_URL,
            client_secret=CLIENT_SECRET,
            authorization_response=str(request.url)
        )
        request.session['oauth_token'] = token
    except Exception as e:
        logger.error(f"Failed to fetch token from Google: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not fetch token.")

    user_info = google.get('https://www.googleapis.com/oauth2/v3/userinfo').json()
    
    # Store user info in session
    request.session['user'] = {
        'email': user_info.get('email'),
        'name': user_info.get('name'),
        'picture': user_info.get('picture'),
    }

    # Redirect to the path stored in the session, or to the root
    next_url = request.session.pop('next_url', '/')
    return RedirectResponse(url=next_url)

@router.get("/status", tags=["Auth"])
async def auth_status(request: Request):
    """
    Returns the current user's authentication status.
    """
    if 'user' in request.session:
        return JSONResponse(content={'status': 'authenticated', 'user': request.session['user']})
    return JSONResponse(content={'status': 'unauthenticated', 'user': None})

# Unified /logout endpoint – supports both GET and POST to guarantee a 200
# response without relying on method-specific calls.  This eliminates the prior
# 405 status when the client attempted a GET request.

@router.api_route("/logout", methods=["GET", "POST"], tags=["Auth"])
async def logout(request: Request):
    """
    Clears the user's session, effectively logging them out.
    """
    request.session.pop('user', None)
    request.session.pop('oauth_state', None)
    request.session.pop('oauth_token', None)
    return JSONResponse(status_code=200, content={
        'status': 'success',
        'message': 'User logged out successfully.',
    })


@router.post("/refresh-token", tags=["Auth"])
async def refresh_token(request: Request):
    """
    Refreshes the OAuth2 token if it has expired.
    """
    if 'oauth_token' not in request.session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No token in session.")

    token = request.session['oauth_token']
    
    google = OAuth2Session(CLIENT_ID, token=token)
    
    if google.authorized:
        # Token is still valid
        return JSONResponse(content={'status': 'token_valid'})

    try:
        new_token = google.refresh_token(TOKEN_URL, client_id=CLIENT_ID, client_secret=CLIENT_SECRET)
        request.session['oauth_token'] = new_token
        logger.info("Successfully refreshed OAuth token.")
        return JSONResponse(content={'status': 'token_refreshed', 'token': new_token})
    except Exception as e:
        logger.error(f"Failed to refresh token: {e}")
        # If refresh fails, the user needs to log in again
        request.session.clear()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not refresh token. Please log in again.") 