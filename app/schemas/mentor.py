from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


class MentorCreate(BaseModel):
    user_id: str
    expertise: list[str] = []
    experience: Optional[str] = None
    availability: Optional[str] = None


class MentorProfileUpdate(BaseModel):
    expertise: Optional[list[str]] = None
    experience: Optional[str] = None
    availability: Optional[str] = None


class RequestCreate(BaseModel):
    mentor_id: str
    startup_id: Optional[str] = None
    message: Optional[str] = None


class RequestUpdate(BaseModel):
    status: Literal["ACCEPTED", "DECLINED", "CANCELLED"]


class SessionCreate(BaseModel):
    mentor_id: str
    founder_id: str
    startup_id: Optional[str] = None
    scheduled_at: datetime
    duration: int = Field(60, ge=15, le=240)


class SessionUpdate(BaseModel):
    scheduled_at: Optional[datetime] = None
    duration: Optional[int] = Field(None, ge=15, le=240)
    notes: Optional[str] = None
    status: Optional[Literal["COMPLETED"]] = None


class Feedback(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None