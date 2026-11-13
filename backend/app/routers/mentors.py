from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.core.exceptions import AppError
from app.core.supabase import supabase
from app.dependencies.auth import get_current_user
from app.dependencies.roles import require_roles
from app.schemas.mentor import Feedback, RequestCreate, RequestUpdate, SessionCreate, SessionUpdate
from app.utils.helpers import notify, now_utc, ok, page_range, paginated
from app.services.mentorship_service import mentor_by_id as _mentor_by_id, my_mentor as _my_mentor
mentors_router = APIRouter(prefix="/mentors", tags=["Mentors"])
router = APIRouter(prefix="/mentorship", tags=["Mentorship"])

PROFILE = "profiles:pz_profiles(first_name,last_name,avatar_url)"

# ---------- directory ----------

@mentors_router.get("")
def list_mentors(
    expertise: Optional[str] = None,
    page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100),
    _: dict = Depends(get_current_user),
):
    start, end = page_range(page, limit)
    q = supabase.table("pz_mentors").select(f"*, {PROFILE}", count="exact").eq("is_verified", True)
    if expertise:
        q = q.contains("expertise", [expertise])
    res = q.range(start, end).execute()
    return paginated(res.data, page, limit, res.count or 0)


@mentors_router.get("/{mentor_id}")
def get_mentor(mentor_id: str, _: dict = Depends(get_current_user)):
    res = supabase.table("pz_mentors").select(f"*, {PROFILE}").eq("id", mentor_id).eq("is_verified", True).limit(1).execute()
    if not res.data:
        raise AppError(404, "NOT_FOUND", "Mentor not found")
    return ok(res.data[0])


# ---------- requests ----------

@router.post("/requests", status_code=201)
def create_request(body: RequestCreate, user: dict = Depends(require_roles("FOUNDER", "BUILDER", "STUDENT"))):
    mentor = _mentor_by_id(body.mentor_id)
    if not mentor["is_verified"]:
        raise AppError(404, "NOT_FOUND", "Mentor not found")
    dup = supabase.table("pz_mentorship_requests").select("id").eq("mentor_id", mentor["id"]) \
        .eq("founder_id", user["id"]).eq("status", "PENDING").execute()
    if dup.data:
        raise AppError(409, "CONFLICT", "You already have a pending request with this mentor")
    data = body.model_dump()
    data["founder_id"] = user["id"]
    res = supabase.table("pz_mentorship_requests").insert(data).execute()
    notify(mentor["user_id"], "MENTORSHIP", "New mentorship request",
           "A founder has requested your mentorship.", {"request_id": res.data[0]["id"]})
    return ok(res.data[0])


@router.get("/requests/me")
def my_requests(user: dict = Depends(get_current_user)):
    mentor = _my_mentor(user)
    q = supabase.table("pz_mentorship_requests").select("*, profiles:pz_profiles(first_name,last_name,avatar_url)")
    q = q.eq("mentor_id", mentor["id"]) if mentor else q.eq("founder_id", user["id"])
    return ok(q.order("created_at", desc=True).execute().data)


@router.patch("/requests/{request_id}")
def update_request(request_id: str, body: RequestUpdate, user: dict = Depends(get_current_user)):
    res = supabase.table("pz_mentorship_requests").select("*, mentors:pz_mentors(user_id)").eq("id", request_id).limit(1).execute()
    if not res.data:
        raise AppError(404, "NOT_FOUND", "Request not found")
    req = res.data[0]
    mentor_user_id = req["mentors"]["user_id"]
    is_mentor, is_founder = user["id"] == mentor_user_id, user["id"] == req["founder_id"]
    if not (is_mentor or is_founder):
        raise AppError(404, "NOT_FOUND", "Request not found")
    if req["status"] != "PENDING":
        raise AppError(409, "CONFLICT", f"Request is already {req['status']}")
    if is_mentor and body.status not in ("ACCEPTED", "DECLINED"):
        raise AppError(403, "FORBIDDEN", "Mentors can only accept or decline")
    if is_founder and body.status != "CANCELLED":
        raise AppError(403, "FORBIDDEN", "You can only cancel your own request")
    updated = supabase.table("pz_mentorship_requests").update({"status": body.status, "updated_at": now_utc()}).eq("id", request_id).execute()
    other = req["founder_id"] if is_mentor else mentor_user_id
    notify(other, "MENTORSHIP", f"Mentorship request {body.status.lower()}",
           f"A mentorship request was {body.status.lower()}.", {"request_id": request_id})
    return ok(updated.data[0])


# ---------- sessions ----------

def _load_session(session_id: str, user: dict):
    res = supabase.table("pz_mentor_sessions").select("*, mentors:pz_mentors(user_id)").eq("id", session_id).limit(1).execute()
    if not res.data:
        raise AppError(404, "NOT_FOUND", "Session not found")
    s = res.data[0]
    mentor_user_id = s["mentors"]["user_id"]
    if user["id"] not in (mentor_user_id, s["founder_id"]) and "mentors.manage" not in user["permissions"]:
        raise AppError(404, "NOT_FOUND", "Session not found")
    return s, mentor_user_id


@router.get("/sessions")
def list_sessions(status: Optional[str] = None, user: dict = Depends(get_current_user)):
    mentor = _my_mentor(user)
    q = supabase.table("pz_mentor_sessions").select("*")
    q = q.eq("mentor_id", mentor["id"]) if mentor else q.eq("founder_id", user["id"])
    if status:
        q = q.eq("status", status)
    return ok(q.order("scheduled_at", desc=True).execute().data)


@router.post("/sessions", status_code=201)
def create_session(body: SessionCreate, user: dict = Depends(get_current_user)):
    mentor = _mentor_by_id(body.mentor_id)
    if user["id"] not in (mentor["user_id"], body.founder_id):
        raise AppError(403, "FORBIDDEN", "You can only schedule sessions you take part in")
    accepted = supabase.table("pz_mentorship_requests").select("id").eq("mentor_id", body.mentor_id) \
        .eq("founder_id", body.founder_id).eq("status", "ACCEPTED").limit(1).execute()
    if not accepted.data:
        raise AppError(409, "NO_ACCEPTED_REQUEST", "An accepted mentorship request is required first")
    res = supabase.table("pz_mentor_sessions").insert(body.model_dump(mode="json")).execute()
    other = body.founder_id if user["id"] == mentor["user_id"] else mentor["user_id"]
    notify(other, "MENTORSHIP", "Mentor session scheduled",
           f"A session was scheduled for {body.scheduled_at:%Y-%m-%d %H:%M} UTC.", {"session_id": res.data[0]["id"]})
    return ok(res.data[0])


@router.patch("/sessions/{session_id}")
def update_session(session_id: str, body: SessionUpdate, user: dict = Depends(get_current_user)):
    s, mentor_user_id = _load_session(session_id, user)
    if s["status"] != "SCHEDULED":
        raise AppError(409, "CONFLICT", f"Session is already {s['status']}")
    changes = body.model_dump(mode="json", exclude_unset=True)
    if changes.get("status") == "COMPLETED" and user["id"] != mentor_user_id:
        raise AppError(403, "FORBIDDEN", "Only the mentor can mark a session completed")
    if "notes" in changes and user["id"] != mentor_user_id:
        raise AppError(403, "FORBIDDEN", "Only the mentor can write session notes")
    if not changes:
        raise AppError(400, "NO_CHANGES", "Nothing to update")
    changes["updated_at"] = now_utc()
    return ok(supabase.table("pz_mentor_sessions").update(changes).eq("id", session_id).execute().data[0])


@router.post("/sessions/{session_id}/cancel")
def cancel_session(session_id: str, user: dict = Depends(get_current_user)):
    s, mentor_user_id = _load_session(session_id, user)
    if s["status"] != "SCHEDULED":
        raise AppError(409, "CONFLICT", f"Session is already {s['status']}")
    res = supabase.table("pz_mentor_sessions").update({"status": "CANCELLED", "updated_at": now_utc()}).eq("id", session_id).execute()
    other = s["founder_id"] if user["id"] == mentor_user_id else mentor_user_id
    notify(other, "MENTORSHIP", "Mentor session cancelled", "A scheduled session was cancelled.", {"session_id": session_id})
    return ok(res.data[0])


@router.post("/sessions/{session_id}/feedback", status_code=201)
def session_feedback(session_id: str, body: Feedback, user: dict = Depends(get_current_user)):
    s, _ = _load_session(session_id, user)
    if s["status"] != "COMPLETED":
        raise AppError(409, "CONFLICT", "Feedback is only allowed after the session is completed")
    dup = supabase.table("pz_mentor_feedback").select("id").eq("session_id", session_id).eq("from_user_id", user["id"]).execute()
    if dup.data:
        raise AppError(409, "CONFLICT", "You already left feedback for this session")
    res = supabase.table("pz_mentor_feedback").insert({
        "session_id": session_id, "from_user_id": user["id"], "rating": body.rating, "comment": body.comment,
    }).execute()
    return ok(res.data[0])