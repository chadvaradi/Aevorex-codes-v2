"""
JWT Authentication Module for FinanceHub
========================================

Modular JWT authentication system with token validation, security headers,
and Redis-based session management.
"""

from .middleware import JWTAuthMiddleware
from .token_service import JWTTokenService
from .factory import create_jwt_middleware
from .config import SECURITY_HEADERS

__all__ = [
    "JWTAuthMiddleware",
    "JWTTokenService", 
    "create_jwt_middleware",
    "SECURITY_HEADERS"
]

__version__ = "1.0.0" 