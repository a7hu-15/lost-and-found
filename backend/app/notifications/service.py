import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

logger = logging.getLogger(__name__)

def send_email(to_email: str, subject: str, body_text: str, body_html: str = None):
    """
    Sends email via SMTP if configured, or logs in development console.
    """
    if not to_email:
        return

    logger.info(f"========== EMAIL DISPATCH ==========")
    logger.info(f"TO: {to_email}")
    logger.info(f"SUBJECT: {subject}")
    logger.info(f"BODY:\n{body_text}")
    logger.info(f"=====================================")

    if not settings.SMTP_HOST or not settings.SMTP_USER:
        return

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.SMTP_FROM
        msg["To"] = to_email

        msg.attach(MIMEText(body_text, "plain"))
        if body_html:
            msg.attach(MIMEText(body_html, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            if settings.SMTP_TLS:
                server.starttls()
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_FROM, [to_email], msg.as_string())
        logger.info(f"Email sent successfully to {to_email}")
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")


def send_report_confirmation_email(email: str, report_id: str, access_token: str, item_title: str):
    tracking_url = f"http://localhost:5173/track?report_id={report_id}&token={access_token}"
    
    subject = f"Lost & Found • Your Report Has Been Created ({report_id})"
    
    text_content = f"""Hello,

Your report has been successfully created on the Campus Lost & Found Platform.

----------------------------------------
Report ID: {report_id}
Item Title: {item_title}
Status: Searching
----------------------------------------

Track Your Report Online:
{tracking_url}

----------------------------------------
Please keep this email for your records.
If you forget your Report ID, simply search your inbox for "Lost & Found" or "{report_id[:8]}" to recover it.

Thank you,
SRM Campus Security & Lost & Found Team
"""

    html_content = f"""
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e4e4e7; rounded: 8px;">
      <h2 style="color: #09090b; margin-top: 0;">Lost &amp; Found Report Created</h2>
      <p style="color: #71717a; font-size: 14px;">Your report has been successfully saved to the campus database.</p>

      <div style="background-color: #f4f4f5; padding: 16px; border-radius: 6px; margin: 20px 0; font-family: monospace;">
        <div style="font-size: 11px; color: #71717a; text-transform: uppercase;">Report ID</div>
        <div style="font-size: 18px; font-weight: bold; color: #09090b; letter-spacing: 1px;">{report_id}</div>
        <div style="font-size: 13px; color: #3f3f46; margin-top: 6px;">Item: {item_title}</div>
      </div>

      <div style="margin: 24px 0;">
        <a href="{tracking_url}" style="background-color: #18181b; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500; display: inline-block;">
          Track Report Status &rarr;
        </a>
      </div>

      <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
      <p style="color: #a1a1aa; font-size: 12px; line-height: 1.5;">
        Please save this email. If you forget your Report ID, search your inbox for <strong>Lost &amp; Found</strong> or <strong>{report_id[:8]}</strong> to recover it anytime.
      </p>
    </div>
    """

    send_email(email, subject, text_content, html_content)


def send_match_alert_email(email: str, report_id: str, access_token: str, match_score: float, matched_title: str):
    tracking_url = f"http://localhost:5173/track?report_id={report_id}&token={access_token}"
    subject = f"Possible Match Found ({match_score:.0f}%) • Lost & Found"
    
    text_content = f"""Possible Match Found!

Our matching engine found a potential match for your report {report_id}.

Matched Item: {matched_title}
Match Score: {match_score:.0f}%

Review & Track Match Here:
{tracking_url}

Campus Security & Lost & Found Team
"""

    send_email(email, subject, text_content)


def send_claim_approved_email(email: str, report_id: str, storage_location: str):
    subject = f"Item Ready for Collection ({report_id}) • Campus Security"
    
    text_content = f"""Your Claim Has Been Approved!

Your ownership verification for report {report_id} has been approved by Security Staff.

Please collect your physical item from:
{storage_location}

IMPORTANT: Please bring your valid Student ID card when collecting your item.

Campus Security Office
"""

    send_email(email, subject, text_content)
