from datetime import date, datetime
from typing import Literal, Optional
from pydantic import BaseModel


class ProgramCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    type: Literal["POINTZERO_90", "ACADEMY", "RESIDENCY", "LABS", "DEMO_DAY"]
    status: Literal["UPCOMING", "ACTIVE", "CLOSED"] = "UPCOMING"
    application_open: bool = False
    application_deadline: Optional[datetime] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    capacity: Optional[int] = None


class ProgramUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    type: Optional[Literal["POINTZERO_90", "ACADEMY", "RESIDENCY", "LABS", "DEMO_DAY"]] = None
    status: Optional[Literal["UPCOMING", "ACTIVE", "CLOSED"]] = None
    application_open: Optional[bool] = None
    application_deadline: Optional[datetime] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    capacity: Optional[int] = None


class CohortCreate(BaseModel):
    name: str
    number: int
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Literal["UPCOMING", "ACTIVE", "COMPLETED"] = "UPCOMING"


class CohortUpdate(BaseModel):
    name: Optional[str] = None
    number: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[Literal["UPCOMING", "ACTIVE", "COMPLETED"]] = None