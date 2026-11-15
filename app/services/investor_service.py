from typing import Optional

from app.core.exceptions import AppError
from app.core.supabase import supabase
from app.repositories.investor_repository import InvestorRepository
from app.utils.helpers import now_utc

investors = InvestorRepository()


def my_investor(user: dict) -> Optional[dict]:
    return investors.by_user(user["id"])


def verified_investor(user: dict) -> dict:
    inv = my_investor(user)
    if not inv:
        raise AppError(403, "NOT_AN_INVESTOR", "Apply as an investor first")
    if inv["verification_status"] != "VERIFIED":
        raise AppError(403, "INVESTOR_NOT_VERIFIED", "Your investor account is not verified")
    return inv


def access_ids(investor_id: str) -> list[str]:
    return investors.access_startup_ids(investor_id)


def visible_query(inv: dict, columns: str = "*", **kwargs):
    """Startups this investor may see: investor_visible, or explicitly granted access."""
    q = supabase.table("pz_startups").select(columns, **kwargs).is_("archived_at", "null")
    ids = access_ids(inv["id"])
    if ids:
        return q.or_(f"investor_visible.eq.true,id.in.({','.join(ids)})")
    return q.eq("investor_visible", True)


def set_interest(investor_id: str, startup_id: str, status: str, only_from: Optional[list[str]] = None):
    res = supabase.table("pz_investment_interests").select("*") \
        .eq("investor_id", investor_id).eq("startup_id", startup_id).execute()
    if res.data:
        if only_from is None or res.data[0]["status"] in only_from:
            supabase.table("pz_investment_interests").update({"status": status, "updated_at": now_utc()}) \
                .eq("id", res.data[0]["id"]).execute()
    else:
        supabase.table("pz_investment_interests").insert(
            {"investor_id": investor_id, "startup_id": startup_id, "status": status}
        ).execute()