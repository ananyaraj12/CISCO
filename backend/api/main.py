import os
import traceback
from dotenv import load_dotenv

# Explicitly load .env from the project root directory
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
ENV_PATH = os.path.join(ROOT_DIR, ".env")
load_dotenv(ENV_PATH)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from backend.dataset.loader import load_cases
from backend.diagnosis.service import DiagnosisService
from backend.llm.service import GeminiDiagnosisService
from backend.llm.models import AIDiagnosis
from backend.review.service import submit_ai_diagnosis_review, load_reviews, DEFAULT_LOG_PATH
from backend.review.models import HumanReview, DecisionEnum
from backend.api.models import DiagnoseRequest, DiagnoseResponse, ReviewRequest, CaseResponse

app = FastAPI(title="NetSage AI Orchestration API", version="1.0.0")

# Configure CORS for the frontend origin
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


@app.get("/cases", response_model=List[CaseResponse])
def get_all_cases():
    """Returns a list of all network troubleshooting cases, excluding ground-truth secrets."""
    try:
        cases = load_cases(CSV_PATH)
        return [
            CaseResponse(
                case_id=c.case_id,
                title=c.title,
                symptom=c.symptome,
                topology=c.topology,
                osi_layer=c.osi_layer,
                concept=c.concept,
                severity=c.severity
            )
            for c in cases
        ]
    except Exception:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Unexpected backend error occurred.")


@app.get("/cases/{case_id}", response_model=CaseResponse)
def get_case_by_id(case_id: str):
    """Returns details for a single network case, excluding ground-truth secrets."""
    try:
        cases = load_cases(CSV_PATH)
        req_id = case_id.strip().upper()
        c = next((item for item in cases if item.case_id.strip().upper() == req_id), None)
        if not c:
            raise HTTPException(status_code=404, detail="Requested case does not exist.")
        return CaseResponse(
            case_id=c.case_id,
            title=c.title,
            symptom=c.symptome,
            topology=c.topology,
            osi_layer=c.osi_layer,
            concept=c.concept,
            severity=c.severity
        )
    except HTTPException:
        raise
    except Exception:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Unexpected backend error occurred.")


@app.get("/cases/{case_id}/evidence")
def get_case_evidence(case_id: str):
    """Returns simulated configuration evidence for the case."""
    try:
        cases = load_cases(CSV_PATH)
        req_id = case_id.strip().upper()
        c = next((item for item in cases if item.case_id.strip().upper() == req_id), None)
        if not c:
            raise HTTPException(status_code=404, detail="Requested case does not exist.")
        
        evidence_text = (
            f"NetSage System Log - Network State Capture for Case {c.case_id}\n"
            f"=================================================================\n"
            f"Device Topology: {c.topology}\n"
            f"Reported Symptom: {c.symptome}\n"
            f"OSI Layer: {c.osi_layer}\n"
            f"Associated Concept: {c.concept}\n"
            f"Severity: {c.severity}\n\n"
            f"Packet Tracer Evidence Summary:\n"
            f"-------------------------------\n"
            f"Structured CLI check logs indicate potential discrepancies in the operational state.\n"
            f"Please run AI Diagnosis to trigger the deep LLM analysis using rule checking verifications."
        )
        
        topology_map = (
            f"Logical Network Connection Graph:\n"
            f"---------------------------------\n"
            f"Path: {c.topology}\n\n"
            f"Interfaces status check:\n"
            f"  - Active monitoring detected connectivity breakdown aligned with: '{c.symptome}'"
        )

        return {
            "files": {
                "evidence_info.txt": evidence_text,
                "topology_map.txt": topology_map
            },
            "evidence_text": evidence_text
        }
    except HTTPException:
        raise
    except Exception:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Unexpected backend error occurred.")


@app.get("/packet-tracer-files")
def get_packet_tracer_files():
    """Returns list of packet tracer evidence files."""
    return ["evidence_info.txt", "topology_map.txt"]


@app.get("/review/history")
def get_review_history():
    """Loads all human review sign-off audit records."""
    try:
        log_path = os.environ.get("RESPONSIBLE_AI_LOG_PATH") or DEFAULT_LOG_PATH
        return load_reviews(log_path)
    except Exception:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Unexpected backend error occurred.")


@app.get("/logs/ai-responses")
def get_ai_responses():
    """Fetches logged AI-responses (mapped from review records for analysis)."""
    try:
        log_path = os.environ.get("RESPONSIBLE_AI_LOG_PATH") or DEFAULT_LOG_PATH
        return load_reviews(log_path)
    except Exception:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Unexpected backend error occurred.")


@app.get("/logs/corrections")
def get_corrections_log():
    """Fetches logged human review corrections (EDITED / REJECTED records)."""
    try:
        log_path = os.environ.get("RESPONSIBLE_AI_LOG_PATH") or DEFAULT_LOG_PATH
        reviews = load_reviews(log_path)
        return [r for r in reviews if r.decision in [DecisionEnum.EDITED, DecisionEnum.REJECTED]]
    except Exception:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Unexpected backend error occurred.")


@app.get("/analytics")
def get_analytics():
    """Calculates overall metrics and case/decision distributions for the dashboard."""
    try:
        cases = load_cases(CSV_PATH)
        log_path = os.environ.get("RESPONSIBLE_AI_LOG_PATH") or DEFAULT_LOG_PATH
        reviews = load_reviews(log_path)
        
        cases_by_osi_layer = {}
        cases_by_severity = {}
        for c in cases:
            cases_by_osi_layer[c.osi_layer] = cases_by_osi_layer.get(c.osi_layer, 0) + 1
            cases_by_severity[c.severity] = cases_by_severity.get(c.severity, 0) + 1
            
        total_reviews = len(reviews)
        if total_reviews > 0:
            ai_accepted = sum(1 for r in reviews if r.decision == DecisionEnum.ACCEPTED)
            ai_edited = sum(1 for r in reviews if r.decision == DecisionEnum.EDITED)
            ai_rejected = sum(1 for r in reviews if r.decision == DecisionEnum.REJECTED)
            human_ai_agreement_rate = round((ai_accepted / total_reviews) * 100, 1)
            avg_conf = sum(r.ai_confidence for r in reviews) / total_reviews
        else:
            ai_accepted = 0
            ai_edited = 0
            ai_rejected = 0
            human_ai_agreement_rate = 100.0
            avg_conf = 0.95
            
        return {
            "total_cases": len(cases),
            "human_ai_agreement_rate": human_ai_agreement_rate,
            "average_ai_confidence": avg_conf,
            "total_reviews": total_reviews,
            "ai_accepted": ai_accepted,
            "ai_edited": ai_edited,
            "ai_rejected": ai_rejected,
            "cases_by_osi_layer": cases_by_osi_layer,
            "cases_by_severity": cases_by_severity
        }
    except Exception:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Unexpected backend error occurred.")

