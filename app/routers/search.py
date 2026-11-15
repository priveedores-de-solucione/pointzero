from typing import Literal, Optional

from fastapi import APIRouter, Depends, Query

from app.core.supabase import supabase
from app.dependencies.auth import get_optional_user
from app.utils.helpers import ok, page_range, search_term

router = APIRouter(tags=["Search"])


def _startup_filter(user: Optional[dict]) -> Optional[str]:
    """PostgREST or-filter for startups this user may discover; None = unrestricted (staff)."""
    if user and "startups.read" in user["permissions"]:
        return None
    conds = ["is_public.eq.true"]
    if user:
        mine = supabase.table("pz_startup_members").select("startup_id").eq("user_id", user["id"]).execute().data
        if mine:
            conds.append(f"id.in.({','.join(m['startup_id'] for m in mine)})")
        inv = supabase.table("pz_investors").select("id").eq("user_id", user["id"]).eq("verification_status", "VERIFIED").limit(1).execute().data
        if inv:
            conds.append("investor_visible.eq.true")
    return ",".join(conds)


@router.get("/search")
def search(
    q: str = Query(..., min_length=2, max_length=100),
    type: Optional[Literal["startups", "programs", "events", "resources", "people"]] = None,
    page: int = Query(1, ge=1), limit: int = Query(10, ge=1, le=50),
    user: Optional[dict] = Depends(get_optional_user),
):
    term = search_term(q)
    start, end = page_range(page, limit)
    out: dict = {}
    if not term:
        return ok(out, {"page": page, "limit": limit})

    if type in (None, "startups"):
        s = supabase.table("pz_startups").select("id,name,slug,logo_url,description,industry,stage") \
            .is_("archived_at", "null").ilike("name", f"%{term}%")
        flt = _startup_filter(user)
        if flt:
            s = s.or_(flt)
        out["startups"] = s.range(start, end).execute().data

    if type in (None, "programs"):
        out["programs"] = supabase.table("pz_programs").select("id,name,slug,description,status,type") \
            .ilike("name", f"%{term}%").range(start, end).execute().data

    if type in (None, "events"):
        out["events"] = supabase.table("pz_events").select("id,title,slug,start_time,location,cover_image") \
            .eq("status", "PUBLISHED").ilike("title", f"%{term}%").range(start, end).execute().data

    if type in (None, "resources"):
        out["resources"] = supabase.table("pz_resources").select("id,title,slug,description,category,cover_image") \
            .eq("status", "PUBLISHED").ilike("title", f"%{term}%").range(start, end).execute().data

    if type in (None, "people") and user:
        out["people"] = supabase.table("pz_profiles").select("id,first_name,last_name,avatar_url,role") \
            .eq("profile_public", True).eq("status", "ACTIVE") \
            .or_(f"first_name.ilike.%{term}%,last_name.ilike.%{term}%").range(start, end).execute().data

    return ok(out, {"page": page, "limit": limit})