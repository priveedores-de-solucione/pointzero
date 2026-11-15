from datetime import date
from typing import Optional

from app.repositories.base import BaseRepository


class MilestoneRepository(BaseRepository):
    table = "milestones"

    def for_startup(self, startup_id: str) -> list:
        return self.query().eq("startup_id", startup_id).order("due_date").execute().data

    def for_startups(self, startup_ids: list[str], status: Optional[str] = None, stage: Optional[str] = None) -> list:
        if not startup_ids:
            return []
        q = self.query("*, startups:pz_startups(name,slug)").in_("startup_id", startup_ids)
        if status:
            q = q.eq("status", status)
        if stage:
            q = q.eq("stage", stage)
        return q.order("due_date").execute().data

    @staticmethod
    def summarize(rows: list) -> dict:
        total = len(rows)
        completed = sum(1 for r in rows if r["status"] == "COMPLETED")
        open_rows = [r for r in rows if r["status"] != "COMPLETED"]
        today = date.today().isoformat()
        overdue = [r for r in open_rows if r["due_date"] and r["due_date"] < today]
        dated = sorted((r for r in open_rows if r["due_date"]), key=lambda r: r["due_date"])
        by_stage: dict = {}
        for r in rows:
            s = by_stage.setdefault(r["stage"], {"total": 0, "completed": 0})
            s["total"] += 1
            s["completed"] += r["status"] == "COMPLETED"
        return {
            "total": total,
            "completed": completed,
            "percent": round(completed * 100 / total) if total else 0,
            "overdue": len(overdue),
            "by_stage": by_stage,
            "next_milestone": dated[0] if dated else (open_rows[0] if open_rows else None),
        }

    def progress(self, startup_ids: list[str]) -> dict:
        return self.summarize(self.for_startups(startup_ids))