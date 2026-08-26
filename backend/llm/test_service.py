import os
import json
import pytest
from unittest.mock import MagicMock, patch
from backend.diagnosis.service import DiagnosisContext
from backend.llm.models import AIDiagnosis
from backend.llm.service import (
    GeminiDiagnosisService,
    GeminiConfigurationError,
    GeminiAPIError,
    GeminiEmptyResponseError,
    GeminiInvalidJSONError,
    GeminiValidationError,
)

# Helper to create a dummy diagnosis context
def create_dummy_context(prompt: str = "Dummy NetSage Prompt") -> DiagnosisContext:
    return DiagnosisContext(
        case_id="NET-TEST-123",
        symptom="Dummy symptom",
        topology="Dummy topology",
        rule_checker_results=[],
        structured_evidence_available=False,
        evidence_note="Dummy evidence note",
        prompt=prompt
    )

@pytest.fixture(autouse=True)
def setup_dummy_env():
    """Ensures a dummy API key is set in environment for all unit tests."""
    with patch.dict(os.environ, {"GEMINI_API_KEY": "dummy-key-for-testing"}):
        yield

@pytest.fixture
def mock_client():
    """Fixture to patch and mock google-genai Client."""
    with patch("backend.llm.service.genai.Client") as mock_client_class:
        m_client = MagicMock()
        mock_client_class.return_value = m_client
        yield m_client

def test_1_valid_response_produces_ai_diagnosis(mock_client):
    """Verify that a valid mocked Gemini JSON response is parsed into an AIDiagnosis model."""
    service = GeminiDiagnosisService()
    
    mock_response = MagicMock()
    mock_response.text = json.dumps({
        "root_cause": "Mismatching VLAN",
        "confidence": 0.85,
        "evidence": ["Evidence 1", "Evidence 2"],
        "next_command": "show vlan brief",
        "fix_steps": ["Fix step 1", "Fix step 2"],
        "osi_layer": "Layer 2",
        "concept": "VLAN"
    })
    mock_client.models.generate_content.return_value = mock_response

    context = create_dummy_context()
    diagnosis = service.diagnose(context)

    assert isinstance(diagnosis, AIDiagnosis)
    assert diagnosis.root_cause == "Mismatching VLAN"
    assert diagnosis.confidence == 0.85
    assert diagnosis.osi_layer == "Layer 2"
    assert diagnosis.concept == "VLAN"

def test_2_confidence_validation_works(mock_client):
    """Verify that confidence boundary values (0.0 and 1.0) are valid."""
    service = GeminiDiagnosisService()
    
    mock_response = MagicMock()
    
    # Boundary 0.0
    mock_response.text = json.dumps({
        "root_cause": "Mismatching VLAN",
        "confidence": 0.0,
        "evidence": [],
        "next_command": "show vlan brief",
        "fix_steps": [],
        "osi_layer": "Layer 2",
        "concept": "VLAN"
    })
    mock_client.models.generate_content.return_value = mock_response
    diagnosis_0 = service.diagnose(create_dummy_context())
    assert diagnosis_0.confidence == 0.0

    # Boundary 1.0
    mock_response.text = json.dumps({
        "root_cause": "Mismatching VLAN",
        "confidence": 1.0,
        "evidence": [],
        "next_command": "show vlan brief",
        "fix_steps": [],
        "osi_layer": "Layer 2",
        "concept": "VLAN"
    })
    mock_client.models.generate_content.return_value = mock_response
    diagnosis_1 = service.diagnose(create_dummy_context())
    assert diagnosis_1.confidence == 1.0

def test_3_invalid_confidence_rejected(mock_client):
    """Verify that confidence values outside 0.0–1.0 are rejected."""
    service = GeminiDiagnosisService()
    mock_response = MagicMock()

    # Too high
    mock_response.text = json.dumps({
        "root_cause": "Mismatching VLAN",
        "confidence": 1.1,
        "evidence": [],
        "next_command": "show vlan brief",
        "fix_steps": [],
        "osi_layer": "Layer 2",
        "concept": "VLAN"
    })
    mock_client.models.generate_content.return_value = mock_response
    with pytest.raises(GeminiValidationError):
        service.diagnose(create_dummy_context())

    # Too low
    mock_response.text = json.dumps({
        "root_cause": "Mismatching VLAN",
        "confidence": -0.1,
        "evidence": [],
        "next_command": "show vlan brief",
        "fix_steps": [],
        "osi_layer": "Layer 2",
        "concept": "VLAN"
    })
    mock_client.models.generate_content.return_value = mock_response
    with pytest.raises(GeminiValidationError):
        service.diagnose(create_dummy_context())

def test_4_missing_required_fields_rejected(mock_client):
    """Verify that missing fields in the JSON response trigger GeminiValidationError."""
    service = GeminiDiagnosisService()
    mock_response = MagicMock()
    
    # Missing root_cause
    mock_response.text = json.dumps({
        "confidence": 0.9,
        "evidence": [],
        "next_command": "show vlan brief",
        "fix_steps": [],
        "osi_layer": "Layer 2",
        "concept": "VLAN"
    })
    mock_client.models.generate_content.return_value = mock_response
    with pytest.raises(GeminiValidationError):
        service.diagnose(create_dummy_context())

def test_5_invalid_json_handled(mock_client):
    """Verify that invalid JSON payload is handled cleanly."""
    service = GeminiDiagnosisService()
    mock_response = MagicMock()
    mock_response.text = "This is not standard JSON"
    mock_client.models.generate_content.return_value = mock_response

    with pytest.raises(GeminiInvalidJSONError):
        service.diagnose(create_dummy_context())

def test_6_empty_response_handled(mock_client):
    """Verify that empty responses trigger GeminiEmptyResponseError."""
    service = GeminiDiagnosisService()
    mock_response = MagicMock()
    mock_response.text = "   "
    mock_client.models.generate_content.return_value = mock_response

    with pytest.raises(GeminiEmptyResponseError):
        service.diagnose(create_dummy_context())

def test_7_missing_api_key_handled():
    """Verify that the service refuses to instantiate if GEMINI_API_KEY environment variable is absent."""
    with patch.dict(os.environ, {}, clear=True):
        with pytest.raises(GeminiConfigurationError) as exc_info:
            GeminiDiagnosisService()
        assert "GEMINI_API_KEY" in str(exc_info.value)

def test_8_and_9_sends_exact_prompt_to_gemini(mock_client):
    """Verify that the service passes context.prompt directly to the Gemini API client and does not generate its own."""
    service = GeminiDiagnosisService()
    
    mock_response = MagicMock()
    mock_response.text = json.dumps({
        "root_cause": "Mismatching VLAN",
        "confidence": 0.85,
        "evidence": [],
        "next_command": "show vlan brief",
        "fix_steps": [],
        "osi_layer": "Layer 2",
        "concept": "VLAN"
    })
    mock_client.models.generate_content.return_value = mock_response

    special_prompt = "SPECIAL_UNIQUE_DIAGNOSTIC_PROMPT_ABC"
    context = create_dummy_context(prompt=special_prompt)
    service.diagnose(context)

    # Confirm model call and the exact content payload sent
    mock_client.models.generate_content.assert_called_once()
    called_kwargs = mock_client.models.generate_content.call_args[1]
    assert called_kwargs["contents"] == special_prompt

def test_10_and_11_no_real_api_requests_or_leaks(mock_client):
    """Verify that no real API requests are made and expected answers are not introduced by the LLM service."""
    service = GeminiDiagnosisService()
    # Pydantic schema validation is restricted only to AIDiagnosis layout
    for field in ["expected_fault", "expected-fault", "expected_fix", "expected_next_command"]:
        assert field not in AIDiagnosis.model_fields

@pytest.mark.skipif(
    not os.environ.get("RUN_GEMINI_INTEGRATION"),
    reason="RUN_GEMINI_INTEGRATION environment variable is not set to 1."
)
def test_real_gemini_integration():
    """
    Optional integration test that calls the live Gemini API.
    Only executed when RUN_GEMINI_INTEGRATION=1.
    """
    service = GeminiDiagnosisService()
    # Compose simple mock context
    context = create_dummy_context(
        prompt="Explain why a mismatching VLAN configuration causes connection failure on Layer 2."
    )
    result = service.diagnose(context)
    assert isinstance(result, AIDiagnosis)
    assert result.confidence >= 0.0
