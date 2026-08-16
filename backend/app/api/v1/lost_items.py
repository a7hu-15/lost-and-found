from typing import List, Optional
import html
from fastapi import Request
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.database.session import get_db
from app.models.lost_item import LostItem, ItemStatus, generate_report_id, generate_access_token
from app.models.found_item import FoundItem
from app.models.match import MatchScore
from app.models.audit import AuditLog
from app.schemas.lost_item import LostItemCreate, LostItemOut
from app.matching.engine import calculate_item_similarity
from app.notifications.service import send_verification_email
from app.services.image_service import process_and_store_image
from app.services.moderation.text_moderator import get_text_moderator
from app.models.verification import VerificationToken, ReportType
from app.models.lost_item import ModerationStatus

import re
from datetime import date as date_cls

from app.core.rate_limit import limiter, LIMIT_CREATE
router = APIRouter()

@router.post("/create", response_model=LostItemOut, status_code=status.HTTP_201_CREATED)
@limiter.limit(LIMIT_CREATE)
async def create_lost_item(
    request: Request,
    title: str = Form(...),
    location: str = Form(...),
    lost_date: date = Form(...),
    description: str = Form(...),
    contact_email: str = Form(...),
    brand: Optional[str] = Form(None),
    color: Optional[str] = Form(None),
    reward: Optional[float] = Form(0.0),
    file: Optional[UploadFile] = File(None),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    db: AsyncSession = Depends(get_db)
):
    # Server-side validation: Length and boundary checks
    if len(title.strip()) > 100:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Title must not exceed 100 characters.")
    if len(location.strip()) > 200:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Location must not exceed 200 characters.")
    if len(description.strip().split()) > 100:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Description exceeds the maximum limit of 100 words.")
    if len(contact_email.strip()) > 254:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email address must not exceed 254 characters.")
    if brand and len(brand.strip()) > 50:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Brand must not exceed 50 characters.")
    if color and len(color.strip()) > 50:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Color must not exceed 50 characters.")

    # Server-side validation: Future date check
    if lost_date > date_cls.today():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Date lost cannot be in the future.")

    report_id = generate_report_id()
    access_token = generate_access_token()

    # Process image if uploaded
    image_url = None
    thumbnail_url = None
    image_flagged = False
    image_mod_result = None
    if file and file.filename:
        image_url, thumbnail_url, image_flagged, image_mod_result = await process_and_store_image(file)

    # XSS Sanitization
    title = html.escape(title.strip())
    location = html.escape(location.strip())
    description = html.escape(description.strip())
    brand = html.escape(brand.strip()) if brand else None
    color = html.escape(color.strip()) if color else None

    # Text Moderation
    moderator = get_text_moderator()
    is_text_flagged, masked_description = moderator.moderate_text(description)
    is_title_flagged, masked_title = moderator.moderate_text(title)
    
    text_flagged = is_text_flagged or is_title_flagged
    
    # Calculate ModerationStatus
    # Starts at PENDING_VERIFICATION until email is verified
    # Then goes to PENDING_MODERATION (if flagged) or APPROVED (if clean)
    moderation_status = ModerationStatus.PENDING_VERIFICATION
    flag_reason = []
    if text_flagged:
        flag_reason.append("Text contained profanity.")
    if image_flagged:
        flag_reason.append("Image was flagged by moderation API.")

    lost_item = LostItem(
        report_id=report_id,
        access_token=access_token,
        title=masked_title,
        category=None,
        brand=brand,
        color=color,
        location=location,
        lost_date=lost_date,
        description=masked_description,
        reward=reward or 0.0,
        image_url=image_url,
        thumbnail_url=thumbnail_url,
        contact_email=contact_email,
        contact_phone=None,
        status=ItemStatus.REPORTED,
        moderation_status=moderation_status,
        text_moderation_result="FLAGGED" if text_flagged else "CLEAN",
        image_moderation_result=image_mod_result,
        flag_reason=" | ".join(flag_reason) if flag_reason else None
    )
    db.add(lost_item)
    await db.flush()

    # Trigger automatic matching engine against existing found items
    found_result = await db.execute(select(FoundItem).where(FoundItem.status == ItemStatus.REPORTED))
    found_items = found_result.scalars().all()
    
    highest_score = 0.0
    for found in found_items:
        score, breakdown = calculate_item_similarity(lost_item, found)
        # Discard low-confidence candidates (< settings.MATCH_THRESHOLD)
        if score >= settings.MATCH_THRESHOLD:
            existing_match = await db.execute(
                select(MatchScore).where(
                    MatchScore.lost_item_id == lost_item.id,
                    MatchScore.found_item_id == found.id
                )
            )
            if not existing_match.scalar_one_or_none():
                match = MatchScore(
                    lost_item_id=lost_item.id,
                    found_item_id=found.id,
                    similarity_score=score,
                    breakdown_json=breakdown
                )
                db.add(match)
            if score > highest_score:
                highest_score = score
            # NOTE: Automatic match alert emails removed per user specification (ZERO match emails sent)

    if highest_score >= settings.MATCH_THRESHOLD:
        lost_item.status = ItemStatus.MATCHED

    # Audit log
    audit = AuditLog(
        action="REPORT_LOST_ITEM",
        resource="lost_items",
        details={"report_id": report_id, "title": lost_item.title, "has_image": image_url is not None}
    )
    db.add(audit)
    
    # Create verification token
    v_token = VerificationToken(
        email=lost_item.contact_email,
        report_id=lost_item.report_id,
        report_type=ReportType.LOST
    )
    db.add(v_token)
    
    await db.commit()
    await db.refresh(lost_item)
    
    # Verification email sent in background to prevent timeout
    background_tasks.add_task(
        send_verification_email,
        email=lost_item.contact_email,
        token=v_token.token,
        report_id=lost_item.report_id
    )
    
    return lost_item

@router.get("/all", response_model=List[LostItemOut])
async def list_lost_items(
    category: Optional[str] = None,
    location: Optional[str] = None,
    status: Optional[ItemStatus] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(LostItem).where(
        LostItem.status != ItemStatus.HIDDEN,
        LostItem.moderation_status == ModerationStatus.APPROVED
    ).order_by(LostItem.created_at.desc())
    if category:
        query = query.where(LostItem.category.ilike(f"%{category}%"))
    if location:
        query = query.where(LostItem.location.ilike(f"%{location}%"))
    if status:
        query = query.where(LostItem.status == status)
        
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{item_id}", response_model=LostItemOut)
async def get_lost_item(item_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LostItem).where(
        (LostItem.id == item_id) | (LostItem.report_id == item_id)
    ))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Lost item not found")
    return item

from app.models.item_information import LostItemInformation
from app.schemas.item_information import ItemInformationCreate, ItemInformationOut

@router.post("/{report_id}/information", response_model=ItemInformationOut, status_code=status.HTTP_201_CREATED)
@limiter.limit(LIMIT_CREATE)
async def submit_item_information(
    report_id: str,
    payload: ItemInformationCreate,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    # Verify the lost item exists
    result = await db.execute(select(LostItem).where(LostItem.report_id == report_id))
    lost_item = result.scalar_one_or_none()
    if not lost_item:
        raise HTTPException(status_code=404, detail="Lost item not found")

    # Save to database
    info = LostItemInformation(
        lost_item_id=lost_item.id,
        sender_name=html.escape(payload.sender_name) if payload.sender_name else None,
        sender_email=payload.sender_email,
        message=html.escape(payload.message)
    )
    db.add(info)
    await db.commit()
    await db.refresh(info)

    return info
