from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime

from app.database.session import get_db
from app.models.verification import VerificationToken, ReportType
from app.models.lost_item import LostItem, ModerationStatus
from app.models.found_item import FoundItem
from app.notifications.service import send_report_confirmation_email
from app.matching.tasks import run_matching_engine_background

router = APIRouter()

@router.get("/verify-email")
async def verify_email(token: str, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(VerificationToken).where(VerificationToken.token == token))
    v_token = result.scalar_one_or_none()
    
    if not v_token:
        raise HTTPException(status_code=400, detail="Invalid verification token")
        
    if not v_token.is_valid():
        raise HTTPException(status_code=400, detail="Verification token is expired or has already been used")
        
    # Mark token as used
    v_token.is_used = True
    v_token.expires_at = datetime.utcnow()
    
    # Retrieve the associated report
    if v_token.report_type == ReportType.LOST:
        report_result = await db.execute(select(LostItem).where(LostItem.report_id == v_token.report_id))
        report = report_result.scalar_one_or_none()
    else:
        report_result = await db.execute(select(FoundItem).where(FoundItem.report_id == v_token.report_id))
        report = report_result.scalar_one_or_none()
        
    if not report:
        raise HTTPException(status_code=404, detail="Associated report not found")
        
    # Update moderation status based on whether it was flagged
    is_clean = (report.flag_reason is None or report.flag_reason == "")
                
    if is_clean:
        report.moderation_status = ModerationStatus.APPROVED
    else:
        report.moderation_status = ModerationStatus.PENDING_MODERATION
        
    report.verification_status = True
        
    await db.commit()
    
    # Send the actual confirmation email with the token
    send_report_confirmation_email(
        email=report.email,
        report_id=report.report_id,
        access_token=report.access_token,
        item_title=report.item_name
    )
    
    
    # Trigger matching engine if safe
    if is_clean:
        is_lost = v_token.report_type == ReportType.LOST
        background_tasks.add_task(run_matching_engine_background, db, report.id, is_lost)

    return {"message": "Email verified successfully", "status": report.moderation_status}
