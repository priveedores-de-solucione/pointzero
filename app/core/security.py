from fastapi import Request

from app.core.exceptions import AppError
from app.core.supabase import supabase


def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def verify_access_token(token: str):
    """Validate a Supabase JWT and return the auth user, or raise 401."""
    try:
        user = supabase.auth.get_user(token).user
    except Exception:
        raise AppError(401, "INVALID_TOKEN", "Invalid or expired token")
    if not user:
        raise AppError(401, "INVALID_TOKEN", "Invalid or expired token")
    return user