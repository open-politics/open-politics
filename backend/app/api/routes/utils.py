from fastapi import APIRouter, Depends, UploadFile, File
from pydantic.networks import EmailStr
import fitz
from io import BytesIO

from app.api.deps import get_current_active_superuser
from app.models import Message
from app.utils import generate_test_email, send_email

router = APIRouter(prefix="/utils", tags=["Utilities"])


@router.post(
    "/test-email/",
    dependencies=[Depends(get_current_active_superuser)],
    status_code=201,
)
def test_email(email_to: EmailStr) -> Message:
    """
    Test emails.
    """
    email_data = generate_test_email(email_to=email_to)
    send_email(
        email_to=email_to,
        subject=email_data.subject,
        html_content=email_data.html_content,
    )
    return Message(message="Test email sent")


@router.get('/healthz')
def healthz():
    return {"status": "ok"}, 200

@router.get('/healthz/readiness')
def readyz():
    return {"status": "ok"}, 200

@router.get('/healthz/liveness')
def liveness():
    return {"status": "ok"}, 200

@router.post("/extract-pdf-text")
async def extract_pdf_text(
    file: UploadFile = File(...),
):
    """Extract text from PDF without authentication"""
    if not file.filename.lower().endswith(".pdf"):
        return {"error": "Only PDF files are supported"}
    
    try:
        contents = await file.read()
        text = ""
        with fitz.open(stream=contents, filetype="pdf") as doc:
            for page in doc:
                text += page.get_text() + "\n"
        return {"text": text}
    except Exception as e:
        return {"error": f"PDF processing failed: {str(e)}"}

