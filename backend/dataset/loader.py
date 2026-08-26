import csv
import os
from typing import List
from .models import NetworkCase

REQUIRED_COLUMNS = [
    "case_id",
    "title",
    "symptome",
    "topology",
    "expected-fault",
    "osi_layer",
    "concept",
    "severity",
    "expected_next_command",
    "expected_fix"
]

def load_cases(csv_path: str) -> List[NetworkCase]:
    """
    Loads and validates all network cases from a CSV file.

    Args:
        csv_path (str): Absolute or relative path to the cases CSV file.

    Returns:
        List[NetworkCase]: A list of NetworkCase Pydantic objects.

    Raises:
        FileNotFoundError: If the CSV file cannot be found.
        ValueError: If the CSV format is invalid, required columns are missing,
                    any cell is empty, or case_id values are duplicate.
    """
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"The CSV file at '{csv_path}' could not be found.")

    cases = []
    seen_case_ids = set()

    with open(csv_path, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)

        if reader.fieldnames is None:
            raise ValueError("The CSV file is empty and has no headers.")

        # Validate that all required columns exist in the header
        missing_columns = [col for col in REQUIRED_COLUMNS if col not in reader.fieldnames]
        if missing_columns:
            raise ValueError(f"Required CSV columns are missing: {', '.join(missing_columns)}")

        for line_num, row in enumerate(reader, start=2): # Line 1 is headers, data starts at line 2
            case_id = row.get("case_id")
            if not case_id or not case_id.strip():
                raise ValueError(f"Line {line_num}: 'case_id' is missing or empty.")

            if case_id in seen_case_ids:
                raise ValueError(f"Line {line_num}: Duplicate 'case_id' '{case_id}' detected.")

            seen_case_ids.add(case_id)

            # Construct input data for NetworkCase, mapping 'expected-fault' -> 'expected_fault'
            mapped_data = {}
            for col in REQUIRED_COLUMNS:
                val = row.get(col)
                if val is None or not val.strip():
                    raise ValueError(f"Line {line_num} (Case ID: {case_id}): Required field '{col}' is empty or missing.")

                if col == "expected-fault":
                    mapped_data["expected_fault"] = val
                else:
                    mapped_data[col] = val

            try:
                # This will trigger Pydantic model validation
                case = NetworkCase(**mapped_data)
                cases.append(case)
            except Exception as e:
                raise ValueError(f"Line {line_num} (Case ID: {case_id}): Model validation failed: {e}")

    return cases

def load_case_by_id(csv_path: str, case_id: str) -> NetworkCase:
    """
    Retrieves a single network case matching the specified case_id.

    Args:
        csv_path (str): Path to the CSV file.
        case_id (str): The unique ID of the case to retrieve.

    Returns:
        NetworkCase: The matching NetworkCase instance.

    Raises:
        KeyError: If the case_id does not exist.
        FileNotFoundError: If the CSV file is not found.
        ValueError: If loading/validation of CSV fails.
    """
    cases = load_cases(csv_path)
    for case in cases:
        if case.case_id == case_id:
            return case
    raise KeyError(f"NetworkCase with case_id '{case_id}' not found.")
