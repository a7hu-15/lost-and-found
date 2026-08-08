from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.models.support_ticket import TicketStatus

class SupportTicketCreate(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

class SupportTicketStatusUpdate(BaseModel):
    status: TicketStatus
    admin_notes: Optional[str] = None

class SupportTicketOut(BaseModel):
    id: str
    ticket_id: str
    name: str
    email: EmailStr
    subject: str
    message: str
    status: TicketStatus
    admin_notes: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
