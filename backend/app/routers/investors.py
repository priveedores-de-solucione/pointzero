from collections import Counter
from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.core.exceptions import AppError
from app.core.permissions import SELF_SERVICE_ROLES
from app.core.supabase import supabase
from app.dependencies.auth import get_current_user
from app.dependencies.roles import require_permission
from app.middleware.rate_limit import rate_limit
from app.schemas.investor import DealFlowUpdate, IntroCreate, InvestorApply, InvestorUpdate
from app.utils.helpers import log_audit, notify, now_utc, ok, page_range, paginated, search_term
from app.services.investor_service import (
    my_investor as _my_investor, set_interest as _set_interest,
    verified_investor as _verified_investor, visible_query as _visible_query,
)
router = APIRouter(prefix="/investors", tags=["Investors"])
introductions_router = APIRouter(prefix="/introductions", tags=["Introductions (founder)"])
admin_router = APIRouter(prefix="/admin", tags=["Admin: Investors"])

OPEN_INTRO = ["pending_review", "founder_pending", "accepted"]


# ---------- application / profile ----------

@router.post("/apply", status_code=201, dependencies=[Depends(rate_limit(5, 3600))])
def apply(body: InvestorApply, user: dict = Depends(get_current_user)):
    if _my_investor(user):
        raise AppError(409, "CONFLICT", "You already applied as an investor")
    data = body.model_dump()
    data.update({"user_id": user["id"], "verification_status": "PENDING"})
    inv = supabase.table("pz_investors").insert(data).execute().data[0]
    if user["role"] in SELF_SERVICE_ROLES and user["role"] != "INVESTOR":
        supabase.table("pz_profiles").update({"role": "INVESTOR"}).eq("id", user["id"]).execute()
    notify(user["id"], "INVESTOR", "Investor application received",
           "We received your application and will review it shortly.", {"investor_id": inv["id"]})
    return ok(inv)


@router.get("/me")
def get_me(user: dict = Depends(get_current_user)):
    inv = _my_investor(user)
    if not inv:
        raise AppError(404, "NOT_FOUND", "No investor profile")
    return ok(inv)


@router.patch("/me")
def update_me(body: InvestorUpdate, user: dict = Depends(get_current_user)):
    inv = _my_investor(user)
    if not inv:
        raise AppError(404, "NOT_FOUND", "No investor profile")
    changes = body.model_dump(exclude_unset=True)   # verification_status is not in the schema on purpose
    if not changes:
        raise AppError(400, "NO_CHANGES", "Nothing to update")
    changes["updated_at"] = now_utc()
    return ok(supabase.table("pz_investors").update(changes).eq("id", inv["id"]).execute().data[0])


# ---------- dashboard / discovery ----------

@router.get("/dashboard")
def dashboard(user: dict = Depends(get_current_user)):
    inv = _verified_investor(user)
    new = _visible_query(inv).order("created_at", desc=True).limit(5).execute().data
    recommended = []
    if inv["industries"]:
        recommended = _visible_query(inv).in_("industry", inv["industries"]).limit(5).execute().data
    saved = supabase.table("pz_saved_startups").select("id", count="exact").eq("investor_id", inv["id"]).limit(1).execute().count or 0
    intros = supabase.table("pz_introduction_requests").select("*, startups:pz_startups(name,slug,logo_url)") \
        .eq("investor_id", inv["id"]).order("created_at", desc=True).limit(5).execute().data
    flow = supabase.table("pz_investment_interests").select("status").eq("investor_id", inv["id"]).execute().data
    events = supabase.table("pz_events").select("id,title,slug,start_time,location").eq("status", "PUBLISHED") \
        .gte("start_time", now_utc()).order("start_time").limit(5).execute().data
    return ok({
        "recommended_startups": recommended, "new_startups": new, "saved_count": saved,
        "introduction_requests": intros, "deal_flow_counts": dict(Counter(r["status"] for r in flow)),
        "upcoming_events": events,
    })


@router.get("/startups")
def discover(
    q: Optional[str] = None, industry: Optional[str] = None, stage: Optional[str] = None,
    location: Optional[str] = None, program_id: Optional[str] = None, cohort_id: Optional[str] = None,
    sort: str = Query("newest", pattern="^(newest|name)$"),
    page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100),
    user: dict = Depends(get_current_user),
):
    inv = _verified_investor(user)
    start, end = page_range(page, limit)
    query = _visible_query(inv, count="exact")
    for col, val in (("industry", industry), ("stage", stage), ("location", location),
                     ("program_id", program_id), ("cohort_id", cohort_id)):
        if val:
            query = query.eq(col, val)
    if q and search_term(q):
        query = query.ilike("name", f"%{search_term(q)}%")
    query = query.order("name") if sort == "name" else query.order("created_at", desc=True)
    res = query.range(start, end).execute()
    return paginated(res.data, page, limit, res.count or 0)


@router.get("/startups/{startup_id}")
def startup_detail(startup_id: str, user: dict = Depends(get_current_user)):
    inv = _verified_investor(user)
    res = _visible_query(inv).eq("id", startup_id).limit(1).execute()
    if not res.data:
        raise AppError(404, "NOT_FOUND", "Startup not found")
    s = res.data[0]
    s["founders"] = supabase.table("pz_startup_members").select("role,profiles:pz_profiles(id,first_name,last_name,avatar_url)") \
        .eq("startup_id", startup_id).eq("is_founder", True).execute().data
    s["metrics"] = supabase.table("pz_startup_metrics").select("name,value,recorded_at") \
        .eq("startup_id", startup_id).order("recorded_at", desc=True).limit(20).execute().data
    return ok(s)


# ---------- saved ----------

@router.post("/startups/{startup_id}/save", status_code=201)
def save_startup(startup_id: str, user: dict = Depends(get_current_user)):
    inv = _verified_investor(user)
    if not _visible_query(inv).eq("id", startup_id).limit(1).execute().data:
        raise AppError(404, "NOT_FOUND", "Startup not found")
    exists = supabase.table("pz_saved_startups").select("id").eq("investor_id", inv["id"]).eq("startup_id", startup_id).execute()
    if not exists.data:
        supabase.table("pz_saved_startups").insert({"investor_id": inv["id"], "startup_id": startup_id}).execute()
        _set_interest(inv["id"], startup_id, "SAVED", only_from=["DISCOVERED"])
    return ok({"saved": True})


@router.delete("/startups/{startup_id}/save", status_code=204)
def unsave_startup(startup_id: str, user: dict = Depends(get_current_user)):
    inv = _verified_investor(user)
    supabase.table("pz_saved_startups").delete().eq("investor_id", inv["id"]).eq("startup_id", startup_id).execute()
    supabase.table("pz_investment_interests").delete().eq("investor_id", inv["id"]).eq("startup_id", startup_id).eq("status", "SAVED").execute()


@router.get("/saved-startups")
def saved_startups(user: dict = Depends(get_current_user)):
    inv = _verified_investor(user)
    res = supabase.table("pz_saved_startups").select("created_at, startups:pz_startups(*)").eq("investor_id", inv["id"]).order("created_at", desc=True).execute()
    return ok([{**r["startups"], "saved_at": r["created_at"]} for r in res.data if r["startups"]])


# ---------- deal flow ----------

@router.get("/deal-flow")
def deal_flow(user: dict = Depends(get_current_user)):
    inv = _verified_investor(user)
    res = supabase.table("pz_investment_interests").select("*, startups:pz_startups(id,name,slug,logo_url,industry,stage)") \
        .eq("investor_id", inv["id"]).order("updated_at", desc=True).execute()
    return ok(res.data)


@router.patch("/deal-flow/{interest_id}")
def update_deal_flow(interest_id: str, body: DealFlowUpdate, user: dict = Depends(get_current_user)):
    inv = _verified_investor(user)
    changes = body.model_dump(exclude_unset=True)
    if not changes:
        raise AppError(400, "NO_CHANGES", "Nothing to update")
    changes["updated_at"] = now_utc()
    res = supabase.table("pz_investment_interests").update(changes).eq("id", interest_id).eq("investor_id", inv["id"]).execute()
    if not res.data:
        raise AppError(404, "NOT_FOUND", "Deal not found")
    return ok(res.data[0])


# ---------- introductions (investor side) ----------

@router.post("/introductions", status_code=201, dependencies=[Depends(rate_limit(10, 3600))])
def request_intro(body: IntroCreate, user: dict = Depends(get_current_user)):
    inv = _verified_investor(user)
    if not _visible_query(inv).eq("id", body.startup_id).limit(1).execute().data:
        raise AppError(404, "NOT_FOUND", "Startup not found")
    dup = supabase.table("pz_introduction_requests").select("id").eq("investor_id", inv["id"]) \
        .eq("startup_id", body.startup_id).in_("status", OPEN_INTRO).execute()
    if dup.data:
        raise AppError(409, "CONFLICT", "You already have an open introduction request for this startup")
    req = supabase.table("pz_introduction_requests").insert({
        "investor_id": inv["id"], "startup_id": body.startup_id,
        "message": body.message, "reason": body.reason, "status": "pending_review",
    }).execute().data[0]
    _set_interest(inv["id"], body.startup_id, "INTERESTED", only_from=["DISCOVERED", "SAVED"])
    notify(user["id"], "INVESTOR", "Introduction request received",
           "POINTZERO will review your request before it reaches the founders.", {"request_id": req["id"]})
    return ok(req)


@router.get("/introductions")
def my_introductions(user: dict = Depends(get_current_user)):
    inv = _verified_investor(user)
    res = supabase.table("pz_introduction_requests").select("*, startups:pz_startups(name,slug,logo_url)") \
        .eq("investor_id", inv["id"]).order("created_at", desc=True).execute()
    return ok(res.data)


# ---------- introductions (founder side) ----------

def _founder_startup_ids(user_id: str) -> list[str]:
    res = supabase.table("pz_startup_members").select("startup_id").eq("user_id", user_id).eq("is_founder", True).execute()
    return [r["startup_id"] for r in res.data]


@introductions_router.get("/incoming")
def incoming(user: dict = Depends(get_current_user)):
    ids = _founder_startup_ids(user["id"])
    if not ids:
        return ok([])
    res = supabase.table("pz_introduction_requests") \
        .select("*, investors:pz_investors(organization,investor_type,investment_thesis), startups:pz_startups(name,slug)") \
        .in_("startup_id", ids).in_("status", ["founder_pending", "accepted", "declined"]) \
        .order("created_at", desc=True).execute()
    return ok(res.data)


def _founder_respond(request_id: str, accept: bool, user: dict):
    res = supabase.table("pz_introduction_requests").select("*").eq("id", request_id).limit(1).execute()
    if not res.data or res.data[0]["startup_id"] not in _founder_startup_ids(user["id"]):
        raise AppError(404, "NOT_FOUND", "Introduction request not found")
    req = res.data[0]
    if req["status"] != "founder_pending":
        raise AppError(409, "CONFLICT", f"Request is {req['status']}")
    inv = supabase.table("pz_investors").select("user_id").eq("id", req["investor_id"]).limit(1).execute().data[0]
    update = {"status": "accepted" if accept else "declined", "updated_at": now_utc()}

    if accept:
        conv = supabase.table("pz_conversations").insert({}).execute().data[0]
        founders = supabase.table("pz_startup_members").select("user_id").eq("startup_id", req["startup_id"]).eq("is_founder", True).execute().data
        member_ids = {inv["user_id"], *[f["user_id"] for f in founders]}
        supabase.table("pz_conversation_members").insert([{"conversation_id": conv["id"], "user_id": uid} for uid in member_ids]).execute()
        update["conversation_id"] = conv["id"]
        _set_interest(req["investor_id"], req["startup_id"], "INTRODUCTION", only_from=["DISCOVERED", "SAVED", "INTERESTED"])

    updated = supabase.table("pz_introduction_requests").update(update).eq("id", request_id).execute().data[0]
    notify(inv["user_id"], "INVESTOR",
           "Introduction accepted" if accept else "Introduction declined",
           "The founders accepted your introduction. You can now message them." if accept
           else "The founders declined your introduction request.",
           {"request_id": request_id, "conversation_id": update.get("conversation_id")})
    log_audit(user["id"], f"introduction.{update['status']}", "introduction_request", request_id)
    return ok(updated)


@introductions_router.post("/{request_id}/accept")
def accept_intro(request_id: str, user: dict = Depends(get_current_user)):
    return _founder_respond(request_id, True, user)


@introductions_router.post("/{request_id}/decline")
def decline_intro(request_id: str, user: dict = Depends(get_current_user)):
    return _founder_respond(request_id, False, user)


# ---------- admin: investors ----------

@admin_router.get("/investors")
def admin_list_investors(
    verification_status: Optional[str] = None,
    page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100),
    _: dict = Depends(require_permission("investors.read")),
):
    start, end = page_range(page, limit)
    q = supabase.table("pz_investors").select("*, profiles:pz_profiles(first_name,last_name,email)", count="exact")
    if verification_status:
        q = q.eq("verification_status", verification_status)
    res = q.order("created_at", desc=True).range(start, end).execute()
    return paginated(res.data, page, limit, res.count or 0)


def _set_verification(investor_id: str, status: str, title: str, message: str, user: dict):
    res = supabase.table("pz_investors").update({"verification_status": status, "updated_at": now_utc()}).eq("id", investor_id).execute()
    if not res.data:
        raise AppError(404, "NOT_FOUND", "Investor not found")
    inv = res.data[0]
    notify(inv["user_id"], "INVESTOR", title, message, {"investor_id": investor_id})
    log_audit(user["id"], f"investor.{status.lower()}", "investor", investor_id)
    return ok(inv)


@admin_router.post("/investors/{investor_id}/verify")
def verify_investor(investor_id: str, user: dict = Depends(require_permission("investors.verify"))):
    return _set_verification(investor_id, "VERIFIED", "You're verified",
                             "Your investor account is verified. You now have access to startup discovery.", user)


@admin_router.post("/investors/{investor_id}/reject")
def reject_investor(investor_id: str, user: dict = Depends(require_permission("investors.verify"))):
    return _set_verification(investor_id, "REJECTED", "Investor application update",
                             "We're unable to verify your investor account at this time.", user)


@admin_router.post("/investors/{investor_id}/suspend")
def suspend_investor(investor_id: str, user: dict = Depends(require_permission("investors.verify"))):
    return _set_verification(investor_id, "SUSPENDED", "Investor access suspended",
                             "Your investor access has been suspended. Contact POINTZERO for details.", user)


# ---------- admin: introduction review ----------

@admin_router.get("/introductions")
def admin_list_intros(
    status: Optional[str] = None,
    page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100),
    _: dict = Depends(require_permission("investors.access")),
):
    start, end = page_range(page, limit)
    q = supabase.table("pz_introduction_requests").select("*, investors:pz_investors(organization,investor_type), startups:pz_startups(name,slug)", count="exact")
    if status:
        q = q.eq("status", status)
    res = q.order("created_at", desc=True).range(start, end).execute()
    return paginated(res.data, page, limit, res.count or 0)


def _review_intro(request_id: str, approve: bool, user: dict):
    res = supabase.table("pz_introduction_requests").select("*").eq("id", request_id).limit(1).execute()
    if not res.data:
        raise AppError(404, "NOT_FOUND", "Introduction request not found")
    req = res.data[0]
    if req["status"] != "pending_review":
        raise AppError(409, "CONFLICT", f"Request is already {req['status']}")
    new_status = "founder_pending" if approve else "rejected"
    updated = supabase.table("pz_introduction_requests").update(
        {"status": new_status, "reviewed_by": user["id"], "updated_at": now_utc()}
    ).eq("id", request_id).execute().data[0]

    inv = supabase.table("pz_investors").select("user_id").eq("id", req["investor_id"]).limit(1).execute().data[0]
    if approve:
        founders = supabase.table("pz_startup_members").select("user_id").eq("startup_id", req["startup_id"]).eq("is_founder", True).execute().data
        for f in founders:
            notify(f["user_id"], "INVESTOR", "An investor wants to meet you",
                   "POINTZERO approved an investor introduction request. Review it in your dashboard.", {"request_id": request_id})
        notify(inv["user_id"], "INVESTOR", "Introduction approved", "Your request was approved and sent to the founders.", {"request_id": request_id})
    else:
        notify(inv["user_id"], "INVESTOR", "Introduction not approved", "Your introduction request was not approved.", {"request_id": request_id})
    log_audit(user["id"], f"introduction.{new_status}", "introduction_request", request_id)
    return ok(updated)


@admin_router.post("/introductions/{request_id}/approve")
def approve_intro(request_id: str, user: dict = Depends(require_permission("investors.access"))):
    return _review_intro(request_id, True, user)


@admin_router.post("/introductions/{request_id}/reject")
def reject_intro(request_id: str, user: dict = Depends(require_permission("investors.access"))):
    return _review_intro(request_id, False, user)