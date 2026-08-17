import enum
import uuid
import random
import secrets
import string
from datetime import datetime, date
from typing import Optional
from sqlalchemy import String, Text, Float, DateTime, Date, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

class ItemStatus(str, enum.Enum):
    REPORTED = "REPORTED"
    MATCHED = "MATCHED"
    CLAIMED = "CLAIMED"
    RETURNED = "RETURNED"
    CLOSED = "CLOSED"
    HIDDEN = "HIDDEN"

class ModerationStatus(str, enum.Enum):
    PENDING_VERIFICATION = "PENDING_VERIFICATION"
    PENDING_MODERATION = "PENDING_MODERATION"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    FLAGGED = "FLAGGED"

def generate_report_id() -> str:
    chars = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"LF-SRM-26-{chars}"

def generate_access_token() -> str:
    return secrets.token_urlsafe(16)

class LostItem(Base):
    __tablename__ = "lost_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    report_id: Mapped[str] = mapped_column(String(20), unique=True, index=True, default=generate_report_id)
    access_token: Mapped[str] = mapped_column(String(64), index=True, default=generate_access_token)
    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    item_name: Mapped[str] = mapped_column(String(255), nullable=False)
    brand: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    color: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    location: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    lost_date: Mapped[date] = mapped_column(Date, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    image_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    thumbnail_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[ItemStatus] = mapped_column(Enum(ItemStatus), default=ItemStatus.REPORTED, nullable=False)
    
    original_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    moderated_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    moderation_status: Mapped[ModerationStatus] = mapped_column(Enum(ModerationStatus), default=ModerationStatus.PENDING_VERIFICATION, nullable=False)
    image_moderation_result: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    flag_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    verification_token: Mapped[Optional[str]] = mapped_column(String(64), unique=True, index=True, nullable=True)
    verification_status: Mapped[bool] = mapped_column(default=False)
    
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    reviewed_by: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="lost_items", foreign_keys=[user_id])
    matches = relationship("MatchScore", back_populates="lost_item", cascade="all, delete-orphan")
    information_tips = relationship("LostItemInformation", back_populates="lost_item", cascade="all, delete-orphan")
