// src/hooks/useSearch.ts

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { SearchQuery } from '@/types/models';

export function useSearch(query: SearchQuery) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => api.searchProperties(query),
    enabled: Object.keys(query).length > 0,
  });
}

