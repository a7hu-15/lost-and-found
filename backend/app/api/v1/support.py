import logging
from datetime import datetime
from pydantic import BaseModel, EmailStr
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.database.session import get_db
from app.models.audit import AuditLog
from app.notifications.service import send_email

logger = logging.getLogger(__name__)

router = APIRouter()

class SupportMessageCreate(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

@router.post("", status_code=status.HTTP_200_OK)
async def submit_support_message(
    payload: SupportMessageCreate,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    try:
        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        client_ip = request.client.host if request.client else "Unknown"

        text_content = f"""New Support Ticket Received

Name: {payload.name}
Email: {payload.email}
Subject: {payload.subject}
Timestamp: {now_str}
Client IP: {client_ip}

Message:
{payload.message}
"""

        html_content = f"""
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px;">
          <h2 style="color: #09090b; margin-top: 0;">[Support Ticket] {payload.subject}</h2>
          <div style="background: #f4f4f5; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 12px; margin-bottom: 16px;">
            <div><strong>From:</strong> {payload.name} (&lt;{payload.email}&gt;)</div>
            <div><strong>Time:</strong> {now_str}</div>
            <div><strong>IP:</strong> {client_ip}</div>
          </div>
          <div style="font-size: 14px; color: #27272a; line-height: 1.6; whitespace: pre-line;">
            {payload.message}
          </div>
        </div>
        """

        # Dispatch email to SUPPORT_EMAIL
        send_email(
            to_email=settings.SUPPORT_EMAIL,
            subject=f"[Lost & Found Support] {payload.subject}",
            body_text=text_content,
            body_html=html_content
        )

        # Record audit log
        audit = AuditLog(
            action="SUPPORT_TICKET_SUBMITTED",
            resource="support",
            details={"email": payload.email, "subject": payload.subject, "ip": client_ip}
        )
        db.add(audit)
        await db.commit()

        return {"message": "Support ticket submitted successfully."}

    except Exception as e:
        logger.error(f"Support message delivery failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to send your message. Please try again in a few minutes."
        )
