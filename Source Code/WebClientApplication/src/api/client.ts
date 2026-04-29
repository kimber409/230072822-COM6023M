import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

// Single Axios instance for all API calls.
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Adds the saved JWT to protected API requests.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('recruitflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Converts API error responses into normal Error objects for React Query.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const detailMessage = error.response?.data?.details
      ?.map((detail: { path: string; message: string }) => `${detail.path}: ${detail.message}`)
      .join(', ');
    return Promise.reject(new Error(detailMessage || error.response?.data?.error || 'Request failed'));
  }
);
