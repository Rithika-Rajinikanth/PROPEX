// src/components/analytics/MetricCards.tsx
'use client';

import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Home, DollarSign, Activity } from 'lucide-react';
import type { MarketTrendData } from '@/types/models';

interface MetricCardsProps {
  totalProperties: number;
  avgHeatIndex: number;
  avgPrice: number;
  trendsData: MarketTrendData[];
}

export function MetricCards({ 
  totalProperties, 
  avgHeatIndex, 
  avgPrice,
  trendsData 
}: MetricCardsProps) {
  // Calculate trend from last two data points
  const calculateTrend = () => {
    if (trendsData.length < 2) return 0;
    const latest = trendsData[trendsData.length - 1];
    const previous = trendsData[trendsData.length - 2];
    return ((latest.median_sale_price - previous.median_sale_price) / previous.median_sale_price) * 100;
  };

  const priceTrend = calculateTrend();

  const metrics = [
    {
      title: 'Total Active Inventory',
      value: totalProperties.toLocaleString(),
      icon: Home,
      trend: null,
      trendLabel: 'verified tokenized units',
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/10 border-cyan-500/30',
    },
    {
      title: 'Average Market Price',
      value: `AED ${(avgPrice / 1000000).toFixed(2)}M`,
      icon: DollarSign,
      trend: priceTrend,
      trendLabel: 'vs last month',
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/30',
    },
    {
      title: 'Average Heat Index',
      value: avgHeatIndex.toFixed(1),
      icon: Activity,
      trend: null,
      trendLabel: 'investor heat score',
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10 border-amber-500/30',
    },
    {
      title: 'Active Prime Districts',
      value: (trendsData.length || 8).toLocaleString(),
      icon: TrendingUp,
      trend: null,
      trendLabel: 'districts tracked',
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/10 border-purple-500/30',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <Card key={index} className="p-5 hud-glass rounded-2xl border border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-200">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5 min-w-0">
              <p className="text-[10px] font-mono font-semibold tracking-[0.15em] uppercase text-slate-400">{metric.title}</p>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">{metric.value}</p>
              <div className="flex items-center gap-1.5 text-xs font-mono">
                {metric.trend !== null ? (
                  <>
                    {metric.trend > 0 ? (
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5 text-rose-400" />
                    )}
                    <span className={metric.trend > 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {metric.trend > 0 ? '+' : ''}{metric.trend.toFixed(1)}%
                    </span>
                    <span className="text-slate-500">{metric.trendLabel}</span>
                  </>
                ) : (
                  <span className="text-slate-500">{metric.trendLabel}</span>
                )}
              </div>
            </div>
            <div className={`p-2.5 rounded-xl border ${metric.iconBg} flex-shrink-0`}>
              <metric.icon className={`h-5 w-5 ${metric.iconColor}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
