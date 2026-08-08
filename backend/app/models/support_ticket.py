import uuid
import random
import string
import enum
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Text, DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column
from app.database.base import Base

class TicketStatus(str, enum.Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"

def generate_ticket_id() -> str:
    year = datetime.utcnow().strftime("%Y")
    chars = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"SUP-{year}-{chars}"

class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ticket_id: Mapped[str] = mapped_column(String(30), unique=True, index=True, default=generate_ticket_id)
    
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    subject: Mapped[str] = mapped_column(String(500), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    
    status: Mapped[TicketStatus] = mapped_column(Enum(TicketStatus), default=TicketStatus.OPEN, nullable=False)
    admin_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
