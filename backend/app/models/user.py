import enum
import uuid
from datetime import datetime
from typing import Optional, Dict
from sqlalchemy import String, Boolean, DateTime, Enum, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

class UserRole(str, enum.Enum):
    USER = "USER"
    ADMIN_STAFF = "ADMIN_STAFF"
    ADMIN_OWNER = "ADMIN_OWNER"
    # Legacy fallbacks for backward compatibility in DB queries
    STUDENT = "USER"
    FACULTY = "USER"
    SECURITY_STAFF = "ADMIN_STAFF"
    ADMIN = "ADMIN_OWNER"

DEFAULT_PERMISSIONS = {
    "view_users": True,
    "manage_users": False,
    "view_lost_items": True,
    "moderate_lost_items": True,
    "view_found_items": True,
    "moderate_found_items": True,
    "view_claims": True,
    "manage_claims": True,
    "view_support": True,
    "manage_support": True,
    "view_analytics": True,
    "view_audit_logs": True
}

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.USER, nullable=False)
    
    # Granular permissions for ADMIN_STAFF
    permissions: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    
    # MFA fields for ADMIN_OWNER & staff
    mfa_secret: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    mfa_enabled: Mapped[bool] = mapped_column(Boolean, default=False)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    lost_items = relationship("LostItem", back_populates="user", foreign_keys="[LostItem.user_id]", cascade="all, delete-orphan")
    found_items = relationship("FoundItem", back_populates="reporter", foreign_keys="[FoundItem.reporter_id]", cascade="all, delete-orphan")
    claims = relationship("Claim", back_populates="claimant", foreign_keys="[Claim.claimant_id]", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user")
