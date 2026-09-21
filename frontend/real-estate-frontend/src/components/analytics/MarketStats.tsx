// src/components/analytics/MarketStats.tsx
'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, TrendingUp, TrendingDown } from 'lucide-react';
import type { HeatmapData } from '@/types/models';

interface MarketStatsProps {
  data: HeatmapData[];
  limit?: number;
  showDetails?: boolean;
}

export function MarketStats({ data, limit = 10, showDetails = false }: MarketStatsProps) {
  const [sortBy, setSortBy] = useState<'heat' | 'price' | 'inventory'>('heat');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    let compareValue = 0;
    
    switch (sortBy) {
      case 'heat':
        compareValue = (a.heat_index || 0) - (b.heat_index || 0);
        break;
      case 'price':
        compareValue = (a.median_sale_price || 0) - (b.median_sale_price || 0);
        break;
      case 'inventory':
        compareValue = (a.inventory || 0) - (b.inventory || 0);
        break;
    }

    return sortOrder === 'desc' ? -compareValue : compareValue;
  }).slice(0, limit);

  const handleSort = (column: 'heat' | 'price' | 'inventory') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const getHeatBadge = (heat: number | null | undefined) => {
    if (heat === null || heat === undefined) return null;
    if (heat >= 70) return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-[hsl(12_72%_50%/0.15)] text-[hsl(12_72%_70%)] border border-[hsl(12_72%_50%/0.3)]">Very Hot</span>;
    if (heat >= 60) return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-[hsl(25_80%_55%/0.15)] text-[hsl(25_80%_70%)] border border-[hsl(25_80%_55%/0.3)]">Hot</span>;
    if (heat >= 50) return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-[hsl(38_80%_57%/0.15)] text-[hsl(38_80%_72%)] border border-[hsl(38_80%_57%/0.3)]">Warm</span>;
    if (heat >= 40) return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-[hsl(148_55%_45%/0.12)] text-[hsl(148_55%_65%)] border border-[hsl(148_55%_45%/0.25)]">Moderate</span>;
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-[hsl(195_60%_50%/0.12)] text-[hsl(195_60%_68%)] border border-[hsl(195_60%_50%/0.25)]">Cool</span>;
  };

  return (
    <div className="space-y-4">
      {!showDetails && (
        <p className="text-xs text-muted-foreground">
          Showing top {limit} markets
        </p>
      )}

      <div className="border border-[hsl(222_14%_20%)] rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[hsl(222_14%_20%)] hover:bg-transparent">
              <TableHead className="w-10 text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground">#</TableHead>
              <TableHead className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground">Market</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('heat')}
                  className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground hover:text-[hsl(38_80%_57%)] hover:bg-transparent px-0 h-auto"
                >
                  Heat Index
                  <ArrowUpDown className="ml-1.5 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('price')}
                  className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground hover:text-[hsl(38_80%_57%)] hover:bg-transparent px-0 h-auto"
                >
                  Median Price
                  <ArrowUpDown className="ml-1.5 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('inventory')}
                  className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground hover:text-[hsl(38_80%_57%)] hover:bg-transparent px-0 h-auto"
                >
                  Inventory
                  <ArrowUpDown className="ml-1.5 h-3 w-3" />
                </Button>
              </TableHead>
              {showDetails && (
                <>
                  <TableHead className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground">New Listings</TableHead>
                  <TableHead className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground">Status</TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item, index) => (
              <TableRow
                key={`${item.state}-${item.region_name}-${index}`}
                className="border-b border-[hsl(222_14%_18%)] hover:bg-[hsl(38_80%_57%/0.03)] transition-colors"
              >
                <TableCell className="text-xs text-muted-foreground font-medium">{index + 1}</TableCell>
                <TableCell>
                  <div>
                    <div className="text-sm font-medium text-foreground">{item.region_name || 'Unknown'}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{item.state}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {item.heat_index !== null && item.heat_index !== undefined ? (
                      <>
                        <span className="font-semibold text-amber-400 font-mono text-sm">{item.heat_index.toFixed(1)}</span>
                        {getHeatBadge(item.heat_index)}
                      </>
                    ) : (
                      <span className="text-slate-500 text-sm">N/A</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {item.median_sale_price ? (
                    <span className="font-mono font-semibold text-emerald-400 text-sm">
                      AED {(item.median_sale_price / 1000000).toFixed(2)}M
                    </span>
                  ) : (
                    <span className="text-slate-500 text-sm">N/A</span>
                  )}
                </TableCell>
                <TableCell>
                  {item.inventory ? (
                    <span className="text-sm text-foreground">{item.inventory.toLocaleString()}</span>
                  ) : (
                    <span className="text-muted-foreground text-sm">N/A</span>
                  )}
                </TableCell>
                {showDetails && (
                  <>
                    <TableCell>
                      {item.new_listings ? (
                        <span className="text-sm text-foreground">{item.new_listings.toLocaleString()}</span>
                      ) : (
                        <span className="text-muted-foreground text-sm">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.heat_index && item.heat_index > 60 ? (
                        <div className="flex items-center gap-1.5 text-[hsl(148_55%_55%)]">
                          <TrendingUp className="h-3.5 w-3.5" />
                          <span className="text-xs font-medium">Rising</span>
                        </div>
                      ) : item.heat_index && item.heat_index < 40 ? (
                        <div className="flex items-center gap-1.5 text-[hsl(12_72%_55%)]">
                          <TrendingDown className="h-3.5 w-3.5" />
                          <span className="text-xs font-medium">Cooling</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Stable</span>
                      )}
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
