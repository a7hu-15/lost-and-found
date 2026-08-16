import uuid
import secrets
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy import String, DateTime, Enum, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from app.database.base import Base
import enum

class ReportType(str, enum.Enum):
    LOST = "LOST"
    FOUND = "FOUND"

def generate_verification_token() -> str:
    return secrets.token_urlsafe(32)

class VerificationToken(Base):
    __tablename__ = "verification_tokens"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    token: Mapped[str] = mapped_column(String(64), nullable=False, unique=True, index=True, default=generate_verification_token)
    report_id: Mapped[str] = mapped_column(String(36), nullable=False)  # either lost_item.id or found_item.id
    report_type: Mapped[ReportType] = mapped_column(Enum(ReportType), nullable=False)
    
    is_used: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=lambda: datetime.utcnow() + timedelta(hours=24))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    def is_valid(self) -> bool:
        return not self.is_used and self.expires_at > datetime.utcnow()
