'use client';

import { use } from 'react';
import { useRegion, useRegionMetrics } from '@/hooks/useRegions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, TrendingUp, Home, DollarSign, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function RegionDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const regionId = parseInt(id);
  const { data: region, isLoading: regionLoading } = useRegion(regionId);
  const { data: metrics, isLoading: metricsLoading } = useRegionMetrics(regionId);

  // ✅ Helper to format currency
  const formatCurrency = (value: number | null | undefined, suffix = 'K'): string => {
    if (!value || value === 0) return 'N/A';
    if (suffix === 'K') {
      return `$${Math.round(value / 1000).toLocaleString()}K`;
    }
    return `$${Math.round(value).toLocaleString()}`;
  };

  // ✅ Helper to format numbers
  const formatNumber = (value: number | null | undefined): string => {
    if (!value || value === 0) return 'N/A';
    return value.toLocaleString();
  };

  // ✅ Helper to format percentage
  const formatPercent = (value: number | null | undefined): string => {
    if (!value || value === 0) return 'N/A';
    return `${value.toFixed(1)}%`;
  };

  // ✅ Get heat status
  const getHeatStatus = () => {
    const heat = metrics?.heat_index;
    if (!heat) return { label: 'Unknown', color: 'gray' };
    if (heat >= 70) return { label: 'Very Hot', color: 'red' };
    if (heat >= 60) return { label: 'Hot', color: 'orange' };
    if (heat >= 50) return { label: 'Warm', color: 'yellow' };
    return { label: 'Cool', color: 'blue' };
  };

  if (regionLoading || metricsLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!region) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Region Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The region you're looking for doesn't exist.
          </p>
          <Link href="/marketplace">
            <Button>Back to Marketplace</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const heatStatus = getHeatStatus();
  const hasAnyMetrics = metrics && (
    (metrics.current_value ?? 0) > 0 ||
    (metrics.median_list_price ?? 0) > 0 ||
    (metrics.median_sale_price ?? 0) > 0 ||
    (metrics.inventory ?? 0) > 0 ||
    (metrics.heat_index ?? 0) > 0
  );

  return (
    <div className="container mx-auto py-8">
      {/* No data banner */}
      {!hasAnyMetrics && metrics && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <p className="font-medium">No market data available for this region</p>
          <p className="mt-1 text-sm">
            Metrics show N/A because no Zillow data has been loaded for {region.region_type} &quot;{region.region_name}&quot;.
            Load Zillow CSV files via the pipeline, then run{' '}
            <code className="rounded bg-amber-100 px-1">REFRESH MATERIALIZED VIEW mv_region_latest_metrics;</code>
          </p>
          <p className="mt-2 text-sm">
            Try browsing <Link href="/marketplace" className="underline">Metro regions</Link> that have data.
          </p>
        </div>
      )}

      {/* Back Button */}
      <Link href="/marketplace">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Marketplace
        </Button>
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">{region.region_name}</h1>
            <p className="text-lg text-muted-foreground">
              {region.state_name} • {region.region_type}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Save</Button>
            <Button variant="outline">Share</Button>
          </div>
        </div>

        {/* Heat Badge */}
        {metrics?.heat_index && (
          <div className="mt-4">
            <Badge 
              className={`
                ${heatStatus.color === 'red' ? 'bg-red-500' : ''}
                ${heatStatus.color === 'orange' ? 'bg-orange-500' : ''}
                ${heatStatus.color === 'yellow' ? 'bg-yellow-500' : ''}
                ${heatStatus.color === 'blue' ? 'bg-blue-500' : ''}
              `}
            >
              🔥 {heatStatus.label} Market • Heat Index: {metrics.heat_index.toFixed(1)}
            </Badge>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">All Metrics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Current Value</p>
                <Home className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold">
                {formatCurrency(metrics?.current_value)}
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Median List Price</p>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold">
                {formatCurrency(metrics?.median_list_price)}
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Active Inventory</p>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold">
                {formatNumber(metrics?.inventory)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">properties available</p>
            </Card>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Market Activity</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">New Listings</span>
                  <span className="font-medium">{formatNumber(metrics?.new_listings)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sales Count</span>
                  <span className="font-medium">{formatNumber(metrics?.sales_count)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Days to Pending</span>
                  <span className="font-medium">
                    {metrics?.days_to_pending ? `${metrics.days_to_pending.toFixed(0)} days` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Days to Close</span>
                  <span className="font-medium">
                    {metrics?.days_to_close ? `${metrics.days_to_close.toFixed(0)} days` : 'N/A'}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Pricing Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Median Sale Price</span>
                  <span className="font-medium">{formatCurrency(metrics?.median_sale_price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Affordability Ratio</span>
                  <span className="font-medium">{formatPercent(metrics?.affordability_ratio)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Heat Index</span>
                  <span className="font-medium">
                    {metrics?.heat_index ? metrics.heat_index.toFixed(1) : 'N/A'}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* All Metrics Tab */}
        <TabsContent value="metrics">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Complete Property Metrics</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody className="divide-y">
                  <tr className="py-3">
                    <td className="py-3 text-muted-foreground">Region ID</td>
                    {/* ✅ Fix: Use region_id instead of id */}
                    <td className="py-3 text-right font-medium">{metrics?.region_id || regionId}</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-muted-foreground">Current Value</td>
                    <td className="py-3 text-right font-medium">{formatCurrency(metrics?.current_value)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-muted-foreground">Median List Price</td>
                    <td className="py-3 text-right font-medium">{formatCurrency(metrics?.median_list_price)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-muted-foreground">Median Sale Price</td>
                    <td className="py-3 text-right font-medium">{formatCurrency(metrics?.median_sale_price)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-muted-foreground">Active Inventory</td>
                    <td className="py-3 text-right font-medium">{formatNumber(metrics?.inventory)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-muted-foreground">New Listings</td>
                    <td className="py-3 text-right font-medium">{formatNumber(metrics?.new_listings)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-muted-foreground">Sales Count</td>
                    <td className="py-3 text-right font-medium">{formatNumber(metrics?.sales_count)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-muted-foreground">Days to Pending</td>
                    <td className="py-3 text-right font-medium">
                      {metrics?.days_to_pending ? `${metrics.days_to_pending.toFixed(0)} days` : 'N/A'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 text-muted-foreground">Days to Close</td>
                    <td className="py-3 text-right font-medium">
                      {metrics?.days_to_close ? `${metrics.days_to_close.toFixed(0)} days` : 'N/A'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 text-muted-foreground">Heat Index</td>
                    <td className="py-3 text-right font-medium">
                      {metrics?.heat_index ? metrics.heat_index.toFixed(1) : 'N/A'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 text-muted-foreground">Affordability Ratio</td>
                    <td className="py-3 text-right font-medium">{formatPercent(metrics?.affordability_ratio)}</td>
                  </tr>
                  {/* ✅ Fix: Remove last_updated (doesn't exist in RegionMetrics type) */}
                  {/* ✅ Fix: Remove created_at (doesn't exist in Region type) */}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Market Trends</h3>
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Historical trend data visualization coming soon...</p>
              <p className="text-sm mt-2">
                We're working on bringing you detailed historical trends for this region
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}