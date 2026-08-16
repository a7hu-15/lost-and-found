from pydantic import BaseModel, EmailStr
from typing import Dict, Any, Optional, List
from datetime import datetime
from app.models.user import UserRole
from app.models.lost_item import ItemStatus

class AuditLogOut(BaseModel):
    id: str
    user_id: Optional[str] = None
    action: str
    resource: str
    details: Dict[str, Any]
    ip_address: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_users: int
    total_lost: int
    total_found: int
    total_matches: int
    pending_claims: int
    resolved_claims: int
    resolution_rate: float
    category_distribution: Dict[str, int]
    open_support_tickets: int = 0

class UserRoleUpdate(BaseModel):
    role: UserRole

class UserStatusUpdate(BaseModel):
    is_active: bool

class ItemStatusUpdate(BaseModel):
    status: ItemStatus
    moderation_reason: Optional[str] = None
    admin_notes: Optional[str] = None

from app.models.lost_item import ModerationStatus

class ModerationUpdate(BaseModel):
    moderation_status: ModerationStatus
    admin_notes: Optional[str] = None

class TrendDataPoint(BaseModel):
    date: str
    lost_count: int
    found_count: int

class AdminAnalyticsTrend(BaseModel):
    trends: List[TrendDataPoint]

class StaffInviteRequest(BaseModel):
    full_name: str
    email: EmailStr
    permissions: Dict[str, bool]

class StaffPermissionsUpdate(BaseModel):
    permissions: Dict[str, bool]
    current_password: str

class StaffStatusUpdate(BaseModel):
    is_active: bool
    current_password: str

class StaffMemberOut(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: UserRole
    permissions: Dict[str, bool]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
