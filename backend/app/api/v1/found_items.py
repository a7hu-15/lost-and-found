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
    query = select(FoundItem).order_by(FoundItem.created_at.desc())
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
