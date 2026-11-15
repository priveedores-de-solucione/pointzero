from fastapi import APIRouter, Depends, Query

from app.core.exceptions import AppError
from app.core.supabase import supabase
from app.dependencies.auth import get_current_user
from app.schemas.message import PreferenceUpdate
from app.utils.helpers import now_utc, ok, page_range, paginated

from app.dependencies.roles import require_permission
from app.schemas.notification import BroadcastCreate
from app.services import notification_service
from app.utils.helpers import log_audit

admin_router = APIRouter(prefix="/admin/notifications", tags=["Admin: Notifications"])

router = APIRouter(tags=["Notifications"])

DEFAULT_PREFS = {"email_notifications": True, "event_reminders": True, "message_notifications": True}


@router.get("/notifications")
def list_notifications(
    unread_only: bool = False, page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100),
    user: dict = Depends(get_current_user),
):
    start, end = page_range(page, limit)
    q = supabase.table("pz_notifications").select("*", count="exact").eq("user_id", user["id"])
    if unread_only:
        q = q.is_("read_at", "null")
    res = q.order("created_at", desc=True).range(start, end).execute()
    return paginated(res.data, page, limit, res.count or 0)


@router.get("/notifications/unread-count")
def unread_count(user: dict = Depends(get_current_user)):
    res = supabase.table("pz_notifications").select("id", count="exact").eq("user_id", user["id"]).is_("read_at", "null").limit(1).execute()
    return ok({"count": res.count or 0})


@router.post("/notifications/read-all")
def read_all(user: dict = Depends(get_current_user)):
    supabase.table("pz_notifications").update({"read_at": now_utc()}).eq("user_id", user["id"]).is_("read_at", "null").execute()
    return ok({"read": True})


@router.post("/notifications/{notification_id}/read")
def read_one(notification_id: str, user: dict = Depends(get_current_user)):
    res = supabase.table("pz_notifications").update({"read_at": now_utc()}) \
        .eq("id", notification_id).eq("user_id", user["id"]).execute()
    if not res.data:
        raise AppError(404, "NOT_FOUND", "Notification not found")
    return ok(res.data[0])


@router.get("/notification-preferences")
def get_preferences(user: dict = Depends(get_current_user)):
    res = supabase.table("pz_notification_preferences").select("*").eq("user_id", user["id"]).limit(1).execute()
    return ok(res.data[0] if res.data else DEFAULT_PREFS)


@router.patch("/notification-preferences")
def update_preferences(body: PreferenceUpdate, user: dict = Depends(get_current_user)):
    changes = body.model_dump(exclude_unset=True)
    if not changes:
        raise AppError(400, "NO_CHANGES", "Nothing to update")
    res = supabase.table("pz_notification_preferences").upsert(
        {"user_id": user["id"], **changes, "updated_at": now_utc()}, on_conflict="user_id"
    ).execute()
    return ok(res.data[0])



@admin_router.post("", status_code=201)
def broadcast(body: BroadcastCreate, user: dict = Depends(require_permission("users.manage"))):
    sent = notification_service.broadcast(
        body.title, body.message, role=body.role, user_ids=body.user_ids, email_too=body.send_email,
    )
    log_audit(user["id"], "notification.broadcast", "notification", "broadcast",
              {"title": body.title, "role": body.role, "recipients": sent})
    return ok({"sent": sent})