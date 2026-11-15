from typing import Literal, Optional
from pydantic import BaseModel


class ProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    website: Optional[str] = None
    linkedin: Optional[str] = None
    twitter: Optional[str] = None
    github: Optional[str] = None

class UserAdminUpdate(BaseModel):
    role: Optional[Literal["SUPER_ADMIN", "ADMIN", "STAFF", "FOUNDER", "BUILDER",
                           "STUDENT", "MENTOR", "INVESTOR", "PARTNER"]] = None
    status: Optional[Literal["ACTIVE", "SUSPENDED"]] = None

class CompleteProfile(ProfileUpdate):
    first_name: str
    last_name: str
    role: Literal["FOUNDER", "BUILDER", "STUDENT", "MENTOR", "INVESTOR", "PARTNER"]
    
class ProfileVisibility(BaseModel):
    profile_public: bool