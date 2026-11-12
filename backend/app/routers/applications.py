from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.core.exceptions import AppError
from app.core.supabase import supabase
from app.dependencies.auth import get_current_user
from app.dependencies.roles import require_permission
from app.schemas.application import (
    AdminApplicationUpdate, ApplicationCreate, ApplicationUpdate, DecisionNote,
)
from app.services import application_service
from app.utils.helpers import log_audit, notify, now_utc, ok, page_range, paginated

router = APIRouter(prefix="/applications", tags=["Applications"])
admin_router = APIRouter(prefix="/admin/applications", tags=["Admin: Applications"])

WITHDRAWABLE = {"DRAFT", "SUBMITTED", "UNDER_REVIEW", "INTERVIEW", "WAITLISTED"}
DECIDABLE = {"SUBMITTED", "UNDER_REVIEW", "INTERVIEW", "WAITLISTED"}

@admin_router.post("/{app_id}/accept")
def accept(app_id: str, body: DecisionNote = DecisionNote(), user: dict = Depends(require_permission("applications.review"))):
    result = _decide(app_id, "ACCEPTED", "Application accepted",
                     "Congratulations! Your application has been accepted.", "application.accepted", user, body.note)
    application = result["data"]
    application_service.enroll_applicant(result["data"])
    return result
def _get_application(app_id: str) -> dict:
    res = supabase.table("pz_applications").select("*").eq("id", app_id).limit(1).execute()
    if not res.data:
        raise AppError(404, "NOT_FOUND", "Application not found")
    return res.data[0]


def _get_own(app_id: str, user: dict) -> dict:
    application = _get_application(app_id)
    if application["user_id"] != user["id"]:
        # 404 instead of 403 so we don't reveal that the record exists
        raise AppError(404, "NOT_FOUND", "Application not found")
    return application


# ---------- User ----------

@router.post("", status_code=201)
def create_application(body: ApplicationCreate, user: dict = Depends(get_current_user)):
    data = body.model_dump()
    data.update({"user_id": user["id"], "status": "DRAFT"})
    res = supabase.table("pz_applications").insert(data).execute()
    return ok(res.data[0])


@router.get("/me")
def my_applications(user: dict = Depends(get_current_user)):
    res = supabase.table("pz_applications").select("*").eq("user_id", user["id"]).order("updated_at", desc=True).execute()
    return ok(res.data)


@router.get("/{app_id}")
def get_application(app_id: str, user: dict = Depends(get_current_user)):
    application = _get_application(app_id)
    if application["user_id"] != user["id"] and "applications.read" not in user["permissions"]:
        raise AppError(404, "NOT_FOUND", "Application not found")
    return ok(application)


@router.patch("/{app_id}")
def update_application(app_id: str, body: ApplicationUpdate, user: dict = Depends(get_current_user)):
    application = _get_own(app_id, user)
    if application["status"] != "DRAFT":
        raise AppError(409, "CONFLICT", "Only draft applications can be edited")
    res = supabase.table("pz_applications").update(
        {"answers": body.answers, "updated_at": now_utc()}
    ).eq("id", app_id).execute()
    return ok(res.data[0])


@router.post("/{app_id}/submit")
def submit_application(app_id: str, user: dict = Depends(get_current_user)):
    application = _get_own(app_id, user)
    if application["status"] != "DRAFT":
        raise AppError(409, "CONFLICT", "Only draft applications can be submitted")

    program_id = application.get("program_id")
    if program_id:
        application_service.assert_program_accepting(program_id)
        application_service.assert_no_active_application(user["id"], program_id)
    res = supabase.table("pz_applications").update(
        {"status": "SUBMITTED", "submitted_at": now_utc(), "updated_at": now_utc()}
    ).eq("id", app_id).execute()

    notify(user["id"], "APPLICATION", "Application received",
           "We received your application and will review it soon.", {"application_id": app_id})
    return ok(res.data[0])


@router.post("/{app_id}/withdraw")
def withdraw_application(app_id: str, user: dict = Depends(get_current_user)):
    application = _get_own(app_id, user)
    if application["status"] not in WITHDRAWABLE:
        raise AppError(409, "CONFLICT", f"Cannot withdraw an application that is {application['status']}")
    res = supabase.table("pz_applications").update(
        {"status": "WITHDRAWN", "updated_at": now_utc()}
    ).eq("id", app_id).execute()
    return ok(res.data[0])


# ---------- Admin ----------

@admin_router.get("")
def admin_list(
    status: Optional[str] = None,
    application_type: Optional[str] = None,
    program_id: Optional[str] = None,
    reviewer_id: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    _: dict = Depends(require_permission("applications.read")),
):
    start, end = page_range(page, limit)
    q = supabase.table("pz_applications").select("*", count="exact").neq("status", "DRAFT")
    if status:
        q = q.eq("status", status)
    if application_type:
        q = q.eq("application_type", application_type)
    if program_id:
        q = q.eq("program_id", program_id)
    if reviewer_id:
        q = q.eq("reviewer_id", reviewer_id)
    res = q.order("submitted_at", desc=True).range(start, end).execute()
    return paginated(res.data, page, limit, res.count or 0)


@admin_router.get("/{app_id}")
def admin_get(app_id: str, _: dict = Depends(require_permission("applications.read"))):
    return ok(_get_application(app_id))


@admin_router.patch("/{app_id}")
def admin_update(app_id: str, body: AdminApplicationUpdate, user: dict = Depends(require_permission("applications.review"))):
    _get_application(app_id)
    changes = body.model_dump(exclude_unset=True)
    if not changes:
        raise AppError(400, "NO_CHANGES", "Nothing to update")
    changes["updated_at"] = now_utc()
    res = supabase.table("pz_applications").update(changes).eq("id", app_id).execute()
    log_audit(user["id"], "application.updated", "application", app_id, changes)
    return ok(res.data[0])


def _decide(app_id: str, new_status: str, title: str, message: str, audit_action: str, user: dict, note: Optional[str]):
    application = _get_application(app_id)
    if application["status"] not in DECIDABLE:
        raise AppError(409, "CONFLICT", f"Cannot act on an application that is {application['status']}")

    changes = {"status": new_status, "reviewer_id": user["id"], "updated_at": now_utc()}
    if note:
        changes["review_notes"] = note
    res = supabase.table("pz_applications").update(changes).eq("id", app_id).execute()

    notify(application["user_id"], "APPLICATION", title, message, {"application_id": app_id})
    log_audit(user["id"], audit_action, "application", app_id, {"note": note})
    return ok(res.data[0])


@admin_router.post("/{app_id}/accept")
def accept(app_id: str, body: DecisionNote = DecisionNote(), user: dict = Depends(require_permission("applications.review"))):
    return _decide(app_id, "ACCEPTED", "Application accepted",
                   "Congratulations! Your application has been accepted.", "application.accepted", user, body.note)


@admin_router.post("/{app_id}/reject")
def reject(app_id: str, body: DecisionNote = DecisionNote(), user: dict = Depends(require_permission("applications.review"))):
    return _decide(app_id, "REJECTED", "Application update",
                   "Thank you for applying. We are unable to offer you a place this time.", "application.rejected", user, body.note)


@admin_router.post("/{app_id}/waitlist")
def waitlist(app_id: str, body: DecisionNote = DecisionNote(), user: dict = Depends(require_permission("applications.review"))):
    return _decide(app_id, "WAITLISTED", "You're on the waitlist",
                   "Your application has been waitlisted. We'll be in touch.", "application.waitlisted", user, body.note)


@admin_router.post("/{app_id}/request-info")
def request_info(app_id: str, body: DecisionNote, user: dict = Depends(require_permission("applications.review"))):
    if not body.note:
        raise AppError(422, "VALIDATION_ERROR", "Tell the applicant what information you need")
    application = _get_application(app_id)
    if application["status"] not in DECIDABLE:
        raise AppError(409, "CONFLICT", f"Cannot act on an application that is {application['status']}")

    # Send it back to DRAFT so the applicant can edit and resubmit.
    res = supabase.table("pz_applications").update({
        "status": "DRAFT", "review_notes": body.note,
        "reviewer_id": user["id"], "updated_at": now_utc(),
    }).eq("id", app_id).execute()

    notify(application["user_id"], "APPLICATION", "More information needed", body.note, {"application_id": app_id})
    log_audit(user["id"], "application.info_requested", "application", app_id, {"note": body.note})
    return ok(res.data[0])