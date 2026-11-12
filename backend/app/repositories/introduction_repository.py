from typing import Optional

from app.repositories.base import BaseRepository

OPEN_STATUSES = ["pending_review", "founder_pending", "accepted"]


class IntroductionRepository(BaseRepository):
    table = "introduction_requests"

    def get_detail(self, request_id: str) -> Optional[dict]:
        res = self.query("*, investors(user_id,organization,investor_type), startups(name,slug,logo_url)") \
            .eq("id", request_id).limit(1).execute()
        return res.data[0] if res.data else None

    def find_open(self, investor_id: str, startup_id: str) -> list:
        return self.query("id").eq("investor_id", investor_id).eq("startup_id", startup_id) \
            .in_("status", OPEN_STATUSES).execute().data