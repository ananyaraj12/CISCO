import os
import json
from google import genai
from google.genai import types
from backend.diagnosis.service import DiagnosisContext
from backend.llm.models import AIDiagnosis

class GeminiConfigurationError(Exception):
    """Raised when environment variables or configurations are missing or invalid."""
    pass

class GeminiAPIError(Exception):
    """Raised when the Gemini API request fails due to network, auth, or server issues."""
    pass

class GeminiEmptyResponseError(Exception):
    """Raised when the Gemini API returns an empty response."""
    pass

class GeminiInvalidJSONError(Exception):
    """Raised when the Gemini API response cannot be parsed as valid JSON."""
    pass

class GeminiValidationError(Exception):
    """Raised when the Gemini response fails Pydantic schema validation."""
    pass

class GeminiDiagnosisService:
    """
    Service responsible for calling the Gemini API with structured output configuration
    and parsing/validating the response using the AIDiagnosis model.
    """
    def __init__(self):
        # 1. Securely fetch GEMINI_API_KEY from environment variables
        self.api_key = os.environ.get("GEMINI_API_KEY")
        if not self.api_key:
            raise GeminiConfigurationError("GEMINI_API_KEY environment variable is not configured.")

        # 2. Get configurable model name (defaults to gemini-3.6-flash)
        self.model_name = os.environ.get("GEMINI_MODEL", "gemini-3.6-flash")

        # 3. Initialize the Google GenAI Client
        try:
            self.client = genai.Client(api_key=self.api_key)
        except Exception as e:
            raise GeminiConfigurationError(f"Failed to initialize Gemini client: {str(e)}")

    def diagnose(self, context: DiagnosisContext) -> AIDiagnosis:
        """
        Sends the diagnosis context prompt to Gemini, requesting a structured JSON
        response conforming to the AIDiagnosis schema.

        Args:
            context (DiagnosisContext): The prepared diagnostic context with instructions,
                                        symptoms, topology, and rule checker results.

        Returns:
            AIDiagnosis: The validated diagnosis object.
        """
        # Call Gemini API
        try:
            config = types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=AIDiagnosis,
            )
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=context.prompt,
                config=config,
            )
        except Exception as e:
            # Secure error handling: avoid exposing API keys or credentials in exceptions
            raise GeminiAPIError(f"Gemini API request failed: {str(e)}")

        # Validate that the response text is present
        if not response or not response.text or not response.text.strip():
            raise GeminiEmptyResponseError("Gemini API returned an empty or null response.")

        # Parse JSON output
        try:
            parsed_data = json.loads(response.text)
        except json.JSONDecodeError as e:
            raise GeminiInvalidJSONError(f"Gemini response text is not valid JSON: {str(e)}")

        # Validate against the AIDiagnosis schema using Pydantic
        try:
            validated_diagnosis = AIDiagnosis.model_validate(parsed_data)
        except Exception as e:
            raise GeminiValidationError(f"Gemini response does not conform to AIDiagnosis schema: {str(e)}")

        return validated_diagnosis
