from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.core.exceptions import AppError
from app.core.supabase import supabase
from app.dependencies.auth import get_current_user, get_optional_user
from app.dependencies.roles import require_permission, require_roles
from app.schemas.startup import (
    MemberCreate, MemberUpdate, MetricCreate, MilestoneCreate, MilestoneUpdate,
    StartupCreate, StartupUpdate, VisibilityUpdate,
)
from app.utils.helpers import (
    count_rows, log_audit, notify, now_utc, ok, page_range, paginated, search_term, unique_slug,
)
from app.services.startup_service import (
    founder_count as _founder_count, get_startup as _get_startup,
    membership as _membership, require_access as _require_access,
)

router = APIRouter(prefix="/startups", tags=["Startups"])
milestones_router = APIRouter(prefix="/milestones", tags=["Milestones"])
admin_router = APIRouter(prefix="/admin/startups", tags=["Admin: Startups"])


# ---------- helpers ----------


# ---------- public ----------

@router.get("")
def list_startups(
    industry: Optional[str] = None, stage: Optional[str] = None, location: Optional[str] = None,
    program_id: Optional[str] = None, cohort_id: Optional[str] = None, q: Optional[str] = None,
    page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100),
):
    start, end = page_range(page, limit)
    query = supabase.table("pz_startups").select("*", count="exact").eq("is_public", True).is_("archived_at", "null")
    for col, val in (("industry", industry), ("stage", stage), ("location", location),
                     ("program_id", program_id), ("cohort_id", cohort_id)):
        if val:
            query = query.eq(col, val)
    if q and search_term(q):
        query = query.ilike("name", f"%{search_term(q)}%")
    res = query.order("created_at", desc=True).range(start, end).execute()
    return paginated(res.data, page, limit, res.count or 0)


@router.get("/me")
def my_startups(user: dict = Depends(get_current_user)):
    res = supabase.table("pz_startup_members").select("role,is_founder,startups(*)").eq("user_id", user["id"]).execute()
    out = [
        {**r["startups"], "member_role": r["role"], "is_founder": r["is_founder"]}
        for r in res.data if r["startups"] and not r["startups"]["archived_at"]
    ]
    return ok(out)


@router.get("/{slug}")
def get_startup(slug: str, user: Optional[dict] = Depends(get_optional_user)):
    res = supabase.table("pz_startups").select("*").eq("slug", slug).is_("archived_at", "null").limit(1).execute()
    if not res.data:
        raise AppError(404, "NOT_FOUND", "Startup not found")
    s = res.data[0]
    if not s["is_public"]:
        allowed = user and ("startups.read" in user["permissions"] or _membership(s["id"], user["id"]))
        if not allowed:
            raise AppError(404, "NOT_FOUND", "Startup not found")
    founders = supabase.table("pz_startup_members").select("role,profiles(id,first_name,last_name,avatar_url)") \
        .eq("startup_id", s["id"]).eq("is_founder", True).execute().data
    s["founders"] = founders
    return ok(s)


# ---------- founder / staff ----------

@router.post("", status_code=201)
def create_startup(body: StartupCreate, user: dict = Depends(require_roles("FOUNDER", "ADMIN", "SUPER_ADMIN"))):
    data = body.model_dump(mode="json", exclude_unset=True)
    data["slug"] = unique_slug("pz_startups", body.name)
    startup = supabase.table("pz_startups").insert(data).execute().data[0]
    supabase.table("pz_startup_members").insert({
        "startup_id": startup["id"], "user_id": user["id"], "role": "Founder", "is_founder": True,
    }).execute()
    log_audit(user["id"], "startup.created", "startup", startup["id"])
    return ok(startup)


@router.patch("/{startup_id}")
def update_startup(startup_id: str, body: StartupUpdate, user: dict = Depends(get_current_user)):
    _require_access(startup_id, user)
    changes = body.model_dump(mode="json", exclude_unset=True)
    if "startups.write" not in user["permissions"]:
        changes.pop("program_id", None)
        changes.pop("cohort_id", None)
    if not changes:
        raise AppError(400, "NO_CHANGES", "Nothing to update")
    changes["updated_at"] = now_utc()
    res = supabase.table("pz_startups").update(changes).eq("id", startup_id).execute()
    log_audit(user["id"], "startup.updated", "startup", startup_id, changes)
    return ok(res.data[0])


@router.delete("/{startup_id}", status_code=204)
def archive_startup(startup_id: str, user: dict = Depends(get_current_user)):
    _require_access(startup_id, user)
    supabase.table("pz_startups").update({
        "archived_at": now_utc(), "is_public": False, "investor_visible": False,
    }).eq("id", startup_id).execute()
    log_audit(user["id"], "startup.archived", "startup", startup_id)


@router.patch("/{startup_id}/visibility")
def update_visibility(startup_id: str, body: VisibilityUpdate, user: dict = Depends(get_current_user)):
    _require_access(startup_id, user)
    changes = body.model_dump(exclude_unset=True)
    if not changes:
        raise AppError(400, "NO_CHANGES", "Nothing to update")
    res = supabase.table("pz_startups").update({**changes, "updated_at": now_utc()}).eq("id", startup_id).execute()
    log_audit(user["id"], "startup.visibility_changed", "startup", startup_id, changes)
    return ok(res.data[0])


# ---------- team ----------

@router.get("/{startup_id}/members")
def list_members(startup_id: str, user: dict = Depends(get_current_user)):
    _require_access(startup_id, user, founder_only=False, read=True)
    res = supabase.table("pz_startup_members").select("*, profiles(first_name,last_name,avatar_url,email)") \
        .eq("startup_id", startup_id).execute()
    return ok(res.data)


@router.post("/{startup_id}/members", status_code=201)
def add_member(startup_id: str, body: MemberCreate, user: dict = Depends(get_current_user)):
    startup = _require_access(startup_id, user)
    target = supabase.table("pz_profiles").select("id").eq("email", body.email.lower()).limit(1).execute().data
    if not target:
        raise AppError(404, "USER_NOT_FOUND", "No user with that email. Ask them to sign up first.")
    target_id = target[0]["id"]
    if _membership(startup_id, target_id):
        raise AppError(409, "CONFLICT", "This user is already on the team")
    res = supabase.table("pz_startup_members").insert({
        "startup_id": startup_id, "user_id": target_id, "role": body.role, "is_founder": body.is_founder,
    }).execute()
    notify(target_id, "SYSTEM", "Added to a startup", f"You were added to {startup['name']}.", {"startup_id": startup_id})
    return ok(res.data[0])


@router.patch("/{startup_id}/members/{member_user_id}")
def update_member(startup_id: str, member_user_id: str, body: MemberUpdate, user: dict = Depends(get_current_user)):
    _require_access(startup_id, user)
    m = _membership(startup_id, member_user_id)
    if not m:
        raise AppError(404, "NOT_FOUND", "Member not found")
    changes = body.model_dump(exclude_unset=True)
    if not changes:
        raise AppError(400, "NO_CHANGES", "Nothing to update")
    if changes.get("is_founder") is False and m["is_founder"] and _founder_count(startup_id) <= 1:
        raise AppError(409, "CONFLICT", "A startup must keep at least one founder")
    res = supabase.table("pz_startup_members").update(changes).eq("startup_id", startup_id).eq("user_id", member_user_id).execute()
    return ok(res.data[0])


@router.delete("/{startup_id}/members/{member_user_id}", status_code=204)
def remove_member(startup_id: str, member_user_id: str, user: dict = Depends(get_current_user)):
    _require_access(startup_id, user)
    m = _membership(startup_id, member_user_id)
    if not m:
        raise AppError(404, "NOT_FOUND", "Member not found")
    if m["is_founder"] and _founder_count(startup_id) <= 1:
        raise AppError(409, "CONFLICT", "A startup must keep at least one founder")
    supabase.table("pz_startup_members").delete().eq("startup_id", startup_id).eq("user_id", member_user_id).execute()


# ---------- metrics ----------

@router.get("/{startup_id}/metrics")
def list_metrics(startup_id: str, user: dict = Depends(get_current_user)):
    _require_access(startup_id, user, founder_only=False, read=True)
    res = supabase.table("pz_startup_metrics").select("*").eq("startup_id", startup_id).order("recorded_at", desc=True).execute()
    return ok(res.data)


@router.post("/{startup_id}/metrics", status_code=201)
def add_metric(startup_id: str, body: MetricCreate, user: dict = Depends(get_current_user)):
    _require_access(startup_id, user)
    data = body.model_dump(mode="json", exclude_none=True)
    data["startup_id"] = startup_id
    return ok(supabase.table("pz_startup_metrics").insert(data).execute().data[0])


# ---------- milestones ----------

@router.get("/{startup_id}/milestones")
def list_milestones(startup_id: str, user: dict = Depends(get_current_user)):
    _require_access(startup_id, user, founder_only=False, read=True)
    res = supabase.table("pz_milestones").select("*").eq("startup_id", startup_id).order("due_date").execute()
    return ok(res.data)


@router.post("/{startup_id}/milestones", status_code=201)
def create_milestone(startup_id: str, body: MilestoneCreate, user: dict = Depends(get_current_user)):
    _require_access(startup_id, user, founder_only=False)
    data = body.model_dump(mode="json")
    data["startup_id"] = startup_id
    if data["status"] == "COMPLETED":
        data["completed_at"] = now_utc()
    return ok(supabase.table("pz_milestones").insert(data).execute().data[0])


def _load_milestone(milestone_id: str, user: dict, founder_only: bool) -> dict:
    res = supabase.table("pz_milestones").select("*").eq("id", milestone_id).limit(1).execute()
    if not res.data:
        raise AppError(404, "NOT_FOUND", "Milestone not found")
    _require_access(res.data[0]["startup_id"], user, founder_only=founder_only)
    return res.data[0]


@milestones_router.patch("/{milestone_id}")
def update_milestone(milestone_id: str, body: MilestoneUpdate, user: dict = Depends(get_current_user)):
    _load_milestone(milestone_id, user, founder_only=False)
    changes = body.model_dump(mode="json", exclude_unset=True)
    if not changes:
        raise AppError(400, "NO_CHANGES", "Nothing to update")
    if "status" in changes:
        changes["completed_at"] = now_utc() if changes["status"] == "COMPLETED" else None
    changes["updated_at"] = now_utc()
    return ok(supabase.table("pz_milestones").update(changes).eq("id", milestone_id).execute().data[0])


@milestones_router.delete("/{milestone_id}", status_code=204)
def delete_milestone(milestone_id: str, user: dict = Depends(get_current_user)):
    _load_milestone(milestone_id, user, founder_only=True)
    supabase.table("pz_milestones").delete().eq("id", milestone_id).execute()


# ---------- admin ----------

@admin_router.get("")
def admin_list_startups(
    q: Optional[str] = None, stage: Optional[str] = None, program_id: Optional[str] = None,
    cohort_id: Optional[str] = None, is_public: Optional[bool] = None,
    page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100),
    _: dict = Depends(require_permission("startups.read")),
):
    start, end = page_range(page, limit)
    query = supabase.table("pz_startups").select("*", count="exact").is_("archived_at", "null")
    for col, val in (("stage", stage), ("program_id", program_id), ("cohort_id", cohort_id), ("is_public", is_public)):
        if val is not None:
            query = query.eq(col, val)
    if q and search_term(q):
        query = query.ilike("name", f"%{search_term(q)}%")
    res = query.order("created_at", desc=True).range(start, end).execute()
    return paginated(res.data, page, limit, res.count or 0)