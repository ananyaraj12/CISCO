import { apiRequest } from './client';

export async function fetchCaseEvidence(caseId) {
  return await apiRequest(`/cases/${caseId}/evidence`);
}

export async function fetchPacketTracerFiles() {
  return await apiRequest('/packet-tracer-files');
}
