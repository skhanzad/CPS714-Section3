from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import os
import httpx

postmark_router = APIRouter()


class PostmarkEmail(BaseModel):
    # Keep types simple for beginners: title, body, recipients as list of strings
    title: str
    body: str = ""
    recipients: List[str]


@postmark_router.post("/data/send_postmark")
async def send_postmark_email(payload: PostmarkEmail):
    """Postmark email sender.

    This function accepts a JSON payload with title, body,
    and recipients.
    """

    # read token and sender from environment variables
    # (main.py loads .env when you run locally)
    token = os.getenv("POSTMARK_SERVER_TOKEN")
    sender = os.getenv("POSTMARK_SENDER")

    # if config is missing, tell the caller
    if not token or not sender:
        raise HTTPException(status_code=500, detail="Postmark not configured on server")

    # build the 'To' field by joining list of addresses with commas
    to_field = ",".join(payload.recipients)

    # keep line breaks for the html styling
    body_html = (payload.body or "").replace("\n", "<br/>")

    # we use a dark background and a little gold accent to match the app.
    html = f"""
            <html><body style="margin:0;background:#0f1724;color:#e6e7ea;font-family:Arial,sans-serif;">
            <div style="max-width:600px;margin:24px auto;padding:18px;background:#0b1220;border-radius:8px;border:1px solid rgba(255,255,255,0.03);">
                <div style="height:6px;background:linear-gradient(90deg,#d4af37,#c5972b);border-radius:4px;margin-bottom:12px;"></div>
                <h2 style="margin:0 0 8px 0;color:#f8f9fb;font-size:18px;">{payload.title}</h2>
                <div style="color:#cbd5e1;line-height:1.5;font-size:14px;">{body_html}</div>
                <div style="margin-top:16px;font-size:12px;color:#9aa3b2;">Sent by Gym Dashboard</div>
            </div>
            </body></html>
            """

    text = payload.title + "\n\n" + (payload.body or "")

    data = {
        "From": sender,
        "To": to_field,
        "Subject": payload.title,
        "HtmlBody": html,
        "TextBody": text,
    }

    # send the request to Postmark
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                "https://api.postmarkapp.com/email",
                json=data,
                headers={"X-Postmark-Server-Token": token},
            )
    except Exception as err:
        # if the network call fails, return a 502 so frontend knows
        raise HTTPException(status_code=502, detail="Network error sending to Postmark: " + str(err))

    # Postmark returns a code >=400 when something is wrong.
    # return that info to help debugging in development.
    if resp.status_code >= 400:
        raise HTTPException(status_code=502, detail=f"Postmark error: {resp.status_code} {resp.text}")

    # on success try to return json body from Postmark, otherwise just code
    try:
        return {"status": "sent", "postmark": resp.json()}
    except Exception:
        return {"status": "sent", "status_code": resp.status_code}

