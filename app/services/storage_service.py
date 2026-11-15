import re
from uuid import uuid4

from app.core.supabase import supabase


def safe_path(user_id: str, filename: str) -> str:
    safe = re.sub(r"[^A-Za-z0-9._-]", "_", filename)[:100]
    return f"{user_id}/{uuid4().hex}-{safe}"


def signed_upload(bucket: str, path: str) -> dict:
    return supabase.storage.from_(bucket).create_signed_upload_url(path)


def public_url(bucket: str, path: str) -> str:
    return supabase.storage.from_(bucket).get_public_url(path)


def signed_download(bucket: str, path: str, expires: int = 300):
    signed = supabase.storage.from_(bucket).create_signed_url(path, expires)
    return signed.get("signedURL") or signed.get("signedUrl")


def remove(bucket: str, paths: list[str]) -> None:
    if paths:
        supabase.storage.from_(bucket).remove(paths)


def remove_user_files(user_id: str) -> None:
    """Delete every stored object a user owns (used when deleting an account)."""
    rows = supabase.table("pz_files").select("bucket,path").eq("owner_id", user_id).execute().data
    by_bucket: dict[str, list[str]] = {}
    for r in rows:
        by_bucket.setdefault(r["bucket"], []).append(r["path"])
    for bucket, paths in by_bucket.items():
        remove(bucket, paths)