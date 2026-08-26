import os
import json
import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from backend.api.main import app
from backend.llm.models import AIDiagnosis

client = TestClient(app)

@pytest.fixture
def mock_gemini_service():
    """Mock the GeminiDiagnosisService's diagnose method to return a valid AIDiagnosis."""
    with patch("backend.api.main.GeminiDiagnosisService") as mock_class:
        mock_instance = MagicMock()
        mock_class.return_value = mock_instance
        
        # Setup mock return value for diagnose
        mock_instance.diagnose.return_value = AIDiagnosis(
            root_cause="VLAN 10 not declared on core switch",
            confidence=0.9,
            evidence=["Ping failed", "VLAN list is empty"],
            next_command="show vlan brief",
            fix_steps=["vlan 10", "name core_vlan"],
            osi_layer="Layer 2",
            concept="VLAN"
        )
        yield mock_instance

@pytest.fixture
def temp_log_file(tmp_path):
    """Fixture providing a temporary log filepath and clean environment setup."""
    log_file = tmp_path / "test_responsible_ai_log.json"
    with patch.dict(os.environ, {"RESPONSIBLE_AI_LOG_PATH": str(log_file)}):
        yield log_file

def test_1_health_check():
    """Verify that GET /health returns ok status."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_2_diagnose_valid_case(mock_gemini_service):
    """Verify that POST /diagnose with a valid case returns AIDiagnosis."""
    response = client.post("/diagnose", json={"case_id": "NET-001"})
    assert response.status_code == 200
    
    data = response.json()
    assert data["case_id"] == "NET-001"
    assert "diagnosis" in data
    
    diag = data["diagnosis"]
    assert diag["root_cause"] == "VLAN 10 not declared on core switch"
    assert diag["confidence"] == 0.9
    assert diag["osi_layer"] == "Layer 2"
    assert diag["concept"] == "VLAN"
    
    mock_gemini_service.diagnose.assert_called_once()

def test_3_diagnose_nonexistent_case():
    """Verify that POST /diagnose with a nonexistent case returns 404."""
    response = client.post("/diagnose", json={"case_id": "NET-UNKNOWN-999"})
    assert response.status_code == 404
    assert "detail" in response.json()

def test_4_review_accepted(temp_log_file):
    """Verify that submitting an ACCEPTED review succeeds and persists."""
    payload = {
        "case_id": "NET-001",
        "ai_root_cause": "VLAN issue",
        "ai_confidence": 0.8,
        "decision": "ACCEPTED",
        "human_correction": None,
        "correction_reason": None,
        "reviewer": "network_engineer_1"
    }
    response = client.post("/review", json=payload)
    assert response.status_code == 200
    
    data = response.json()
    assert data["case_id"] == "NET-001"
    assert data["decision"] == "ACCEPTED"
    assert data["reviewer"] == "network_engineer_1"
    
    assert os.path.exists(temp_log_file)
    with open(temp_log_file, "r") as f:
        log_data = json.load(f)
        assert len(log_data) == 1
        assert log_data[0]["case_id"] == "NET-001"

def test_5_review_edited(temp_log_file):
    """Verify that submitting an EDITED review with correction info succeeds."""
    payload = {
        "case_id": "NET-001",
        "ai_root_cause": "VLAN issue",
        "ai_confidence": 0.8,
        "decision": "EDITED",
        "human_correction": "VLAN 20 is actually the issue",
        "correction_reason": "VLAN 10 is fine in running config",
        "reviewer": "network_engineer_2"
    }
    response = client.post("/review", json=payload)
    assert response.status_code == 200
    
    data = response.json()
    assert data["decision"] == "EDITED"
    assert data["human_correction"] == "VLAN 20 is actually the issue"

def test_6_review_rejected(temp_log_file):
    """Verify that submitting a REJECTED review with justification details succeeds."""
    payload = {
        "case_id": "NET-001",
        "ai_root_cause": "VLAN issue",
        "ai_confidence": 0.8,
        "decision": "REJECTED",
        "human_correction": "Completely incorrect analysis",
        "correction_reason": "The interface is administratively down",
        "reviewer": "network_engineer_3"
    }
    response = client.post("/review", json=payload)
    assert response.status_code == 200
    
    data = response.json()
    assert data["decision"] == "REJECTED"
    assert data["correction_reason"] == "The interface is administratively down"

def test_7_invalid_edited_review_fails(temp_log_file):
    """Verify that an EDITED review without correction info is rejected with 400."""
    payload = {
        "case_id": "NET-001",
        "ai_root_cause": "VLAN issue",
        "ai_confidence": 0.8,
        "decision": "EDITED",
        "human_correction": None,
        "correction_reason": "Missing human_correction",
        "reviewer": "network_engineer_4"
    }
    response = client.post("/review", json=payload)
    assert response.status_code == 400

def test_8_invalid_rejected_review_fails(temp_log_file):
    """Verify that a REJECTED review without correction info is rejected with 400."""
    payload = {
        "case_id": "NET-001",
        "ai_root_cause": "VLAN issue",
        "ai_confidence": 0.8,
        "decision": "REJECTED",
        "human_correction": "Missing reason text",
        "correction_reason": None,
        "reviewer": "network_engineer_5"
    }
    response = client.post("/review", json=payload)
    assert response.status_code == 400

def test_9_invalid_malformed_request():
    """Verify that malformed JSON or invalid types are rejected with 422."""
    # Invalid confidence type
    response = client.post("/review", json={"case_id": "NET-001", "ai_confidence": "high"})
    assert response.status_code == 422
    
    # Missing required case_id
    response = client.post("/diagnose", json={})
    assert response.status_code == 422

def test_10_diagnose_response_schema(mock_gemini_service):
    """Verify that POST /diagnose response conforms exactly to the expected schema layout."""
    response = client.post("/diagnose", json={"case_id": "NET-001"})
    assert response.status_code == 200
    
    data = response.json()
    assert "case_id" in data
    assert "diagnosis" in data
    diag = data["diagnosis"]
    
    # Check all fields from AIDiagnosis model
    for field in ["root_cause", "confidence", "evidence", "next_command", "fix_steps", "osi_layer", "concept"]:
        assert field in diag

def test_diagnose_case_id_normalization_regression(mock_gemini_service):
    """
    Regression test: Verify that case_id is normalized (casing, whitespace)
    so that requests like 'net-001' or '  NET-001  ' do not return 404.
    """
    # Test lowercase
    response_lower = client.post("/diagnose", json={"case_id": "net-001"})
    assert response_lower.status_code == 200
    assert response_lower.json()["case_id"] == "net-001"
    
    # Test trailing/leading whitespace
    response_space = client.post("/diagnose", json={"case_id": "  NET-001  "})
    assert response_space.status_code == 200
    assert response_space.json()["case_id"] == "  NET-001  "


def test_env_configuration_loading():
    """Verify that the API successfully loads the environment configuration from the root .env."""
    from dotenv import dotenv_values
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    env_path = os.path.join(root_dir, ".env")
    assert os.path.exists(env_path), "Root .env file does not exist"
    
    # Verify dotenv values can be read
    config = dotenv_values(env_path)
    assert "GEMINI_API_KEY" in config, "GEMINI_API_KEY not found in .env"
    assert "GEMINI_MODEL" in config, "GEMINI_MODEL not found in .env"
    assert config["GEMINI_API_KEY"].startswith("AQ."), "GEMINI_API_KEY should start with expected prefix"

    # Verify os.environ is populated
    assert os.environ.get("GEMINI_API_KEY") is not None


def test_api_multiple_reviews_appended(temp_log_file):
    """Verify that multiple reviews submitted via POST /review are appended to the temporary log."""
    payload1 = {
        "case_id": "NET-001",
        "ai_root_cause": "AI Root Cause 1",
        "ai_confidence": 0.8,
        "decision": "ACCEPTED",
        "human_correction": None,
        "correction_reason": None,
        "reviewer": "reviewer_1"
    }
    payload2 = {
        "case_id": "NET-002",
        "ai_root_cause": "AI Root Cause 2",
        "ai_confidence": 0.7,
        "decision": "EDITED",
        "human_correction": "Corrected Root Cause 2",
        "correction_reason": "Reason 2",
        "reviewer": "reviewer_2"
    }
    
    response1 = client.post("/review", json=payload1)
    assert response1.status_code == 200
    
    response2 = client.post("/review", json=payload2)
    assert response2.status_code == 200
    
    # Verify both are written to temp_log_file
    assert os.path.exists(temp_log_file)
    with open(temp_log_file, "r", encoding="utf-8") as f:
        log_data = json.load(f)
        assert len(log_data) == 2
        assert log_data[0]["case_id"] == "NET-001"
        assert log_data[1]["case_id"] == "NET-002"


def test_api_e2e_mocked_gemini_diagnosis_and_review(mock_gemini_service, temp_log_file):
    """
    E2E integration test:
    1. POST /diagnose and receive AIDiagnosis response (using mocked Gemini service).
    2. Submit the returned diagnosis payload to POST /review.
    3. Verify that the HumanReview record is stored correctly.
    """
    # 1. POST /diagnose
    diagnose_response = client.post("/diagnose", json={"case_id": "NET-001"})
    assert diagnose_response.status_code == 200
    diag_data = diagnose_response.json()
    
    case_id = diag_data["case_id"]
    ai_diag = diag_data["diagnosis"]
    
    # 2. POST /review using the AI diagnosis output
    review_payload = {
        "case_id": case_id,
        "ai_root_cause": ai_diag["root_cause"],
        "ai_confidence": ai_diag["confidence"],
        "decision": "ACCEPTED",
        "human_correction": None,
        "correction_reason": None,
        "reviewer": "e2e_test_reviewer"
    }
    review_response = client.post("/review", json=review_payload)
    assert review_response.status_code == 200
    
    # 3. Verify record in temp log file
    assert os.path.exists(temp_log_file)
    with open(temp_log_file, "r", encoding="utf-8") as f:
        log_data = json.load(f)
        assert len(log_data) == 1
        record = log_data[0]
        assert record["case_id"] == "NET-001"
        assert record["ai_root_cause"] == ai_diag["root_cause"]
        assert record["ai_confidence"] == ai_diag["confidence"]
        assert record["decision"] == "ACCEPTED"
        assert record["reviewer"] == "e2e_test_reviewer"


def test_get_all_cases():
    response = client.get("/cases")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    # Ensure ground truth fields are excluded
    for c in data:
        assert "expected_fault" not in c
        assert "expected_next_command" not in c
        assert "expected_fix" not in c
        assert "case_id" in c
        assert "symptom" in c


def test_get_case_by_id_success():
    response = client.get("/cases/NET-001")
    assert response.status_code == 200
    c = response.json()
    assert c["case_id"] == "NET-001"
    assert "expected_fault" not in c


def test_get_case_by_id_not_found():
    response = client.get("/cases/NET-999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Requested case does not exist."


def test_get_case_evidence():
    response = client.get("/cases/NET-001/evidence")
    assert response.status_code == 200
    data = response.json()
    assert "files" in data
    assert "evidence_info.txt" in data["files"]
    assert "topology_map.txt" in data["files"]
    assert "evidence_text" in data


def test_get_packet_tracer_files():
    response = client.get("/packet-tracer-files")
    assert response.status_code == 200
    assert response.json() == ["evidence_info.txt", "topology_map.txt"]


def test_get_review_history_and_logs(temp_log_file):
    # submit one review
    payload = {
        "case_id": "NET-001",
        "ai_root_cause": "Test Cause",
        "ai_confidence": 0.9,
        "decision": "EDITED",
        "human_correction": "Correct Cause",
        "correction_reason": "Reason",
        "reviewer": "reviewer_1"
    }
    client.post("/review", json=payload)
    
    # Check history
    response = client.get("/review/history")
    assert response.status_code == 200
    history = response.json()
    assert len(history) == 1
    assert history[0]["case_id"] == "NET-001"
    
    # Check ai-responses
    response_ai = client.get("/logs/ai-responses")
    assert response_ai.status_code == 200
    assert len(response_ai.json()) == 1

    # Check corrections
    response_corr = client.get("/logs/corrections")
    assert response_corr.status_code == 200
    assert len(response_corr.json()) == 1


def test_get_analytics(temp_log_file):
    response = client.get("/analytics")
    assert response.status_code == 200
    data = response.json()
    assert "total_cases" in data
    assert data["total_cases"] == 30
    assert "human_ai_agreement_rate" in data




