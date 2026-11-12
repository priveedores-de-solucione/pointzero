from datetime import date
from typing import Literal, Optional
from pydantic import BaseModel, EmailStr


class StartupCreate(BaseModel):
    name: str
    description: Optional[str] = None
    long_description: Optional[str] = None
    logo_url: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None
    stage: Optional[str] = None
    location: Optional[str] = None
    founded_at: Optional[date] = None


class StartupUpdate(StartupCreate):
    name: Optional[str] = None
    program_id: Optional[str] = None   # ignored unless caller has startups.write
    cohort_id: Optional[str] = None


class VisibilityUpdate(BaseModel):
    is_public: Optional[bool] = None
    investor_visible: Optional[bool] = None


class MemberCreate(BaseModel):
    email: EmailStr
    role: str = "Team member"
    is_founder: bool = False


class MemberUpdate(BaseModel):
    role: Optional[str] = None
    is_founder: Optional[bool] = None


class MetricCreate(BaseModel):
    name: str
    value: float
    recorded_at: Optional[date] = None


Stage = Literal["VALIDATE", "BUILD", "LAUNCH", "SCALE"]
MStatus = Literal["PENDING", "IN_PROGRESS", "COMPLETED", "BLOCKED"]


class MilestoneCreate(BaseModel):
    title: str
    description: Optional[str] = None
    notes: Optional[str] = None
    stage: Stage = "VALIDATE"
    status: MStatus = "PENDING"
    due_date: Optional[date] = None


class MilestoneUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    stage: Optional[Stage] = None
    status: Optional[MStatus] = None
    due_date: Optional[date] = None