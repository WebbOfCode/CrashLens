// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Map Configuration
export const DEFAULT_MAP_CENTER = [36.1627, -86.7816]; // Nashville, TN
export const DEFAULT_MAP_ZOOM = 12;

// Update intervals (milliseconds)
export const INCIDENT_REFRESH_INTERVAL = 60000; // 1 minute
export const TRAFFIC_FLOW_REFRESH_INTERVAL = 30000; // 30 seconds

// Risk Analysis
export const RISK_LEVELS = {
  LOW: { label: 'Low Risk', color: '#10b981', threshold: 30 },
  MODERATE: { label: 'Moderate Risk', color: '#f59e0b', threshold: 70 },
  HIGH: { label: 'High Risk', color: '#ef4444', threshold: 100 },
};

// Incident Severities
export const SEVERITY_CONFIG = {
  critical: { label: 'Critical', color: '#dc2626', icon: '🚨' },
  major: { label: 'Major', color: '#ea580c', icon: '⚠️' },
  minor: { label: 'Minor', color: '#ca8a04', icon: '⚡' },
  low: { label: 'Low', color: '#65a30d', icon: 'ℹ️' },
};
