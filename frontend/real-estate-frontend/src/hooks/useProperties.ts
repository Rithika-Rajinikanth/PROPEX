// src/hooks/useProperties.ts

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Region } from '@/types/models';

export function useProperties(params?: {
  state?: string;
  region_type?: string;
  limit?: number;
  offset?: number;
}): {
  data: Region[] | undefined;
  isLoading: boolean;
  error: Error | null;
} {
  const query = useQuery<Region[], Error>({
    queryKey: ['properties', params],
    queryFn: () => api.getRegions(params),
    enabled: !!params,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error ?? null,
  };
}

export function useProperty(id: number) {
  return useQuery({
    queryKey: ['property', id],
    queryFn: () => api.getRegion(id),
    enabled: !!id,
  });
}

export function usePropertyMetrics(id: number) {
  return useQuery({
    queryKey: ['property-metrics', id],
    queryFn: () => api.getRegionMetrics(id),
    enabled: !!id,
  });
}

export function usePropertyTrends(
  id: number,
  params?: { metric?: string; months?: number }
) {
  return useQuery({
    queryKey: ['property-trends', id, params],
    queryFn: () => api.getRegionTrends(id, params),
    enabled: !!id,
  });
}

// ✅ NEW: Semantic search
export function useSemanticSearch(query: string, options?: {
  limit?: number;
  state?: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ['semantic-search', query, options?.limit, options?.state],
    queryFn: () => api.semanticSearch({
      q: query,
      limit: options?.limit,
      state: options?.state,
    }),
    enabled: options?.enabled !== false && query.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}