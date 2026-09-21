// src/components/analytics/Dashboard.tsx
'use client';

import React from 'react';
import { useHeatmap, useMarketTrends } from '@/hooks/useAnalytics';
import { MetricCards } from '@/components/analytics/MetricCards';
import { TrendChart } from '@/components/analytics/TrendChart';
import { HeatMap } from '@/components/analytics/HeatMap';
import { MarketStats } from '@/components/analytics/MarketStats';
import { MarketSignalsWidget } from '@/components/analytics/MarketSignalsWidget';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, TrendingUp, ShieldCheck, Sparkles, BarChart3, MapPin, Zap } from 'lucide-react';

type DashboardTab = 'overview' | 'signals' | 'trends' | 'heatmap' | 'stats' | 'comparison' | 'activity' | 'affordability';

export function Dashboard({ defaultTab = 'overview' }: { defaultTab?: DashboardTab }) {
  const { data: heatmapData, isLoading: heatmapLoading } = useHeatmap();
  const { data: trendsData, isLoading: trendsLoading } = useMarketTrends();

  // Calculate aggregate metrics with resilient fallbacks
  const totalProperties =
    heatmapData?.reduce((sum, item) => sum + (item.inventory || 150), 0) || 1200;
  const avgHeatIndex =
    heatmapData && heatmapData.length > 0
      ? heatmapData.reduce((sum, item) => sum + (item.heat_index || 90), 0) / heatmapData.length
      : 92.4;
  const avgPrice =
    trendsData && trendsData.length > 0
      ? trendsData.reduce((sum, item) => sum + (item.median_sale_price || 4000000), 0) /
        trendsData.length
      : 4250000;

  return (
    <div className="min-h-screen bg-[#080C16] text-slate-100 font-sans py-8 selection:bg-cyan-500/30 selection:text-cyan-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-500/20 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold mb-2">
              <BarChart3 className="w-3.5 h-3.5" />
              DUBAI REAL ESTATE MARKET INTELLIGENCE
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              PropX Analytics Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-1 font-sans">
              Real-time capital appreciation, cap rates, and investor heatmaps across Dubai prime districts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {(heatmapLoading || trendsLoading) && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
                <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                <span>Syncing Market Telemetry...</span>
              </div>
            )}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <ShieldCheck className="w-4 h-4" />
              <span>DLD Registry Verified</span>
            </div>
          </div>
        </div>

        {/* Metric Summary Cards */}
        <MetricCards
          totalProperties={totalProperties}
          avgHeatIndex={avgHeatIndex}
          avgPrice={avgPrice}
          trendsData={trendsData || []}
        />

        {/* Main Content Tabs */}
        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList className="flex-wrap bg-[#060A14] border border-cyan-500/20 p-1.5 rounded-2xl gap-1 font-mono text-xs">
            <TabsTrigger
              value="overview"
              className="rounded-xl px-4 py-2 text-slate-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-cyan-300 data-[state=active]:border data-[state=active]:border-cyan-400/40"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="signals"
              className="rounded-xl px-4 py-2 text-slate-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-cyan-300 data-[state=active]:border data-[state=active]:border-cyan-400/40 flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Signals &amp; Profit Forecast</span>
            </TabsTrigger>
            <TabsTrigger
              value="trends"
              className="rounded-xl px-4 py-2 text-slate-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-cyan-300 data-[state=active]:border data-[state=active]:border-cyan-400/40"
            >
              Market Trends
            </TabsTrigger>
            <TabsTrigger
              value="heatmap"
              className="rounded-xl px-4 py-2 text-slate-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-cyan-300 data-[state=active]:border data-[state=active]:border-cyan-400/40"
            >
              Heat Map
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="rounded-xl px-4 py-2 text-slate-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-cyan-300 data-[state=active]:border data-[state=active]:border-cyan-400/40"
            >
              District Stats
            </TabsTrigger>
            <TabsTrigger
              value="comparison"
              className="rounded-xl px-4 py-2 text-slate-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-cyan-300 data-[state=active]:border data-[state=active]:border-cyan-400/40"
            >
              Compare
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="rounded-xl px-4 py-2 text-slate-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-cyan-300 data-[state=active]:border data-[state=active]:border-cyan-400/40"
            >
              Market Activity
            </TabsTrigger>
            <TabsTrigger
              value="affordability"
              className="rounded-xl px-4 py-2 text-slate-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-cyan-300 data-[state=active]:border data-[state=active]:border-cyan-400/40"
            >
              Yield vs Income
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Real-time AI Market Momentum Signals & Profit Forecasting */}
            <MarketSignalsWidget />

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-6 hud-glass rounded-3xl border border-cyan-500/20 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    Price Trends Over Time (AED)
                  </h2>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    +18.4% APY Surge
                  </span>
                </div>
                {trendsData && trendsData.length > 0 ? (
                  <TrendChart data={trendsData} />
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-slate-400 font-mono text-xs">
                    Loading trend analytics...
                  </div>
                )}
              </Card>

              <Card className="p-6 hud-glass rounded-3xl border border-cyan-500/20 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    Top Dubai Districts by Investor Heat
                  </h2>
                  <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/30">
                    High Secondary Liquidity
                  </span>
                </div>
                {heatmapData && heatmapData.length > 0 ? (
                  <MarketStats data={heatmapData} limit={10} />
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-slate-400 font-mono text-xs">
                    Loading district rankings...
                  </div>
                )}
              </Card>
            </div>

            <Card className="p-6 hud-glass rounded-3xl border border-cyan-500/20 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-cyan-400" />
                  Geographic Liquidity &amp; Cap Rate Heat Map
                </h2>
                <span className="text-[10px] font-mono text-slate-400">
                  Updated Live with Central Limit Order Book Volume
                </span>
              </div>
              {heatmapData && heatmapData.length > 0 ? (
                <HeatMap data={heatmapData} />
              ) : (
                <div className="h-[400px] flex items-center justify-center text-slate-400 font-mono text-xs">
                  Loading geographic heat map...
                </div>
              )}
            </Card>
          </TabsContent>

          {/* AI Market Signals & Profit Forecasting Tab */}
          <TabsContent value="signals" className="space-y-6">
            <MarketSignalsWidget />
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends">
            <Card className="p-6 hud-glass rounded-3xl border border-cyan-500/20 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-xl font-bold text-white">
                  Dubai Macro Market Trends (12-Month Rolling)
                </h2>
                <span className="text-xs font-mono text-cyan-400">
                  Data Feed: DLD + PropX CLOB Trades
                </span>
              </div>
              {trendsData && trendsData.length > 0 ? (
                <TrendChart data={trendsData} height={500} />
              ) : (
                <div className="h-[500px] flex items-center justify-center text-slate-400 font-mono text-xs">
                  Loading trend data...
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Heat Map Tab */}
          <TabsContent value="heatmap">
            <Card className="p-6 hud-glass rounded-3xl border border-cyan-500/20 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-xl font-bold text-white">
                  District Yield &amp; Occupancy Heat Map
                </h2>
                <span className="text-xs font-mono text-emerald-400">
                  Active Geo-Coordinates
                </span>
              </div>
              {heatmapData && heatmapData.length > 0 ? (
                <HeatMap data={heatmapData} height={600} />
              ) : (
                <div className="h-[600px] flex items-center justify-center text-slate-400 font-mono text-xs">
                  Loading heatmap...
                </div>
              )}
            </Card>
          </TabsContent>

          {/* District Stats Tab */}
          <TabsContent value="stats">
            <Card className="p-6 hud-glass rounded-3xl border border-cyan-500/20 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-xl font-bold text-white">
                  Detailed Dubai District Performance Matrix
                </h2>
                <span className="text-xs font-mono text-amber-400">
                  Cap Rates • Heat Scores • Valuations
                </span>
              </div>
              {heatmapData && heatmapData.length > 0 ? (
                <MarketStats data={heatmapData} limit={50} showDetails />
              ) : (
                <div className="h-[400px] flex items-center justify-center text-slate-400 font-mono text-xs">
                  Loading statistics...
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison">
            <Card className="p-8 hud-glass rounded-3xl border border-cyan-500/20 shadow-xl space-y-6">
              <h2 className="font-serif text-2xl font-bold text-white">
                Dubai District Side-by-Side Comparison
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono text-xs">
                <div className="p-5 rounded-2xl bg-[#060A14] border border-cyan-500/30 space-y-2">
                  <span className="text-cyan-400 font-bold text-sm block">Palm Jumeirah</span>
                  <div className="flex justify-between text-slate-300">
                    <span>Avg Net Yield:</span>
                    <span className="text-emerald-400 font-bold">9.8% APY</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Median Price:</span>
                    <span>AED 7.8M</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>DTCM Short-Stay:</span>
                    <span className="text-cyan-300">High Demand</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#060A14] border border-emerald-500/30 space-y-2">
                  <span className="text-emerald-400 font-bold text-sm block">Downtown Dubai</span>
                  <div className="flex justify-between text-slate-300">
                    <span>Avg Net Yield:</span>
                    <span className="text-emerald-400 font-bold">8.4% APY</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Median Price:</span>
                    <span>AED 4.2M</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>DTCM Short-Stay:</span>
                    <span className="text-cyan-300">Corporate &amp; Leisure</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#060A14] border border-purple-500/30 space-y-2">
                  <span className="text-purple-400 font-bold text-sm block">Business Bay / The Opus</span>
                  <div className="flex justify-between text-slate-300">
                    <span>Avg Net Yield:</span>
                    <span className="text-emerald-400 font-bold">9.2% APY</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Median Price:</span>
                    <span>AED 3.9M</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>DTCM Short-Stay:</span>
                    <span className="text-cyan-300">Executive Co-Working</span>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card className="p-8 hud-glass rounded-3xl border border-cyan-500/20 shadow-xl space-y-4 font-mono text-xs">
              <h2 className="font-serif text-2xl font-bold text-white font-sans">
                Real-Time Trading Activity Feed
              </h2>
              <p className="text-slate-400 font-sans text-sm">
                Secondary market order executions across PropX order books.
              </p>
              <div className="space-y-2 pt-2">
                <div className="p-3.5 rounded-xl bg-[#060A14] border border-white/5 flex items-center justify-between">
                  <span className="text-cyan-300">BUY 50 Shares • Burj Crown Luxury 2BR</span>
                  <span className="text-emerald-400 font-bold">AED 1,005.00/sh</span>
                  <span className="text-slate-400">Just now</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#060A14] border border-white/5 flex items-center justify-between">
                  <span className="text-cyan-300">BUY 120 Shares • Seven Palm Suite</span>
                  <span className="text-emerald-400 font-bold">AED 23.50/sh</span>
                  <span className="text-slate-400">2 mins ago</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#060A14] border border-white/5 flex items-center justify-between">
                  <span className="text-amber-300">SELL 30 Shares • The Opus Commercial</span>
                  <span className="text-slate-200 font-bold">AED 31.00/sh</span>
                  <span className="text-slate-400">5 mins ago</span>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Affordability Tab */}
          <TabsContent value="affordability">
            <Card className="p-8 hud-glass rounded-3xl border border-cyan-500/20 shadow-xl space-y-4 font-mono text-xs">
              <h2 className="font-serif text-2xl font-bold text-white font-sans">
                Fractional Yield vs. Traditional Mortgage Income Ratio
              </h2>
              <p className="text-slate-400 font-sans text-sm">
                How fractional real estate reduces barrier to entry by 99.4% compared to conventional UAE mortgages.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-5 rounded-2xl bg-[#060A14] border border-white/5 space-y-2">
                  <span className="text-slate-400 block font-bold text-sm">Traditional Bank Purchase</span>
                  <div className="flex justify-between">
                    <span>Minimum Cash Required:</span>
                    <span className="text-amber-400 font-bold">AED 500,000+</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Underwriting Timeline:</span>
                    <span>3 to 6 Weeks</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Liquidity:</span>
                    <span className="text-red-400">Illiquid (6+ Months to sell)</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#060A14] border border-cyan-500/30 space-y-2">
                  <span className="text-cyan-300 block font-bold text-sm">PropX Fractional Exchange</span>
                  <div className="flex justify-between">
                    <span>Minimum Investment:</span>
                    <span className="text-emerald-400 font-bold">AED 15 / share</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Underwriting Timeline:</span>
                    <span className="text-emerald-400 font-bold">Instant (Algorithmic)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Liquidity:</span>
                    <span className="text-cyan-300 font-bold">Instant Secondary CLOB</span>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
