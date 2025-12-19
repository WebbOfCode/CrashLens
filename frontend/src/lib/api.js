import axios from 'axios';
import { API_BASE_URL } from './config';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API Methods
export const apiService = {
  // Health Check
  getHealth: () => api.get('/health'),

  // Incidents
  getIncidents: (bbox, criticality = null) => {
    const params = { bbox };
    if (criticality) params.criticality = criticality;
    return api.get('/api/incidents', { params });
  },

  // Traffic Flow
  getTrafficFlow: (bbox, maxPoints = 100) => {
    return api.get('/api/traffic-flow', {
      params: { bbox, max_points: maxPoints },
    });
  },

  // Risk Analysis
  analyzeRisk: (latitude, longitude, radius = 5000) => {
    return api.post('/api/risk-analysis', {
      latitude,
      longitude,
      radius,
    });
  },

  // Analytics
  getAnalyticsSummary: (bbox) => {
    const params = bbox ? { bbox } : {};
    return api.get('/api/analytics/summary', { params });
  },
};

export default api;
