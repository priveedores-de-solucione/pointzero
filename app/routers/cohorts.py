from fastapi import APIRouter, Depends

from app.core.exceptions import AppError
from app.dependencies.auth import get_current_user
from app.dependencies.roles import require_permission
from app.repositories.cohort_repository import CohortRepository
from app.repositories.milestone_repository import MilestoneRepository
from app.schemas.cohort import CohortAssign
from app.services import startup_service
from app.utils.helpers import log_audit, notify, ok

router = APIRouter(prefix="/cohorts", tags=["Cohorts"])
admin_router = APIRouter(prefix="/admin/cohorts", tags=["Admin: Cohorts"])

cohorts = CohortRepository()
milestones = MilestoneRepository()


@router.get("/my")
def my_cohorts(user: dict = Depends(get_current_user)):
    ids = startup_service.my_startup_ids(user["id"])
    return ok({"cohorts": cohorts.for_user(user["id"]), "progress": milestones.progress(ids)})


@router.get("/{cohort_id}")
def get_cohort(cohort_id: str, _: dict = Depends(get_current_user)):
    cohort = cohorts.get(cohort_id)
    if not cohort:
        raise AppError(404, "NOT_FOUND", "Cohort not found")
    return ok(cohort)


# ---------- admin ----------

@admin_router.get("")
def admin_list(_: dict = Depends(require_permission("programs.manage"))):
    rows, _total = cohorts.paginate(page=1, limit=100)
    return ok(rows)


@admin_router.get("/{cohort_id}/members")
def members(cohort_id: str, _: dict = Depends(require_permission("programs.manage"))):
    if not cohorts.get(cohort_id):
        raise AppError(404, "NOT_FOUND", "Cohort not found")
    return ok(cohorts.members(cohort_id))


@admin_router.post("/{cohort_id}/members", status_code=201)
def add_member(cohort_id: str, body: CohortAssign, admin: dict = Depends(require_permission("programs.manage"))):
    enrollment = cohorts.assign_user(cohort_id, body.user_id)
    if not enrollment:
        raise AppError(404, "NOT_FOUND", "Cohort not found")
    notify(body.user_id, "PROGRAM", "You've been added to a cohort",
           "Check your dashboard for your cohort details.", {"cohort_id": cohort_id})
    log_audit(admin["id"], "cohort.member_added", "cohort", cohort_id, {"user_id": body.user_id})
    return ok(enrollment)


@admin_router.delete("/{cohort_id}/members/{user_id}", status_code=204)
def remove_member(cohort_id: str, user_id: str, admin: dict = Depends(require_permission("programs.manage"))):
    if not cohorts.unassign_user(cohort_id, user_id):
        raise AppError(404, "NOT_FOUND", "Member not found in this cohort")
    log_audit(admin["id"], "cohort.member_removed", "cohort", cohort_id, {"user_id": user_id})