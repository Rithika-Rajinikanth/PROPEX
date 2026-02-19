// src/hooks/useRegions.ts

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useRegions(params?: {
  state?: string;
  region_type?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['regions', params],
    queryFn: () => api.getRegions(params),
  });
}

export function useRegion(id: number) {
  return useQuery({
    queryKey: ['region', id],
    queryFn: () => api.getRegion(id),
    enabled: !!id,
  });
}

export function useRegionMetrics(id: number) {
  return useQuery({
    queryKey: ['region-metrics', id],
    queryFn: () => api.getRegionMetrics(id),
    enabled: !!id,
  });
}

export function useRegionTrends(
  id: number,
  params?: { metric?: string; months?: number }
) {
  return useQuery({
    queryKey: ['region-trends', id, params],
    queryFn: () => api.getRegionTrends(id, params),
    enabled: !!id,
  });
}