from typing import Optional

from app.core.supabase import supabase
from app.utils.helpers import page_range


class BaseRepository:
    """Thin wrapper over one Supabase table. Subclasses set `table` and add their own queries."""

    table: str = ""
    order_column: str = "created_at"

    def query(self, columns: str = "*", **kwargs):
        return supabase.table(self.table).select(columns, **kwargs)

    def get(self, record_id: str) -> Optional[dict]:
        res = self.query().eq("id", record_id).limit(1).execute()
        return res.data[0] if res.data else None

    def get_by(self, **filters) -> Optional[dict]:
        q = self.query()
        for col, val in filters.items():
            q = q.eq(col, val)
        res = q.limit(1).execute()
        return res.data[0] if res.data else None

    def paginate(self, page: int = 1, limit: int = 20, **filters) -> tuple[list, int]:
        start, end = page_range(page, limit)
        q = self.query(count="exact")
        for col, val in filters.items():
            if val is not None:
                q = q.eq(col, val)
        res = q.order(self.order_column, desc=True).range(start, end).execute()
        return res.data, res.count or 0

    def create(self, data: dict) -> dict:
        return supabase.table(self.table).insert(data).execute().data[0]

    def update(self, record_id: str, changes: dict) -> Optional[dict]:
        res = supabase.table(self.table).update(changes).eq("id", record_id).execute()
        return res.data[0] if res.data else None

    def delete(self, record_id: str) -> bool:
        res = supabase.table(self.table).delete().eq("id", record_id).execute()
        return bool(res.data)

    def count(self, **filters) -> int:
        q = self.query("id", count="exact").limit(1)
        for col, val in filters.items():
            q = q.eq(col, val)
        return q.execute().count or 0