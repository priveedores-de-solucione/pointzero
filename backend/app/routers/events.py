from datetime import datetime, timezone
from typing import Literal, Optional

from fastapi import APIRouter, Depends, Query

from app.core.exceptions import AppError
from app.core.supabase import supabase
from app.dependencies.auth import get_current_user, get_optional_user
from app.dependencies.roles import require_permission
from app.schemas.content import EventCreate, EventUpdate
from app.utils.helpers import count_rows, log_audit, notify, now_utc, ok, page_range, paginated, unique_slug

router = APIRouter(prefix="/events", tags=["Events"])
admin_router = APIRouter(prefix="/admin/events", tags=["Admin: Events"])


def _published_event(event_id: str) -> dict:
    res = supabase.table("pz_events").select("*").eq("id", event_id).eq("status", "PUBLISHED").limit(1).execute()
    if not res.data:
        raise AppError(404, "NOT_FOUND", "Event not found")
    return res.data[0]


def _registered_count(event_id: str) -> int:
    return count_rows("pz_event_registrations", event_id=event_id, status="REGISTERED")


# ---------- public ----------

@router.get("")
def list_events(
    event_type: Optional[str] = None,
    when: Optional[Literal["upcoming", "past"]] = None,
    page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100),
):
    start, end = page_range(page, limit)
    q = supabase.table("pz_events").select("*", count="exact").eq("status", "PUBLISHED")
    if event_type:
        q = q.eq("event_type", event_type)
    now = now_utc()
    if when == "upcoming":
        q = q.gte("end_time", now).order("start_time")
    elif when == "past":
        q = q.lt("end_time", now).order("start_time", desc=True)
    else:
        q = q.order("start_time", desc=True)
    res = q.range(start, end).execute()
    return paginated(res.data, page, limit, res.count or 0)


@router.get("/{slug}")
def get_event(slug: str, user: Optional[dict] = Depends(get_optional_user)):
    res = supabase.table("pz_events").select("*").eq("slug", slug).eq("status", "PUBLISHED").limit(1).execute()
    if not res.data:
        raise AppError(404, "NOT_FOUND", "Event not found")
    e = res.data[0]
    count = _registered_count(e["id"])
    e["registrations_count"] = count
    e["is_full"] = bool(e["capacity"]) and count >= e["capacity"]
    e["registered"] = False
    if user:
        reg = supabase.table("pz_event_registrations").select("status").eq("event_id", e["id"]).eq("user_id", user["id"]).limit(1).execute().data
        e["registered"] = bool(reg and reg[0]["status"] == "REGISTERED")
    return ok(e)


# ---------- users ----------

@router.post("/{event_id}/register", status_code=201)
def register(event_id: str, user: dict = Depends(get_current_user)):
    event = _published_event(event_id)
    if datetime.fromisoformat(event["end_time"]) < datetime.now(timezone.utc):
        raise AppError(409, "REGISTRATION_CLOSED", "This event has ended")
    existing = supabase.table("pz_event_registrations").select("*").eq("event_id", event_id).eq("user_id", user["id"]).limit(1).execute().data
    if existing and existing[0]["status"] == "REGISTERED":
        raise AppError(409, "ALREADY_REGISTERED", "You are already registered")
    if event["capacity"] and _registered_count(event_id) >= event["capacity"]:
        raise AppError(409, "EVENT_FULL", "This event is full")
    if existing:
        res = supabase.table("pz_event_registrations").update({"status": "REGISTERED", "registered_at": now_utc()}).eq("id", existing[0]["id"]).execute()
    else:
        res = supabase.table("pz_event_registrations").insert({"event_id": event_id, "user_id": user["id"]}).execute()
    notify(user["id"], "EVENT", "Event registration confirmed",
           f"You're registered for {event['title']}.", {"event_id": event_id})
    return ok(res.data[0])


@router.delete("/{event_id}/register", status_code=204)
def cancel_registration(event_id: str, user: dict = Depends(get_current_user)):
    res = supabase.table("pz_event_registrations").update({"status": "CANCELLED"}) \
        .eq("event_id", event_id).eq("user_id", user["id"]).eq("status", "REGISTERED").execute()
    if not res.data:
        raise AppError(404, "NOT_FOUND", "You are not registered for this event")


@router.get("/{event_id}/registrations/me")
def my_registration(event_id: str, user: dict = Depends(get_current_user)):
    res = supabase.table("pz_event_registrations").select("*").eq("event_id", event_id).eq("user_id", user["id"]).limit(1).execute()
    return ok(res.data[0] if res.data else None)


# ---------- admin ----------

@admin_router.get("")
def admin_list(
    status: Optional[str] = None, page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100),
    _: dict = Depends(require_permission("events.manage")),
):
    start, end = page_range(page, limit)
    q = supabase.table("pz_events").select("*", count="exact")
    if status:
        q = q.eq("status", status)
    res = q.order("start_time", desc=True).range(start, end).execute()
    return paginated(res.data, page, limit, res.count or 0)


@admin_router.post("", status_code=201)
def admin_create(body: EventCreate, user: dict = Depends(require_permission("events.manage"))):
    if body.end_time <= body.start_time:
        raise AppError(422, "VALIDATION_ERROR", "end_time must be after start_time")
    data = body.model_dump(mode="json")
    data["slug"] = unique_slug("pz_events", body.title)
    event = supabase.table("pz_events").insert(data).execute().data[0]
    log_audit(user["id"], "event.created", "event", event["id"])
    return ok(event)


@admin_router.patch("/{event_id}")
def admin_update(event_id: str, body: EventUpdate, user: dict = Depends(require_permission("events.manage"))):
    changes = body.model_dump(mode="json", exclude_unset=True)
    if not changes:
        raise AppError(400, "NO_CHANGES", "Nothing to update")
    res = supabase.table("pz_events").update(changes).eq("id", event_id).execute()
    if not res.data:
        raise AppError(404, "NOT_FOUND", "Event not found")
    log_audit(user["id"], "event.updated", "event", event_id, changes)
    return ok(res.data[0])


@admin_router.delete("/{event_id}", status_code=204)
def admin_archive(event_id: str, user: dict = Depends(require_permission("events.manage"))):
    res = supabase.table("pz_events").update({"status": "ARCHIVED"}).eq("id", event_id).execute()
    if not res.data:
        raise AppError(404, "NOT_FOUND", "Event not found")
    log_audit(user["id"], "event.archived", "event", event_id)


@admin_router.get("/{event_id}/registrations")
def admin_registrations(event_id: str, _: dict = Depends(require_permission("events.manage"))):
    res = supabase.table("pz_event_registrations").select("*, profiles:pz_profiles(first_name,last_name,email)") \
        .eq("event_id", event_id).eq("status", "REGISTERED").execute()
    return ok(res.data)


@admin_router.post("/{event_id}/attendance/{user_id}")
def mark_attendance(event_id: str, user_id: str, user: dict = Depends(require_permission("events.manage"))):
    res = supabase.table("pz_event_registrations").update({"attended_at": now_utc()}) \
        .eq("event_id", event_id).eq("user_id", user_id).eq("status", "REGISTERED").execute()
    if not res.data:
        raise AppError(404, "NOT_FOUND", "Registration not found")
    return ok(res.data[0])