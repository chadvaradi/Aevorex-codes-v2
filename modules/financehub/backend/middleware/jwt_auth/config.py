"""
JWT Authentication Configuration
===============================

Security headers, constants, and configuration for JWT authentication.
"""

import logging
from typing import Set

logger = logging.getLogger("aevorex_finbot_api.middleware.jwt_auth.config")

# Security headers to be added to all responses
SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY", 
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "X-Permitted-Cross-Domain-Policies": "none",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
}

# Public endpoints that don't require authentication
PUBLIC_ENDPOINTS: Set[str] = {
    "/",
    "/docs",
    "/openapi.json", 
    "/redoc",
    "/api/v1/health",
    "/api/v1/auth/login",
    "/api/v1/auth/callback",
    "/api/v1/auth/refresh",
    "/metrics"
}

# JWT Configuration defaults
JWT_DEFAULTS = {
    "algorithm": "HS256",
    "token_expiration": 900,  # 15 minutes
    "max_refresh_age": 3600,  # 1 hour
    "blacklist_ttl": 3600     # 1 hour
}

# Required JWT payload fields
REQUIRED_JWT_FIELDS = ['user_id', 'email', 'exp', 'iat']

def is_public_endpoint(path: str) -> bool:
    """
    Check if the endpoint is public (doesn't require authentication)
    """
    # Exact match
    if path in PUBLIC_ENDPOINTS:
        return True
    
    # Pattern matching for API documentation
    if path.startswith("/docs") or path.startswith("/redoc"):
        return True
    
    # Health check patterns
    if path.startswith("/health") or path.startswith("/ping"):
        return True
    
    return False 