// src/components/shared/PropertyDetails.tsx
'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SaveButton } from '@/components/shared/SaveButton';
import { ShareButton } from '@/components/shared/ShareButton';
import { ExternalDataBadge } from '@/components/shared/ExternalDataBadge';
import { 
  MapPin, 
  TrendingUp, 
  Home, 
  DollarSign,
  Calendar,
  Activity,
  BarChart3
} from 'lucide-react';
import type { Region, RegionMetrics } from '@/types/models';

interface PropertyDetailsProps {
  property: Region;
  metrics?: RegionMetrics | null;
  externalData?: any;
  externalLoading?: boolean;
}

export function PropertyDetails({ 
  property, 
  metrics,
  externalData,
  externalLoading 
}: PropertyDetailsProps) {
  const redfin = externalData?.redfin;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-foreground">
              {property.region_name}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">{property.state_name}</span>
              {property.region_type && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-[hsl(222_16%_16%)] text-muted-foreground border border-[hsl(222_14%_22%)]">
                  {property.region_type}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <SaveButton propertyId={property.id} />
            <ShareButton property={property} />
          </div>
        </div>

        {/* Price Section */}
        <Card className="p-6 bg-[hsl(222_18%_12%)] border border-[hsl(222_14%_20%)]">
          <div className="grid md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-[hsl(222_14%_20%)]">
            {/* Current Value */}
            <div className="pb-4 md:pb-0 md:pr-6">
              <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-2">Current Value</p>
              <p className="font-serif text-3xl font-bold text-[hsl(38_80%_57%)] flex items-center gap-2">
                <DollarSign className="h-7 w-7 text-[hsl(38_80%_57%/0.7)]" />
                {property.current_value
                  ? property.current_value.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 0,
                    })
                  : 'N/A'}
              </p>
            </div>

            {/* Heat Index */}
            {property.heat_index !== null && property.heat_index !== undefined && (
              <div className="py-4 md:py-0 md:px-6">
                <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-2">Market Heat Index</p>
                <div className="flex items-center gap-3">
                  <p className="font-serif text-3xl font-bold text-[hsl(25_80%_60%)]">
                    {property.heat_index.toFixed(1)}
                  </p>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[hsl(25_80%_55%/0.12)] text-[hsl(25_80%_68%)] border border-[hsl(25_80%_55%/0.25)]">
                    <TrendingUp className="h-3 w-3" />
                    {property.heat_index > 60 ? 'Hot' : property.heat_index > 40 ? 'Warm' : 'Cool'}
                  </span>
                </div>
              </div>
            )}

            {/* Inventory */}
            {property.inventory !== null && property.inventory !== undefined && (
              <div className="pt-4 md:pt-0 md:pl-6">
                <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-2">Active Inventory</p>
                <p className="font-serif text-3xl font-bold text-foreground flex items-center gap-2">
                  <Home className="h-7 w-7 text-[hsl(270_55%_60%)]" />
                  {property.inventory.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* External Data */}
        {redfin && (
          <Card className="p-6 bg-[hsl(222_18%_12%)] border border-[hsl(222_14%_20%)]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-foreground">Redfin Market Data</h2>
              <ExternalDataBadge loading={externalLoading} />
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-[hsl(148_55%_45%/0.08)] border border-[hsl(148_55%_45%/0.2)] rounded-md p-4">
                <p className="text-[10px] font-semibold tracking-wide uppercase text-[hsl(148_55%_60%)] mb-1.5">Median Sale Price</p>
                <p className="font-serif text-xl font-bold text-[hsl(148_55%_65%)]">
                  ${redfin.median_sale_price?.toLocaleString()}
                </p>
              </div>

              <div className="bg-[hsl(195_60%_50%/0.08)] border border-[hsl(195_60%_50%/0.2)] rounded-md p-4">
                <p className="text-[10px] font-semibold tracking-wide uppercase text-[hsl(195_60%_60%)] mb-1.5">Days on Market</p>
                <p className="font-serif text-xl font-bold text-[hsl(195_60%_65%)]">
                  {redfin.median_dom} days
                </p>
              </div>

              <div className="bg-[hsl(270_55%_55%/0.08)] border border-[hsl(270_55%_55%/0.2)] rounded-md p-4">
                <p className="text-[10px] font-semibold tracking-wide uppercase text-[hsl(270_55%_65%)] mb-1.5">Homes Sold</p>
                <p className="font-serif text-xl font-bold text-[hsl(270_55%_68%)]">
                  {redfin.homes_sold?.toLocaleString()}
                </p>
              </div>

              <div className="bg-[hsl(38_80%_57%/0.08)] border border-[hsl(38_80%_57%/0.2)] rounded-md p-4">
                <p className="text-[10px] font-semibold tracking-wide uppercase text-[hsl(38_80%_62%)] mb-1.5">Market Inventory</p>
                <p className="font-serif text-xl font-bold text-[hsl(38_80%_65%)]">
                  {redfin.inventory?.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-5">
          <TabsList className="bg-[hsl(222_18%_12%)] border border-[hsl(222_14%_20%)] p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[hsl(38_40%_18%)] data-[state=active]:text-[hsl(38_80%_57%)] text-muted-foreground hover:text-foreground">Overview</TabsTrigger>
            <TabsTrigger value="metrics" className="data-[state=active]:bg-[hsl(38_40%_18%)] data-[state=active]:text-[hsl(38_80%_57%)] text-muted-foreground hover:text-foreground">All Metrics</TabsTrigger>
            <TabsTrigger value="trends" className="data-[state=active]:bg-[hsl(38_40%_18%)] data-[state=active]:text-[hsl(38_80%_57%)] text-muted-foreground hover:text-foreground">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-5">
            <Card className="p-5 bg-[hsl(222_18%_12%)] border border-[hsl(222_14%_20%)]">
              <h2 className="font-serif text-foreground mb-5">Key Metrics</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {property.median_list_price && (
                  <MetricItem
                    icon={DollarSign}
                    label="Median List Price"
                    value={`$${property.median_list_price.toLocaleString()}`}
                  />
                )}
                {property.median_sale_price && (
                  <MetricItem
                    icon={DollarSign}
                    label="Median Sale Price"
                    value={`$${property.median_sale_price.toLocaleString()}`}
                  />
                )}
                {property.new_listings && (
                  <MetricItem
                    icon={Home}
                    label="New Listings"
                    value={property.new_listings.toLocaleString()}
                  />
                )}
                {property.days_to_pending && (
                  <MetricItem
                    icon={Calendar}
                    label="Days to Pending"
                    value={`${property.days_to_pending} days`}
                  />
                )}
                {property.affordability_ratio && (
                  <MetricItem
                    icon={BarChart3}
                    label="Affordability Ratio"
                    value={property.affordability_ratio.toFixed(2)}
                  />
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="metrics">
            <Card className="p-5 bg-[hsl(222_18%_12%)] border border-[hsl(222_14%_20%)]">
              <h2 className="font-serif text-foreground mb-5">All Property Metrics</h2>
              <div className="grid md:grid-cols-2 gap-0">
                {Object.entries(property).map(([key, value]) => {
                  if (
                    key === 'region_id' ||
                    key === 'region_name' ||
                    key === 'state_name' ||
                    key === 'region_type' ||
                    value === null ||
                    value === undefined
                  ) {
                    return null;
                  }

                  return (
                    <div key={key} className="flex justify-between items-center py-2.5 border-b border-[hsl(222_14%_18%)] last:border-0 px-1">
                      <p className="text-xs text-muted-foreground capitalize">
                        {key.replace(/_/g, ' ')}
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {typeof value === 'number'
                          ? value.toLocaleString()
                          : String(value)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="trends">
            <Card className="p-5 bg-[hsl(222_18%_12%)] border border-[hsl(222_14%_20%)]">
              <h2 className="font-serif text-foreground mb-4">Market Trends</h2>
              <p className="text-sm text-muted-foreground">
                Historical trend data visualization coming soon...
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function MetricItem({ 
  icon: Icon, 
  label, 
  value 
}: { 
  icon: any; 
  label: string; 
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 p-4 bg-[hsl(222_16%_14%)] border border-[hsl(222_14%_20%)] rounded-md hover:border-[hsl(38_80%_57%/0.2)] transition-colors">
      <div className="w-8 h-8 rounded flex items-center justify-center bg-[hsl(38_40%_18%)] flex-shrink-0">
        <Icon className="h-4 w-4 text-[hsl(38_80%_57%)]" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}
