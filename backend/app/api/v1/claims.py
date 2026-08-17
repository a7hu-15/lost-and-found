from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database.session import get_db
from app.models.claim import Claim, ClaimStatus
from app.models.found_item import FoundItem
from app.models.lost_item import ItemStatus
from app.models.audit import AuditLog
from app.schemas.claim import ClaimCreate, ClaimOut, ClaimReview
from app.security.dependencies import get_current_user, require_roles
from app.notifications.service import send_claim_approved_email

router = APIRouter()

@router.post("/submit", response_model=ClaimOut, status_code=status.HTTP_201_CREATED)
async def submit_claim(
    claim_in: ClaimCreate,
    db: AsyncSession = Depends(get_db)
):
    # Check if found item exists
    found_res = await db.execute(select(FoundItem).where(FoundItem.id == claim_in.found_item_id))
    found_item = found_res.scalar_one_or_none()
    if not found_item:
        raise HTTPException(status_code=404, detail="Found item not found.")

    claim = Claim(
        found_item_id=claim_in.found_item_id,
        claimant_email=claim_in.claimant_email,
        proof_description=claim_in.proof_description,
        verification_answers=claim_in.verification_answers,
        status=ClaimStatus.PENDING
    )
    db.add(claim)
    
    # Update item status to CLAIMED pending review
    found_item.status = ItemStatus.CLAIMED

    # Audit log
    audit = AuditLog(
        action="SUBMIT_CLAIM",
        resource="claims",
        details={"found_item_id": claim_in.found_item_id, "claimant_email": claim_in.claimant_email}
    )
    db.add(audit)

    await db.commit()

    # Re-query with found_item loaded
    result = await db.execute(
        select(Claim)
        .options(selectinload(Claim.found_item))
        .where(Claim.id == claim.id)
    )
    return result.scalar_one()

from app.security.dependencies import require_permission

@router.get("/all", response_model=List[ClaimOut])
async def list_claims(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_permission("view_claims"))
):
    result = await db.execute(
        select(Claim)
        .options(selectinload(Claim.found_item))
        .order_by(Claim.created_at.desc())
    )
    return result.scalars().all()

@router.post("/{claim_id}/review", response_model=ClaimOut)
async def review_claim(
    claim_id: str,
    review_in: ClaimReview,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_permission("manage_claims"))
):
    result = await db.execute(
        select(Claim)
        .options(selectinload(Claim.found_item))
        .where(Claim.id == claim_id)
    )
    claim = result.scalar_one_or_none()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    claim.status = review_in.status
    claim.admin_notes = review_in.admin_notes
    claim.reviewed_by_id = current_user.id

    if review_in.status == "APPROVED":
        if claim.found_item:
            claim.found_item.status = ItemStatus.RETURNED
            # Send pickup email
            send_claim_approved_email(
                email=claim.claimant_email or claim.found_item.email,
                report_id=claim.found_item.report_id,
                storage_location=claim.found_item.storage_location
            )
    elif review_in.status == "REJECTED":
        if claim.found_item:
            claim.found_item.status = ItemStatus.REPORTED

    audit = AuditLog(
        user_id=current_user.id,
        action=f"REVIEW_CLAIM_{review_in.status}",
        resource="claims",
        details={"claim_id": claim_id, "status": review_in.status}
    )
    db.add(audit)

    await db.commit()
    await db.refresh(claim)
    return claim
