import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import inspect
from app.core.config import settings

logger = logging.getLogger(__name__)

def send_email(to_email: str, subject: str, body_text: str, body_html: str = None):
    """
    Sends email via SMTP if configured, or logs in development console.
    """
    if not to_email:
        return

    # INSTRUMENTATION: Identify exact caller
    try:
        stack = inspect.stack()
        # stack[0] is this function, stack[1] is the caller
        caller_func = stack[1].function
        caller_file = stack[1].filename.split('/')[-1]
    except Exception:
        caller_func = "unknown"
        caller_file = "unknown"

    logger.info(f"========== EMAIL DISPATCH ==========")
    logger.info(f"TYPE: {subject}")
    logger.info(f"CALLER: {caller_file} -> {caller_func}()")
    logger.info(f"TO: {to_email}")
    logger.info(f"BODY:\n{body_text}")
    logger.info(f"=====================================")

    if not settings.SMTP_HOST or not settings.SMTP_USER:
        return

    if settings.MOCK_SMTP:
        logger.info(f"MOCK SMTP ENABLED: Bypassed physical email dispatch to {to_email}")
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

def send_information_submitted_platform_email(report_id: str, item_title: str, location: str, lost_date: str, message: str, sender_info: str):
    subject = f"New Information Submitted — Lost Item [{report_id}]"
    
    text_content = f"""New Information Submitted — Lost Item

Lost Report: {report_id}
Item: {item_title}
Location: {location}
Lost Date: {lost_date}

Message from visitor:
{message}

Submitted by:
{sender_info}

Please log in to the admin dashboard to review this information.
"""

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: sans-serif; background-color: #f4f4f5; margin: 0; padding: 24px; }}
        .container {{ max-width: 560px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 8px; padding: 32px; }}
        .header {{ font-size: 18px; font-weight: bold; margin-bottom: 16px; }}
        .info-box {{ background: #f4f4f5; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 12px; margin-bottom: 16px; }}
        .message-box {{ font-size: 14px; line-height: 1.6; padding: 16px; border-left: 4px solid #2563eb; background: #eff6ff; margin-bottom: 16px; white-space: pre-wrap; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">New Information Submitted</div>
        <div class="info-box">
          <strong>Report:</strong> {report_id}<br/>
          <strong>Item:</strong> {item_title}<br/>
          <strong>Location:</strong> {location}<br/>
          <strong>Lost Date:</strong> {lost_date}
        </div>
        <div class="message-box">{message}</div>
        <div style="font-size: 12px; color: #71717a; margin-bottom: 16px;">
          <strong>Submitted by:</strong> {sender_info}
        </div>
        <p style="font-size: 13px; color: #52525b;">Please review this information in the admin dashboard.</p>
      </div>
    </body>
    </html>
    """

    send_email(settings.SUPPORT_EMAIL, subject, text_content, html_content)


def send_information_approved_owner_email(email: str, message: str, report_id: str):
    tracking_url = f"http://localhost:5173/track"
    subject = f"Someone Submitted Information About Your Lost Item ({report_id})"
    
    text_content = f"""Someone Submitted Information About Your Lost Item

Someone has provided information regarding your lost item report ({report_id}).

Message:
{message}

Please check your report/tracking page for further details:
{tracking_url}

Campus Security & Lost & Found Team
"""

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: sans-serif; background-color: #f4f4f5; margin: 0; padding: 24px; }}
        .container {{ max-width: 560px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 8px; padding: 32px; }}
        .header {{ font-size: 18px; font-weight: bold; margin-bottom: 16px; }}
        .message-box {{ font-size: 14px; line-height: 1.6; padding: 16px; border-left: 4px solid #10b981; background: #ecfdf5; margin-bottom: 16px; white-space: pre-wrap; }}
        .btn {{ background-color: #2563eb; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 600; display: inline-block; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">Information About Your Lost Item</div>
        <p style="font-size: 14px; color: #3f3f46;">Someone has provided information regarding your lost item report <strong>{report_id}</strong>.</p>
        <div class="message-box">{message}</div>
        <div style="margin: 24px 0;">
          <a href="{tracking_url}" class="btn">Track My Report &rarr;</a>
        </div>
      </div>
    </body>
    </html>
    """

    send_email(email, subject, text_content, html_content)
