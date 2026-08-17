from pydantic import BaseModel, EmailStr
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.database.session import get_db
from app.models.lost_item import LostItem
from app.models.found_item import FoundItem
from app.models.match import MatchScore
from app.notifications.service import send_email

router = APIRouter()

class RecoveryRequest(BaseModel):
    email: EmailStr

@router.get("/{report_id}")
async def get_report_status(
    report_id: str,
    token: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    if len(report_id.strip()) > 50:
        raise HTTPException(status_code=400, detail="Invalid Report ID format.")
    if token and len(token.strip()) > 100:
        raise HTTPException(status_code=400, detail="Invalid Access Token format.")

    # Check LostItems first
    lost_res = await db.execute(select(LostItem).where(LostItem.report_id == report_id))
    lost_item = lost_res.scalar_one_or_none()

    if lost_item:
        if token and lost_item.access_token != token:
            raise HTTPException(status_code=400, detail="Invalid Report ID or Access Token.")

        matches_res = await db.execute(
            select(MatchScore)
            .options(selectinload(MatchScore.found_item))
            .where(
                MatchScore.lost_item_id == lost_item.id,
                MatchScore.similarity_score >= settings.MATCH_THRESHOLD
            )
            .order_by(MatchScore.similarity_score.desc())
        )
        all_matches = matches_res.scalars().all()

        # Deduplicate matches by found_item_id
        seen_found_ids = set()
        unique_matches = []
        for m in all_matches:
            if m.found_item_id and m.found_item_id not in seen_found_ids:
                seen_found_ids.add(m.found_item_id)
                unique_matches.append(m)

        return {
            "type": "lost",
            "report": lost_item,
            "matches": unique_matches
        }

    # Check FoundItems
    found_res = await db.execute(select(FoundItem).where(FoundItem.report_id == report_id))
    found_item = found_res.scalar_one_or_none()

    if found_item:
        if token and found_item.access_token != token:
            raise HTTPException(status_code=400, detail="Invalid Report ID or Access Token.")

        return {
            "type": "found",
            "report": found_item,
            "matches": []
        }

    raise HTTPException(status_code=404, detail="Invalid Report ID or Access Token.")


@router.post("/recover")
async def recover_reports(
    req: RecoveryRequest,
    db: AsyncSession = Depends(get_db)
):
    email = req.email.lower().strip()

    # Search lost items
    lost_res = await db.execute(select(LostItem).where(LostItem.email == email))
    lost_items = lost_res.scalars().all()

    # Search found items
    found_res = await db.execute(select(FoundItem).where(FoundItem.email == email))
    found_items = found_res.scalars().all()

    if lost_items or found_items:
        subject = "Lost & Found • Your Report Recovery Links"
        
        items_list_html = ""
        items_list_text = ""

        for item in lost_items:
            tracking_url = f"http://localhost:5173/track?report_id={item.report_id}&token={item.access_token}"
            items_list_text += f"- Lost Item: {item.item_name} (ID: {item.report_id})\n  Link: {tracking_url}\n\n"
            items_list_html += f"""
            <div style="background:#f4f4f5; padding:12px; border-radius:6px; margin-bottom:10px; font-family:monospace;">
              <div><strong>[Lost] {item.item_name}</strong></div>
              <div style="font-size:12px; color:#71717a;">ID: {item.report_id} | Status: {item.status}</div>
              <a href="{tracking_url}" style="color:#2563eb; font-size:12px; font-weight:bold;">Track Status &rarr;</a>
            </div>
            """

        for item in found_items:
            tracking_url = f"http://localhost:5173/track?report_id={item.report_id}&token={item.access_token}"
            items_list_text += f"- Found Item: {item.item_name} (ID: {item.report_id})\n  Link: {tracking_url}\n\n"
            items_list_html += f"""
            <div style="background:#f4f4f5; padding:12px; border-radius:6px; margin-bottom:10px; font-family:monospace;">
              <div><strong>[Found] {item.item_name}</strong></div>
              <div style="font-size:12px; color:#71717a;">ID: {item.report_id} | Status: {item.status}</div>
              <a href="{tracking_url}" style="color:#2563eb; font-size:12px; font-weight:bold;">Track Status &rarr;</a>
            </div>
            """

        text_content = f"Hello,\n\nHere are all active reports associated with your email:\n\n{items_list_text}\nCampus Security Team"
        html_content = f"""
        <div style="font-family:sans-serif; max-width:540px; margin:0 auto; padding:20px; border:1px solid #e4e4e7; border-radius:8px;">
          <h2>Your Active Report Links</h2>
          <p style="color:#71717a; font-size:13px;">Below are all reports associated with <strong>{email}</strong>:</p>
          {items_list_html}
          <hr style="border:0; border-top:1px solid #e4e4e7; margin:20px 0;" />
          <p style="font-size:11px; color:#a1a1aa;">SRM Campus Security &amp; Lost &amp; Found Team</p>
        </div>
        """

        send_email(email, subject, text_content, html_content)

    # Always return success message for email privacy
    return {
        "message": "If an active report exists for this email, we have sent a recovery email with your tracking links."
    }
