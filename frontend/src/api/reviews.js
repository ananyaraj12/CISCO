import { apiRequest } from './client';

export async function submitHumanReview(reviewData) {
  const diagInfo = reviewData.original_diagnosis?.diagnosis || reviewData.original_diagnosis || {};
  
  // Map decision-specific fields to what the backend expects
  let humanCorrection = null;
  let correctionReason = null;
  
  if (reviewData.decision === 'EDITED') {
    humanCorrection = reviewData.corrected_root_cause || '';
    if (reviewData.corrected_fix) {
      humanCorrection += ` | CLI Fix: ${reviewData.corrected_fix}`;
    }
    correctionReason = reviewData.notes || 'Edited by network engineer';
  } else if (reviewData.decision === 'REJECTED') {
    humanCorrection = reviewData.corrected_root_cause || 'Rejected: physical configuration/uncategorized error';
    correctionReason = reviewData.rejection_reason || 'Rejected by network engineer';
  }
  
  const payload = {
    case_id: reviewData.case_id,
    ai_root_cause: diagInfo.root_cause || reviewData.original_diagnosis?.root_cause || 'Unknown root cause',
    ai_confidence: diagInfo.confidence || reviewData.original_diagnosis?.confidence || 0.92,
    decision: reviewData.decision,
    human_correction: humanCorrection,
    correction_reason: correctionReason,
    reviewer: reviewData.reviewer
  };

  return await apiRequest('/review', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchReviewHistory() {
  return await apiRequest('/review/history');
}

export async function fetchAiResponsesLog() {
  return await apiRequest('/logs/ai-responses');
}

export async function fetchCorrectionsLog() {
  return await apiRequest('/logs/corrections');
}
