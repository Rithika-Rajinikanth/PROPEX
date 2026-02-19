// src/app/regions/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useRegion, useRegionMetrics, useRegionTrends } from '@/hooks/useRegions';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function RegionPage() {
  const params = useParams();
  const id = Number(params.id);

  const { data: region, isLoading: regionLoading } = useRegion(id);
  const { data: metrics, isLoading: metricsLoading } = useRegionMetrics(id);
  const { data: trends } = useRegionTrends(id, { metric: 'zhvi', months: 12 });

  if (regionLoading || metricsLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!region || !metrics) {
    return <div className="container mx-auto px-4 py-8">Region not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">{region.region_name}</h1>
        <div className="flex gap-2 mt-2">
          <Badge>{region.state_name}</Badge>
          <Badge variant="outline">{region.region_type}</Badge>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          label="Current Value"
          value={metrics.current_value}
          format="currency"
        />
        <MetricCard
          label="Median List Price"
          value={metrics.median_list_price}
          format="currency"
        />
        <MetricCard label="Heat Index" value={metrics.heat_index} format="number" />
      </div>

      <Tabs defaultValue="trends" className="mb-8">
        <TabsList>
          <TabsTrigger value="trends">Price Trends</TabsTrigger>
          <TabsTrigger value="metrics">All Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card className="p-6">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard label="Inventory" value={metrics.inventory} />
            <MetricCard label="New Listings" value={metrics.new_listings} />
            <MetricCard label="Sales Count" value={metrics.sales_count} />
            <MetricCard label="Days to Pending" value={metrics.days_to_pending} />
            <MetricCard label="Days to Close" value={metrics.days_to_close} />
            <MetricCard label="Affordability Ratio" value={metrics.affordability_ratio} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetricCard({
  label,
  value,
  format = 'number',
}: {
  label: string;
  value?: number | null;
  format?: 'number' | 'currency';
}) {
  const formattedValue =
    value !== null && value !== undefined
      ? format === 'currency'
        ? `$${value.toLocaleString()}`
        : value.toLocaleString()
      : 'N/A';

  return (
    <Card className="p-6">
      <p className="text-sm text-muted-foreground mb-2">{label}</p>
      <p className="text-2xl font-bold">{formattedValue}</p>
    </Card>
  );
}