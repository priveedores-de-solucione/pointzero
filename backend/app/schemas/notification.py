from typing import Literal, Optional

from pydantic import BaseModel, Field

from app.schemas.message import PreferenceUpdate  # noqa: F401  (defined in message.py)

Role = Literal["FOUNDER", "BUILDER", "STUDENT", "MENTOR", "INVESTOR", "PARTNER", "STAFF", "ADMIN"]


class BroadcastCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    message: str = Field(min_length=1, max_length=1000)
    role: Optional[Role] = None                       # omit role and user_ids to message everyone
    user_ids: Optional[list[str]] = Field(default=None, max_length=500)
    send_email: bool = False