from typing import Optional

from app.core.supabase import supabase
from app.repositories.base import BaseRepository


class MentorRepository(BaseRepository):
    table = "mentors"

    def by_user(self, user_id: str) -> Optional[dict]:
        return self.get_by(user_id=user_id)

    def rating_values(self, mentor_id: str) -> list[int]:
        res = supabase.table("pz_mentor_feedback").select("rating, mentor_sessions!inner(mentor_id)") \
            .eq("mentor_sessions.mentor_id", mentor_id).execute()
        return [r["rating"] for r in res.data]