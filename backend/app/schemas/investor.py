from typing import Literal, Optional
from pydantic import BaseModel

InvestorType = Literal["ANGEL", "VC", "FAMILY_OFFICE", "CORPORATE_VC", "ACCELERATOR", "FUND", "SYNDICATE", "INSTITUTION"]
InterestStatus = Literal["DISCOVERED", "SAVED", "INTERESTED", "INTRODUCTION", "MEETING", "DUE_DILIGENCE", "INVESTING", "PASSED"]


class InvestorApply(BaseModel):
    organization: str
    investor_type: InvestorType
    website: Optional[str] = None
    linkedin: Optional[str] = None
    country: Optional[str] = None
    investment_stage: list[str] = []
    investment_range_min: Optional[float] = None
    investment_range_max: Optional[float] = None
    industries: list[str] = []
    geographies: list[str] = []
    portfolio: Optional[str] = None
    investment_thesis: Optional[str] = None
    why_pointzero: Optional[str] = None


class InvestorUpdate(BaseModel):
    organization: Optional[str] = None
    investor_type: Optional[InvestorType] = None
    website: Optional[str] = None
    linkedin: Optional[str] = None
    country: Optional[str] = None
    investment_stage: Optional[list[str]] = None
    investment_range_min: Optional[float] = None
    investment_range_max: Optional[float] = None
    industries: Optional[list[str]] = None
    geographies: Optional[list[str]] = None
    portfolio: Optional[str] = None
    investment_thesis: Optional[str] = None
    why_pointzero: Optional[str] = None


class IntroCreate(BaseModel):
    startup_id: str
    message: str
    reason: Optional[str] = None


class DealFlowUpdate(BaseModel):
    status: Optional[InterestStatus] = None
    notes: Optional[str] = None