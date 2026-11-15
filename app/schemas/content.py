from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, EmailStr

EventType = Literal["WORKSHOP", "HACKATHON", "DEMO_DAY", "MEETUP", "INVESTOR_SESSION", "COMMUNITY"]
Category = Literal["STARTUP", "ENGINEERING", "PRODUCT", "DESIGN", "FUNDRAISING", "AI", "BLOCKCHAIN", "FOUNDER_STORIES"]
PartnerType = Literal["TECHNOLOGY", "CAPITAL", "EDUCATION", "INFRASTRUCTURE", "MEDIA", "CORPORATE", "GOVERNMENT", "COMMUNITY"]
PubStatus = Literal["DRAFT", "PUBLISHED", "ARCHIVED"]


class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    event_type: EventType
    start_time: datetime
    end_time: datetime
    capacity: Optional[int] = None
    cover_image: Optional[str] = None
    status: PubStatus = "DRAFT"


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    event_type: Optional[EventType] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    capacity: Optional[int] = None
    cover_image: Optional[str] = None
    status: Optional[PubStatus] = None


class ResourceCreate(BaseModel):
    title: str
    description: Optional[str] = None
    content: Optional[str] = None
    type: str = "ARTICLE"
    category: Category
    cover_image: Optional[str] = None
    status: PubStatus = "DRAFT"


class ResourceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    type: Optional[str] = None
    category: Optional[Category] = None
    cover_image: Optional[str] = None
    status: Optional[PubStatus] = None


class PartnerApply(BaseModel):
    organization: str
    description: Optional[str] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None
    partner_type: PartnerType
    contact_email: EmailStr


class PartnerUpdate(BaseModel):
    organization: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None
    partner_type: Optional[PartnerType] = None
    contact_email: Optional[EmailStr] = None