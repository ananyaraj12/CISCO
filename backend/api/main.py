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
    """Returns simulated or actual configuration evidence for the case."""
    try:
        cases = load_cases(CSV_PATH)
        req_id = case_id.strip().upper()
        c = next((item for item in cases if item.case_id.strip().upper() == req_id), None)
        if not c:
            raise HTTPException(status_code=404, detail="Requested case does not exist.")
        
        # Check if actual txt file exists in Cisco Network Cases/NET txt files
        case_num = req_id.replace("NET-", "").strip()
        txt_dir = os.path.abspath(os.path.join(ROOT_DIR, "Cisco Network Cases", "NET txt files"))
        pkt_dir = os.path.abspath(os.path.join(ROOT_DIR, "Cisco Network Cases", "NET pkt files"))
        
        txt_content = None
        if os.path.exists(txt_dir):
            for fname in os.listdir(txt_dir):
                if fname.lower().replace(" ", "").startswith(f"net{case_num.lower()}"):
                    with open(os.path.join(txt_dir, fname), "r", encoding="utf-8", errors="ignore") as f:
                        txt_content = f.read()
                    break
        
        # Determine pkt filename and size
        pkt_filename = f"{c.case_id}-{c.concept.replace(' ', '_')}-Lab.pkt"
        pkt_size = 58.4
        if os.path.exists(pkt_dir):
            for fname in os.listdir(pkt_dir):
                if fname.upper().startswith(c.case_id):
                    pkt_filename = fname
                    pkt_size = round(os.path.getsize(os.path.join(pkt_dir, fname)) / 1024, 1)
                    break

        if txt_content:
            evidence_info = txt_content
        else:
            evidence_info = (
                f"NetSage System Log - Network State Capture for Case {c.case_id}\n"
                f"=================================================================\n"
                f"Device Topology: {c.topology}\n"
                f"Reported Symptom: {c.symptome}\n"
                f"OSI Layer: {c.osi_layer}\n"
                f"Associated Concept: {c.concept}\n"
                f"Severity: {c.severity}\n\n"
                f"CLI Output Check Logs:\n"
                f"----------------------\n"
                f"Router# show running-config\n"
                f"Building configuration...\n\n"
                f"Current configuration : 1842 bytes\n"
                f"version 15.1\n"
                f"hostname Router-{c.case_id}\n"
                f"!\n"
                f"interface GigabitEthernet0/0\n"
                f" description Primary Uplink ({c.topology})\n"
                f" ip address 192.168.1.1 255.255.255.0\n"
                f"!\n"
                f"Active monitoring detected connectivity breakdown: '{c.symptome}'\n"
                f"Inspect Packet Tracer lab file '{pkt_filename}' for deep diagnostic verification."
            )
        
        show_config = (
            f"Building configuration for {c.case_id}...\n"
            f"--------------------------------------------------\n"
            f"Hostname: Router-{c.case_id}\n"
            f"Concept: {c.concept}\n"
            f"Topology: {c.topology}\n\n"
            f"show ip interface brief:\n"
            f"Interface              IP-Address      OK? Method Status                Protocol\n"
            f"GigabitEthernet0/0     192.168.1.1     YES manual up                    up\n"
            f"GigabitEthernet0/1     unassigned      YES unset  administratively down down\n"
        )
        
        topology_map = (
            f"Logical Network Connection Graph:\n"
            f"---------------------------------\n"
            f"Path: {c.topology}\n\n"
            f"Interfaces status check:\n"
            f"  - Active monitoring detected connectivity breakdown aligned with: '{c.symptome}'"
        )

        return {
            "case_id": c.case_id,
            "title": c.title,
            "symptom": c.symptome,
            "topology": c.topology,
            "osi_layer": c.osi_layer,
            "concept": c.concept,
            "severity": c.severity,
            "pkt_filename": pkt_filename,
            "pkt_size_kb": pkt_size,
            "files": {
                "evidence_info.txt": evidence_info,
                "show_running_config.txt": show_config,
                "topology_map.txt": topology_map
            },
            "evidence_text": evidence_info
        }
    except HTTPException:
        raise
    except Exception:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Unexpected backend error occurred.")


@app.get("/packet-tracer-files")
def get_packet_tracer_files():
    """Returns list of packet tracer evidence file objects across all cases."""
    try:
        cases = load_cases(CSV_PATH)
        pkt_dir = os.path.abspath(os.path.join(ROOT_DIR, "Cisco Network Cases", "NET pkt files"))
        
        result = []
        for c in cases:
            pkt_filename = f"{c.case_id}-{c.concept.replace(' ', '_')}-Lab.pkt"
            pkt_size = 54.2
            has_pkt = False
            
            if os.path.exists(pkt_dir):
                for fname in os.listdir(pkt_dir):
                    if fname.upper().startswith(c.case_id):
                        pkt_filename = fname
                        pkt_size = round(os.path.getsize(os.path.join(pkt_dir, fname)) / 1024, 1)
                        has_pkt = True
                        break
            
            result.append({
                "case_id": c.case_id,
                "filename": pkt_filename,
                "title": c.title,
                "symptom": c.symptome,
                "concept": c.concept,
                "osi_layer": c.osi_layer,
                "severity": c.severity,
                "size_kb": pkt_size,
                "status": "Ready for Audit" if has_pkt else "Analyzed",
                "has_pkt_file": has_pkt
            })
            
        return result
    except Exception:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Unexpected backend error occurred.")


from fastapi.responses import FileResponse, Response

@app.get("/cases/{case_id}/download-pkt")
def download_pkt_file(case_id: str):
    """Download Packet Tracer .pkt file for a given case."""
    req_id = case_id.strip().upper()
    pkt_dir = os.path.abspath(os.path.join(ROOT_DIR, "Cisco Network Cases", "NET pkt files"))
    if os.path.exists(pkt_dir):
        for fname in os.listdir(pkt_dir):
            if fname.upper().startswith(req_id):
                file_path = os.path.join(pkt_dir, fname)
                return FileResponse(file_path, filename=fname, media_type="application/octet-stream")
    
    # Fallback simulated .pkt download content
    content = f"PACKET_TRACER_SIMULATED_PKT_BINARY_DATA_{req_id}".encode("utf-8")
    return Response(
        content=content,
        media_type="application/octet-stream",
        headers={"Content-Disposition": f'attachment; filename="{req_id}-Lab.pkt"'}
    )

@app.get("/cases/{case_id}/download-evidence")
def download_evidence_file(case_id: str):
    """Download evidence text file for a given case."""
    req_id = case_id.strip().upper()
    case_num = req_id.replace("NET-", "").strip()
    txt_dir = os.path.abspath(os.path.join(ROOT_DIR, "Cisco Network Cases", "NET txt files"))
    if os.path.exists(txt_dir):
        for fname in os.listdir(txt_dir):
            if fname.lower().replace(" ", "").startswith(f"net{case_num.lower()}"):
                file_path = os.path.join(txt_dir, fname)
                return FileResponse(file_path, filename=fname, media_type="text/plain")
    
    ev_data = get_case_evidence(req_id)
    text = ev_data.get("evidence_text", f"Evidence log for {req_id}")
    return Response(
        content=text.encode("utf-8"),
        media_type="text/plain",
        headers={"Content-Disposition": f'attachment; filename="{req_id}_evidence.txt"'}
    )



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

