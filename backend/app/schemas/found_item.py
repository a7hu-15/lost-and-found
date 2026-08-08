from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, date
from app.models.lost_item import ItemStatus

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
