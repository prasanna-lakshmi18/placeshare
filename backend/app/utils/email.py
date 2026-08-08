import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

async def send_email(to_email: str, subject: str, body_text: str, body_html: str = None):
    """
    Sends an email using SMTP. Falls back to logging if SMTP is not configured.
    """
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.warning("SMTP credentials not configured. Skipping email dispatch.")
        if settings.DEBUG:
            logger.debug("Development Mock Email - TO: %s | SUBJECT: %s", to_email, subject)
        return

    try:
        from_addr = settings.MAIL_FROM or settings.SMTP_USER
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = from_addr
        message["To"] = to_email

        # Create text and HTML versions of your message
        part1 = MIMEText(body_text, "plain")
        message.attach(part1)

        if body_html:
            part2 = MIMEText(body_html, "html")
            message.attach(part2)

        smtp_user = (settings.SMTP_USER or "").strip()
        smtp_pass = (settings.SMTP_PASSWORD or "").replace(" ", "").strip()

        # Connect via SSL if port 465, otherwise STARTTLS
        if settings.SMTP_PORT == 465:
            with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as server:
                server.login(smtp_user, smtp_pass)
                server.sendmail(from_addr, to_email, message.as_string())
        else:
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as server:
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.sendmail(from_addr, to_email, message.as_string())
        
        logger.info("Email '%s' sent successfully to %s", subject, to_email)
    except Exception as e:
        logger.error("Failed to send email to %s via SMTP: %s", to_email, e)

async def send_verification_email(to_email: str, token: str):
    subject = "Verify your PlaceShare account"
    frontend_base = settings.FRONTEND_URL.rstrip('/')
    verify_url = f"{frontend_base}/verify-email?token={token}"
    
    body_text = f"Welcome to PlaceShare!\n\nPlease click the link below to verify your account:\n\n{verify_url}\n\nThis link expires in 24 hours."
    
    body_html = f"""
    <html>
      <body style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #6366f1;">Welcome to PlaceShare!</h2>
          <p>We're excited to have you on board. Please verify your email address to get full access to the platform.</p>
          <a href="{verify_url}" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
          <p>If the button above doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">{verify_url}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999;">This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
        </div>
      </body>
    </html>
    """
    await send_email(to_email, subject, body_text, body_html)

async def send_password_reset_email(to_email: str, token: str):
    subject = "Reset your PlaceShare password"
    frontend_base = settings.FRONTEND_URL.rstrip('/')
    reset_url = f"{frontend_base}/reset-password?token={token}"
    
    body_text = f"Reset your password\n\nPlease click the link below to reset your password:\n\n{reset_url}\n\nThis link expires in 1 hour."
    
    body_html = f"""
    <html>
      <body style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #6366f1;">Reset Your Password</h2>
          <p>We received a request to reset your password. Click the button below to choose a new one:</p>
          <a href="{reset_url}" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          <p>If the button above doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">{reset_url}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999;">This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
      </body>
    </html>
    """
    await send_email(to_email, subject, body_text, body_html)
