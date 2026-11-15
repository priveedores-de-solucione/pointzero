from app.core.supabase import supabase
from app.repositories.base import BaseRepository
from app.utils.helpers import now_utc, page_range


class MessageRepository(BaseRepository):
    table = "messages"

    def member_ids(self, conversation_id: str) -> list[str]:
        res = supabase.table("pz_conversation_members").select("user_id").eq("conversation_id", conversation_id).execute()
        return [r["user_id"] for r in res.data]

    def is_member(self, conversation_id: str, user_id: str) -> bool:
        return user_id in self.member_ids(conversation_id)

    def for_conversation(self, conversation_id: str, page: int = 1, limit: int = 50) -> tuple[list, int]:
        start, end = page_range(page, limit)
        res = self.query(count="exact").eq("conversation_id", conversation_id) \
            .order("created_at", desc=True).range(start, end).execute()
        return res.data, res.count or 0

    def mark_read(self, conversation_id: str, user_id: str) -> None:
        supabase.table(self.table).update({"read_at": now_utc()}) \
            .eq("conversation_id", conversation_id).neq("sender_id", user_id).is_("read_at", "null").execute()