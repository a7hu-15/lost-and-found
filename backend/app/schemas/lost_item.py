from pydantic import BaseModel, EmailStr
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
