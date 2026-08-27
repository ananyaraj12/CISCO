import { apiRequest } from './client';

export async function fetchCaseEvidence(caseId) {
  return await apiRequest(`/cases/${caseId}/evidence`);
}

export async function fetchPacketTracerFiles() {
  return await apiRequest('/packet-tracer-files');
}

export function getDownloadPktUrl(caseId) {
  return `http://localhost:8000/cases/${caseId}/download-pkt`;
}

export function getDownloadEvidenceUrl(caseId) {
  return `http://localhost:8000/cases/${caseId}/download-evidence`;
}

