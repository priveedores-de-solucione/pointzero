from typing import Optional

from fastapi import APIRouter, Depends

from app.core.exceptions import AppError
from app.dependencies.auth import get_current_user
from app.repositories.milestone_repository import MilestoneRepository
from app.services import startup_service
from app.utils.helpers import now_utc, ok

router = APIRouter(prefix="/milestones", tags=["Milestones"])
milestones = MilestoneRepository()


@router.get("/my")
def my_milestones(status: Optional[str] = None, stage: Optional[str] = None, user: dict = Depends(get_current_user)):
    ids = startup_service.my_startup_ids(user["id"])
    return ok(milestones.for_startups(ids, status=status, stage=stage))


@router.get("/progress")
def my_progress(user: dict = Depends(get_current_user)):
    ids = startup_service.my_startup_ids(user["id"])
    return ok(milestones.progress(ids))


@router.post("/{milestone_id}/complete")
def complete(milestone_id: str, user: dict = Depends(get_current_user)):
    milestone = milestones.get(milestone_id)
    if not milestone:
        raise AppError(404, "NOT_FOUND", "Milestone not found")
    startup_service.require_access(milestone["startup_id"], user, founder_only=False)
    if milestone["status"] == "COMPLETED":
        raise AppError(409, "CONFLICT", "Milestone is already completed")
    return ok(milestones.update(milestone_id, {
        "status": "COMPLETED", "completed_at": now_utc(), "updated_at": now_utc(),
    }))