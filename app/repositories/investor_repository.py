from typing import Optional

from app.core.supabase import supabase
from app.repositories.base import BaseRepository
from app.utils.helpers import now_utc


class InvestorRepository(BaseRepository):
    table = "investors"

    def by_user(self, user_id: str) -> Optional[dict]:
        return self.get_by(user_id=user_id)

    def access_startup_ids(self, investor_id: str) -> list[str]:
        res = supabase.table("pz_investor_startup_access").select("startup_id") \
            .eq("investor_id", investor_id).or_(f"expires_at.is.null,expires_at.gt.{now_utc()}").execute()
        return [r["startup_id"] for r in res.data]