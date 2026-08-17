from typing import List, Optional
import html
from datetime import date, datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.database.session import get_db
from app.models.found_item import FoundItem
from app.models.lost_item import LostItem, ItemStatus, generate_report_id, generate_access_token
from app.models.match import MatchScore
from app.models.audit import AuditLog
from app.schemas.found_item import FoundItemCreate, FoundItemOut
from app.notifications.service import send_verification_email
from app.services.image_service import process_and_store_image
from app.services.moderation.text_moderator import get_text_moderator
from app.models.verification import VerificationToken, ReportType
from app.models.lost_item import ModerationStatus
from app.matching.engine import calculate_item_similarity

import re

from app.core.rate_limit import limiter, LIMIT_CREATE
from fastapi import Request

router = APIRouter()

@router.post("/create", response_model=FoundItemOut, status_code=status.HTTP_201_CREATED)
@limiter.limit(LIMIT_CREATE)
async def create_found_item(
    request: Request,
    item_name: str = Form(...),
    location: str = Form(...),
    found_date: date = Form(...),
    description: str = Form(...),
    storage_location: str = Form("Campus Security Office - Gate 1"),
    email: str = Form(...),
    brand: Optional[str] = Form(None),
    color: Optional[str] = Form(None),
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    db: AsyncSession = Depends(get_db)
):
    # Server-side validation: Length and boundary checks
    if len(item_name.strip()) > 100:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Title must not exceed 100 characters.")
    if len(location.strip()) > 200:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Location must not exceed 200 characters.")
    if len(description.strip().split()) > 100:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Description exceeds the maximum limit of 100 words.")
    if len(storage_location.strip()) > 200:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Storage location must not exceed 200 characters.")
    if len(email.strip()) > 254:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email address must not exceed 254 characters.")
    if brand and len(brand.strip()) > 50:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Brand must not exceed 50 characters.")
    if color and len(color.strip()) > 50:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Color must not exceed 50 characters.")

    # Server-side validation: Future date check
    if found_date > date.today():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Date found cannot be in the future.")

    # Prevent duplicate submissions (Debounce / Idempotency)
    recent_item = await db.execute(
        select(FoundItem).where(
            FoundItem.email == email,
            FoundItem.item_name == item_name,
            FoundItem.created_at >= (datetime.utcnow() - timedelta(minutes=5))
        )
    )
    if recent_item.scalars().first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A similar report was recently submitted.")

    report_id = generate_report_id()
    access_token = generate_access_token()

    # Process image if uploaded (it is required now)
    if not file or not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Image upload is required for found items.")
    image_url, thumbnail_url, image_flagged, image_mod_result = await process_and_store_image(file)

    # XSS Sanitization
    item_name = html.escape(item_name.strip())
    location = html.escape(location.strip())
    description = html.escape(description.strip())
    storage_location = html.escape(storage_location.strip())
    brand = html.escape(brand.strip()) if brand else None
    color = html.escape(color.strip()) if color else None

    # Text Moderation
    moderator = get_text_moderator()
    is_text_flagged, masked_description = moderator.moderate_text(description)
    is_item_name_flagged, masked_item_name = moderator.moderate_text(item_name)
    is_location_flagged, masked_location = moderator.moderate_text(location)
    is_storage_flagged, masked_storage_location = moderator.moderate_text(storage_location)
    
    is_brand_flagged, masked_brand = moderator.moderate_text(brand) if brand else (False, None)
    is_color_flagged, masked_color = moderator.moderate_text(color) if color else (False, None)
    
    text_flagged = is_text_flagged or is_item_name_flagged or is_location_flagged or is_storage_flagged or is_brand_flagged or is_color_flagged
    # Auto-approving clean items for demo so they appear in search immediately
    moderation_status = ModerationStatus.PENDING_MODERATION if (text_flagged or image_flagged) else ModerationStatus.APPROVED
    flag_reason = []
    if text_flagged:
        flag_reason.append("Text contained profanity.")
    if image_flagged:
        flag_reason.append("Image was flagged by moderation API.")

    import json
    original_data = json.dumps({"item_name": item_name, "location": location, "description": description})
    moderated_data = json.dumps({"item_name": masked_item_name, "location": masked_location, "description": masked_description})

    found_item = FoundItem(
        original_text=original_data,
        moderated_text=moderated_data,
        report_id=report_id,
        access_token=access_token,
        item_name=masked_item_name,
        brand=masked_brand,
        color=masked_color,
        location=masked_location,
        found_date=found_date,
        description=masked_description,
        storage_location=masked_storage_location,
        image_url=image_url,
        thumbnail_url=thumbnail_url,
        email=email,
        status=ItemStatus.REPORTED,
        moderation_status=moderation_status,
        
        image_moderation_result=image_mod_result,
        flag_reason=" | ".join(flag_reason) if flag_reason else None,
        verification_status=True
    )
    db.add(found_item)
    await db.flush()

    # Matching engine disabled per spec

    # Audit log
    audit = AuditLog(
        action="REPORT_FOUND_ITEM",
        resource="found_items",
        details={"report_id": report_id, "title": found_item.item_name, "has_image": image_url is not None}
    )
    db.add(audit)
    
    # Create verification token
    v_token = VerificationToken(
        email=found_item.email,
        report_id=found_item.report_id,
        report_type=ReportType.FOUND
    )
    db.add(v_token)
    
    await db.commit()
    await db.refresh(found_item)
    
    # Verification email sent in background to prevent timeout
    background_tasks.add_task(
        send_verification_email,
        email=found_item.email,
        token=v_token.token,
        report_id=found_item.report_id
    )
    
    return found_item

@router.get("/all", response_model=List[FoundItemOut])
async def list_found_items(
    location: Optional[str] = None,
    status: Optional[ItemStatus] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(FoundItem).where(
        FoundItem.status != ItemStatus.HIDDEN,
        FoundItem.moderation_status == ModerationStatus.APPROVED
    ).order_by(FoundItem.created_at.desc())
    if location:
        query = query.where(FoundItem.location.ilike(f"%{location}%"))
    if status:
        query = query.where(FoundItem.status == status)
        
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{item_id}", response_model=FoundItemOut)
async def get_found_item(item_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FoundItem).where(
        (FoundItem.id == item_id) | (FoundItem.report_id == item_id)
    ))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Found item not found")
    return item
