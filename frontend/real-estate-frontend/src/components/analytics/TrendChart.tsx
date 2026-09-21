// src/components/analytics/TrendChart.tsx - FINAL FIX
'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { MarketTrendData } from '@/types/models';

interface TrendChartProps {
  data: MarketTrendData[];
  height?: number;
}

export function TrendChart({ data, height = 300 }: TrendChartProps) {
  // Transform data for chart
  const chartData = data.map((item) => ({
    name: item.state || 'Unknown',
    price: item.median_sale_price,
    heat: item.heat_index,
    inventory: item.inventory,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 14% 20%)" />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          angle={-45}
          textAnchor="end"
          height={80}
          axisLine={{ stroke: 'rgba(6, 182, 212, 0.2)' }}
          tickLine={false}
        />
        <YAxis 
          yAxisId="left"
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          label={{ value: 'Price (AED)', angle: -90, position: 'insideLeft', fill: '#06b6d4', fontSize: 11 }}
          axisLine={{ stroke: 'rgba(6, 182, 212, 0.2)' }}
          tickLine={false}
        />
        <YAxis 
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          label={{ value: 'Heat Index', angle: 90, position: 'insideRight', fill: '#f59e0b', fontSize: 11 }}
          axisLine={{ stroke: 'rgba(6, 182, 212, 0.2)' }}
          tickLine={false}
        />
        <Tooltip 
          contentStyle={{ 
            background: '#060A14', 
            border: '1px solid rgba(6, 182, 212, 0.4)', 
            borderRadius: '12px',
            color: '#f8fafc',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}
          formatter={(value: any, name: any) => {
            if (value === undefined || value === null) return ['N/A', String(name)];
            
            const nameStr = String(name);
            
            if (nameStr === 'price') {
              return [`AED ${Number(value).toLocaleString()}`, 'Median Price'];
            }
            if (nameStr === 'heat') {
              return [Number(value).toFixed(1), 'Heat Index'];
            }
            return [Number(value).toLocaleString(), nameStr];
          }}
        />
        <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="price"
          stroke="#06b6d4"
          strokeWidth={2.5}
          name="Median Price (AED)"
          dot={{ r: 3, fill: '#06b6d4', strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#22d3ee' }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="heat"
          stroke="#f59e0b"
          strokeWidth={2}
          name="Heat Index"
          dot={{ r: 3, fill: '#f59e0b', strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#fbbf24' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
