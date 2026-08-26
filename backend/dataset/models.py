from pydantic import BaseModel, Field, model_validator

class NetworkCase(BaseModel):
    """
    Pydantic model representing a single network troubleshooting case from the CSV dataset.
    """
    case_id: str = Field(..., description="Unique case identifier (e.g., NET-001)")
    title: str = Field(..., description="Title of the case")
    symptome: str = Field(..., description="Symptom of the network issue (matches 'symptome' CSV column)")
    topology: str = Field(..., description="Network topology description")
    expected_fault: str = Field(..., description="Expected fault description (maps from 'expected-fault' CSV column)")
    osi_layer: str = Field(..., description="OSI layer where the fault occurs")
    concept: str = Field(..., description="Network concept related to the issue")
    severity: str = Field(..., description="Severity of the case (e.g., High, Medium, Low, None)")
    expected_next_command: str = Field(..., description="Expected next troubleshooting command")
    expected_fix: str = Field(..., description="Expected fix action")

    @model_validator(mode="after")
    def validate_non_empty_fields(self) -> "NetworkCase":
        """
        Validate that none of the required string fields are empty or contain only whitespace.
        """
        for field_name, value in self.__dict__.items():
            # Only validate fields defined on the model
            if field_name in self.__class__.model_fields:
                if isinstance(value, str) and not value.strip():
                    raise ValueError(f"Field '{field_name}' cannot be empty or only whitespace.")
        return self
