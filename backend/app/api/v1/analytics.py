from typing import Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta

from app.database.session import get_db
from app.models.lost_item import LostItem
from app.models.found_item import FoundItem
from app.models.claim import Claim, ClaimStatus
from app.models.match import MatchScore

router = APIRouter()

@router.get("", response_model=Dict[str, Any])
async def get_analytics(db: AsyncSession = Depends(get_db)):
    now = datetime.utcnow()
    last_30_days = now - timedelta(days=30)
    
    # Lost vs Found trend
    lost_30 = (await db.execute(select(func.count(LostItem.id)).where(LostItem.created_at >= last_30_days))).scalar() or 0
    found_30 = (await db.execute(select(func.count(FoundItem.id)).where(FoundItem.created_at >= last_30_days))).scalar() or 0
    
    # High score matches count
    high_matches = (await db.execute(select(func.count(MatchScore.id)).where(MatchScore.similarity_score >= 80.0))).scalar() or 0
    
    # Active locations distribution
    loc_query = select(LostItem.location, func.count(LostItem.id)).group_by(LostItem.location).limit(5)
    loc_result = await db.execute(loc_query)
    top_locations = {loc: count for loc, count in loc_result.all()}

    return {
        "monthly_lost_reports": lost_30,
        "monthly_found_reports": found_30,
        "high_confidence_matches": high_matches,
        "top_lost_locations": top_locations,
        "timestamp": now.isoformat()
    }
