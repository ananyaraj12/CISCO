from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field, model_validator

class DecisionEnum(str, Enum):
    """
    Enum representing the human reviewer's decision on the AI-generated diagnosis.
    """
    ACCEPTED = "ACCEPTED"
    EDITED = "EDITED"
    REJECTED = "REJECTED"

class HumanReview(BaseModel):
    """
    Pydantic model representing a human review for an AI-generated network diagnosis.
    Includes fields for the human reviewer's final decision, corrective inputs, and justification.
    """
    case_id: str = Field(..., description="The identifier of the troubleshooting case.")
    ai_root_cause: str = Field(..., description="The root cause diagnosed by the AI.")
    ai_confidence: float = Field(..., description="The confidence score assigned by the AI.")
    decision: DecisionEnum = Field(..., description="The decision of the human reviewer (ACCEPTED, EDITED, REJECTED).")
    human_correction: Optional[str] = Field(None, description="The human corrected root cause or feedback.")
    correction_reason: Optional[str] = Field(None, description="The reason behind the human correction or rejection.")
    reviewer: str = Field(..., description="The identifier/username of the network engineer performing the review.")
    timestamp: str = Field(..., description="The ISO 8601 formatted timestamp of the review.")

    @model_validator(mode="after")
    def validate_human_oversight_fields(self) -> "HumanReview":
        """
        Enforce the requirement that EDITED and REJECTED reviews must include 
        both human_correction and correction_reason.
        """
        # If the human decides to EDIT the AI diagnosis, they must specify the correction and the reason.
        if self.decision == DecisionEnum.EDITED:
            if not self.human_correction or not self.human_correction.strip():
                raise ValueError("human_correction is required when decision is EDITED.")
            if not self.correction_reason or not self.correction_reason.strip():
                raise ValueError("correction_reason is required when decision is EDITED.")
        
        # If the human decides to REJECT the AI diagnosis, they must specify the correction and the reason.
        elif self.decision == DecisionEnum.REJECTED:
            if not self.human_correction or not self.human_correction.strip():
                raise ValueError("human_correction is required when decision is REJECTED.")
            if not self.correction_reason or not self.correction_reason.strip():
                raise ValueError("correction_reason is required when decision is REJECTED.")
                
        return self
