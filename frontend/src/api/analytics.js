import { apiRequest } from './client';

export async function fetchAnalytics() {
  return await apiRequest('/analytics');
}

export async function fetchHealth() {
  return await apiRequest('/health');
}
