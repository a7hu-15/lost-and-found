import re
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime, date
from app.models.lost_item import ItemStatus

class LostItemCreate(BaseModel):
    title: str
    category: str
    brand: Optional[str] = None
    color: Optional[str] = None
    location: str
    lost_date: date
    description: str
    reward: Optional[float] = 0.0
    image_url: Optional[str] = None
    contact_email: EmailStr
    contact_phone: Optional[str] = None

    @field_validator('lost_date')
    @classmethod
    def validate_lost_date(cls, v: date) -> date:
        if v > date.today():
            raise ValueError("Date lost cannot be in the future.")
        return v

    @field_validator('contact_phone')
    @classmethod
    def validate_contact_phone(cls, v: Optional[str]) -> Optional[str]:
        if not v or not v.strip():
            return None
        v_str = v.strip()
        digits = re.sub(r'\D', '', v_str)
        if not re.match(r'^\+?[0-9\s\-\(\)]{7,15}$', v_str) or not (7 <= len(digits) <= 15):
            raise ValueError("Invalid phone number format. Please provide a valid phone number (7–15 digits).")
        return v_str

class LostItemOut(BaseModel):
    id: str
    report_id: str
    access_token: str
    title: str
    category: str
    brand: Optional[str]
    color: Optional[str]
    location: str
    lost_date: date
    description: str
    reward: Optional[float]
    image_url: Optional[str]
    thumbnail_url: Optional[str]
    status: ItemStatus
    created_at: datetime

    class Config:
        from_attributes = True
