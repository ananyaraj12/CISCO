// Centralized API client for NetSage-AI

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const FALLBACK_URL = '/api';


export async function apiRequest(endpoint, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const err = new Error(errorData.detail || `API Error: ${response.status} ${response.statusText}`);
      err.status = response.status;
      throw err;
    }
    return await response.json();
  } catch (error) {
    if (error.status) {
      throw error;
    }
    try {
      const fallbackResponse = await fetch(`${FALLBACK_URL}${endpoint}`, config);
      if (!fallbackResponse.ok) {
        const errorData = await fallbackResponse.json().catch(() => ({}));
        const err = new Error(errorData.detail || `Fallback API Error: ${fallbackResponse.status}`);
        err.status = fallbackResponse.status;
        throw err;
      }
      return await fallbackResponse.json();
    } catch (fallbackError) {
      console.error(`API Fetch Error [${endpoint}]:`, error);
      throw error;
    }
  }
}
