from typing import Optional

from app.core.supabase import supabase
from app.repositories.base import BaseRepository


class CohortRepository(BaseRepository):
    table = "cohorts"
    order_column = "number"

    def by_program(self, program_id: str) -> list:
        return self.query().eq("program_id", program_id).order("number").execute().data

    def for_user(self, user_id: str) -> list:
        res = supabase.table("pz_enrollments").select("status, cohort_id, cohorts(*), programs(*)") \
            .eq("user_id", user_id).execute()
        return [r for r in res.data if r["cohorts"]]

    def members(self, cohort_id: str) -> list:
        return supabase.table("pz_enrollments") \
            .select("*, profiles(first_name,last_name,email,avatar_url)").eq("cohort_id", cohort_id).execute().data

    def assign_user(self, cohort_id: str, user_id: str) -> Optional[dict]:
        cohort = self.get(cohort_id)
        if not cohort:
            return None
        existing = supabase.table("pz_enrollments").select("id") \
            .eq("user_id", user_id).eq("program_id", cohort["program_id"]).limit(1).execute().data
        if existing:
            return supabase.table("pz_enrollments").update({"cohort_id": cohort_id}) \
                .eq("id", existing[0]["id"]).execute().data[0]
        return supabase.table("pz_enrollments").insert({
            "user_id": user_id, "program_id": cohort["program_id"], "cohort_id": cohort_id, "status": "ACTIVE",
        }).execute().data[0]

    def unassign_user(self, cohort_id: str, user_id: str) -> bool:
        res = supabase.table("pz_enrollments").update({"cohort_id": None}) \
            .eq("cohort_id", cohort_id).eq("user_id", user_id).execute()
        return bool(res.data)