from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database.session import get_db
from app.models.user import User, UserRole
from app.models.lost_item import LostItem, ItemStatus
from app.models.found_item import FoundItem
from app.models.match import MatchScore
from app.models.claim import Claim, ClaimStatus
from app.models.audit import AuditLog
from app.schemas.admin import AuditLogOut, DashboardStats
from app.schemas.auth import UserOut
from app.security.dependencies import require_roles

router = APIRouter()

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.SECURITY_STAFF])),
    db: AsyncSession = Depends(get_db)
):
    users_count = (await db.execute(select(func.count(User.id)))).scalar() or 0
    lost_count = (await db.execute(select(func.count(LostItem.id)))).scalar() or 0
    found_count = (await db.execute(select(func.count(FoundItem.id)))).scalar() or 0
    matches_count = (await db.execute(select(func.count(MatchScore.id)))).scalar() or 0
    
    pending_claims = (await db.execute(select(func.count(Claim.id)).where(Claim.status == ClaimStatus.PENDING))).scalar() or 0
    approved_claims = (await db.execute(select(func.count(Claim.id)).where(Claim.status == ClaimStatus.APPROVED))).scalar() or 0
    
    total_claims = pending_claims + approved_claims
    resolution_rate = round((approved_claims / total_claims * 100.0), 1) if total_claims > 0 else 100.0

    # Category distribution
    cat_query = select(FoundItem.category, func.count(FoundItem.id)).group_by(FoundItem.category)
    cat_result = await db.execute(cat_query)
    category_distribution = {cat: count for cat, count in cat_result.all()}

    return DashboardStats(
        total_users=users_count,
        total_lost=lost_count,
        total_found=found_count,
        total_matches=matches_count,
        pending_claims=pending_claims,
        resolved_claims=approved_claims,
        resolution_rate=resolution_rate,
        category_distribution=category_distribution
    )

@router.get("/audit-logs", response_model=List[AuditLogOut])
async def get_audit_logs(
    limit: int = 50,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.SECURITY_STAFF])),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit))
    return result.scalars().all()

@router.get("/users", response_model=List[UserOut])
async def list_users(
    current_user: User = Depends(require_roles([UserRole.ADMIN])),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    return result.scalars().all()
