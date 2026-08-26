from typing import Optional
from pydantic import BaseModel, Field
from backend.llm.models import AIDiagnosis
from backend.review.models import DecisionEnum

class DiagnoseRequest(BaseModel):
    """Request schema for triggers AI diagnosis for a case ID."""
    case_id: str = Field(..., description="The case ID to diagnose (e.g. NET-001).")

class DiagnoseResponse(BaseModel):
    """Response schema containing the case ID and the structured AI diagnosis."""
    case_id: str
    diagnosis: AIDiagnosis

class ReviewRequest(BaseModel):
    """Request schema for submitting a human review on an AI diagnosis."""
    case_id: str = Field(..., description="The identifier of the troubleshooting case.")
    ai_root_cause: str = Field(..., description="The root cause diagnosed by the AI.")
    ai_confidence: float = Field(..., description="The confidence score assigned by the AI.")
    decision: DecisionEnum = Field(..., description="The decision of the human reviewer (ACCEPTED, EDITED, REJECTED).")
    human_correction: Optional[str] = Field(None, description="The human corrected root cause or feedback.")
    correction_reason: Optional[str] = Field(None, description="The reason behind the human correction or rejection.")
    reviewer: str = Field(..., description="The identifier/username of the network engineer performing the review.")
