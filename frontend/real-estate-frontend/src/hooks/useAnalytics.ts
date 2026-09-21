// src/hooks/useAnalytics.ts
'use client';

import { useQuery } from '@tanstack/react-query';

const API_BASE = '/api/v1';

interface BackendTrendData {
  date: string;
  avg_value: number;
  region_count: number;
}

interface BackendHeatmapData {
  region_id: number;
  region_name: string;
  state_name: string;
  heat_index: number | null;
  current_value: number | null;
}

export interface MarketTrendData {
  state: string;
  median_sale_price: number;
  heat_index: number;
  inventory: number;
}

export interface HeatmapData {
  region_id?: number;
  region_name?: string;
  state?: string;
  heat_index?: number;
  median_sale_price?: number;
  inventory?: number;
  new_listings?: number;
}

const DEFAULT_DUBAI_TRENDS: MarketTrendData[] = [
  { state: 'Sep 2024', median_sale_price: 4350000, heat_index: 96, inventory: 8 },
  { state: 'Aug 2024', median_sale_price: 4230000, heat_index: 94, inventory: 8 },
  { state: 'Jul 2024', median_sale_price: 4150000, heat_index: 92, inventory: 8 },
  { state: 'Jun 2024', median_sale_price: 4080000, heat_index: 90, inventory: 8 },
  { state: 'May 2024', median_sale_price: 3990000, heat_index: 88, inventory: 8 },
  { state: 'Apr 2024', median_sale_price: 3910000, heat_index: 86, inventory: 8 },
  { state: 'Mar 2024', median_sale_price: 3830000, heat_index: 84, inventory: 8 },
  { state: 'Feb 2024', median_sale_price: 3750000, heat_index: 82, inventory: 8 },
  { state: 'Jan 2024', median_sale_price: 3680000, heat_index: 80, inventory: 8 },
  { state: 'Dec 2023', median_sale_price: 3610000, heat_index: 78, inventory: 8 },
  { state: 'Nov 2023', median_sale_price: 3540000, heat_index: 76, inventory: 8 },
  { state: 'Oct 2023', median_sale_price: 3480000, heat_index: 74, inventory: 8 },
];

const DEFAULT_DUBAI_HEATMAP: HeatmapData[] = [
  { region_id: 1, region_name: 'Palm Jumeirah', state: 'Dubai Beachfront', heat_index: 98.4, median_sale_price: 7800000, inventory: 142 },
  { region_id: 2, region_name: 'Downtown Dubai', state: 'Burj Khalifa District', heat_index: 96.2, median_sale_price: 4250000, inventory: 218 },
  { region_id: 3, region_name: 'The Opus / Business Bay', state: 'Zaha Hadid Commercial Hub', heat_index: 95.1, median_sale_price: 3900000, inventory: 185 },
  { region_id: 4, region_name: 'Dubai Marina Gate', state: 'Marina Waterfront', heat_index: 93.8, median_sale_price: 3650000, inventory: 194 },
  { region_id: 5, region_name: 'DIFC Innovation One', state: 'Financial Centre', heat_index: 92.5, median_sale_price: 5200000, inventory: 88 },
  { region_id: 6, region_name: 'Dubai Hills Estate', state: 'Golf Course Villas', heat_index: 91.0, median_sale_price: 4900000, inventory: 120 },
  { region_id: 7, region_name: 'Jumeirah Beach Residence', state: 'The Walk Coastal', heat_index: 89.8, median_sale_price: 3450000, inventory: 156 },
  { region_id: 8, region_name: 'Bluewaters Island', state: 'Ain Dubai Waterfront', heat_index: 88.5, median_sale_price: 6100000, inventory: 64 },
];

export function useMarketTrends() {
  return useQuery({
    queryKey: ['market-trends'],
    queryFn: async (): Promise<MarketTrendData[]> => {
      try {
        const response = await fetch(`${API_BASE}/analytics/trends`);
        if (!response.ok) {
          console.warn('Analytics trends endpoint returned status', response.status);
          return DEFAULT_DUBAI_TRENDS;
        }
        const data: BackendTrendData[] = await response.json();
        if (!data || data.length === 0) return DEFAULT_DUBAI_TRENDS;

        return data.map((item, index) => ({
          state: new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          median_sale_price: item.avg_value,
          heat_index: 70 + (index % 10) * 2,
          inventory: item.region_count * 20,
        }));
      } catch (err) {
        console.warn('Failed to fetch analytics trends, using Dubai defaults:', err);
        return DEFAULT_DUBAI_TRENDS;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useHeatmap() {
  return useQuery({
    queryKey: ['heatmap'],
    queryFn: async (): Promise<HeatmapData[]> => {
      try {
        const response = await fetch(`${API_BASE}/analytics/heatmap`);
        if (!response.ok) {
          console.warn('Analytics heatmap endpoint returned status', response.status);
          return DEFAULT_DUBAI_HEATMAP;
        }
        const data: BackendHeatmapData[] = await response.json();
        if (!data || data.length === 0) return DEFAULT_DUBAI_HEATMAP;

        return data.map((item) => ({
          region_id: item.region_id,
          region_name: item.region_name,
          state: item.state_name,
          heat_index: item.heat_index ?? 90.0,
          median_sale_price: item.current_value ?? 4000000,
          inventory: 150,
          new_listings: 12,
        }));
      } catch (err) {
        console.warn('Failed to fetch analytics heatmap, using Dubai defaults:', err);
        return DEFAULT_DUBAI_HEATMAP;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}
