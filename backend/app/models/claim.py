import uuid
import enum
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Text, JSON, DateTime, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

class ClaimStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class Claim(Base):
    __tablename__ = "claims"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    found_item_id: Mapped[str] = mapped_column(String(36), ForeignKey("found_items.id", ondelete="CASCADE"), nullable=False)
    claimant_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    claimant_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    proof_description: Mapped[str] = mapped_column(Text, nullable=False)
    verification_answers: Mapped[dict] = mapped_column(JSON, default=dict)
    
    status: Mapped[ClaimStatus] = mapped_column(Enum(ClaimStatus), default=ClaimStatus.PENDING, nullable=False)
    admin_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    reviewed_by_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    found_item = relationship("FoundItem")
    claimant = relationship("User", foreign_keys=[claimant_id])
    reviewed_by = relationship("User", foreign_keys=[reviewed_by_id])
