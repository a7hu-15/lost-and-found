import enum
import uuid
from datetime import datetime
from sqlalchemy import String, Float, DateTime, Enum, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

class MatchStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    REJECTED = "REJECTED"

class MatchScore(Base):
    __tablename__ = "matches"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    lost_item_id: Mapped[str] = mapped_column(String(36), ForeignKey("lost_items.id", ondelete="CASCADE"), nullable=False)
    found_item_id: Mapped[str] = mapped_column(String(36), ForeignKey("found_items.id", ondelete="CASCADE"), nullable=False)
    
    similarity_score: Mapped[float] = mapped_column(Float, nullable=False)  # 0.0 to 100.0
    breakdown_json: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    status: Mapped[MatchStatus] = mapped_column(Enum(MatchStatus), default=MatchStatus.PENDING, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    lost_item = relationship("LostItem", back_populates="matches")
    found_item = relationship("FoundItem", back_populates="matches")
