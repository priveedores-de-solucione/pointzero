from fastapi import APIRouter, Depends

from app.core.exceptions import AppError
from app.core.permissions import permissions_for
from app.core.supabase import supabase
from app.dependencies.auth import get_current_user
from app.schemas.user import CompleteProfile, ProfileUpdate
from app.utils.helpers import now_utc, ok

router = APIRouter(prefix="/auth", tags=["Auth"])

PUBLIC_FIELDS = {
    "id", "email", "first_name", "last_name", "avatar_url", "bio", "country",
    "city", "website", "linkedin", "twitter", "github", "role", "status", "permissions",
    "onboarding_completed", "profile_public",
}


def _clean(user: dict) -> dict:
    return {k: v for k, v in user.items() if k in PUBLIC_FIELDS}


@router.get("/me")
def me(user: dict = Depends(get_current_user)):
    return ok(_clean(user))


@router.patch("/me")
def update_me(body: ProfileUpdate, user: dict = Depends(get_current_user)):
    changes = body.model_dump(exclude_unset=True)
    if not changes:
        raise AppError(400, "NO_CHANGES", "Nothing to update")
    changes["updated_at"] = now_utc()
    res = supabase.table("pz_profiles").update(changes).eq("id", user["id"]).execute()
    updated = res.data[0]
    updated["permissions"] = user["permissions"]
    return ok(_clean(updated))


@router.post("/complete-profile")
def complete_profile(body: CompleteProfile, user: dict = Depends(get_current_user)):
    # Admin/staff users keep their role; everyone else picks from the allowed list.
    if user["role"] in {"SUPER_ADMIN", "ADMIN", "STAFF"}:
        raise AppError(400, "NOT_ALLOWED", "Staff accounts cannot change role here")

    changes = body.model_dump(exclude_unset=True)
    changes["onboarding_completed"] = True
    changes["updated_at"] = now_utc()
    res = supabase.table("pz_profiles").update(changes).eq("id", user["id"]).execute()
    updated = res.data[0]
    updated["permissions"] = permissions_for(updated["role"])
    return ok(_clean(updated))