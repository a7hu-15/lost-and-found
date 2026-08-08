from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from datetime import datetime
from app.schemas.found_item import FoundItemOut
from app.schemas.auth import UserOut

class ClaimCreate(BaseModel):
    found_item_id: str
    claimant_email: EmailStr
    proof_description: str
    verification_answers: Dict[str, Any]
    proof_image_url: Optional[str] = None

class ClaimReview(BaseModel):
    status: str  # APPROVED or REJECTED
    admin_notes: Optional[str] = None

class ClaimOut(BaseModel):
    id: str
    found_item_id: str
    proof_description: str
    verification_answers: Dict[str, Any]
    status: str
    admin_notes: Optional[str]
    created_at: datetime
    found_item: Optional[FoundItemOut] = None

    class Config:
        from_attributes = True
