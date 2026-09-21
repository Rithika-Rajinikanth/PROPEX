// src/components/search/SearchResults.tsx
'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { SearchResult, SearchQuery } from '@/types/models';

interface SearchResultsProps {
  data?: SearchResult;
  query: SearchQuery;
  onQueryChange: (query: SearchQuery) => void;
}

export function SearchResults({ data, query, onQueryChange }: SearchResultsProps) {
  if (!data || data.results.length === 0) {
    return (
      <Card className="p-10 text-center bg-[hsl(222_18%_12%)] border border-[hsl(222_14%_20%)]">
        <p className="text-muted-foreground text-sm">No properties found matching your criteria.</p>
      </Card>
    );
  }

  const totalPages = Math.ceil(data.total / data.page_size);
  const currentPage = data.page;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-xs text-muted-foreground">
          Showing <span className="text-foreground font-medium">{data.results.length}</span> of <span className="text-foreground font-medium">{data.total}</span> results
        </p>
      </div>

      <div className="grid gap-3">
        {data.results.map((result) => (
          <Card key={result.region_id} className="p-5 bg-[hsl(222_18%_12%)] border border-[hsl(222_14%_20%)] hover:border-[hsl(38_80%_57%/0.3)] hover:shadow-[0_4px_24px_hsl(222_20%_4%/0.5)] transition-all duration-300 group">
            <div className="flex justify-between items-start gap-4">
              <div className="min-w-0">
                <Link href={`/regions/${result.region_id}`}>
                  <h3 className="font-serif text-foreground hover:text-[hsl(38_80%_62%)] cursor-pointer transition-colors truncate">
                    {result.region_name}
                  </h3>
                </Link>
                <p className="text-sm text-muted-foreground mt-0.5">{result.state_name}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-serif text-xl font-bold text-[hsl(38_80%_57%)]">
                  ${result.current_value?.toLocaleString() || 'N/A'}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Current Value</p>
              </div>
            </div>

            <div className="h-px bg-[hsl(222_14%_20%)] my-4" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricBadge label="List Price" value={result.median_list_price} />
              <MetricBadge label="Sale Price" value={result.median_sale_price} />
              <MetricBadge label="Inventory" value={result.inventory} />
              <MetricBadge label="Heat Index" value={result.heat_index} isHeat />
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-3 mt-6">
          <Button
            variant="outline"
            disabled={currentPage === 0}
            onClick={() =>
              onQueryChange({
                ...query,
                offset: Math.max(0, (currentPage - 1) * data.page_size),
              })
            }
            className="border-[hsl(222_14%_25%)] text-muted-foreground hover:text-foreground hover:border-[hsl(222_14%_32%)] hover:bg-[hsl(222_16%_16%)] disabled:opacity-40"
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page <span className="text-foreground font-medium mx-1">{currentPage + 1}</span> of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage >= totalPages - 1}
            onClick={() =>
              onQueryChange({
                ...query,
                offset: (currentPage + 1) * data.page_size,
              })
            }
            className="border-[hsl(222_14%_25%)] text-muted-foreground hover:text-foreground hover:border-[hsl(222_14%_32%)] hover:bg-[hsl(222_16%_16%)] disabled:opacity-40"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

function MetricBadge({ label, value, isHeat }: { label: string; value?: number | null; isHeat?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground mb-1.5">{label}</p>
      <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold ${
        isHeat && value
          ? 'bg-[hsl(38_80%_57%/0.12)] text-[hsl(38_80%_65%)] border border-[hsl(38_80%_57%/0.25)]'
          : 'bg-[hsl(222_16%_16%)] text-foreground border border-[hsl(222_14%_22%)]'
      }`}>
        {value !== null && value !== undefined ? value.toLocaleString() : 'N/A'}
      </span>
    </div>
  );
}
