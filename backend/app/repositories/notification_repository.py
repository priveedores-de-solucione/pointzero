from typing import Optional

from app.repositories.base import BaseRepository
from app.utils.helpers import now_utc


class NotificationRepository(BaseRepository):
    table = "notifications"

    def unread_count(self, user_id: str) -> int:
        return self.count_unread(user_id)

    def count_unread(self, user_id: str) -> int:
        res = self.query("id", count="exact").eq("user_id", user_id).is_("read_at", "null").limit(1).execute()
        return res.count or 0

    def mark_read(self, notification_id: str, user_id: str) -> Optional[dict]:
        from app.core.supabase import supabase
        res = supabase.table(self.table).update({"read_at": now_utc()}) \
            .eq("id", notification_id).eq("user_id", user_id).execute()
        return res.data[0] if res.data else None

    def mark_all_read(self, user_id: str) -> None:
        from app.core.supabase import supabase
        supabase.table(self.table).update({"read_at": now_utc()}).eq("user_id", user_id).is_("read_at", "null").execute()