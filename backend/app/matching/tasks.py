import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.lost_item import LostItem, ModerationStatus
from app.models.found_item import FoundItem
from app.models.item_status import ItemStatus
from app.models.match import MatchScore
from app.matching.engine import calculate_item_similarity

logger = logging.getLogger(__name__)

async def run_matching_engine_background(db: AsyncSession, item_id: str, is_lost_item: bool):
    try:
        if is_lost_item:
            result = await db.execute(select(LostItem).where(LostItem.id == item_id))
            lost_item = result.scalar_one_or_none()
            if not lost_item or lost_item.moderation_status != ModerationStatus.APPROVED or lost_item.status == ItemStatus.HIDDEN:
                return

            # Find all approved found items
            found_res = await db.execute(
                select(FoundItem).where(
                    FoundItem.status != ItemStatus.HIDDEN,
                    FoundItem.moderation_status == ModerationStatus.APPROVED
                )
            )
            found_items = found_res.scalars().all()
            
            for found in found_items:
                score, breakdown = calculate_item_similarity(lost_item, found)
                if score >= 40.0:  # Threshold for potential match
                    match = MatchScore(
                        lost_item_id=lost_item.id,
                        found_item_id=found.id,
                        similarity_score=score,
                        breakdown_json=breakdown,
                        status="PENDING"
                    )
                    db.add(match)
        else:
            result = await db.execute(select(FoundItem).where(FoundItem.id == item_id))
            found_item = result.scalar_one_or_none()
            if not found_item or found_item.moderation_status != ModerationStatus.APPROVED or found_item.status == ItemStatus.HIDDEN:
                return

            lost_res = await db.execute(
                select(LostItem).where(
                    LostItem.status != ItemStatus.HIDDEN,
                    LostItem.moderation_status == ModerationStatus.APPROVED
                )
            )
            lost_items = lost_res.scalars().all()

            for lost in lost_items:
                score, breakdown = calculate_item_similarity(lost, found_item)
                if score >= 40.0:
                    match = MatchScore(
                        lost_item_id=lost.id,
                        found_item_id=found_item.id,
                        similarity_score=score,
                        breakdown_json=breakdown,
                        status="PENDING"
                    )
                    db.add(match)

        await db.commit()
    except Exception as e:
        logger.error(f"Background matching failed: {e}")
