from typing import Literal, Optional
from pydantic import BaseModel, Field

ApplicationType = Literal["FOUNDER", "BUILDER", "STUDENT", "MENTOR", "INVESTOR", "PARTNER"]


class ApplicationCreate(BaseModel):
    program_id: Optional[str] = None
    application_type: ApplicationType
    answers: dict = Field(default_factory=dict)


class ApplicationUpdate(BaseModel):
    answers: dict


class AdminApplicationUpdate(BaseModel):
    reviewer_id: Optional[str] = None
    review_notes: Optional[str] = None
    status: Optional[Literal["UNDER_REVIEW", "INTERVIEW"]] = None


class DecisionNote(BaseModel):
    note: Optional[str] = None