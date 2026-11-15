from typing import Optional

from app.repositories.base import BaseRepository
from app.utils.helpers import page_range

PUBLIC_COLUMNS = "id,organization,slug,description,logo_url,website,partner_type"


class PartnerRepository(BaseRepository):
    table = "partners"
    order_column = "organization"

    def approved(self, partner_type: Optional[str] = None, page: int = 1, limit: int = 50) -> tuple[list, int]:
        start, end = page_range(page, limit)
        q = self.query(PUBLIC_COLUMNS, count="exact").eq("status", "APPROVED")
        if partner_type:
            q = q.eq("partner_type", partner_type)
        res = q.order("organization").range(start, end).execute()
        return res.data, res.count or 0

    def approved_by_slug(self, slug: str) -> Optional[dict]:
        res = self.query(PUBLIC_COLUMNS).eq("slug", slug).eq("status", "APPROVED").limit(1).execute()
        return res.data[0] if res.data else None