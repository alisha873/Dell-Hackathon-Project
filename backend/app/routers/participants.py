import io
from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import rapidfuzz

from participant_ai.pipelines.resume_rag.parser import parse_and_vectorize_batch
from ..database import execute, fetch_all, fetch_one

router = APIRouter()

class ResumeAnalysisRequest(BaseModel):
    resume_text: str

class ResumeAnalysisResponse(BaseModel):
    parsed_resume: dict
    skill_vector: dict
    semantic_embedding: List[float]
    breakdown: dict

@router.post("/analyze_resume", response_model=ResumeAnalysisResponse)
async def analyze_resume(request: ResumeAnalysisRequest):
    """
    Parses resume text directly.
    """
    results = await parse_and_vectorize_batch([request.resume_text], max_concurrency=1)
    parsed, vector, embedding, breakdown = results[0]
    
    return ResumeAnalysisResponse(
        parsed_resume=parsed.dict(),
        skill_vector=vector.to_dict(),
        semantic_embedding=embedding,
        breakdown=breakdown
    )

@router.post("/upload_resume", response_model=ResumeAnalysisResponse)
async def upload_resume(file: UploadFile = File(...)):
    """
    Accepts a PDF file, extracts text via pypdf, and runs the AI analysis.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
    try:
        import pypdf
        content = await file.read()
        pdf_reader = pypdf.PdfReader(io.BytesIO(content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse PDF: {str(e)}")
        
    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract any text from the PDF")
        
    results = await parse_and_vectorize_batch([text], max_concurrency=1)
    parsed, vector, embedding, breakdown = results[0]
    
    return ResumeAnalysisResponse(
        parsed_resume=parsed.dict(),
        skill_vector=vector.to_dict(),
        semantic_embedding=embedding,
        breakdown=breakdown
    )

class RegistrationPayload(BaseModel):
    hackathon_id: str
    user_id: Optional[str] = None
    name: str
    email: str
    college: str
    github: str
    skills: List[str] = []

@router.post("/register")
async def submit_registration(payload: RegistrationPayload):
    """
    Handles deterministic registration scoring (Duplicate Detection)
    and saves the registration.
    """
    # 1. Fetch existing registrations to check duplicates
    existing = fetch_all(
        "SELECT id, name, email, college, github FROM registrations WHERE hackathon_id = %s",
        (payload.hackathon_id,)
    )

    exact_email = False
    exact_github = False
    max_fuzzy_score = 0.0
    matched_profile = None

    for r in existing:
        if r['email'].lower() == payload.email.lower():
            exact_email = True
            matched_profile = r['id']
        if r['github'].lower() == payload.github.lower():
            exact_github = True
            matched_profile = r['id']

        # Fuzzy string matching using RapidFuzz
        name_sim = rapidfuzz.fuzz.token_sort_ratio(payload.name.lower(), r['name'].lower()) / 100.0
        college_sim = rapidfuzz.fuzz.token_sort_ratio(payload.college.lower(), r['college'].lower()) / 100.0

        # PRD specifies: Name (0.60) + College (0.40)
        combined_score = (name_sim * 0.6) + (college_sim * 0.4)
        if combined_score > max_fuzzy_score:
            max_fuzzy_score = combined_score
            if not exact_email and not exact_github:
                matched_profile = r['id']

    # 2. Determine Decision Thresholds
    if exact_email or exact_github:
        final_score = 1.0
        decision = 'HARD_DUPLICATE'
    else:
        final_score = max_fuzzy_score
        if final_score < 0.70:
            decision = 'AUTO_APPROVED'
        elif 0.70 <= final_score < 0.85:
            decision = 'MANUAL_REVIEW'
        else:
            decision = 'POTENTIAL_DUPLICATE'

    # 3. Save Registration
    reg_id = execute(
        """
        INSERT INTO registrations (
            hackathon_id, user_id, name, email, college, github, skills,
            decision, score, exact_email, exact_github, matched_profile
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id
        """,
        (
            payload.hackathon_id, payload.user_id, payload.name, payload.email, 
            payload.college, payload.github, payload.skills,
            decision, final_score, exact_email, exact_github, matched_profile
        )
    )

    # 4. If Auto-Approved, create the actual participant profile
    if decision == 'AUTO_APPROVED':
        execute(
            """
            INSERT INTO participants (hackathon_id, user_id, registration_id, name, email, college_name, github_url, declared_skills, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'approved')
            """,
            (payload.hackathon_id, payload.user_id, reg_id['id'], payload.name, payload.email, payload.college, payload.github, payload.skills)
        )

    return {
        "status": "success",
        "registration_id": reg_id['id'],
        "decision": decision,
        "score": final_score
    }

@router.post("/{registration_id}/approve")
async def approve_registration(registration_id: str):
    """
    Admin endpoint to manually approve a registration that was flagged for review.
    """
    reg = fetch_one("SELECT * FROM registrations WHERE id = %s", (registration_id,))
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")

    if reg['decision'] == 'AUTO_APPROVED':
        return {"status": "already_approved"}

    execute("UPDATE registrations SET decision = 'AUTO_APPROVED' WHERE id = %s", (registration_id,))

    # Explicitly create participant
    execute(
        """
        INSERT INTO participants (hackathon_id, user_id, registration_id, name, email, college_name, github_url, declared_skills, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'approved')
        """,
        (reg['hackathon_id'], reg['user_id'], reg['id'], reg['name'], reg['email'], reg['college'], reg['github'], reg['skills'])
    )

    return {"status": "approved", "participant_created": True}

@router.post("/{registration_id}/reject")
async def reject_registration(registration_id: str):
    """
    Admin endpoint to manually reject a registration.
    """
    reg = fetch_one("SELECT * FROM registrations WHERE id = %s", (registration_id,))
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")

    if reg['decision'] == 'REJECTED':
        return {"status": "already_rejected"}

    execute("UPDATE registrations SET decision = 'REJECTED' WHERE id = %s", (registration_id,))

    # Ideally also handle deleting from participants if it was somehow approved then rejected, but keeping it simple for demo.

    return {"status": "rejected"}
