import html
import re
import secrets
from app.services.email_service import send_email
from datetime import datetime, timezone
from typing import Any

from app.core.supabase import supabase


def now_utc() -> str:
    return datetime.now(timezone.utc).isoformat()


def ok(data: Any, meta: dict | None = None) -> dict:
    return {"data": data, "meta": meta or {}}


def page_range(page: int, limit: int) -> tuple[int, int]:
    start = (page - 1) * limit
    return start, start + limit - 1


def paginated(data: list, page: int, limit: int, total: int) -> dict:
    total_pages = (total + limit - 1) // limit if limit else 0
    return {
        "data": data,
        "meta": {"page": page, "limit": limit, "total": total, "total_pages": total_pages},
    }


def log_audit(user_id: str, action: str, entity_type: str, entity_id: str, metadata: dict | None = None):
    supabase.table("pz_audit_logs").insert({
        "user_id": user_id,
        "action": action,
        "entity_type": entity_type,
        "entity_id": entity_id,
        "metadata": metadata or {},
    }).execute()


def notify(user_id: str, type_: str, title: str, message: str, data: dict | None = None):
    supabase.table("pz_notifications").insert({
        "user_id": user_id, "type": type_, "title": title,
        "message": message, "data": data or {},
    }).execute()
    if type_ != "MESSAGE":
        _email_user(user_id, title, message)


def _email_user(user_id: str, title: str, message: str):
    try:
        profile = supabase.table("pz_profiles").select("email").eq("id", user_id).limit(1).execute().data
        if not profile:
            return
        prefs = supabase.table("pz_notification_preferences").select("email_notifications").eq("user_id", user_id).limit(1).execute().data
        if prefs and not prefs[0]["email_notifications"]:
            return
        send_email(profile[0]["email"], title, message)
    except Exception:
        pass  # email must never break the request


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-") or "item"


def unique_slug(table: str, text: str) -> str:
    base = slug = slugify(text)
    while supabase.table(table).select("id").eq("slug", slug).limit(1).execute().data:
        slug = f"{base}-{secrets.token_hex(2)}"
    return slug


def count_rows(table: str, **filters) -> int:
    q = supabase.table(table).select("id", count="exact").limit(1)
    for k, v in filters.items():
        q = q.eq(k, v)
    return q.execute().count or 0


def search_term(q: str) -> str:
    return re.sub(r"[,()%*\\]", " ", q).strip()