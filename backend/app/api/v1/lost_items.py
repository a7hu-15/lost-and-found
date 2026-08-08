import json
from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.session import get_db
from app.models.lost_item import LostItem, ItemStatus, generate_report_id, generate_access_token
from app.models.found_item import FoundItem
from app.models.match import MatchScore
from app.models.audit import AuditLog
from app.schemas.lost_item import LostItemCreate, LostItemOut
from app.matching.engine import calculate_item_similarity
from app.notifications.service import send_report_confirmation_email, send_match_alert_email
from app.services.image_service import process_and_store_image

import re
from datetime import date as date_cls

router = APIRouter()

@router.post("/create", response_model=LostItemOut, status_code=status.HTTP_201_CREATED)
async def create_lost_item(
    title: str = Form(...),
    category: str = Form(...),
    location: str = Form(...),
    lost_date: date = Form(...),
    description: str = Form(...),
    contact_email: str = Form(...),
    brand: Optional[str] = Form(None),
    color: Optional[str] = Form(None),
    reward: Optional[float] = Form(0.0),
    contact_phone: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db)
):
    # Server-side validation: Future date check
    if lost_date > date_cls.today():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Date lost cannot be in the future."
        )

    # Server-side validation: Phone number format check
    if contact_phone and contact_phone.strip():
        phone_str = contact_phone.strip()
        digits = re.sub(r'\D', '', phone_str)
        if not re.match(r'^\+?[0-9\s\-\(\)]{7,15}$', phone_str) or not (7 <= len(digits) <= 15):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid phone number format. Please provide a valid phone number (7–15 digits) or leave it empty."
            )

    report_id = generate_report_id()
    access_token = generate_access_token()

    # Process image if uploaded
    image_url = None
    thumbnail_url = None
    if file and file.filename:
        image_url, thumbnail_url = await process_and_store_image(file)

    lost_item = LostItem(
        report_id=report_id,
        access_token=access_token,
        title=title,
        category=category,
        brand=brand,
        color=color,
        location=location,
        lost_date=lost_date,
        description=description,
        reward=reward or 0.0,
        image_url=image_url,
        thumbnail_url=thumbnail_url,
        contact_email=contact_email,
        contact_phone=contact_phone,
        status=ItemStatus.REPORTED
    )
    db.add(lost_item)
    await db.flush()

    # Confirmation notification email
    send_report_confirmation_email(
        email=lost_item.contact_email,
        report_id=lost_item.report_id,
        access_token=lost_item.access_token,
        item_title=lost_item.title
    )

    # Trigger automatic matching engine against existing found items
    found_result = await db.execute(select(FoundItem).where(FoundItem.status == ItemStatus.REPORTED))
    found_items = found_result.scalars().all()
    
    highest_score = 0.0
    for found in found_items:
        score, breakdown = calculate_item_similarity(lost_item, found)
        if score >= 50.0:
            match = MatchScore(
                lost_item_id=lost_item.id,
                found_item_id=found.id,
                similarity_score=score,
                breakdown_json=breakdown
            )
            db.add(match)
            if score > highest_score:
                highest_score = score
                send_match_alert_email(
                    email=lost_item.contact_email,
                    report_id=lost_item.report_id,
                    access_token=lost_item.access_token,
                    match_score=score,
                    matched_title=found.title
                )

    if highest_score >= 70.0:
        lost_item.status = ItemStatus.MATCHED

    # Audit log
    audit = AuditLog(
        action="REPORT_LOST_ITEM",
        resource="lost_items",
        details={"report_id": report_id, "title": lost_item.title, "has_image": image_url is not None}
    )
    db.add(audit)
    
    await db.commit()
    await db.refresh(lost_item)
    return lost_item

@router.get("/all", response_model=List[LostItemOut])
async def list_lost_items(
    category: Optional[str] = None,
    location: Optional[str] = None,
    status: Optional[ItemStatus] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(LostItem).where(LostItem.status != ItemStatus.HIDDEN).order_by(LostItem.created_at.desc())
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
