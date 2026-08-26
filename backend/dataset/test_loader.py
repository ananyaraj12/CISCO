import os
import pytest
from backend.dataset.models import NetworkCase
from backend.dataset.loader import load_cases, load_case_by_id

# Resolve the absolute path to the real cases.csv dataset
REAL_CSV_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "data", "cases.csv")
)

def test_csv_loads_successfully():
    """Test that the real CSV loads successfully without raising errors."""
    cases = load_cases(REAL_CSV_PATH)
    assert isinstance(cases, list)
    assert len(cases) > 0
    assert all(isinstance(case, NetworkCase) for case in cases)

def test_exactly_30_cases_loaded():
    """Test that exactly 30 cases are loaded from the real CSV."""
    cases = load_cases(REAL_CSV_PATH)
    assert len(cases) == 30

def test_every_case_has_case_id():
    """Test that every loaded case has a non-empty case_id."""
    cases = load_cases(REAL_CSV_PATH)
    for case in cases:
        assert case.case_id is not None
        assert isinstance(case.case_id, str)
        assert len(case.case_id.strip()) > 0

def test_case_ids_are_unique():
    """Test that case IDs are unique across all loaded cases."""
    cases = load_cases(REAL_CSV_PATH)
    case_ids = [case.case_id for case in cases]
    assert len(case_ids) == len(set(case_ids))

def test_all_required_columns_mapped_correctly():
    """Test that all required columns are correctly mapped to NetworkCase fields."""
    cases = load_cases(REAL_CSV_PATH)
    # Check the first case (NET-001) for correct mapping and content
    case = next(c for c in cases if c.case_id == "NET-001")
    assert case.case_id == "NET-001"
    assert case.title == "Wrong VLAN Assignment"
    assert case.symptome == "PC1 cannot reach its default gateway"
    assert case.topology == "PC1-SW1-R1"
    assert case.expected_fault == "Wrong VLAN assignment"
    assert case.osi_layer == "Layer 2"
    assert case.concept == "VLAN"
    assert case.severity == "High"
    assert case.expected_next_command == "show vlan brief"
    assert case.expected_fix == "Assign SW1 Fa0/1 to VLAN 10"

def test_expected_fault_mapping():
    """Test that 'expected-fault' CSV column maps correctly to the model's 'expected_fault' field."""
    cases = load_cases(REAL_CSV_PATH)
    case = next(c for c in cases if c.case_id == "NET-001")
    assert case.expected_fault == "Wrong VLAN assignment"

def test_known_case_can_be_loaded_by_id():
    """Test that a known case can be retrieved using load_case_by_id."""
    case = load_case_by_id(REAL_CSV_PATH, "NET-010")
    assert case.case_id == "NET-010"
    assert case.title == "Router VLAN 10 Subinterface Shutdown"
    assert case.expected_fault == "GigabitEthernet0/0/0.10 is administratively down because shutdown is configured"

    # Non-existent ID should raise KeyError
    with pytest.raises(KeyError) as exc_info:
        load_case_by_id(REAL_CSV_PATH, "NET-999")
    assert "NET-999" in str(exc_info.value)

def test_missing_csv_path_produces_clear_error():
    """Test that loading from a non-existent CSV path raises FileNotFoundError."""
    non_existent_path = "non_existent_file.csv"
    with pytest.raises(FileNotFoundError) as exc_info:
        load_cases(non_existent_path)
    assert "could not be found" in str(exc_info.value)

def test_missing_required_csv_column_produces_clear_error(tmp_path):
    """Test that loading a CSV with missing required columns raises a ValueError."""
    # Write a temporary CSV missing the 'topology' column
    temp_csv = tmp_path / "missing_column.csv"
    headers = "case_id,title,symptome,expected-fault,osi_layer,concept,severity,expected_next_command,expected_fix\n"
    row = "NET-901,Test Title,Test Symptom,Test Fault,Layer 2,Concept,High,command,fix\n"
    temp_csv.write_text(headers + row, encoding="utf-8")

    with pytest.raises(ValueError) as exc_info:
        load_cases(str(temp_csv))
    assert "Required CSV columns are missing" in str(exc_info.value)
    assert "topology" in str(exc_info.value)

def test_blank_value_in_csv_produces_clear_error(tmp_path):
    """Test that a blank value in a required field raises a ValueError."""
    # Write a temporary CSV with an empty 'severity' field
    temp_csv = tmp_path / "blank_value.csv"
    headers = "case_id,title,symptome,topology,expected-fault,osi_layer,concept,severity,expected_next_command,expected_fix\n"
    row = "NET-902,Test Title,Test Symptom,Test Topology,Test Fault,Layer 2,Concept,,command,fix\n"
    temp_csv.write_text(headers + row, encoding="utf-8")

    with pytest.raises(ValueError) as exc_info:
        load_cases(str(temp_csv))
    assert "empty" in str(exc_info.value) or "missing" in str(exc_info.value)

def test_duplicate_case_id_produces_clear_error(tmp_path):
    """Test that duplicate case_id values in the CSV raise a ValueError."""
    temp_csv = tmp_path / "duplicate_ids.csv"
    headers = "case_id,title,symptome,topology,expected-fault,osi_layer,concept,severity,expected_next_command,expected_fix\n"
    row1 = "NET-903,Title1,Symptom1,Topology1,Fault1,Layer 2,Concept1,High,command1,fix1\n"
    row2 = "NET-903,Title2,Symptom2,Topology2,Fault2,Layer 3,Concept2,Medium,command2,fix2\n"
    temp_csv.write_text(headers + row1 + row2, encoding="utf-8")

    with pytest.raises(ValueError) as exc_info:
        load_cases(str(temp_csv))
    assert "Duplicate 'case_id' 'NET-903' detected" in str(exc_info.value)

def test_dataset_quality_check():
    """
    Perform dataset quality validation on the real cases.csv file:
    - Exactly 30 rows loaded.
    - case_id values are unique.
    - No required field in any row is blank, empty, or whitespace-only.
    """
    cases = load_cases(REAL_CSV_PATH)
    assert len(cases) == 30, f"Expected exactly 30 cases, but loaded {len(cases)}"

    case_ids = set()
    for case in cases:
        # Check unique IDs
        assert case.case_id not in case_ids, f"Duplicate case_id '{case.case_id}' found in dataset!"
        case_ids.add(case.case_id)

        # Check all string fields are not empty or blank
        for field_name, value in case.model_dump().items():
            assert isinstance(value, str), f"Field '{field_name}' in case {case.case_id} is not a string"
            assert value.strip() != "", f"Field '{field_name}' in case {case.case_id} is empty or only whitespace"
