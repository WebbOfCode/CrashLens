import { useQuery } from '@tanstack/react-query';
import { apiService } from '../lib/api';
import { INCIDENT_REFRESH_INTERVAL } from '../lib/config';

export function useIncidents(bbox, criticality = null) {
  return useQuery({
    queryKey: ['incidents', bbox, criticality],
    queryFn: async () => {
      const response = await apiService.getIncidents(bbox, criticality);
      return response.data;
    },
    enabled: !!bbox,
    refetchInterval: INCIDENT_REFRESH_INTERVAL,
  });
}

export function useTrafficFlow(bbox) {
  return useQuery({
    queryKey: ['traffic-flow', bbox],
    queryFn: async () => {
      const response = await apiService.getTrafficFlow(bbox);
      return response.data;
    },
    enabled: !!bbox,
  });
}

export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const response = await apiService.getAnalyticsSummary();
      return response.data;
    },
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
}
