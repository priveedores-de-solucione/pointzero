from typing import Optional

from app.core.supabase import supabase
from app.repositories.base import BaseRepository


class StartupRepository(BaseRepository):
    table = "startups"

    def get_active(self, startup_id: str) -> Optional[dict]:
        res = self.query().eq("id", startup_id).is_("archived_at", "null").limit(1).execute()
        return res.data[0] if res.data else None

    def by_slug(self, slug: str) -> Optional[dict]:
        res = self.query().eq("slug", slug).is_("archived_at", "null").limit(1).execute()
        return res.data[0] if res.data else None

    def membership(self, startup_id: str, user_id: str) -> Optional[dict]:
        res = supabase.table("pz_startup_members").select("*") \
            .eq("startup_id", startup_id).eq("user_id", user_id).limit(1).execute()
        return res.data[0] if res.data else None

    def founder_count(self, startup_id: str) -> int:
        res = supabase.table("pz_startup_members").select("id", count="exact") \
            .eq("startup_id", startup_id).eq("is_founder", True).limit(1).execute()
        return res.count or 0

    def founder_user_ids(self, startup_id: str) -> list[str]:
        res = supabase.table("pz_startup_members").select("user_id") \
            .eq("startup_id", startup_id).eq("is_founder", True).execute()
        return [r["user_id"] for r in res.data]

    def member_startup_ids(self, user_id: str, founder_only: bool = False) -> list[str]:
        q = supabase.table("pz_startup_members").select("startup_id, startups:pz_startups(archived_at)").eq("user_id", user_id)
        if founder_only:
            q = q.eq("is_founder", True)
        return [r["startup_id"] for r in q.execute().data if r["startups"] and not r["startups"]["archived_at"]]