import os
import json
from typing import List
from pydantic import BaseModel, Field
from backend.dataset.models import NetworkCase
from backend.rule_checker.models import NetworkState, RuleResult
from backend.rule_checker.checker import NetworkRuleChecker

class DiagnosisContext(BaseModel):
    """
    Pydantic model representing the structured diagnostic context prepared for the LLM.
    """
    case_id: str = Field(..., description="Unique identifier of the troubleshooting case.")
    symptom: str = Field(..., description="Symptom of the network issue (mapped from CSV's symptome field).")
    topology: str = Field(..., description="Network topology of the case.")
    rule_checker_results: List[RuleResult] = Field(..., description="Results from the deterministic Rule Checker.")
    structured_evidence_available: bool = Field(..., description="Flag indicating if structured network-state evidence is available.")
    evidence_note: str = Field(..., description="Explanation of the evidence status (e.g., indicating structured network-state data is unavailable).")
    prompt: str = Field(..., description="The fully prepared prompt ready to be sent to the LLM.")

class DiagnosisService:
    """
    Service responsible for converting network troubleshooting cases into
    structured diagnosis contexts for the AI model.
    """
    def __init__(self, prompt_template_path: str = None):
        if prompt_template_path is None:
            # Resolve the default path relative to this file
            current_dir = os.path.dirname(os.path.abspath(__file__))
            prompt_template_path = os.path.abspath(
                os.path.join(current_dir, "..", "prompts", "diagnose_prompt.md")
            )
        self.prompt_template_path = prompt_template_path
        self.instructions = ""
        self._load_prompt_instructions()

    def _load_prompt_instructions(self):
        """Loads diagnostic instructions from the prompt template markdown file."""
        if not os.path.exists(self.prompt_template_path):
            raise FileNotFoundError(f"Prompt template file not found at '{self.prompt_template_path}'")
        with open(self.prompt_template_path, "r", encoding="utf-8") as f:
            self.instructions = f.read()

    def prepare_diagnosis_context(self, case: NetworkCase) -> DiagnosisContext:
        """
        Prepares the diagnosis context for the given network case. Runs the deterministic
        Rule Checker, collects results, and generates the diagnostic prompt.

        Args:
            case (NetworkCase): The case loaded from the CSV dataset.

        Returns:
            DiagnosisContext: The structured context object.
        """
        # 1. Use a minimal/empty NetworkState as no structured evidence is available in the CSV row
        network_state = NetworkState(devices=[])

        # 2. Run the deterministic Rule Checker on the minimal state
        checker = NetworkRuleChecker()
        rule_results = checker.check_network(network_state)

        # 3. Evidence availability and explanation notes
        structured_evidence_available = False
        evidence_note = (
            "The CSV case does not contain structured interface, IP, VLAN, gateway, "
            "or routing data required for deterministic network-state checks. Therefore, "
            "structured network-state data is unavailable."
        )

        # 4. Serialize Rule Checker results for inclusion in the prompt
        serialized_results = [r.model_dump() for r in rule_results]
        results_json_str = json.dumps(serialized_results, indent=2)

        # 5. Construct prompt containing instructions, symptom, topology, evidence note, and checker results.
        # Do not include expected-fault, expected_next_command, expected_fix, osi_layer, or concept.
        prompt = f"""{self.instructions}

### Symptom
{case.symptome}

### Topology Note
{case.topology}

### Evidence Availability
{evidence_note}

### Rule Checker Results
{results_json_str}
"""

        # 6. Construct and return the structured DiagnosisContext
        return DiagnosisContext(
            case_id=case.case_id,
            symptom=case.symptome,
            topology=case.topology,
            rule_checker_results=rule_results,
            structured_evidence_available=structured_evidence_available,
            evidence_note=evidence_note,
            prompt=prompt
        )
