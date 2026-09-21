// src/components/analytics/HeatMap.tsx
'use client';

import { useMemo } from 'react';
import type { HeatmapData } from '@/types/models';

interface HeatMapProps {
  data: HeatmapData[];
  height?: number;
}

export function HeatMap({ data, height = 400 }: HeatMapProps) {
  // Group data by state and calculate averages
  const stateData = useMemo(() => {
    const grouped = data.reduce((acc, item) => {
      const state = item.state || 'Unknown';
      if (!acc[state]) {
        acc[state] = {
          heat_index: [],
          median_sale_price: [],
          inventory: [],
        };
      }
      if (item.heat_index !== null && item.heat_index !== undefined) {
        acc[state].heat_index.push(item.heat_index);
      }
      if (item.median_sale_price !== null && item.median_sale_price !== undefined) {
        acc[state].median_sale_price.push(item.median_sale_price);
      }
      if (item.inventory !== null && item.inventory !== undefined) {
        acc[state].inventory.push(item.inventory);
      }
      return acc;
    }, {} as Record<string, { heat_index: number[]; median_sale_price: number[]; inventory: number[] }>);

    return Object.entries(grouped).map(([state, values]) => ({
      state,
      avgHeat: values.heat_index.reduce((a, b) => a + b, 0) / values.heat_index.length || 0,
      avgPrice: values.median_sale_price.reduce((a, b) => a + b, 0) / values.median_sale_price.length || 0,
      totalInventory: values.inventory.reduce((a, b) => a + b, 0),
    }))
    .sort((a, b) => b.avgHeat - a.avgHeat);
  }, [data]);

  // Get color based on heat index
  const getHeatColor = (heat: number) => {
    if (heat >= 70) return 'bg-red-500';
    if (heat >= 60) return 'bg-orange-500';
    if (heat >= 50) return 'bg-yellow-500';
    if (heat >= 40) return 'bg-green-500';
    return 'bg-blue-500';
  };

  return (
    <div className="space-y-4" style={{ height }}>
      {/* Legend */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-muted-foreground">Heat Index:</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded" />
          <span>0-40</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded" />
          <span>40-50</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded" />
          <span>50-60</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-500 rounded" />
          <span>60-70</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded" />
          <span>70+</span>
        </div>
      </div>

      {/* State Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 overflow-auto" style={{ maxHeight: height - 60 }}>
        {stateData.map((item) => (
          <div
            key={item.state}
            className={`${getHeatColor(item.avgHeat)} p-4 rounded-xl text-white cursor-pointer hover:opacity-90 transition-opacity shadow-lg border border-white/20`}
            title={`${item.state}: Heat ${item.avgHeat.toFixed(1)}, Avg Price AED ${(item.avgPrice / 1000000).toFixed(2)}M`}
          >
            <div className="font-bold text-base">{item.state}</div>
            <div className="text-xs font-mono opacity-90">Heat: {item.avgHeat.toFixed(1)}</div>
            <div className="text-xs font-mono font-semibold opacity-90">AED {(item.avgPrice / 1000000).toFixed(2)}M</div>
          </div>
        ))}
      </div>
    </div>
  );
}