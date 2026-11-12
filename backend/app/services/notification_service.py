from typing import Optional

from app.core.exceptions import AppError
from app.core.supabase import supabase
from app.repositories.notification_repository import NotificationRepository
from app.services.email_service import send_email

notifications = NotificationRepository()

BATCH = 500
MAX_EMAIL_RECIPIENTS = 200


def unread_count(user_id: str) -> int:
    return notifications.unread_count(user_id)


def _recipients(role: Optional[str], user_ids: Optional[list[str]]) -> list[dict]:
    rows, start = [], 0
    while True:
        q = supabase.table("pz_profiles").select("id,email").eq("status", "ACTIVE")
        if user_ids:
            q = q.in_("id", user_ids)
        elif role:
            q = q.eq("role", role)
        batch = q.range(start, start + 999).execute().data
        rows += batch
        if len(batch) < 1000:
            return rows
        start += 1000


def broadcast(title: str, message: str, role: Optional[str] = None,
              user_ids: Optional[list[str]] = None, email_too: bool = False) -> int:
    """Send an in-app notification to a role, a list of users, or everyone. Returns recipient count."""
    recipients = _recipients(role, user_ids)
    if not recipients:
        return 0
    if email_too and len(recipients) > MAX_EMAIL_RECIPIENTS:
        raise AppError(422, "TOO_MANY_RECIPIENTS", f"Email broadcasts are limited to {MAX_EMAIL_RECIPIENTS} people")

    rows = [{"user_id": r["id"], "type": "SYSTEM", "title": title, "message": message, "data": {}} for r in recipients]
    for i in range(0, len(rows), BATCH):
        supabase.table("pz_notifications").insert(rows[i:i + BATCH]).execute()

    if email_too:
        muted = {r["user_id"] for r in supabase.table("pz_notification_preferences").select("user_id")
                 .eq("email_notifications", False).execute().data}
        for r in recipients:
            if r["id"] not in muted:
                send_email(r["email"], title, message)
    return len(recipients)