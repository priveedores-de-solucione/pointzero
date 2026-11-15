from typing import Literal, Optional

from pydantic import BaseModel

from app.schemas.investor import IntroCreate  # noqa: F401  (defined in investor.py)

IntroStatus = Literal[
    "pending_review", "approved", "rejected", "founder_pending",
    "accepted", "declined", "meeting", "closed",
]


class IntroNote(BaseModel):
    note: Optional[str] = None