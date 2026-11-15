from typing import Optional
from pydantic import BaseModel, Field


class ConversationCreate(BaseModel):
    member_ids: list[str] = Field(min_length=1, max_length=20)


class MessageCreate(BaseModel):
    body: str = Field(min_length=1, max_length=5000)
    attachment_url: Optional[str] = None


class AttachmentBody(BaseModel):
    attachment_url: str


class PreferenceUpdate(BaseModel):
    email_notifications: Optional[bool] = None
    event_reminders: Optional[bool] = None
    message_notifications: Optional[bool] = None