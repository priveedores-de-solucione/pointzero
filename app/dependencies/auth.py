from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.exceptions import AppError
from app.core.permissions import permissions_for
from app.core.supabase import supabase
from app.core.security import verify_access_token
bearer = HTTPBearer(auto_error=False)


def _names_from_metadata(auth_user) -> tuple[str | None, str | None, str | None]:
    """Pull first/last name and avatar from Supabase user_metadata (email or OAuth sign-up)."""
    meta = getattr(auth_user, "user_metadata", None) or {}
    first = (meta.get("first_name") or meta.get("given_name") or "").strip()
    last = (meta.get("last_name") or meta.get("family_name") or "").strip()
    if not (first and last):
        full = (meta.get("full_name") or meta.get("name") or "").strip()
        if full:
            parts = full.split(None, 1)
            first = first or parts[0]
            last = last or (parts[1] if len(parts) > 1 else "")
    avatar = meta.get("avatar_url") or meta.get("picture") or None
    return (first or None, last or None, avatar)


def get_current_user(creds: HTTPAuthorizationCredentials | None = Depends(bearer)) -> dict:
    if not creds:
        raise AppError(401, "UNAUTHENTICATED", "Missing access token")

    try:
        auth_user = verify_access_token(creds.credentials)
    except Exception:
        raise AppError(401, "INVALID_TOKEN", "Invalid or expired token")
    if not auth_user:
        raise AppError(401, "INVALID_TOKEN", "Invalid or expired token")

    res = supabase.table("pz_profiles").select("*").eq("id", auth_user.id).limit(1).execute()
    if res.data:
        profile = res.data[0]
    else:
        # First login: create a profile seeded from the auth metadata (email sign-up sends
        # first_name/last_name; OAuth providers send full_name/name + avatar).
        # Role stays STUDENT and onboarding_completed stays false until /auth/complete-profile.
        first_name, last_name, avatar_url = _names_from_metadata(auth_user)
        profile = supabase.table("pz_profiles").insert({
            "id": auth_user.id,
            "email": auth_user.email,
            "first_name": first_name,
            "last_name": last_name,
            "avatar_url": avatar_url,
            "role": "STUDENT",
            "status": "ACTIVE",
            "onboarding_completed": False,
        }).execute().data[0]

    if profile.get("status") == "SUSPENDED":
        raise AppError(403, "ACCOUNT_SUSPENDED", "This account is suspended")

    profile["permissions"] = permissions_for(profile["role"])
    return profile



def get_optional_user(creds: HTTPAuthorizationCredentials | None = Depends(bearer)) -> dict | None:
    if not creds:
        return None
    return get_current_user(creds)