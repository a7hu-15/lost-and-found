from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime
from app.models.match import MatchStatus
from app.schemas.lost_item import LostItemOut
from app.schemas.found_item import FoundItemOut

class MatchScoreOut(BaseModel):
    id: str
    lost_item_id: str
    found_item_id: str
    similarity_score: float
    breakdown_json: Dict[str, Any]
    status: MatchStatus
    created_at: datetime
    lost_item: Optional[LostItemOut] = None
    found_item: Optional[FoundItemOut] = None

    class Config:
        from_attributes = True
