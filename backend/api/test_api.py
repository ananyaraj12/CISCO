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

