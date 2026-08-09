import re
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime, date
from app.models.lost_item import ItemStatus
from app.schemas.lost_item import validate_indian_mobile, validate_description_words

class FoundItemCreate(BaseModel):
    title: str
    category: str
    brand: Optional[str] = None
    color: Optional[str] = None
    location: str
    found_date: date
    description: str
    storage_location: str = "Campus Security Office - Gate 1"
    image_url: Optional[str] = None
    contact_email: EmailStr
    contact_phone: Optional[str] = None

    @field_validator('title')
    @classmethod
    def validate_title_len(cls, v: str) -> str:
        if len(v.strip()) > 100:
            raise ValueError("Title must not exceed 100 characters.")
        return v

    @field_validator('location', 'storage_location')
    @classmethod
    def validate_location_len(cls, v: str) -> str:
        if len(v.strip()) > 200:
            raise ValueError("Location must not exceed 200 characters.")
        return v

    @field_validator('category', 'brand', 'color')
    @classmethod
    def validate_short_attr_len(cls, v: Optional[str]) -> Optional[str]:
        if v and len(v.strip()) > 50:
            raise ValueError("Category, brand, and color must not exceed 50 characters each.")
        return v

    @field_validator('contact_email')
    @classmethod
    def validate_email_len(cls, v: EmailStr) -> EmailStr:
        if len(str(v)) > 254:
            raise ValueError("Email address must not exceed 254 characters.")
        return v

    @field_validator('description')
    @classmethod
    def validate_desc(cls, v: str) -> str:
        return validate_description_words(v)

    @field_validator('found_date')
    @classmethod
    def validate_found_date(cls, v: date) -> date:
        if v > date.today():
            raise ValueError("Date found cannot be in the future.")
        return v

    @field_validator('contact_phone')
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        return validate_indian_mobile(v)

class FoundItemOut(BaseModel):
    id: str
    report_id: str
    access_token: str
    title: str
    category: str
    brand: Optional[str]
    color: Optional[str]
    location: str
    found_date: date
    description: str
    storage_location: str
    image_url: Optional[str]
    thumbnail_url: Optional[str]
    status: ItemStatus
    created_at: datetime

    class Config:
        from_attributes = True
