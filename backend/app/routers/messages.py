from fastapi import APIRouter, Depends, Query

from app.core.exceptions import AppError
from app.core.supabase import supabase
from app.dependencies.auth import get_current_user
from app.schemas.message import AttachmentBody, ConversationCreate, MessageCreate
from app.utils.helpers import notify, now_utc, ok, page_range, paginated

router = APIRouter(tags=["Messages"])


def _require_member(conversation_id: str, user: dict) -> list[str]:
    res = supabase.table("pz_conversation_members").select("user_id").eq("conversation_id", conversation_id).execute()
    ids = [r["user_id"] for r in res.data]
    if user["id"] not in ids:
        raise AppError(404, "NOT_FOUND", "Conversation not found")
    return ids


@router.get("/conversations")
def list_conversations(user: dict = Depends(get_current_user)):
    mine = supabase.table("pz_conversation_members").select("conversation_id").eq("user_id", user["id"]).execute().data
    ids = [m["conversation_id"] for m in mine]
    if not ids:
        return ok([])
    convs = supabase.table("pz_conversations").select("*").in_("id", ids).order("updated_at", desc=True).execute().data
    members = supabase.table("pz_conversation_members").select("conversation_id,user_id,profiles(first_name,last_name,avatar_url)") \
        .in_("conversation_id", ids).execute().data
    # Recent window only (1000 rows). Move to a SQL view/RPC if unread counts must be exact at scale.
    msgs = supabase.table("pz_messages").select("conversation_id,sender_id,body,read_at,created_at") \
        .in_("conversation_id", ids).order("created_at", desc=True).limit(1000).execute().data
    last, unread = {}, {}
    for m in msgs:
        cid = m["conversation_id"]
        last.setdefault(cid, m)
        if m["sender_id"] != user["id"] and not m["read_at"]:
            unread[cid] = unread.get(cid, 0) + 1
    for c in convs:
        c["members"] = [m for m in members if m["conversation_id"] == c["id"]]
        c["last_message"] = last.get(c["id"])
        c["unread_count"] = unread.get(c["id"], 0)
    return ok(convs)


@router.post("/conversations", status_code=201)
def create_conversation(body: ConversationCreate, user: dict = Depends(get_current_user)):
    targets = set(body.member_ids) - {user["id"]}
    if not targets:
        raise AppError(422, "VALIDATION_ERROR", "Add at least one other member")
    found = supabase.table("pz_profiles").select("id,role,status").in_("id", list(targets)).execute().data
    if len(found) != len(targets) or any(p["status"] != "ACTIVE" for p in found):
        raise AppError(404, "USER_NOT_FOUND", "One or more users were not found")

    is_staff = "investors.access" in user["permissions"]
    involves_investor = user["role"] == "INVESTOR" or any(p["role"] == "INVESTOR" for p in found)
    if involves_investor and not is_staff:
        # Investors only talk to founders through an approved introduction.
        raise AppError(403, "INTRODUCTION_REQUIRED", "Investor conversations start from an approved introduction")

    conv = supabase.table("pz_conversations").insert({}).execute().data[0]
    supabase.table("pz_conversation_members").insert(
        [{"conversation_id": conv["id"], "user_id": uid} for uid in targets | {user["id"]}]
    ).execute()
    return ok(conv)


@router.get("/conversations/{conversation_id}")
def get_conversation(conversation_id: str, user: dict = Depends(get_current_user)):
    _require_member(conversation_id, user)
    conv = supabase.table("pz_conversations").select("*").eq("id", conversation_id).limit(1).execute().data[0]
    conv["members"] = supabase.table("pz_conversation_members").select("user_id,profiles(first_name,last_name,avatar_url)") \
        .eq("conversation_id", conversation_id).execute().data
    return ok(conv)


@router.get("/conversations/{conversation_id}/messages")
def list_messages(
    conversation_id: str, page: int = Query(1, ge=1), limit: int = Query(50, ge=1, le=100),
    user: dict = Depends(get_current_user),
):
    _require_member(conversation_id, user)
    start, end = page_range(page, limit)
    res = supabase.table("pz_messages").select("*", count="exact").eq("conversation_id", conversation_id) \
        .order("created_at", desc=True).range(start, end).execute()
    return paginated(res.data, page, limit, res.count or 0)


@router.post("/conversations/{conversation_id}/messages", status_code=201)
def send_message(conversation_id: str, body: MessageCreate, user: dict = Depends(get_current_user)):
    ids = _require_member(conversation_id, user)
    msg = supabase.table("pz_messages").insert({
        "conversation_id": conversation_id, "sender_id": user["id"],
        "body": body.body, "attachment_url": body.attachment_url,
    }).execute().data[0]
    supabase.table("pz_conversations").update({"updated_at": now_utc()}).eq("id", conversation_id).execute()
    for uid in ids:
        if uid != user["id"]:
            notify(uid, "MESSAGE", "New message", body.body[:100], {"conversation_id": conversation_id})
    return ok(msg)


@router.post("/conversations/{conversation_id}/read")
def mark_read(conversation_id: str, user: dict = Depends(get_current_user)):
    _require_member(conversation_id, user)
    supabase.table("pz_messages").update({"read_at": now_utc()}) \
        .eq("conversation_id", conversation_id).neq("sender_id", user["id"]).is_("read_at", "null").execute()
    return ok({"read": True})


@router.post("/messages/{message_id}/attachment")
def set_attachment(message_id: str, body: AttachmentBody, user: dict = Depends(get_current_user)):
    """attachment_url = the file `path` returned by /files/upload-url (fetch it later via /files/{id}/download-url)."""
    res = supabase.table("pz_messages").update({"attachment_url": body.attachment_url}) \
        .eq("id", message_id).eq("sender_id", user["id"]).execute()
    if not res.data:
        raise AppError(404, "NOT_FOUND", "Message not found")
    return ok(res.data[0])