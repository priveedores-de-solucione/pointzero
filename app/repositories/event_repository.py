from typing import Optional

from app.core.supabase import supabase
from app.repositories.base import BaseRepository


class EventRepository(BaseRepository):
    table = "events"

    def published_by_id(self, event_id: str) -> Optional[dict]:
        res = self.query().eq("id", event_id).eq("status", "PUBLISHED").limit(1).execute()
        return res.data[0] if res.data else None

    def published_by_slug(self, slug: str) -> Optional[dict]:
        res = self.query().eq("slug", slug).eq("status", "PUBLISHED").limit(1).execute()
        return res.data[0] if res.data else None

    def registered_count(self, event_id: str) -> int:
        res = supabase.table("pz_event_registrations").select("id", count="exact") \
            .eq("event_id", event_id).eq("status", "REGISTERED").limit(1).execute()
        return res.count or 0