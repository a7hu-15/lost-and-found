import re
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime, date
from app.models.lost_item import ItemStatus

def validate_indian_mobile(v: Optional[str]) -> Optional[str]:
    if not v or not v.strip():
        return None
    phone_raw = v.strip()
    digits = re.sub(r'\D', '', phone_raw)
    
    if phone_raw.startswith('+91'):
        core_digits = digits[2:] if digits.startswith('91') else digits
    elif len(digits) == 12 and digits.startswith('91'):
        core_digits = digits[2:]
    else:
        core_digits = digits
        
    if not re.match(r'^[6-9]\d{9}$', core_digits):
        raise ValueError("Please enter a valid Indian mobile number (10 digits starting with 6–9), or leave the field blank.")
        
    return f"+91{core_digits}" if phone_raw.startswith('+91') else core_digits

def validate_description_words(v: str) -> str:
    if not v or not v.strip():
        raise ValueError("Description is required.")
    words = v.strip().split()
    if len(words) > 100:
        raise ValueError(f"Description exceeds the maximum limit of 100 words (currently {len(words)} words).")
    return v

class LostItemCreate(BaseModel):
    item_name: str
    brand: Optional[str] = None
    color: Optional[str] = None
    location: str
    lost_date: date
    description: str
    image_url: Optional[str] = None
    email: EmailStr

    @field_validator('item_name')
    @classmethod
    def validate_item_name_len(cls, v: str) -> str:
        if len(v.strip()) > 100:
            raise ValueError("Title must not exceed 100 characters.")
        return v

    @field_validator('location')
    @classmethod
    def validate_location_len(cls, v: str) -> str:
        if len(v.strip()) > 200:
            raise ValueError("Location must not exceed 200 characters.")
        return v

    @field_validator('brand', 'color')
    @classmethod
    def validate_short_attr_len(cls, v: Optional[str]) -> Optional[str]:
        if v and len(v.strip()) > 50:
            raise ValueError("Brand and color must not exceed 50 characters each.")
        return v

    @field_validator('email')
    @classmethod
    def validate_email_len(cls, v: EmailStr) -> EmailStr:
        if len(str(v)) > 254:
            raise ValueError("Email address must not exceed 254 characters.")
        return v

    @field_validator('description')
    @classmethod
    def validate_desc(cls, v: str) -> str:
        return validate_description_words(v)

    @field_validator('lost_date')
    @classmethod
    def validate_lost_date(cls, v: date) -> date:
        if v > date.today():
            raise ValueError("Date lost cannot be in the future.")
        return v



class LostItemOut(BaseModel):
    id: str
    report_id: str
    access_token: str
    item_name: str
    brand: Optional[str]
    color: Optional[str]
    location: str
    lost_date: date
    description: str
    image_url: Optional[str]
    thumbnail_url: Optional[str]
    status: ItemStatus
    created_at: datetime

    class Config:
        from_attributes = True

from app.models.lost_item import ModerationStatus

class AdminLostItemOut(LostItemOut):
    email: str
    moderation_status: ModerationStatus
    original_text: Optional[str]
    moderated_text: Optional[str]
    verification_status: bool
    image_moderation_result: Optional[str]
    flag_reason: Optional[str]
    reviewed_at: Optional[datetime]
    reviewed_by: Optional[str]
