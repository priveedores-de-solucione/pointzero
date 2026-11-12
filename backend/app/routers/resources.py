from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.core.exceptions import AppError
from app.core.supabase import supabase
from app.dependencies.roles import require_permission
from app.schemas.content import ResourceCreate, ResourceUpdate
from app.utils.helpers import log_audit, now_utc, ok, page_range, paginated, search_term, unique_slug

router = APIRouter(prefix="/resources", tags=["Resources"])
admin_router = APIRouter(prefix="/admin/resources", tags=["Admin: Resources"])

LIST_COLUMNS = "id,title,slug,description,type,category,cover_image,published_at,author_id"


@router.get("")
def list_resources(
    category: Optional[str] = None, q: Optional[str] = None,
    page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100),
):
    start, end = page_range(page, limit)
    query = supabase.table("pz_resources").select(LIST_COLUMNS, count="exact").eq("status", "PUBLISHED")
    if category:
        query = query.eq("category", category)
    if q and search_term(q):
        query = query.ilike("title", f"%{search_term(q)}%")
    res = query.order("published_at", desc=True).range(start, end).execute()
    return paginated(res.data, page, limit, res.count or 0)


@router.get("/{slug}")
def get_resource(slug: str):
    res = supabase.table("pz_resources").select("*, profiles(first_name,last_name,avatar_url)") \
        .eq("slug", slug).eq("status", "PUBLISHED").limit(1).execute()
    if not res.data:
        raise AppError(404, "NOT_FOUND", "Resource not found")
    r = res.data[0]
    r["reading_time"] = max(1, len((r.get("content") or "").split()) // 200)
    return ok(r)


@admin_router.post("", status_code=201)
def create_resource(body: ResourceCreate, user: dict = Depends(require_permission("content.manage"))):
    data = body.model_dump(mode="json")
    data["slug"] = unique_slug("pz_resources", body.title)
    data["author_id"] = user["id"]
    if data["status"] == "PUBLISHED":
        data["published_at"] = now_utc()
    res = supabase.table("pz_resources").insert(data).execute()
    log_audit(user["id"], "resource.created", "resource", res.data[0]["id"])
    return ok(res.data[0])


@admin_router.patch("/{resource_id}")
def update_resource(resource_id: str, body: ResourceUpdate, user: dict = Depends(require_permission("content.manage"))):
    changes = body.model_dump(mode="json", exclude_unset=True)
    if not changes:
        raise AppError(400, "NO_CHANGES", "Nothing to update")
    if changes.get("status") == "PUBLISHED":
        current = supabase.table("pz_resources").select("published_at").eq("id", resource_id).limit(1).execute().data
        if current and not current[0]["published_at"]:
            changes["published_at"] = now_utc()
    res = supabase.table("pz_resources").update(changes).eq("id", resource_id).execute()
    if not res.data:
        raise AppError(404, "NOT_FOUND", "Resource not found")
    log_audit(user["id"], "resource.updated", "resource", resource_id, changes)
    return ok(res.data[0])


@admin_router.delete("/{resource_id}", status_code=204)
def archive_resource(resource_id: str, user: dict = Depends(require_permission("content.manage"))):
    res = supabase.table("pz_resources").update({"status": "ARCHIVED"}).eq("id", resource_id).execute()
    if not res.data:
        raise AppError(404, "NOT_FOUND", "Resource not found")
    log_audit(user["id"], "resource.archived", "resource", resource_id)