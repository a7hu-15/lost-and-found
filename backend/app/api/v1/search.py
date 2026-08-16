from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from app.database.session import get_db
from app.models.lost_item import LostItem, ItemStatus, ModerationStatus
from app.models.found_item import FoundItem
from app.schemas.lost_item import LostItemOut
from app.schemas.found_item import FoundItemOut

from fastapi import APIRouter, Depends, Query, HTTPException, status

router = APIRouter()

@router.get("", response_model=Dict[str, Any])
async def search_items(
    q: Optional[str] = Query(None, description="Search query string"),
    category: Optional[str] = Query(None, description="Filter by category"),
    location: Optional[str] = Query(None, description="Filter by location"),
    color: Optional[str] = Query(None, description="Filter by color"),
    db: AsyncSession = Depends(get_db)
):
    if q and len(q.strip()) > 200:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Search query must not exceed 200 characters.")
    if category and len(category.strip()) > 50:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category filter must not exceed 50 characters.")
    if location and len(location.strip()) > 200:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Location filter must not exceed 200 characters.")
    if color and len(color.strip()) > 50:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Color filter must not exceed 50 characters.")

    is_report_id_search = bool(q and "LF-SRM-" in q.upper())

    # Query lost items
    if is_report_id_search:
        lost_query = select(LostItem).where(LostItem.report_id.ilike(f"%{q}%"))
    else:
        lost_query = select(LostItem).where(LostItem.status != ItemStatus.HIDDEN, LostItem.moderation_status == ModerationStatus.APPROVED)
        if q:
            lost_query = lost_query.where(
                or_(
                    LostItem.title.ilike(f"%{q}%"),
                    LostItem.description.ilike(f"%{q}%"),
                    LostItem.brand.ilike(f"%{q}%"),
                )
            )
        if category:
            lost_query = lost_query.where(LostItem.category.ilike(f"%{category}%"))
        if location:
            lost_query = lost_query.where(LostItem.location.ilike(f"%{location}%"))
        if color:
            lost_query = lost_query.where(LostItem.color.ilike(f"%{color}%"))

    lost_result = await db.execute(lost_query.order_by(LostItem.created_at.desc()))
    lost_items = lost_result.scalars().all()

    # Query found items
    if is_report_id_search:
        found_query = select(FoundItem).where(FoundItem.report_id.ilike(f"%{q}%"))
    else:
        found_query = select(FoundItem).where(FoundItem.status != ItemStatus.HIDDEN, FoundItem.moderation_status == ModerationStatus.APPROVED)
        if q:
            found_query = found_query.where(
                or_(
                    FoundItem.title.ilike(f"%{q}%"),
                    FoundItem.description.ilike(f"%{q}%"),
                    FoundItem.brand.ilike(f"%{q}%"),
                )
            )
        if category:
            found_query = found_query.where(FoundItem.category.ilike(f"%{category}%"))
        if location:
            found_query = found_query.where(FoundItem.location.ilike(f"%{location}%"))
        if color:
            found_query = found_query.where(FoundItem.color.ilike(f"%{color}%"))

    found_result = await db.execute(found_query.order_by(FoundItem.created_at.desc()))
    found_items = found_result.scalars().all()

    return {