from collections import Counter
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.core.exceptions import AppError
from app.core.supabase import supabase
from app.dependencies.roles import require_permission
from app.schemas.mentor import MentorCreate
from app.schemas.user import UserAdminUpdate
from app.utils.helpers import count_rows, log_audit, notify, now_utc, ok, page_range, paginated, search_term

router = APIRouter(prefix="/admin", tags=["Admin"])

PRIVILEGED = {"ADMIN", "SUPER_ADMIN"}


# ---------- dashboard / analytics ----------

@router.get("/dashboard")
def dashboard(_: dict = Depends(require_permission("analytics.read"))):
    applications = supabase.table("pz_applications").select("id", count="exact").neq("status", "DRAFT").limit(1).execute().count or 0
    return ok({
        "total_users": count_rows("pz_profiles"),
        "startups": count_rows("pz_startups"),
        "active_founders": count_rows("pz_profiles", role="FOUNDER", status="ACTIVE"),
        "investors": count_rows("pz_investors", verification_status="VERIFIED"),
        "pending_investors": count_rows("pz_investors", verification_status="PENDING"),
        "applications": applications,
        "pending_applications": count_rows("pz_applications", status="SUBMITTED"),
        "programs": count_rows("pz_programs"),
    })


def _fetch_all(table: str, col: str, since: str) -> list[dict]:
    rows, start = [], 0
    while True:
        batch = supabase.table(table).select(col).gte(col, since).range(start, start + 999).execute().data
        rows += batch
        if len(batch) < 1000:
            return rows
        start += 1000


def _monthly(table: str, col: str = "created_at", months: int = 6) -> list[dict]:
    labels, d = [], datetime.now(timezone.utc).replace(day=1)
    for _ in range(months):
        labels.append(d.strftime("%Y-%m"))
        d = (d - timedelta(days=1)).replace(day=1)
    labels.reverse()
    counts = Counter(r[col][:7] for r in _fetch_all(table, col, labels[0] + "-01") if r[col])
    return [{"month": m, "count": counts.get(m, 0)} for m in labels]


@router.get("/analytics")
def analytics(months: int = Query(6, ge=1, le=24), _: dict = Depends(require_permission("analytics.read"))):
    return ok({
        "applications": _monthly("applications", "submitted_at", months),
        "user_growth": _monthly("profiles", "created_at", months),
        "startup_growth": _monthly("startups", "created_at", months),
        "investor_activity": _monthly("introduction_requests", "created_at", months),
        "event_registrations": _monthly("event_registrations", "registered_at", months),
    })


# ---------- users ----------

@router.get("/users")
def list_users(
    q: Optional[str] = None, role: Optional[str] = None, status: Optional[str] = None,
    page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100),
    _: dict = Depends(require_permission("users.read")),
):
    start, end = page_range(page, limit)
    query = supabase.table("pz_profiles").select("*", count="exact")
    if role:
        query = query.eq("role", role)
    if status:
        query = query.eq("status", status)
    if q and search_term(q):
        t = search_term(q)
        query = query.or_(f"email.ilike.%{t}%,first_name.ilike.%{t}%,last_name.ilike.%{t}%")
    res = query.order("created_at", desc=True).range(start, end).execute()
    return paginated(res.data, page, limit, res.count or 0)


@router.get("/users/{user_id}")
def get_user(user_id: str, _: dict = Depends(require_permission("users.read"))):
    res = supabase.table("pz_profiles").select("*").eq("id", user_id).limit(1).execute()
    if not res.data:
        raise AppError(404, "NOT_FOUND", "User not found")
    activity = supabase.table("pz_audit_logs").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(20).execute().data
    return ok({**res.data[0], "recent_activity": activity})


@router.patch("/users/{user_id}")
def update_user(user_id: str, body: UserAdminUpdate, admin: dict = Depends(require_permission("users.manage"))):
    if user_id == admin["id"]:
        raise AppError(400, "NOT_ALLOWED", "You cannot change your own role or status")
    res = supabase.table("pz_profiles").select("*").eq("id", user_id).limit(1).execute()
    if not res.data:
        raise AppError(404, "NOT_FOUND", "User not found")
    target = res.data[0]
    changes = body.model_dump(exclude_unset=True)
    if not changes:
        raise AppError(400, "NO_CHANGES", "Nothing to update")
    if admin["role"] != "SUPER_ADMIN" and (target["role"] in PRIVILEGED or changes.get("role") in PRIVILEGED):
        raise AppError(403, "FORBIDDEN", "Only a super admin can manage admin accounts")
    changes["updated_at"] = now_utc()
    updated = supabase.table("pz_profiles").update(changes).eq("id", user_id).execute().data[0]
    if "role" in changes:
        log_audit(admin["id"], "user.role_changed", "user", user_id, {"from": target["role"], "to": changes["role"]})
    if "status" in changes:
        log_audit(admin["id"], "user.status_changed", "user", user_id, {"from": target["status"], "to": changes["status"]})
    return ok(updated)


# ---------- mentors ----------

@router.get("/mentors")
def list_mentors(
    is_verified: Optional[bool] = None,
    page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100),
    _: dict = Depends(require_permission("mentors.manage")),
):
    start, end = page_range(page, limit)
    q = supabase.table("pz_mentors").select("*, profiles(first_name,last_name,email)", count="exact")
    if is_verified is not None:
        q = q.eq("is_verified", is_verified)
    res = q.order("created_at", desc=True).range(start, end).execute()
    return paginated(res.data, page, limit, res.count or 0)


@router.post("/mentors", status_code=201)
def create_mentor(body: MentorCreate, admin: dict = Depends(require_permission("mentors.manage"))):
    profile = supabase.table("pz_profiles").select("id,role").eq("id", body.user_id).limit(1).execute().data
    if not profile:
        raise AppError(404, "USER_NOT_FOUND", "User not found")
    if supabase.table("pz_mentors").select("id").eq("user_id", body.user_id).execute().data:
        raise AppError(409, "CONFLICT", "This user is already a mentor")
    mentor = supabase.table("pz_mentors").insert(body.model_dump()).execute().data[0]
    if profile[0]["role"] not in PRIVILEGED | {"STAFF"}:
        supabase.table("pz_profiles").update({"role": "MENTOR"}).eq("id", body.user_id).execute()
    log_audit(admin["id"], "mentor.created", "mentor", mentor["id"])
    return ok(mentor)


@router.post("/mentors/{mentor_id}/verify")
def verify_mentor(mentor_id: str, admin: dict = Depends(require_permission("mentors.manage"))):
    res = supabase.table("pz_mentors").update({"is_verified": True}).eq("id", mentor_id).execute()
    if not res.data:
        raise AppError(404, "NOT_FOUND", "Mentor not found")
    notify(res.data[0]["user_id"], "MENTORSHIP", "You're a verified mentor",
           "Founders can now find and request you.", {"mentor_id": mentor_id})
    log_audit(admin["id"], "mentor.verified", "mentor", mentor_id)
    return ok(res.data[0])


# ---------- audit logs ----------

@router.get("/audit-logs")
def audit_logs(
    action: Optional[str] = None, user_id: Optional[str] = None, entity_type: Optional[str] = None,
    page: int = Query(1, ge=1), limit: int = Query(50, ge=1, le=200),
    _: dict = Depends(require_permission("audit_logs.read")),
):
    start, end = page_range(page, limit)
    q = supabase.table("pz_audit_logs").select("*", count="exact")
    for col, val in (("action", action), ("user_id", user_id), ("entity_type", entity_type)):
        if val:
            q = q.eq(col, val)
    res = q.order("created_at", desc=True).range(start, end).execute()
    return paginated(res.data, page, limit, res.count or 0)