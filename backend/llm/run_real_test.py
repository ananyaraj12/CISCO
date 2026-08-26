import os
import sys
from dotenv import load_dotenv

# Ensure backend package can be imported correctly
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.abspath(os.path.join(current_dir, "..", ".."))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from backend.dataset.loader import load_cases
from backend.diagnosis.service import DiagnosisService
from backend.llm.service import GeminiDiagnosisService

def main():
    # 1. Load the .env file using python-dotenv
    load_dotenv()

    # 2. Verify GEMINI_API_KEY exists, but NEVER print or expose its value
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY is missing from environment variables.", file=sys.stderr)
        sys.exit(1)

    # 3. Load NET-001 from CSV
    csv_path = os.path.abspath(os.path.join(current_dir, "..", "data", "cases.csv"))
    try:
        cases = load_cases(csv_path)
    except Exception as e:
        print(f"Error loading CSV dataset: {str(e)}", file=sys.stderr)
        sys.exit(1)

    case = next((c for c in cases if c.case_id == "NET-001"), None)
    if not case:
        print("Error: Case NET-001 not found in dataset.", file=sys.stderr)
        sys.exit(1)

    # 4. Prepare context (does not contain expected answers)
    diagnosis_service = DiagnosisService()
    context = diagnosis_service.prepare_diagnosis_context(case)

    # 5. Initialize Gemini service
    try:
        llm_service = GeminiDiagnosisService()
    except Exception as e:
        print(f"Error initializing Gemini service: {str(e)}", file=sys.stderr)
        sys.exit(1)

    # 6. Call live Gemini API (exactly once)
    print(f"Sending live request for case {case.case_id} using model {llm_service.model_name}...")
    try:
        diagnosis_result = llm_service.diagnose(context)
    except Exception as e:
        # Avoid print of sensitive context/keys, print safe class name and message
        print(f"Error during Gemini diagnosis call: {str(e)}", file=sys.stderr)
        sys.exit(1)

    # 7. Print fields as requested
    print("\n==================================================")
    print("REAL GEMINI DIAGNOSIS OUTCOME")
    print("==================================================")
    print(f"case_id: {context.case_id}")
    print(f"model: {llm_service.model_name}")
    print(f"root_cause: {diagnosis_result.root_cause}")
    print(f"confidence: {diagnosis_result.confidence}")
    print(f"evidence: {diagnosis_result.evidence}")
    print(f"next_command: {diagnosis_result.next_command}")
    print(f"fix_steps: {diagnosis_result.fix_steps}")
    print(f"osi_layer: {diagnosis_result.osi_layer}")
    print(f"concept: {diagnosis_result.concept}")
    print("==================================================")

if __name__ == "__main__":
    main()
