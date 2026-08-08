from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database.session import get_db
from app.models.match import MatchScore, MatchStatus
from app.schemas.match import MatchScoreOut
from app.security.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("", response_model=List[MatchScoreOut])
async def get_matches(
    min_score: float = 50.0,
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(MatchScore)
        .options(
            selectinload(MatchScore.lost_item),
            selectinload(MatchScore.found_item)
        )
        .where(MatchScore.similarity_score >= min_score)
        .order_by(MatchScore.similarity_score.desc())
    )
    result = await db.execute(query)
    matches = result.scalars().all()
    return matches

@router.post("/{match_id}/status")
async def update_match_status(
    match_id: str,
    status: MatchStatus,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(MatchScore).where(MatchScore.id == match_id))
    match = result.scalar_one_or_none()
    if not match:
        raise HTTPException(status_code=404, detail="Match score record not found")
    
    match.status = status
    await db.commit()
    return {"message": f"Match status updated to {status.value}"}
