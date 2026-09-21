// src/components/marketplace/PropertyCard.tsx - FIXED
'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import type { RegionMetrics } from '@/types/models';

interface PropertyCardProps {
  region: RegionMetrics;
}

export function PropertyCard({ region }: PropertyCardProps) {
  // ✅ FIX: Defensively resolve the ID — search returns region_id,
  // but if someone passes a raw Region object it may have "id" instead.
  const regionId = region.region_id ?? (region as any).id;

  const formatCurrency = (value: number | null | undefined): string => {
    if (value === null || value === undefined || value === 0) return 'N/A';
    return `$${Math.round(value / 1000).toLocaleString()}K`;
  };

  const formatNumber = (value: number | null | undefined): string => {
    if (value === null || value === undefined || value === 0) return 'N/A';
    return value.toLocaleString();
  };

  const getHeatBadge = () => {
    const heat = region.heat_index;
    if (!heat) return null;
    if (heat >= 70) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-[hsl(12_72%_50%/0.15)] text-[hsl(12_72%_70%)] border border-[hsl(12_72%_50%/0.3)]">🔥 Very Hot</span>;
    if (heat >= 60) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-[hsl(25_80%_55%/0.15)] text-[hsl(25_80%_70%)] border border-[hsl(25_80%_55%/0.3)]">🔥 Hot</span>;
    if (heat >= 50) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-[hsl(38_80%_57%/0.15)] text-[hsl(38_80%_70%)] border border-[hsl(38_80%_57%/0.3)]">☀️ Warm</span>;
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-[hsl(195_60%_50%/0.12)] text-[hsl(195_60%_72%)] border border-[hsl(195_60%_50%/0.25)]">❄️ Cool</span>;
  };

  return (
    <Card className="p-5 bg-[hsl(222_18%_12%)] border border-[hsl(222_14%_20%)] hover:border-[hsl(38_80%_57%/0.3)] hover:shadow-[0_8px_32px_hsl(222_20%_4%/0.6),0_0_0_1px_hsl(38_80%_57%/0.12)] transition-all duration-300 cursor-pointer group">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-serif font-semibold text-foreground text-base leading-tight truncate group-hover:text-[hsl(38_80%_62%)] transition-colors">{region.region_name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {region.state_name}
              {region.region_type ? ` · ${region.region_type}` : ''}
            </p>
          </div>
          {getHeatBadge()}
        </div>

        {/* Divider */}
        <div className="h-px bg-[hsl(222_14%_20%)]" />

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground block text-[10px] tracking-wide uppercase mb-1">List Price</span>
            <p className="font-semibold text-foreground">{formatCurrency(region.median_list_price)}</p>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] tracking-wide uppercase mb-1">Inventory</span>
            <p className="font-semibold text-foreground">{formatNumber(region.inventory)}</p>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] tracking-wide uppercase mb-1">Current Value</span>
            <p className="font-semibold text-foreground">{formatCurrency(region.current_value)}</p>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] tracking-wide uppercase mb-1">Heat Index</span>
            <p className="font-semibold text-[hsl(38_80%_57%)]">
              {region.heat_index != null ? region.heat_index.toFixed(1) : 'N/A'}
            </p>
          </div>
        </div>

        {/* ✅ FIX: Use resolved regionId — was /regions/undefined before */}
        {regionId ? (
          <Link href={`/regions/${regionId}`} className="block">
            <Button variant="outline" size="sm" className="w-full border-[hsl(222_14%_25%)] text-muted-foreground hover:text-[hsl(38_80%_57%)] hover:border-[hsl(38_80%_57%/0.4)] hover:bg-[hsl(38_40%_18%)] transition-all">
              View Details →
            </Button>
          </Link>
        ) : (
          <Button variant="outline" size="sm" className="w-full border-[hsl(222_14%_22%)] text-muted-foreground opacity-50" disabled>
            No Details Available
          </Button>
        )}
      </div>
    </Card>
  );
}
