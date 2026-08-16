from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database.session import get_db
from app.models.user import User, UserRole, DEFAULT_PERMISSIONS
from app.models.staff_invitation import StaffInvitation
from app.models.lost_item import LostItem, ItemStatus
from app.models.found_item import FoundItem
from app.models.match import MatchScore
from app.models.claim import Claim, ClaimStatus
from app.models.support_ticket import SupportTicket, TicketStatus
from app.models.audit import AuditLog
from app.schemas.admin import (
    AuditLogOut, DashboardStats, UserRoleUpdate, UserStatusUpdate,
    ItemStatusUpdate, AdminAnalyticsTrend, TrendDataPoint,
    StaffInviteRequest, StaffPermissionsUpdate, StaffStatusUpdate, StaffMemberOut,
    ModerationUpdate
)
from app.schemas.auth import UserOut
from app.schemas.support import SupportTicketOut, SupportTicketStatusUpdate
from app.schemas.lost_item import LostItemOut, AdminLostItemOut
from app.schemas.found_item import FoundItemOut, AdminFoundItemOut
from app.models.lost_item import ModerationStatus
from app.schemas.item_information import ItemInformationOut, ItemInformationReview
from app.models.item_information import LostItemInformation, TipStatus
from app.notifications.service import send_information_approved_owner_email
from app.security.passwords import verify_password
from app.security.dependencies import (
    get_current_user, require_admin_owner, require_permission, require_any_admin
)
from app.notifications.service import send_staff_invitation_email

router = APIRouter()

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: User = Depends(require_any_admin),
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

# --- Staff & Access Management (ADMIN_OWNER ONLY) ---

@router.get("/staff", response_model=List[StaffMemberOut])
async def list_staff_members(
    current_user: User = Depends(require_admin_owner),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(User).where(User.role.in_([UserRole.ADMIN_OWNER, UserRole.ADMIN_STAFF, "ADMIN_OWNER", "ADMIN_STAFF", "SECURITY_STAFF", "ADMIN"]))
        .order_by(User.created_at.desc())
    )
    return result.scalars().all()

@router.post("/staff/invite", status_code=status.HTTP_201_CREATED)
async def invite_staff_member(
    invite_in: StaffInviteRequest,
    current_user: User = Depends(require_admin_owner),
    db: AsyncSession = Depends(get_db)
):
    # Check if user/invite already exists
    existing = (await db.execute(select(User).where(User.email == invite_in.email))).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="A user with this email address already exists.")

    existing_invite = (await db.execute(select(StaffInvitation).where(StaffInvitation.email == invite_in.email, StaffInvitation.is_used == False))).scalar_one_or_none()
    if existing_invite:
        # Re-send or refresh invitation
        db.delete(existing_invite)
        await db.flush()

    invitation = StaffInvitation(
        email=invite_in.email,
        full_name=invite_in.full_name,
        permissions=invite_in.permissions,
        created_by_id=current_user.id
    )
    db.add(invitation)

    audit = AuditLog(
        user_id=current_user.id,
        action="ADMIN_INVITE_STAFF",
        resource="staff",
        details={"email": invite_in.email, "full_name": invite_in.full_name, "permissions": invite_in.permissions}
    )
    db.add(audit)

    await db.commit()

    send_staff_invitation_email(
        email=invitation.email,
        full_name=invitation.full_name,
        invite_token=invitation.token
    )

    return {"message": f"Staff invitation dispatched to {invitation.email}."}

@router.patch("/staff/{staff_id}/permissions", response_model=StaffMemberOut)
async def update_staff_permissions(
    staff_id: str,
    update_in: StaffPermissionsUpdate,
    current_user: User = Depends(require_admin_owner),
    db: AsyncSession = Depends(get_db)
):
    # Re-authentication password verification for sensitive operation
    if not verify_password(update_in.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Sensitive Action Re-authentication Failed: Incorrect password.")

    if staff_id == current_user.id:
        raise HTTPException(status_code=400, detail="ADMIN_OWNER automatically possesses all permissions.")

    result = await db.execute(select(User).where(User.id == staff_id))
    target = result.scalar_one_or_none()
    if not target:
        raise HTTPException(status_code=404, detail="Staff member not found.")

    target.permissions = update_in.permissions

    audit = AuditLog(
        user_id=current_user.id,
        action="ADMIN_UPDATE_STAFF_PERMISSIONS",
        resource="staff",
        details={"target_staff_id": staff_id, "email": target.email, "new_permissions": update_in.permissions}
    )
    db.add(audit)
    await db.commit()
    await db.refresh(target)

    return target

@router.patch("/staff/{staff_id}/status", response_model=StaffMemberOut)
async def toggle_staff_status(
    staff_id: str,
    update_in: StaffStatusUpdate,
    current_user: User = Depends(require_admin_owner),
    db: AsyncSession = Depends(get_db)
):
    # Re-authentication password verification for sensitive operation
    if not verify_password(update_in.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Sensitive Action Re-authentication Failed: Incorrect password.")

    if staff_id == current_user.id:
        raise HTTPException(status_code=400, detail="Self-protection enabled: Platform owner cannot revoke their own account.")

    result = await db.execute(select(User).where(User.id == staff_id))
    target = result.scalar_one_or_none()
    if not target:
        raise HTTPException(status_code=404, detail="Staff member not found.")

    target.is_active = update_in.is_active

    audit = AuditLog(
        user_id=current_user.id,
        action=f"ADMIN_STAFF_ACCESS_{'REACTIVATED' if update_in.is_active else 'REVOKED'}",
        resource="staff",
        details={"target_staff_id": staff_id, "email": target.email, "is_active": update_in.is_active}
    )
    db.add(audit)
    await db.commit()
    await db.refresh(target)

    return target

# --- User Management ---

@router.get("/users", response_model=List[UserOut])
async def list_users(
    current_user: User = Depends(require_permission("view_users")),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    return result.scalars().all()

@router.patch("/users/{user_id}/role", response_model=UserOut)
async def update_user_role(
    user_id: str,
    role_in: UserRoleUpdate,
    current_user: User = Depends(require_admin_owner),
    db: AsyncSession = Depends(get_db)
):
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Self-protection enabled: Owner role cannot be modified."
        )

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    old_role = user.role.value if hasattr(user.role, 'value') else str(user.role)
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
    current_user: User = Depends(require_permission("manage_users")),
    db: AsyncSession = Depends(get_db)
):
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Self-protection enabled: Cannot deactivate your own account."
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

@router.get("/lost-items", response_model=List[AdminLostItemOut])
async def list_all_lost_items(
    moderation_status: Optional[ModerationStatus] = None,
    current_user: User = Depends(require_permission("view_lost_items")),
    db: AsyncSession = Depends(get_db)
):
    query = select(LostItem).order_by(LostItem.created_at.desc())
    if moderation_status:
        query = query.where(LostItem.moderation_status == moderation_status)
    result = await db.execute(query)
    return result.scalars().all()

@router.patch("/lost-items/{item_id}/status", response_model=LostItemOut)
async def update_lost_item_status(
    item_id: str,
    status_in: ItemStatusUpdate,
    current_user: User = Depends(require_permission("moderate_lost_items")),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(LostItem).where(LostItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Lost item report not found.")

    old_status = item.status.value if hasattr(item.status, 'value') else str(item.status)
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

@router.patch("/lost-items/{item_id}/moderation", response_model=AdminLostItemOut)
async def update_lost_item_moderation(
    item_id: str,
    status_in: ModerationUpdate,
    current_user: User = Depends(require_permission("moderate_lost_items")),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(LostItem).where(LostItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Lost item report not found.")

    old_status = item.moderation_status.value if hasattr(item.moderation_status, 'value') else str(item.moderation_status)
    item.moderation_status = status_in.moderation_status
    item.reviewed_at = datetime.utcnow()
    item.reviewed_by = current_user.id

    audit = AuditLog(
        user_id=current_user.id,
        action=f"ADMIN_MODERATE_LOST_ITEM_{status_in.moderation_status.value}",
        resource="lost_items",
        details={
            "report_id": item.report_id,
            "old_mod_status": old_status,
            "new_mod_status": status_in.moderation_status.value,
            "notes": status_in.admin_notes or ""
        }
    )
    db.add(audit)
    await db.commit()
    await db.refresh(item)
    
    from app.notifications.service import send_report_approved_email, send_report_rejected_email
    if item.moderation_status == ModerationStatus.APPROVED:
        send_report_approved_email(item.contact_email, item.report_id, item.title)
    elif item.moderation_status == ModerationStatus.REJECTED:
        send_report_rejected_email(item.contact_email, item.report_id, item.title)

    return item

# --- Found Items Management ---

@router.get("/found-items", response_model=List[AdminFoundItemOut])
async def list_all_found_items(
    moderation_status: Optional[ModerationStatus] = None,
    current_user: User = Depends(require_permission("view_found_items")),
    db: AsyncSession = Depends(get_db)
):
    query = select(FoundItem).order_by(FoundItem.created_at.desc())
    if moderation_status:
        query = query.where(FoundItem.moderation_status == moderation_status)
    result = await db.execute(query)
    return result.scalars().all()

@router.patch("/found-items/{item_id}/status", response_model=FoundItemOut)
async def update_found_item_status(
    item_id: str,
    status_in: ItemStatusUpdate,
    current_user: User = Depends(require_permission("moderate_found_items")),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(FoundItem).where(FoundItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Found item report not found.")

    old_status = item.status.value if hasattr(item.status, 'value') else str(item.status)
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

@router.patch("/found-items/{item_id}/moderation", response_model=AdminFoundItemOut)
async def update_found_item_moderation(
    item_id: str,
    status_in: ModerationUpdate,
    current_user: User = Depends(require_permission("moderate_found_items")),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(FoundItem).where(FoundItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Found item report not found.")

    old_status = item.moderation_status.value if hasattr(item.moderation_status, 'value') else str(item.moderation_status)
    item.moderation_status = status_in.moderation_status
    item.reviewed_at = datetime.utcnow()
    item.reviewed_by = current_user.id

    audit = AuditLog(
        user_id=current_user.id,
        action=f"ADMIN_MODERATE_FOUND_ITEM_{status_in.moderation_status.value}",
        resource="found_items",
        details={
            "report_id": item.report_id,
            "old_mod_status": old_status,
            "new_mod_status": status_in.moderation_status.value,
            "notes": status_in.admin_notes or ""
        }
    )
    db.add(audit)
    await db.commit()
    await db.refresh(item)
    
    from app.notifications.service import send_report_approved_email, send_report_rejected_email
    if item.moderation_status == ModerationStatus.APPROVED:
        send_report_approved_email(item.contact_email, item.report_id, item.title)
    elif item.moderation_status == ModerationStatus.REJECTED:
        send_report_rejected_email(item.contact_email, item.report_id, item.title)

    return item

# --- Support Tickets Management ---

@router.get("/support-tickets", response_model=List[SupportTicketOut])
async def list_support_tickets(
    current_user: User = Depends(require_permission("view_support")),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(SupportTicket).order_by(SupportTicket.created_at.desc()))
    return result.scalars().all()

@router.patch("/support-tickets/{ticket_id}/status", response_model=SupportTicketOut)
async def update_support_ticket_status(
    ticket_id: str,
    update_in: SupportTicketStatusUpdate,
    current_user: User = Depends(require_permission("manage_support")),
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
    current_user: User = Depends(require_permission("view_analytics")),
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
    current_user: User = Depends(require_permission("view_audit_logs")),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit))
    return result.scalars().all()

@router.get("/information", response_model=List[ItemInformationOut])
async def list_information_tips(
    status: Optional[TipStatus] = None,
    current_user: User = Depends(require_permission("manage_items")),
    db: AsyncSession = Depends(get_db)
):
    query = select(LostItemInformation).order_by(LostItemInformation.created_at.desc())
    if status:
        query = query.where(LostItemInformation.status == status)
    result = await db.execute(query)
    return result.scalars().all()

@router.patch("/information/{info_id}/status", response_model=ItemInformationOut)
async def update_information_status(
    info_id: str,
    payload: ItemInformationReview,
    current_user: User = Depends(require_permission("manage_items")),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(LostItemInformation).where(LostItemInformation.id == info_id))
    info = result.scalar_one_or_none()
    if not info:
        raise HTTPException(status_code=404, detail="Information tip not found")

    old_status = info.status
    info.status = payload.status
    info.reviewed_at = datetime.utcnow()
    info.reviewed_by_id = current_user.id
    
    await db.commit()
    await db.refresh(info)

    if info.status == TipStatus.APPROVED and old_status != TipStatus.APPROVED:
        # Fetch lost item to get contact email
        lost_item_res = await db.execute(select(LostItem).where(LostItem.id == info.lost_item_id))
        lost_item = lost_item_res.scalar_one_or_none()
        if lost_item:
            send_information_approved_owner_email(
                email=lost_item.contact_email,
                message=info.message,
                report_id=lost_item.report_id
            )

    return info
