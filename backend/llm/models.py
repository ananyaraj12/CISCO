from pydantic import BaseModel, Field, field_validator
from typing import List

class AIDiagnosis(BaseModel):
    """
    Pydantic model representing the structured network diagnosis produced by the AI model.
    Matches the schema requirements outlined in diagnose_prompt.md.
    """
    root_cause: str = Field(..., description="The identified root cause of the troubleshooting issue.")
    confidence: float = Field(..., description="The confidence score of the diagnosis (must be between 0.0 and 1.0).")
    evidence: List[str] = Field(..., description="A list of facts, rule checker outputs, or observations supporting the diagnosis.")
    next_command: str = Field(..., description="The next useful Cisco command to verify or narrow down the diagnosis.")
    fix_steps: List[str] = Field(..., description="Step-by-step resolution configuration plan.")
    osi_layer: str = Field(..., description="The OSI Layer corresponding to the issue.")
    concept: str = Field(..., description="The core networking concept involved.")

    @field_validator("confidence")
    @classmethod
    def validate_confidence(cls, v: float) -> float:
        if not (0.0 <= v <= 1.0):
            raise ValueError("confidence must be between 0.0 and 1.0")
        return v
