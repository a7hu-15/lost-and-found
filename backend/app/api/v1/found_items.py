from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.session import get_db
from app.models.found_item import FoundItem
from app.models.lost_item import LostItem, ItemStatus, generate_report_id, generate_access_token
from app.models.match import MatchScore
from app.models.audit import AuditLog
from app.schemas.found_item import FoundItemCreate, FoundItemOut
from app.matching.engine import calculate_item_similarity
from app.notifications.service import send_report_confirmation_email, send_match_alert_email
from app.services.image_service import process_and_store_image

import re
from datetime import date as date_cls

router = APIRouter()

@router.post("/create", response_model=FoundItemOut, status_code=status.HTTP_201_CREATED)
async def create_found_item(
    title: str = Form(...),
    category: str = Form(...),
    location: str = Form(...),
    found_date: date = Form(...),
    description: str = Form(...),
    contact_email: str = Form(...),
    storage_location: str = Form("Campus Security Office - Gate 1"),
    brand: Optional[str] = Form(None),
    color: Optional[str] = Form(None),
    contact_phone: Optional[str] = Form(None),
    lost_item_id: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db)
):
    # Server-side validation: Length and boundary checks
    if len(title.strip()) > 100:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Title must not exceed 100 characters.")
    if len(location.strip()) > 200:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Location must not exceed 200 characters.")
    if storage_location and len(storage_location.strip()) > 200:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Storage location must not exceed 200 characters.")
    if len(description.strip().split()) > 100:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Description exceeds the maximum limit of 100 words.")
    if len(contact_email.strip()) > 254:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email address must not exceed 254 characters.")
    if category and len(category.strip()) > 50:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category must not exceed 50 characters.")
    if brand and len(brand.strip()) > 50:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Brand must not exceed 50 characters.")
    if color and len(color.strip()) > 50:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Color must not exceed 50 characters.")

    # Server-side validation: Future date check
    if found_date > date_cls.today():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Date found cannot be in the future.")

    # Server-side validation: Indian mobile number format check
    if contact_phone and contact_phone.strip():
        phone_raw = contact_phone.strip()
        digits = re.sub(r'\D', '', phone_raw)
        if phone_raw.startswith('+91'):
            core_digits = digits[2:] if digits.startswith('91') else digits
        elif len(digits) == 12 and digits.startswith('91'):
            core_digits = digits[2:]
        else:
            core_digits = digits

        if not re.match(r'^[6-9]\d{9}$', core_digits):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please enter a valid Indian mobile number (10 digits starting with 6–9), or leave the field blank."
            )
        contact_phone = f"+91{core_digits}" if phone_raw.startswith('+91') else core_digits

    report_id = generate_report_id()
    access_token = generate_access_token()

    # Process image if uploaded
    image_url = None
    thumbnail_url = None
    if file and file.filename:
        image_url, thumbnail_url = await process_and_store_image(file)

    found_item = FoundItem(
        report_id=report_id,
        access_token=access_token,
        title=title,
        category=category,
        brand=brand,
        color=color,
        location=location,
        found_date=found_date,
        description=description,
        storage_location=storage_location,
        image_url=image_url,
        thumbnail_url=thumbnail_url,
        contact_email=contact_email,
        contact_phone=contact_phone,
        status=ItemStatus.REPORTED
    )
    db.add(found_item)
    await db.flush()

    # Send confirmation email
    send_report_confirmation_email(
        email=found_item.contact_email,
        report_id=found_item.report_id,
        access_token=found_item.access_token,
        item_title=found_item.title
    )

    # If explicitly linked to a lost item via "I Found This Item" button
    if lost_item_id:
        lost_res = await db.execute(select(LostItem).where(LostItem.id == lost_item_id))
        linked_lost = lost_res.scalar_one_or_none()
        if linked_lost:
            match = MatchScore(
                lost_item_id=linked_lost.id,
                found_item_id=found_item.id,
                similarity_score=95.0,
                breakdown_json={"linked_report": 95.0}
            )
            db.add(match)
            found_item.status = ItemStatus.MATCHED
            linked_lost.status = ItemStatus.MATCHED
            send_match_alert_email(
                email=linked_lost.contact_email,
                report_id=linked_lost.report_id,
                access_token=linked_lost.access_token,
                match_score=95.0,
                matched_title=found_item.title
            )

    # Trigger automatic matching engine against existing lost items
    lost_result = await db.execute(select(LostItem).where(LostItem.status == ItemStatus.REPORTED))
    lost_items = lost_result.scalars().all()
    
    highest_score = 0.0
    for lost in lost_items:
        score, breakdown = calculate_item_similarity(lost, found_item)
        if score >= 50.0:
            existing_match = await db.execute(
                select(MatchScore).where(
                    MatchScore.lost_item_id == lost.id,
                    MatchScore.found_item_id == found_item.id
                )
            )
            if not existing_match.scalar_one_or_none():
                match = MatchScore(
                    lost_item_id=lost.id,
                    found_item_id=found_item.id,
                    similarity_score=score,
                    breakdown_json=breakdown
                )
                db.add(match)
            if score > highest_score:
                highest_score = score
                send_match_alert_email(
                    email=lost.contact_email,
                    report_id=lost.report_id,
                    access_token=lost.access_token,
                    match_score=score,
                    matched_title=found_item.title
                )

    if highest_score >= 70.0:
        found_item.status = ItemStatus.MATCHED

    # Audit log
    audit = AuditLog(
        action="REPORT_FOUND_ITEM",
        resource="found_items",
        details={"report_id": report_id, "title": found_item.title, "has_image": image_url is not None}
    )
    db.add(audit)
    
    await db.commit()
    await db.refresh(found_item)
    return found_item

@router.get("/all", response_model=List[FoundItemOut])
async def list_found_items(
    category: Optional[str] = None,
    location: Optional[str] = None,
    status: Optional[ItemStatus] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(FoundItem).where(FoundItem.status != ItemStatus.HIDDEN).order_by(FoundItem.created_at.desc())
    if category:
        query = query.where(FoundItem.category.ilike(f"%{category}%"))
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
