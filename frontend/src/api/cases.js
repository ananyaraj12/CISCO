import { apiRequest } from './client';

export async function fetchAllCases() {
  return await apiRequest('/cases');
}

export async function fetchCaseById(caseId) {
  return await apiRequest(`/cases/${caseId}`);
}
