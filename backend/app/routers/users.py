from uuid import UUID

from app.services import startup_service
from fastapi import APIRouter, Depends

from app.core.exceptions import AppError
from app.core.supabase import supabase
from app.dependencies.auth import get_current_user
from app.repositories.startup_repository import StartupRepository
from app.repositories.user_repository import UserRepository
from app.schemas.user import ProfileVisibility
from app.services import storage_service
from app.utils.helpers import log_audit, now_utc, ok

router = APIRouter(prefix="/users", tags=["Users"])
users = UserRepository()
startups = StartupRepository()


@router.patch("/me/visibility")
def set_visibility(body: ProfileVisibility, user: dict = Depends(get_current_user)):
    updated = users.update(user["id"], {"profile_public": body.profile_public, "updated_at": now_utc()})
    return ok({"profile_public": updated["profile_public"]})


@router.delete("/me", status_code=204)
def delete_account(user: dict = Depends(get_current_user)):
    if user["role"] in {"SUPER_ADMIN", "ADMIN", "STAFF"}:
        raise AppError(403, "FORBIDDEN", "Staff accounts must be removed by a super admin")
    for startup_id in startup_service.my_startup_ids(user["id"], founder_only=True):
        if startups.founder_count(startup_id) <= 1:
            raise AppError(409, "SOLE_FOUNDER",
                           "You are the only founder of a startup. Add another founder or archive it first.")
    log_audit(user["id"], "user.deleted", "user", user["id"])
    storage_service.remove_user_files(user["id"])
    supabase.auth.admin.delete_user(user["id"])   # profile + owned rows cascade


@router.get("/{user_id}")
def public_profile(user_id: UUID, _: dict = Depends(get_current_user)):
    profile = users.public_profile(str(user_id))
    if not profile:
        raise AppError(404, "NOT_FOUND", "Profile not found")
    return ok(profile)