from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, cast, Date

from app.database.session import get_db
from app.models.user import User, UserRole
from app.models.lost_item import LostItem, ItemStatus
from app.models.found_item import FoundItem
from app.models.match import MatchScore
from app.models.claim import Claim, ClaimStatus
from app.models.support_ticket import SupportTicket, TicketStatus
from app.models.audit import AuditLog
from app.schemas.admin import (
    AuditLogOut, DashboardStats, UserRoleUpdate, UserStatusUpdate,
    ItemStatusUpdate, AdminAnalyticsTrend, TrendDataPoint
)
from app.schemas.auth import UserOut
from app.schemas.support import SupportTicketOut, SupportTicketStatusUpdate
from app.schemas.lost_item import LostItemOut
from app.schemas.found_item import FoundItemOut
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
    open_tickets = (await db.execute(select(func.count(SupportTicket.id)).where(SupportTicket.status == TicketStatus.OPEN))).scalar() or 0
    
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
        category_distribution=category_distribution,
        open_support_tickets=open_tickets
    )

# --- User Management ---

@router.get("/users", response_model=List[UserOut])
async def list_users(
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.SECURITY_STAFF])),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    return result.scalars().all()

@router.patch("/users/{user_id}/role", response_model=UserOut)
async def update_user_role(
    user_id: str,
    role_in: UserRoleUpdate,
    current_user: User = Depends(require_roles([UserRole.ADMIN])),
    db: AsyncSession = Depends(get_db)
):
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Self-protection enabled: Admins cannot modify or demote their own admin role."
        )

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    old_role = user.role.value
    user.role = role_in.role

    audit = AuditLog(
        user_id=current_user.id,
        action="ADMIN_UPDATE_USER_ROLE",
        resource="users",
        details={"target_user_id": user_id, "email": user.email, "old_role": old_role, "new_role": role_in.role.value}
    )
    db.add(audit)
    await db.commit()
    await db.refresh(user)
    return user

@router.patch("/users/{user_id}/status", response_model=UserOut)
async def update_user_status(
    user_id: str,
    status_in: UserStatusUpdate,
    current_user: User = Depends(require_roles([UserRole.ADMIN])),
    db: AsyncSession = Depends(get_db)
):
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Self-protection enabled: Admins cannot deactivate their own account."
        )

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.is_active = status_in.is_active

    audit = AuditLog(
        user_id=current_user.id,
        action="ADMIN_UPDATE_USER_STATUS",
        resource="users",
        details={"target_user_id": user_id, "email": user.email, "is_active": status_in.is_active}
    )
    db.add(audit)
    await db.commit()
    await db.refresh(user)
    return user

# --- Lost Items Management ---

@router.get("/lost-items", response_model=List[LostItemOut])
async def list_all_lost_items(
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.SECURITY_STAFF])),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(LostItem).order_by(LostItem.created_at.desc()))
    return result.scalars().all()

@router.patch("/lost-items/{item_id}/status", response_model=LostItemOut)
async def update_lost_item_status(
    item_id: str,
    status_in: ItemStatusUpdate,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.SECURITY_STAFF])),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(LostItem).where(LostItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Lost item report not found.")

    old_status = item.status.value
    item.status = status_in.status

    audit = AuditLog(
        user_id=current_user.id,
        action=f"ADMIN_MODERATE_LOST_ITEM_{status_in.status.value}",
        resource="lost_items",
        details={
            "report_id": item.report_id,
            "old_status": old_status,
            "new_status": status_in.status.value,
            "reason": status_in.moderation_reason or "N/A",
            "notes": status_in.admin_notes or ""
        }
    )
    db.add(audit)
    await db.commit()
    await db.refresh(item)
    return item

# --- Found Items Management ---

@router.get("/found-items", response_model=List[FoundItemOut])
async def list_all_found_items(
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.SECURITY_STAFF])),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(FoundItem).order_by(FoundItem.created_at.desc()))
    return result.scalars().all()

@router.patch("/found-items/{item_id}/status", response_model=FoundItemOut)
async def update_found_item_status(
    item_id: str,
    status_in: ItemStatusUpdate,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.SECURITY_STAFF])),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(FoundItem).where(FoundItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Found item report not found.")

    old_status = item.status.value
    item.status = status_in.status

    audit = AuditLog(
        user_id=current_user.id,
        action=f"ADMIN_MODERATE_FOUND_ITEM_{status_in.status.value}",
        resource="found_items",
        details={
            "report_id": item.report_id,
            "old_status": old_status,
            "new_status": status_in.status.value,
            "reason": status_in.moderation_reason or "N/A",
            "notes": status_in.admin_notes or ""
        }
    )
    db.add(audit)
    await db.commit()
    await db.refresh(item)
    return item

# --- Support Tickets Management ---

@router.get("/support-tickets", response_model=List[SupportTicketOut])
async def list_support_tickets(
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.SECURITY_STAFF])),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(SupportTicket).order_by(SupportTicket.created_at.desc()))
    return result.scalars().all()

@router.patch("/support-tickets/{ticket_id}/status", response_model=SupportTicketOut)
async def update_support_ticket_status(
    ticket_id: str,
    update_in: SupportTicketStatusUpdate,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.SECURITY_STAFF])),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(SupportTicket).where(SupportTicket.id == ticket_id))
    ticket = result.scalar_one_or_none()
    if not ticket:
        raise HTTPException(status_code=404, detail="Support ticket not found.")

    ticket.status = update_in.status
    if update_in.admin_notes is not None:
        ticket.admin_notes = update_in.admin_notes

    audit = AuditLog(
        user_id=current_user.id,
        action=f"ADMIN_SUPPORT_TICKET_{update_in.status.value}",
        resource="support",
        details={"ticket_id": ticket.ticket_id, "new_status": update_in.status.value}
    )
    db.add(audit)
    await db.commit()
    await db.refresh(ticket)
    return ticket

# --- Analytics Trends & Audit Logs ---

@router.get("/analytics/trends", response_model=AdminAnalyticsTrend)
async def get_analytics_trends(
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.SECURITY_STAFF])),
    db: AsyncSession = Depends(get_db)
):
    now = datetime.utcnow()
    start_date = now - timedelta(days=14)

    trends = []
    for i in range(15):
        day = start_date + timedelta(days=i)
        day_str = day.strftime("%Y-%m-%d")
        next_day = day + timedelta(days=1)

        lost_cnt = (await db.execute(
            select(func.count(LostItem.id))
            .where(LostItem.created_at >= day)
            .where(LostItem.created_at < next_day)
        )).scalar() or 0

        found_cnt = (await db.execute(
            select(func.count(FoundItem.id))
            .where(FoundItem.created_at >= day)
            .where(FoundItem.created_at < next_day)
        )).scalar() or 0

        trends.append(TrendDataPoint(date=day_str, lost_count=lost_cnt, found_count=found_cnt))

    return AdminAnalyticsTrend(trends=trends)

@router.get("/audit-logs", response_model=List[AuditLogOut])
async def get_audit_logs(
    limit: int = 100,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.SECURITY_STAFF])),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit))
    return result.scalars().all()
