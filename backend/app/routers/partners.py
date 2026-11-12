from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.core.exceptions import AppError
from app.core.supabase import supabase
from app.dependencies.roles import require_permission
from app.middleware.rate_limit import rate_limit
from app.schemas.content import PartnerApply, PartnerUpdate
from app.utils.helpers import log_audit, ok, page_range, paginated, unique_slug

router = APIRouter(prefix="/partners", tags=["Partners"])
admin_router = APIRouter(prefix="/admin/partners", tags=["Admin: Partners"])


@router.get("")
def list_partners(
    partner_type: Optional[str] = None,
    page: int = Query(1, ge=1), limit: int = Query(50, ge=1, le=100),
):
    start, end = page_range(page, limit)
    q = supabase.table("pz_partners").select("id,organization,slug,description,logo_url,website,partner_type", count="exact") \
        .eq("status", "APPROVED")
    if partner_type:
        q = q.eq("partner_type", partner_type)
    res = q.order("organization").range(start, end).execute()
    return paginated(res.data, page, limit, res.count or 0)


@router.post("/apply", status_code=201, dependencies=[Depends(rate_limit(5, 3600))])
def apply(body: PartnerApply):
    data = body.model_dump()
    data["slug"] = unique_slug("pz_partners", body.organization)
    data["status"] = "PENDING"
    supabase.table("pz_partners").insert(data).execute()
    return ok({"message": "Application received"})


@router.get("/{slug}")
def get_partner(slug: str):
    res = supabase.table("pz_partners").select("id,organization,slug,description,logo_url,website,partner_type") \
        .eq("slug", slug).eq("status", "APPROVED").limit(1).execute()
    if not res.data:
        raise AppError(404, "NOT_FOUND", "Partner not found")
    return ok(res.data[0])


# ---------- admin ----------

@admin_router.get("")
def admin_list(
    status: Optional[str] = None, page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100),
    _: dict = Depends(require_permission("partners.manage")),
):
    start, end = page_range(page, limit)
    q = supabase.table("pz_partners").select("*", count="exact")
    if status:
        q = q.eq("status", status)
    res = q.order("created_at", desc=True).range(start, end).execute()
    return paginated(res.data, page, limit, res.count or 0)


@admin_router.post("", status_code=201)
def admin_create(body: PartnerApply, user: dict = Depends(require_permission("partners.manage"))):
    data = body.model_dump()
    data["slug"] = unique_slug("pz_partners", body.organization)
    data["status"] = "APPROVED"
    res = supabase.table("pz_partners").insert(data).execute()
    log_audit(user["id"], "partner.created", "partner", res.data[0]["id"])
    return ok(res.data[0])


@admin_router.patch("/{partner_id}")
def admin_update(partner_id: str, body: PartnerUpdate, user: dict = Depends(require_permission("partners.manage"))):
    changes = body.model_dump(exclude_unset=True)
    if not changes:
        raise AppError(400, "NO_CHANGES", "Nothing to update")
    res = supabase.table("pz_partners").update(changes).eq("id", partner_id).execute()
    if not res.data:
        raise AppError(404, "NOT_FOUND", "Partner not found")
    log_audit(user["id"], "partner.updated", "partner", partner_id, changes)
    return ok(res.data[0])


def _set_status(partner_id: str, status: str, user: dict):
    res = supabase.table("pz_partners").update({"status": status}).eq("id", partner_id).execute()
    if not res.data:
        raise AppError(404, "NOT_FOUND", "Partner not found")
    log_audit(user["id"], f"partner.{status.lower()}", "partner", partner_id)
    return ok(res.data[0])


@admin_router.post("/{partner_id}/approve")
def approve(partner_id: str, user: dict = Depends(require_permission("partners.manage"))):
    return _set_status(partner_id, "APPROVED", user)


@admin_router.post("/{partner_id}/reject")
def reject(partner_id: str, user: dict = Depends(require_permission("partners.manage"))):
    return _set_status(partner_id, "REJECTED", user)