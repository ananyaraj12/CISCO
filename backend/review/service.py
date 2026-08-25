import os
import json
from typing import List, Dict, Any
from backend.review.models import HumanReview, DecisionEnum

def load_reviews(filepath: str) -> List[HumanReview]:
    """
    Loads all saved reviews from the specified JSON file.
    If the file does not exist, returns an empty list.
    """
    if not os.path.exists(filepath):
        return []
        
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            if not isinstance(data, list):
                return []
            return [HumanReview(**item) for item in data]
    except (json.JSONDecodeError, ValueError):
        # Return an empty list if the JSON file is empty or malformed
        return []

def save_review(review: HumanReview, filepath: str) -> None:
    """
    Appends a validated review to the list in the specified JSON file and saves it.
    """
    # Load any existing reviews first to avoid overwriting them
    reviews = load_reviews(filepath)
    
    # Append the new validated review
    reviews.append(review)
    
    # Ensure the parent directory exists
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    
    # Write the updated list back to the JSON file as a pretty-printed array
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump([r.model_dump() for r in reviews], f, indent=2, ensure_ascii=False)

def create_review(review_data: Dict[str, Any]) -> HumanReview:
    """
    Creates and validates a HumanReview object from raw input data.
    """
    return HumanReview(**review_data)

def calculate_statistics(reviews: List[HumanReview]) -> Dict[str, Any]:
    """
    Calculates key metrics about human reviews and model alignment.
    
    Calculates:
      - total_reviews: total number of reviews analyzed
      - accepted: count of reviews with decision ACCEPTED
      - edited: count of reviews with decision EDITED
      - rejected: count of reviews with decision REJECTED
      - corrected_cases: count of reviews with decision EDITED or REJECTED
      - ai_human_agreement_rate: percentage of ACCEPTED reviews over total_reviews
    """
    total_reviews = len(reviews)
    if total_reviews == 0:
        return {
            "total_reviews": 0,
            "accepted": 0,
            "edited": 0,
            "rejected": 0,
            "corrected_cases": 0,
            "ai_human_agreement_rate": 0.0
        }
        
    accepted = sum(1 for r in reviews if r.decision == DecisionEnum.ACCEPTED)
    edited = sum(1 for r in reviews if r.decision == DecisionEnum.EDITED)
    rejected = sum(1 for r in reviews if r.decision == DecisionEnum.REJECTED)
    
    corrected_cases = edited + rejected
    ai_human_agreement_rate = (accepted / total_reviews) * 100.0
    
    return {
        "total_reviews": total_reviews,
        "accepted": accepted,
        "edited": edited,
        "rejected": rejected,
        "corrected_cases": corrected_cases,
        "ai_human_agreement_rate": ai_human_agreement_rate
    }
