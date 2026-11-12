from typing import Optional

from app.core.supabase import supabase
from app.repositories.base import BaseRepository


class ProgramRepository(BaseRepository):
    table = "programs"

    def by_slug(self, slug: str) -> Optional[dict]:
        return self.get_by(slug=slug)

    def enroll(self, user_id: str, program_id: str, cohort_id: Optional[str] = None) -> dict:
        existing = supabase.table("pz_enrollments").select("*") \
            .eq("user_id", user_id).eq("program_id", program_id).limit(1).execute().data
        if existing:
            return existing[0]
        return supabase.table("pz_enrollments").insert({
            "user_id": user_id, "program_id": program_id, "cohort_id": cohort_id, "status": "ACTIVE",
        }).execute().data[0]

    def enrollments_for_user(self, user_id: str) -> list:
        return supabase.table("pz_enrollments").select("*, programs(*), cohorts(*)").eq("user_id", user_id).execute().data