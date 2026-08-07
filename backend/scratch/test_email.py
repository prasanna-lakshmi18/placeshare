import asyncio
import sys
import os

# Add the parent directory to sys.path so we can import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.utils.email import send_email
from app.config import get_settings

async def main():
    settings = get_settings()
    
    print("--- PlaceShare SMTP Tester ---")
    print(f"SMTP Host: {settings.SMTP_HOST}")
    print(f"SMTP Port: {settings.SMTP_PORT}")
    print(f"SMTP User: {settings.SMTP_USER}")
    print(f"Mail From: {settings.MAIL_FROM}")
    
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print("\n[!] ERROR: SMTP_USER or SMTP_PASSWORD not set in .env or environment.")
        print("Please configure these settings before running this test.")
        return

    recipient = input("\nEnter recipient email address: ")
    subject = "PlaceShare SMTP Test Email"
    body_text = "This is a test email from your PlaceShare development environment."
    body_html = "<h1>PlaceShare Test</h1><p>This is a <b>test email</b> from your PlaceShare development environment.</p>"

    print(f"\nSending test email to {recipient}...")
    await send_email(recipient, subject, body_text, body_html)
    print("\nCheck the console output above. If there were no errors, the email should be in your inbox shortly.")

if __name__ == "__main__":
    asyncio.run(main())
