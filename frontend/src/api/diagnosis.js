import { apiRequest } from './client';

export async function fetchDiagnosis(caseId) {
  return await apiRequest(`/diagnosis/${caseId}`);
}

export async function triggerDiagnosis(caseId) {
  return await apiRequest('/diagnose', {
    method: 'POST',
    body: JSON.stringify({ case_id: caseId }),
  });
}
