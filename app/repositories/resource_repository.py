from typing import Optional

from app.repositories.base import BaseRepository


class ResourceRepository(BaseRepository):
    table = "resources"

    def by_slug(self, slug: str, published_only: bool = True) -> Optional[dict]:
        q = self.query().eq("slug", slug)
        if published_only:
            q = q.eq("status", "PUBLISHED")
        res = q.limit(1).execute()
        return res.data[0] if res.data else None