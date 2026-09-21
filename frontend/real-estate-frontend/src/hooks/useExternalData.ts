// src/hooks/useExternalData.ts

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useRedfinData(regionName: string, state: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['redfin', regionName, state],
    queryFn: () => api.getRedfinData(regionName, state),
    enabled: enabled && !!regionName && !!state,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours (Redfin data cached in backend)
    retry: 1,
  });
}

export function useCrimeData(state: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['crime', state],
    queryFn: () => api.getCrimeData(state),
    enabled: enabled && !!state,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 1,
  });
}

export function useCombinedExternalData(
  regionName: string,
  state: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['external-combined', regionName, state],
    queryFn: () => api.getCombinedExternalData(regionName, state),
    enabled: enabled && !!regionName && !!state,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 1,
  });
}