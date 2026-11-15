from fastapi import APIRouter, Depends

from app.core.exceptions import AppError
from app.dependencies.auth import get_current_user
from app.schemas.mentor import MentorProfileUpdate
from app.services import mentorship_service
from app.utils.helpers import ok

router = APIRouter(prefix="/mentorship", tags=["Mentorship"])


@router.get("/profile")
def my_profile(user: dict = Depends(get_current_user)):
    mentor = mentorship_service.my_mentor(user)
    if not mentor:
        raise AppError(404, "NOT_FOUND", "You are not a mentor")
    return ok({**mentor, "stats": mentorship_service.stats(mentor["id"])})


@router.patch("/profile")
def update_profile(body: MentorProfileUpdate, user: dict = Depends(get_current_user)):
    # is_verified is not in the schema on purpose, so mentors cannot verify themselves.
    return ok(mentorship_service.update_profile(user, body.model_dump(exclude_unset=True)))