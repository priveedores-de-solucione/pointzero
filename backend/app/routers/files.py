import re
from typing import Literal, Optional
from uuid import uuid4

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.exceptions import AppError
from app.core.supabase import supabase
from app.dependencies.auth import get_current_user
from app.utils.helpers import ok

router = APIRouter(prefix="/files", tags=["Files"])

IMAGES = {"image/png", "image/jpeg", "image/webp", "image/gif"}
DOCS = IMAGES | {"application/pdf",
                 "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}

BUCKETS = {
    "avatars":               {"public": True,  "types": IMAGES},
    "startup-logos":         {"public": True,  "types": IMAGES, "startup": True},
    "event-images":          {"public": True,  "types": IMAGES, "perm": "events.manage"},
    "resource-images":       {"public": True,  "types": IMAGES, "perm": "content.manage"},
    "startup-documents":     {"public": False, "types": DOCS,   "startup": True, "read_perm": "startups.read"},
    "application-documents": {"public": False, "types": DOCS,   "read_perm": "applications.read"},
    "investor-documents":    {"public": False, "types": DOCS,   "role": "INVESTOR", "read_perm": "investors.read"},
}


class UploadRequest(BaseModel):
    bucket: Literal["avatars", "startup-logos", "event-images", "resource-images",
                    "startup-documents", "application-documents", "investor-documents"]
    filename: str
    content_type: str
    startup_id: Optional[str] = None


class CompleteRequest(BaseModel):
    file_id: str


def _is_member(startup_id: str, user_id: str) -> bool:
    return bool(supabase.table("pz_startup_members").select("id").eq("startup_id", startup_id).eq("user_id", user_id).execute().data)


def _get_file(file_id: str) -> dict:
    res = supabase.table("pz_files").select("*").eq("id", file_id).limit(1).execute()
    if not res.data:
        raise AppError(404, "NOT_FOUND", "File not found")
    return res.data[0]


def _can_read(f: dict, user: dict) -> bool:
    if f["owner_id"] == user["id"]:
        return True
    cfg = BUCKETS[f["bucket"]]
    if cfg["public"]:
        return True
    if cfg.get("startup") and f["startup_id"] and _is_member(f["startup_id"], user["id"]):
        return True
    return cfg.get("read_perm") in user["permissions"]


@router.post("/upload-url", status_code=201)
def upload_url(body: UploadRequest, user: dict = Depends(get_current_user)):
    cfg = BUCKETS[body.bucket]
    if body.content_type not in cfg["types"]:
        raise AppError(422, "INVALID_FILE_TYPE", "This file type is not allowed for this bucket")
    if cfg.get("perm") and cfg["perm"] not in user["permissions"]:
        raise AppError(403, "FORBIDDEN", "You cannot upload to this bucket")
    if cfg.get("role") and user["role"] != cfg["role"] and "investors.read" not in user["permissions"]:
        raise AppError(403, "FORBIDDEN", "You cannot upload to this bucket")
    if cfg.get("startup"):
        if not body.startup_id:
            raise AppError(422, "VALIDATION_ERROR", "startup_id is required for this bucket")
        if not _is_member(body.startup_id, user["id"]) and "startups.write" not in user["permissions"]:
            raise AppError(403, "FORBIDDEN", "You are not a member of this startup")

    safe = re.sub(r"[^A-Za-z0-9._-]", "_", body.filename)[:100]
    path = f"{user['id']}/{uuid4().hex}-{safe}"
    signed = supabase.storage.from_(body.bucket).create_signed_upload_url(path)
    record = supabase.table("pz_files").insert({
        "owner_id": user["id"], "bucket": body.bucket, "path": path, "filename": body.filename,
        "content_type": body.content_type, "startup_id": body.startup_id, "status": "PENDING",
    }).execute().data[0]
    # Frontend: supabase.storage.from(bucket).uploadToSignedUrl(path, token, file)
    return ok({"file_id": record["id"], "bucket": body.bucket, "path": path,
               "upload_url": signed.get("signed_url"), "token": signed.get("token")})


@router.post("/complete")
def complete(body: CompleteRequest, user: dict = Depends(get_current_user)):
    f = _get_file(body.file_id)
    if f["owner_id"] != user["id"]:
        raise AppError(404, "NOT_FOUND", "File not found")
    updated = supabase.table("pz_files").update({"status": "UPLOADED"}).eq("id", f["id"]).execute().data[0]
    if BUCKETS[f["bucket"]]["public"]:
        updated["url"] = supabase.storage.from_(f["bucket"]).get_public_url(f["path"])
    return ok(updated)


@router.get("/{file_id}/download-url")
def download_url(file_id: str, user: dict = Depends(get_current_user)):
    f = _get_file(file_id)
    if not _can_read(f, user):
        raise AppError(404, "NOT_FOUND", "File not found")
    bucket = supabase.storage.from_(f["bucket"])
    if BUCKETS[f["bucket"]]["public"]:
        return ok({"url": bucket.get_public_url(f["path"]), "expires_in": None})
    signed = bucket.create_signed_url(f["path"], 300)   # 5 minutes
    return ok({"url": signed.get("signedURL") or signed.get("signedUrl"), "expires_in": 300})


@router.delete("/{file_id}", status_code=204)
def delete_file(file_id: str, user: dict = Depends(get_current_user)):
    f = _get_file(file_id)
    cfg = BUCKETS[f["bucket"]]
    allowed = f["owner_id"] == user["id"] or cfg.get("read_perm") in user["permissions"]
    if not allowed:
        raise AppError(404, "NOT_FOUND", "File not found")
    supabase.storage.from_(f["bucket"]).remove([f["path"]])
    supabase.table("pz_files").delete().eq("id", file_id).execute()