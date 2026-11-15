from app.repositories.base import BaseRepository

ACTIVE_STATUSES = ["SUBMITTED", "UNDER_REVIEW", "INTERVIEW", "ACCEPTED", "WAITLISTED"]


class ApplicationRepository(BaseRepository):
    table = "applications"

    def for_user(self, user_id: str) -> list:
        return self.query().eq("user_id", user_id).order("updated_at", desc=True).execute().data

    def active_for_program(self, user_id: str, program_id: str) -> list:
        return self.query("id").eq("user_id", user_id).eq("program_id", program_id) \
            .in_("status", ACTIVE_STATUSES).execute().data