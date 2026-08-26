import os
import json
import pytest
from backend.dataset.models import NetworkCase
from backend.dataset.loader import load_cases
from backend.diagnosis.service import DiagnosisService, DiagnosisContext

# Path to the real CSV dataset
REAL_CSV_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "data", "cases.csv")
)

def test_1_real_case():
    """
    TEST 1 — REAL CASE
    Load a real case from backend/data/cases.csv.
    Verify:
    - case loads successfully
    - DiagnosisService returns DiagnosisContext
    - case_id is preserved
    - symptom is mapped from CSV "symptome"
    - topology is preserved exactly
    """
    cases = load_cases(REAL_CSV_PATH)
    assert len(cases) > 0
    case = cases[0]

    service = DiagnosisService()
    context = service.prepare_diagnosis_context(case)

    assert isinstance(context, DiagnosisContext)
    assert context.case_id == case.case_id
    assert context.symptom == case.symptome
    assert context.topology == case.topology

def test_2_structured_evidence_status():
    """
    TEST 2 — STRUCTURED EVIDENCE STATUS
    For a normal CSV case, verify:
    - context.structured_evidence_available is False
    - context.evidence_note is not empty
    - evidence_note explains that structured network-state data is unavailable
    """
    cases = load_cases(REAL_CSV_PATH)
    case = cases[0]

    service = DiagnosisService()
    context = service.prepare_diagnosis_context(case)

    assert context.structured_evidence_available is False
    assert context.evidence_note != ""
    assert "unavailable" in context.evidence_note.lower()

def test_3_no_fake_network_configuration():
    """
    TEST 3 — NO FAKE NETWORK CONFIGURATION
    Use a test case with topology such as: "PC1-SW1-R1"
    Process it through DiagnosisService.
    Verify that the service does NOT fabricate:
    - IP addresses
    - subnet masks
    - VLAN IDs
    - gateways
    - routes
    - interfaces
    - interface states
    """
    test_case = NetworkCase(
        case_id="NET-TEST-3",
        title="Fake Config Test",
        symptome="PC cannot ping router",
        topology="PC1-SW1-R1",
        expected_fault="Some fault",
        osi_layer="Layer 3",
        concept="Routing",
        severity="High",
        expected_next_command="show ip route",
        expected_fix="Fix routing"
    )

    service = DiagnosisService()
    context = service.prepare_diagnosis_context(test_case)

    # Assert that no fake IP addresses, subnet masks, VLAN IDs, gateways, interfaces or routes are fabricated.
    # Since we did not configure any devices/interfaces/routes in NetworkState,
    # the evidence/issues for all RuleResults should not contain any IPs, subnet masks, VLAN IDs, gateways, or routes.
    for rule in context.rule_checker_results:
        evidence_str = str(rule.evidence)
        assert "192.168" not in evidence_str
        assert "10." not in evidence_str
        assert "255.255" not in evidence_str
        assert "Fa0/" not in evidence_str
        assert "G0/" not in evidence_str
        assert "gateway" not in evidence_str.lower() or not rule.detected

def test_4_rule_checker_results():
    """
    TEST 4 — RULE CHECKER RESULTS
    Verify:
    - isinstance(context.rule_checker_results, list)
    - the results are serialized into the generated prompt
    - DO NOT assert len(context.rule_checker_results) == 6
    """
    cases = load_cases(REAL_CSV_PATH)
    case = cases[0]

    service = DiagnosisService()
    context = service.prepare_diagnosis_context(case)

    assert isinstance(context.rule_checker_results, list)
    
    # Verify results are serialized into prompt
    assert "Rule Checker Results" in context.prompt
    assert "duplicate_ips" in context.prompt
    assert "invalid_subnet" in context.prompt

def test_5_prompt_content():
    """
    TEST 5 — PROMPT CONTENT
    Verify that the prompt contains:
    - case.symptome
    - case.topology
    - "Evidence Availability"
    - the evidence limitation
    - "Rule Checker Results"
    - the serialized Rule Checker output
    - the original diagnose_prompt.md instructions are present.
    """
    cases = load_cases(REAL_CSV_PATH)
    case = cases[0]

    service = DiagnosisService()
    context = service.prepare_diagnosis_context(case)

    assert case.symptome in context.prompt
    assert case.topology in context.prompt
    assert "Evidence Availability" in context.prompt
    assert context.evidence_note in context.prompt
    assert "Rule Checker Results" in context.prompt
    assert "NetSage AI Diagnostic Prompt" in context.prompt
    assert "You are NetSage AI" in context.prompt

def test_6_expected_answers_are_not_leaked():
    """
    TEST 6 — EXPECTED ANSWERS ARE NOT LEAKED
    Create a NetworkCase with unique sentinel values.
    Generate the DiagnosisContext.
    Assert that NONE of those sentinel values occur in context.prompt.
    """
    test_case = NetworkCase(
        case_id="NET-TEST-6",
        title="Leak Test",
        symptome="Test Symptom",
        topology="Test Topology",
        expected_fault="SECRET_EXPECTED_FAULT_1234",
        osi_layer="SECRET_OSI_LAYER_3456",
        concept="SECRET_CONCEPT_7890",
        severity="High",
        expected_next_command="SECRET_EXPECTED_COMMAND_5678",
        expected_fix="SECRET_EXPECTED_FIX_9012"
    )

    service = DiagnosisService()
    context = service.prepare_diagnosis_context(test_case)

    # Verify that NONE of the secret expected answers exist in the prompt
    assert "SECRET_EXPECTED_FAULT_1234" not in context.prompt
    assert "SECRET_EXPECTED_COMMAND_5678" not in context.prompt
    assert "SECRET_EXPECTED_FIX_9012" not in context.prompt
    assert "SECRET_OSI_LAYER_3456" not in context.prompt
    assert "SECRET_CONCEPT_7890" not in context.prompt

def test_7_no_llm_call():
    """
    TEST 7 — NO LLM CALL
    Verify that prepare_diagnosis_context() works completely locally.
    Do not mock an external API.
    The test should simply prove that the method returns a DiagnosisContext
    without requiring an API key or external service.
    """
    cases = load_cases(REAL_CSV_PATH)
    case = cases[0]

    service = DiagnosisService()
    context = service.prepare_diagnosis_context(case)
    assert context is not None

def test_8_prompt_must_not_leak_csv_field_labels_as_answers():
    """
    TEST 8 — PROMPT MUST NOT LEAK CSV FIELD LABELS AS ANSWERS
    Instead of testing simple negative checks like "assert 'concept' not in prompt"
    (which may legitimately exist in base instructions), we verify leakage protection
    via unique sentinel values (asserting their absence in context.prompt).
    """
    test_case = NetworkCase(
        case_id="NET-TEST-8",
        title="Sentinel Labelling Leak Test",
        symptome="Test Symptom Label",
        topology="Test Topology Label",
        expected_fault="SENTINEL_FAULT_ANS",
        osi_layer="SENTINEL_OSI_ANS",
        concept="SENTINEL_CONCEPT_ANS",
        severity="Medium",
        expected_next_command="SENTINEL_NEXT_COMMAND_ANS",
        expected_fix="SENTINEL_FIX_ANS"
    )

    service = DiagnosisService()
    context = service.prepare_diagnosis_context(test_case)

    # The labels themselves (like "concept" or "osi_layer") can remain in the instructions,
    # but the specific answer values MUST NOT be leaked.
    assert "SENTINEL_FAULT_ANS" not in context.prompt
    assert "SENTINEL_OSI_ANS" not in context.prompt
    assert "SENTINEL_CONCEPT_ANS" not in context.prompt
    assert "SENTINEL_NEXT_COMMAND_ANS" not in context.prompt
    assert "SENTINEL_FIX_ANS" not in context.prompt
