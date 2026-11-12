from uuid import UUID

from app.services import investor_service
from fastapi import APIRouter, Depends

from app.core.exceptions import AppError
from app.dependencies.auth import get_current_user
from app.repositories.introduction_repository import IntroductionRepository
from app.repositories.startup_repository import StartupRepository
from app.schemas.introduction import IntroNote
from app.services import startup_service
from app.utils.helpers import log_audit, notify, now_utc, ok

router = APIRouter(prefix="/introductions", tags=["Introductions"])
introductions = IntroductionRepository()
startups = StartupRepository()


def _load(request_id: str, user: dict) -> tuple[dict, str]:
    """Return (request, viewer_role). Anyone who isn't a participant or staff gets a 404."""
    req = introductions.get_detail(request_id)
    if not req:
        raise AppError(404, "NOT_FOUND", "Introduction request not found")
    if req["investors"]["user_id"] == user["id"]:
        return req, "investor"
    if req["startup_id"] in startup_service.my_startup_ids(user["id"], founder_only=True):
        return req, "founder"
    if "investors.access" in user["permissions"]:
        return req, "staff"
    raise AppError(404, "NOT_FOUND", "Introduction request not found")


def _notify_other_side(req: dict, role: str, title: str, message: str):
    data = {"request_id": req["id"]}
    if role != "investor":
        notify(req["investors"]["user_id"], "INVESTOR", title, message, data)
    if role != "founder":
        for founder_id in startups.founder_user_ids(req["startup_id"]):
            notify(founder_id, "INVESTOR", title, message, data)


@router.get("/{request_id}")
def get_introduction(request_id: UUID, user: dict = Depends(get_current_user)):
    req, _ = _load(str(request_id), user)
    return ok(req)


@router.post("/{request_id}/meeting")
def mark_meeting(request_id: UUID, body: IntroNote = IntroNote(), user: dict = Depends(get_current_user)):
    req, role = _load(str(request_id), user)
    if req["status"] != "accepted":
        raise AppError(409, "CONFLICT", f"Request is {req['status']}; it must be accepted first")
    updated = introductions.update(req["id"], {"status": "meeting", "updated_at": now_utc()})
    investor_service.set_interest(req["investor_id"], req["startup_id"], "MEETING",
                                  only_from=["DISCOVERED", "SAVED", "INTERESTED", "INTRODUCTION"])
    _notify_other_side(req, role, "Meeting scheduled", body.note or "A meeting was marked for this introduction.")
    log_audit(user["id"], "introduction.meeting", "introduction_request", req["id"], {"note": body.note})
    return ok(updated)


@router.post("/{request_id}/close")
def close_introduction(request_id: UUID, body: IntroNote = IntroNote(), user: dict = Depends(get_current_user)):
    req, role = _load(str(request_id), user)
    if req["status"] not in ("accepted", "meeting"):
        raise AppError(409, "CONFLICT", f"Cannot close a request that is {req['status']}")
    updated = introductions.update(req["id"], {"status": "closed", "updated_at": now_utc()})
    _notify_other_side(req, role, "Introduction closed", body.note or "This introduction was closed.")
    log_audit(user["id"], "introduction.closed", "introduction_request", req["id"], {"note": body.note})
    return ok(updated)