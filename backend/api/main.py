import os
import traceback
from dotenv import load_dotenv

# Explicitly load .env from the project root directory
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
ENV_PATH = os.path.join(ROOT_DIR, ".env")
load_dotenv(ENV_PATH)

from fastapi import FastAPI, HTTPException
from backend.dataset.loader import load_cases
from backend.diagnosis.service import DiagnosisService
from backend.llm.service import GeminiDiagnosisService
from backend.llm.models import AIDiagnosis
from backend.review.service import submit_ai_diagnosis_review
from backend.review.models import HumanReview
from backend.api.models import DiagnoseRequest, DiagnoseResponse, ReviewRequest

app = FastAPI(title="NetSage AI Orchestration API", version="1.0.0")

CSV_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "data", "cases.csv")
)
if not os.path.exists(CSV_PATH):
    CSV_PATH = os.path.abspath(os.path.join("backend", "data", "cases.csv"))


@app.get("/health")
def health_check():
    """Simple API health check endpoint."""
    return {"status": "ok"}

@app.post("/diagnose", response_model=DiagnoseResponse)
def diagnose_case(request: DiagnoseRequest):
    """
    Triggers network diagnosis for a given case ID by fetching the case,
    generating the diagnostic prompt, calling Gemini, and returning the parsed AI diagnosis.
    """
    # 1. Fetch case from CSV using the Dataset Loader
    try:
        cases = load_cases(CSV_PATH)
    except Exception:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Unexpected backend error occurred.")

    # Normalize lookup case-insensitively and strip whitespace to prevent mismatch
    req_id = request.case_id.strip().upper()
    case = next((c for c in cases if c.case_id.strip().upper() == req_id), None)
    if not case:
        raise HTTPException(status_code=404, detail="Requested case does not exist.")


    # 2. Build diagnosis context using the DiagnosisService
    try:
        diagnosis_service = DiagnosisService()
        context = diagnosis_service.prepare_diagnosis_context(case)
    except Exception:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Unexpected backend error occurred.")

    # 3. Call live/mocked Gemini via the GeminiDiagnosisService
    try:
        llm_service = GeminiDiagnosisService()
        ai_diagnosis = llm_service.diagnose(context)
    except Exception:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Unexpected backend error occurred.")

    # 4. Return structured response (guaranteed to not leak secrets/answers)
    return DiagnoseResponse(case_id=request.case_id, diagnosis=ai_diagnosis)

@app.post("/review", response_model=HumanReview)
def submit_review(request: ReviewRequest):
    """
    Accepts human verification (ACCEPTED, EDITED, or REJECTED) on the AI diagnosis,
    runs validations, and logs the outcome to responsible_ai_log.json.
    """
    # 1. Pack ai_root_cause and ai_confidence into an AIDiagnosis instance (expected by review service)
    try:
        ai_diagnosis = AIDiagnosis(
            root_cause=request.ai_root_cause,
            confidence=request.ai_confidence,
            evidence=[],
            next_command="",
            fix_steps=[],
            osi_layer="",
            concept=""
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid AI diagnosis confidence boundary: {str(e)}")

    # 2. Check for optional test log path from environmental variables
    log_path = os.environ.get("RESPONSIBLE_AI_LOG_PATH")

    # 3. Call submit_ai_diagnosis_review to perform validations and logging
    try:
        review_record = submit_ai_diagnosis_review(
            case_id=request.case_id,
            ai_diagnosis=ai_diagnosis,
            reviewer=request.reviewer,
            decision=request.decision,
            human_correction=request.human_correction,
            correction_reason=request.correction_reason,
            filepath=log_path
        )
        return review_record
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Unexpected backend error occurred.")
