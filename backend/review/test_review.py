import pytest
import os
import json
from backend.review.models import HumanReview, DecisionEnum
from backend.review.service import (
    create_review,
    save_review,
    load_reviews,
    calculate_statistics,
    submit_ai_diagnosis_review,
)
from backend.llm.models import AIDiagnosis


@pytest.fixture
def base_review_data():
    """
    Fixture providing basic valid attributes for human review tests.
    """
    return {
        "case_id": "CASE-001",
        "ai_root_cause": "Interface GigabitEthernet0/1 is down",
        "ai_confidence": 0.85,
        "reviewer": "junior_engineer",
        "timestamp": "2026-08-24T12:00:00"
    }

def test_valid_accepted_review(base_review_data):
    """
    1. Verify that a valid ACCEPTED review can be successfully created
    without requiring human_correction or correction_reason.
    """
    base_review_data["decision"] = "ACCEPTED"
    review = create_review(base_review_data)
    assert review.decision == DecisionEnum.ACCEPTED
    assert review.human_correction is None
    assert review.correction_reason is None

def test_valid_edited_review(base_review_data):
    """
    2. Verify that a valid EDITED review can be successfully created
    when human_correction and correction_reason are provided.
    """
    base_review_data["decision"] = "EDITED"
    base_review_data["human_correction"] = "VLAN 10 is missing in the database"
    base_review_data["correction_reason"] = "SW1 show vlan brief showed VLAN 10 was absent"
    review = create_review(base_review_data)
    assert review.decision == DecisionEnum.EDITED
    assert review.human_correction == "VLAN 10 is missing in the database"
    assert review.correction_reason == "SW1 show vlan brief showed VLAN 10 was absent"

def test_valid_rejected_review(base_review_data):
    """
    3. Verify that a valid REJECTED review can be successfully created
    when human_correction and correction_reason are provided.
    """
    base_review_data["decision"] = "REJECTED"
    base_review_data["human_correction"] = "Wrong gateway IP configuration"
    base_review_data["correction_reason"] = "The interface IP matches but default gateway configuration is incorrect"
    review = create_review(base_review_data)
    assert review.decision == DecisionEnum.REJECTED
    assert review.human_correction == "Wrong gateway IP configuration"
    assert review.correction_reason == "The interface IP matches but default gateway configuration is incorrect"

def test_invalid_decision_rejected(base_review_data):
    """
    4. Verify that an invalid decision value is rejected by the model.
    """
    base_review_data["decision"] = "APPROVED"  # Not a valid Enum value
    with pytest.raises(ValueError):
        create_review(base_review_data)

def test_edited_without_human_correction_fails(base_review_data):
    """
    5. Verify that an EDITED review creation fails if human_correction is missing.
    """
    base_review_data["decision"] = "EDITED"
    base_review_data["correction_reason"] = "Reason provided but no correction"
    with pytest.raises(ValueError) as excinfo:
        create_review(base_review_data)
    assert "human_correction is required" in str(excinfo.value)

def test_edited_without_correction_reason_fails(base_review_data):
    """
    6. Verify that an EDITED review creation fails if correction_reason is missing.
    """
    base_review_data["decision"] = "EDITED"
    base_review_data["human_correction"] = "Correction provided but no reason"
    with pytest.raises(ValueError) as excinfo:
        create_review(base_review_data)
    assert "correction_reason is required" in str(excinfo.value)

def test_rejected_without_human_correction_fails(base_review_data):
    """
    7. Verify that a REJECTED review creation fails if human_correction is missing.
    """
    base_review_data["decision"] = "REJECTED"
    base_review_data["correction_reason"] = "Reason provided but no correction"
    with pytest.raises(ValueError) as excinfo:
        create_review(base_review_data)
    assert "human_correction is required" in str(excinfo.value)

def test_rejected_without_correction_reason_fails(base_review_data):
    """
    8. Verify that a REJECTED review creation fails if correction_reason is missing.
    """
    base_review_data["decision"] = "REJECTED"
    base_review_data["human_correction"] = "Correction provided but no reason"
    with pytest.raises(ValueError) as excinfo:
        create_review(base_review_data)
    assert "correction_reason is required" in str(excinfo.value)

def test_statistics_calculated_correctly():
    """
    9. Verify that total_reviews, accepted, edited, and rejected counts 
    are calculated correctly by the statistics helper.
    """
    reviews = [
        HumanReview(case_id="C1", ai_root_cause="R1", ai_confidence=0.8, decision=DecisionEnum.ACCEPTED, reviewer="Eng1", timestamp="T1"),
        HumanReview(case_id="C2", ai_root_cause="R2", ai_confidence=0.9, decision=DecisionEnum.EDITED, human_correction="Cor1", correction_reason="Rea1", reviewer="Eng1", timestamp="T2"),
        HumanReview(case_id="C3", ai_root_cause="R3", ai_confidence=0.7, decision=DecisionEnum.REJECTED, human_correction="Cor2", correction_reason="Rea2", reviewer="Eng1", timestamp="T3"),
    ]
    stats = calculate_statistics(reviews)
    assert stats["total_reviews"] == 3
    assert stats["accepted"] == 1
    assert stats["edited"] == 1
    assert stats["rejected"] == 1

def test_agreement_rate_calculation():
    """
    10. Verify that the AI-human agreement rate is calculated correctly.
    """
    # 3 ACCEPTED out of 4 total reviews = 75.0% agreement rate
    reviews = [
        HumanReview(case_id="C1", ai_root_cause="R1", ai_confidence=0.8, decision=DecisionEnum.ACCEPTED, reviewer="Eng1", timestamp="T1"),
        HumanReview(case_id="C2", ai_root_cause="R2", ai_confidence=0.9, decision=DecisionEnum.ACCEPTED, reviewer="Eng1", timestamp="T2"),
        HumanReview(case_id="C3", ai_root_cause="R3", ai_confidence=0.7, decision=DecisionEnum.ACCEPTED, reviewer="Eng1", timestamp="T3"),
        HumanReview(case_id="C4", ai_root_cause="R4", ai_confidence=0.5, decision=DecisionEnum.REJECTED, human_correction="Cor1", correction_reason="Rea1", reviewer="Eng1", timestamp="T4"),
    ]
    stats = calculate_statistics(reviews)
    assert stats["ai_human_agreement_rate"] == 75.0

def test_corrected_cases_counted_correctly():
    """
    11. Verify that corrected cases (EDITED or REJECTED) are counted correctly.
    """
    # 2 edited + 1 rejected = 3 corrected cases
    reviews = [
        HumanReview(case_id="C1", ai_root_cause="R1", ai_confidence=0.8, decision=DecisionEnum.ACCEPTED, reviewer="Eng1", timestamp="T1"),
        HumanReview(case_id="C2", ai_root_cause="R2", ai_confidence=0.9, decision=DecisionEnum.EDITED, human_correction="Cor1", correction_reason="Rea1", reviewer="Eng1", timestamp="T2"),
        HumanReview(case_id="C3", ai_root_cause="R3", ai_confidence=0.7, decision=DecisionEnum.REJECTED, human_correction="Cor2", correction_reason="Rea2", reviewer="Eng1", timestamp="T3"),
        HumanReview(case_id="C4", ai_root_cause="R4", ai_confidence=0.6, decision=DecisionEnum.EDITED, human_correction="Cor3", correction_reason="Rea3", reviewer="Eng1", timestamp="T4"),
    ]
    stats = calculate_statistics(reviews)
    assert stats["corrected_cases"] == 3

def test_zero_reviews_statistics():
    """
    12. Verify that stats return zero values when review list is empty.
    """
    stats = calculate_statistics([])
    assert stats["total_reviews"] == 0
    assert stats["accepted"] == 0
    assert stats["edited"] == 0
    assert stats["rejected"] == 0
    assert stats["corrected_cases"] == 0
    assert stats["ai_human_agreement_rate"] == 0.0

def test_save_and_load_reviews(tmp_path, base_review_data):
    """
    Verify that save_review and load_reviews correctly append and retrieve items 
    using a temporary test file. This avoids modifying the production JSON log file.
    """
    temp_file = tmp_path / "test_responsible_ai_log.json"
    
    # 1. Start with an empty list
    assert load_reviews(str(temp_file)) == []
    
    # 2. Add an ACCEPTED review
    base_review_data["decision"] = "ACCEPTED"
    review1 = create_review(base_review_data)
    save_review(review1, str(temp_file))
    
    # 3. Add an EDITED review
    base_review_data["case_id"] = "CASE-002"
    base_review_data["decision"] = "EDITED"
    base_review_data["human_correction"] = "Correction details"
    base_review_data["correction_reason"] = "Reason details"
    review2 = create_review(base_review_data)
    save_review(review2, str(temp_file))
    
    # 4. Load reviews and assert correct parsing
    loaded = load_reviews(str(temp_file))
    assert len(loaded) == 2
    assert loaded[0].case_id == "CASE-001"
    assert loaded[0].decision == DecisionEnum.ACCEPTED
    assert loaded[1].case_id == "CASE-002"
    assert loaded[1].decision == DecisionEnum.EDITED
    assert loaded[1].human_correction == "Correction details"

@pytest.fixture
def sample_ai_diagnosis():
    """Fixture providing a sample AIDiagnosis model output."""
    return AIDiagnosis(
        root_cause="VLAN mismatch between Switch 1 and Router 1",
        confidence=0.85,
        evidence=["Ping failed", "VLAN 10 not declared"],
        next_command="show vlan brief",
        fix_steps=["configure terminal", "vlan 10"],
        osi_layer="Layer 2",
        concept="VLAN"
    )

def test_submit_accepted_review(tmp_path, sample_ai_diagnosis):
    """Verify that submitting an ACCEPTED review succeeds without correction info."""
    temp_file = tmp_path / "test_responsible_ai_log.json"
    
    review = submit_ai_diagnosis_review(
        case_id="NET-001",
        ai_diagnosis=sample_ai_diagnosis,
        reviewer="senior_engineer",
        decision=DecisionEnum.ACCEPTED,
        filepath=str(temp_file)
    )
    
    assert review.case_id == "NET-001"
    assert review.ai_root_cause == sample_ai_diagnosis.root_cause
    assert review.ai_confidence == sample_ai_diagnosis.confidence
    assert review.decision == DecisionEnum.ACCEPTED
    assert review.reviewer == "senior_engineer"
    assert review.human_correction is None
    
    loaded = load_reviews(str(temp_file))
    assert len(loaded) == 1
    assert loaded[0].decision == DecisionEnum.ACCEPTED

def test_submit_edited_review(tmp_path, sample_ai_diagnosis):
    """Verify that submitting an EDITED review succeeds when correction and reason are provided."""
    temp_file = tmp_path / "test_responsible_ai_log.json"
    
    review = submit_ai_diagnosis_review(
        case_id="NET-001",
        ai_diagnosis=sample_ai_diagnosis,
        reviewer="senior_engineer",
        decision=DecisionEnum.EDITED,
        human_correction="Actually it is VLAN 20 mismatch",
        correction_reason="Verified by show interface trunk command",
        filepath=str(temp_file)
    )
    
    assert review.decision == DecisionEnum.EDITED
    assert review.human_correction == "Actually it is VLAN 20 mismatch"
    assert review.correction_reason == "Verified by show interface trunk command"

    loaded = load_reviews(str(temp_file))
    assert len(loaded) == 1
    assert loaded[0].decision == DecisionEnum.EDITED
    assert loaded[0].human_correction == "Actually it is VLAN 20 mismatch"

def test_submit_rejected_review(tmp_path, sample_ai_diagnosis):
    """Verify that submitting a REJECTED review succeeds when correction and reason are provided."""
    temp_file = tmp_path / "test_responsible_ai_log.json"
    
    review = submit_ai_diagnosis_review(
        case_id="NET-001",
        ai_diagnosis=sample_ai_diagnosis,
        reviewer="senior_engineer",
        decision=DecisionEnum.REJECTED,
        human_correction="Completely wrong; it's a physical cabling fault",
        correction_reason="Cable is disconnected on port G0/1",
        filepath=str(temp_file)
    )
    
    assert review.decision == DecisionEnum.REJECTED
    assert review.human_correction == "Completely wrong; it's a physical cabling fault"

    loaded = load_reviews(str(temp_file))
    assert len(loaded) == 1
    assert loaded[0].decision == DecisionEnum.REJECTED

def test_submit_invalid_edited_review_fails(tmp_path, sample_ai_diagnosis):
    """Verify that submitting an EDITED review without correction info raises ValidationError/ValueError."""
    temp_file = tmp_path / "test_responsible_ai_log.json"
    
    # Missing correction
    with pytest.raises(ValueError) as excinfo:
        submit_ai_diagnosis_review(
            case_id="NET-001",
            ai_diagnosis=sample_ai_diagnosis,
            reviewer="senior_engineer",
            decision=DecisionEnum.EDITED,
            correction_reason="Missing human_correction",
            filepath=str(temp_file)
        )
    assert "human_correction is required" in str(excinfo.value)
    
    # Missing reason
    with pytest.raises(ValueError) as excinfo:
        submit_ai_diagnosis_review(
            case_id="NET-001",
            ai_diagnosis=sample_ai_diagnosis,
            reviewer="senior_engineer",
            decision=DecisionEnum.EDITED,
            human_correction="Correction without reason",
            filepath=str(temp_file)
        )
    assert "correction_reason is required" in str(excinfo.value)

def test_submit_invalid_rejected_review_fails(tmp_path, sample_ai_diagnosis):
    """Verify that submitting a REJECTED review without correction info raises ValidationError/ValueError."""
    temp_file = tmp_path / "test_responsible_ai_log.json"
    
    # Missing correction
    with pytest.raises(ValueError) as excinfo:
        submit_ai_diagnosis_review(
            case_id="NET-001",
            ai_diagnosis=sample_ai_diagnosis,
            reviewer="senior_engineer",
            decision=DecisionEnum.REJECTED,
            correction_reason="Missing human_correction",
            filepath=str(temp_file)
        )
    assert "human_correction is required" in str(excinfo.value)

def test_submit_multiple_reviews_appended(tmp_path, sample_ai_diagnosis):
    """Verify that multiple reviews are properly appended sequentially to the JSON file."""
    temp_file = tmp_path / "test_responsible_ai_log.json"
    
    # Submit first
    submit_ai_diagnosis_review(
        case_id="NET-001",
        ai_diagnosis=sample_ai_diagnosis,
        reviewer="eng_1",
        decision=DecisionEnum.ACCEPTED,
        filepath=str(temp_file)
    )
    
    # Submit second
    submit_ai_diagnosis_review(
        case_id="NET-002",
        ai_diagnosis=sample_ai_diagnosis,
        reviewer="eng_2",
        decision=DecisionEnum.EDITED,
        human_correction="Correction detail",
        correction_reason="Reason detail",
        filepath=str(temp_file)
    )
    
    # Submit third
    submit_ai_diagnosis_review(
        case_id="NET-003",
        ai_diagnosis=sample_ai_diagnosis,
        reviewer="eng_3",
        decision=DecisionEnum.REJECTED,
        human_correction="Rejection correction",
        correction_reason="Rejection reason",
        filepath=str(temp_file)
    )
    
    loaded = load_reviews(str(temp_file))
    assert len(loaded) == 3
    assert loaded[0].case_id == "NET-001"
    assert loaded[1].case_id == "NET-002"
    assert loaded[2].case_id == "NET-003"
    
    with open(temp_file, "r", encoding="utf-8") as f:
        data = json.load(f)
        assert isinstance(data, list)
        assert len(data) == 3

