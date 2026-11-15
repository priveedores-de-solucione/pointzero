import html
import threading

import httpx

from app.core.config import settings


def _send(to: str, subject: str, body: str):
    try:
        httpx.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}"},
            json={"from": settings.EMAIL_FROM, "to": [to], "subject": subject, "html": body},
            timeout=10,
        )
    except Exception:
        pass


def send_email(to: str, subject: str, message: str):
    if not settings.RESEND_API_KEY:
        return
    body = (
        f"<div style='font-family:sans-serif'><h2>{html.escape(subject)}</h2>"
        f"<p>{html.escape(message)}</p><p>- POINTZERO</p></div>"
    )
    threading.Thread(target=_send, args=(to, subject, body), daemon=True).start()