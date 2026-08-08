from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime

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
