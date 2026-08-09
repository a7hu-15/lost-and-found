from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.models.item_information import TipStatus

class ItemInformationCreate(BaseModel):
    message: str = Field(..., min_length=10, max_length=1000, description="The information message")
    sender_name: Optional[str] = Field(None, max_length=255)
    sender_email: Optional[EmailStr] = None

class ItemInformationOut(BaseModel):
    id: str
    lost_item_id: str
    sender_name: Optional[str]
    sender_email: Optional[str]
    message: str
    status: TipStatus
    created_at: datetime
    reviewed_at: Optional[datetime]
    reviewed_by_id: Optional[str]

    class Config:
        from_attributes = True

class ItemInformationReview(BaseModel):
    status: TipStatus = Field(..., description="Either APPROVED or REJECTED")
