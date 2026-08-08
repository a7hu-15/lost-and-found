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
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 24px; }}
        .container {{ max-width: 560px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 8px; padding: 32px; }}
        .header {{ font-size: 18px; font-weight: 700; color: #09090b; margin-bottom: 4px; }}
        .subtitle {{ font-size: 13px; color: #71717a; margin-bottom: 24px; }}
        .badge-box {{ background-color: #09090b; color: #ffffff; padding: 16px 20px; border-radius: 6px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; margin-bottom: 24px; }}
        .badge-label {{ font-size: 10px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.5px; }}
        .badge-id {{ font-size: 20px; font-weight: 700; color: #ffffff; margin-top: 2px; }}
        .badge-detail {{ font-size: 12px; color: #d4d4d8; margin-top: 6px; font-family: sans-serif; }}
        .btn {{ background-color: #2563eb; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 600; display: inline-block; }}
        .footer {{ font-size: 12px; color: #a1a1aa; border-top: 1px solid #e4e4e7; pt: 20px; margin-top: 28px; line-height: 1.5; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">Lost &amp; Found Report Created</div>
        <div class="subtitle">Your item report has been logged to the campus database.</div>

        <div class="badge-box">
          <div class="badge-label">Unique Report ID</div>
          <div class="badge-id">{report_id}</div>
          <div class="badge-detail">Item: {item_title} &bull; Status: Searching</div>
        </div>

        <div style="margin-bottom: 24px;">
          <a href="{tracking_url}" class="btn">Track My Report &rarr;</a>
        </div>

        <div class="footer">
          Please keep this email receipt. If you ever forget your Report ID, simply search your inbox for <strong>Lost &amp; Found</strong> or <strong>{report_id[:9]}</strong> to recover your status link.
        </div>
      </div>
    </body>
    </html>
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

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; margin: 0; padding: 24px; }}
        .container {{ max-width: 560px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 8px; padding: 32px; }}
        .header {{ font-size: 18px; font-weight: 700; color: #09090b; margin-bottom: 4px; }}
        .score-box {{ background-color: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; padding: 16px; border-radius: 6px; margin: 20px 0; font-family: monospace; }}
        .btn {{ background-color: #2563eb; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 600; display: inline-block; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">Possible Match Found ({match_score:.0f}%)</div>
        <div style="font-size: 13px; color: #71717a;">Our rule engine matched your report {report_id} with a turned-in item.</div>

        <div class="score-box">
          <div style="font-size: 11px; text-transform: uppercase;">Similarity Confidence Score</div>
          <div style="font-size: 22px; font-weight: bold;">{match_score:.0f}% Match</div>
          <div style="font-size: 13px; margin-top: 4px;">Matched Item: {matched_title}</div>
        </div>

        <a href="{tracking_url}" class="btn">Review Match Details &rarr;</a>
      </div>
    </body>
    </html>
    """

    send_email(email, subject, text_content, html_content)


def send_claim_approved_email(email: str, report_id: str, storage_location: str):
    subject = f"Item Ready for Collection ({report_id}) • Campus Security"
    
    text_content = f"""Your Claim Has Been Approved!

Your ownership verification for report {report_id} has been approved by Security Staff.

Please collect your physical item from:
{storage_location}

IMPORTANT: Please bring your valid Student ID card when collecting your item.

Campus Security Office
"""

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; margin: 0; padding: 24px; }}
        .container {{ max-width: 560px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 8px; padding: 32px; }}
        .header {{ font-size: 18px; font-weight: 700; color: #09090b; margin-bottom: 4px; }}
        .success-box {{ background-color: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; padding: 16px; border-radius: 6px; margin: 20px 0; font-family: monospace; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">Item Ready for Pickup</div>
        <div style="font-size: 13px; color: #71717a;">Your ownership verification for report {report_id} was approved by Security Staff.</div>

        <div class="success-box">
          <div style="font-size: 11px; text-transform: uppercase;">Holding Storage Location</div>
          <div style="font-size: 16px; font-weight: bold; margin-top: 2px;">{storage_location}</div>
          <div style="font-size: 12px; margin-top: 8px; font-family: sans-serif;">Please bring your valid Student ID card when collecting your item.</div>
        </div>
      </div>
    </body>
    </html>
    """

    send_email(email, subject, text_content, html_content)


def send_staff_invitation_email(email: str, full_name: str, invite_token: str):
    invite_url = f"http://localhost:5173/admin/accept-invite?token={invite_token}"
    subject = "Campus Security Staff Access Invitation"

    text_content = f"""Hello {full_name},

You have been invited by the Platform Owner to join the Campus Lost & Found Administrative Staff.

Complete your account setup and create your password here:
{invite_url}

NOTE: This invitation link is single-use and expires in 3 days.

Campus Administration Team
"""

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; margin: 0; padding: 24px; }}
        .container {{ max-width: 560px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 8px; padding: 32px; }}
        .header {{ font-size: 18px; font-weight: 700; color: #09090b; margin-bottom: 4px; }}
        .btn {{ background-color: #ff7a00; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 600; display: inline-block; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">Administrative Staff Invitation</div>
        <p style="font-size: 13px; color: #71717a;">Hello {full_name}, you have been invited to join the staff console.</p>
        <div style="margin: 24px 0;">
          <a href="{invite_url}" class="btn">Set Up Password &amp; Activate Staff Account &rarr;</a>
        </div>
        <p style="font-size: 11px; color: #a1a1aa;">This single-use link expires in 3 days. Never share this link.</p>
      </div>
    </body>
    </html>
    """

    send_email(email, subject, text_content, html_content)


def send_password_reset_email(email: str, reset_token: str):
    reset_url = f"http://localhost:5173/admin/reset-password?token={reset_token}"
    subject = "Password Reset Request • Campus Lost & Found Console"

    text_content = f"""Hello,

We received a request to reset the password for your account ({email}).

Reset your password using this secure single-use link:
{reset_url}

If you did not request a password reset, please ignore this email or contact the Platform Owner. This link expires in 2 hours.

Campus Administration Security
"""

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; margin: 0; padding: 24px; }}
        .container {{ max-width: 560px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 8px; padding: 32px; }}
        .header {{ font-size: 18px; font-weight: 700; color: #09090b; margin-bottom: 4px; }}
        .btn {{ background-color: #2563eb; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 600; display: inline-block; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">Password Reset Request</div>
        <p style="font-size: 13px; color: #71717a;">A password reset was requested for <strong>{email}</strong>.</p>
        <div style="margin: 24px 0;">
          <a href="{reset_url}" class="btn">Reset Password Now &rarr;</a>
        </div>
        <p style="font-size: 11px; color: #a1a1aa;">This single-use link expires in 2 hours. If you did not make this request, your account remains secure.</p>
      </div>
    </body>
    </html>
    """

    send_email(email, subject, text_content, html_content)
