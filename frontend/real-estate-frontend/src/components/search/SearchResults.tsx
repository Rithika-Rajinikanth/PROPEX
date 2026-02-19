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
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No properties found matching your criteria.</p>
      </Card>
    );
  }

  const totalPages = Math.ceil(data.total / data.page_size);
  const currentPage = data.page;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Showing {data.results.length} of {data.total} results
        </p>
      </div>

      <div className="grid gap-4">
        {data.results.map((result) => (
          <Card key={result.region_id} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <Link href={`/regions/${result.region_id}`}>
                  <h3 className="text-xl font-semibold hover:text-primary cursor-pointer">
                    {result.region_name}
                  </h3>
                </Link>
                <p className="text-muted-foreground">{result.state_name}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  ${result.current_value?.toLocaleString() || 'N/A'}
                </p>
                <p className="text-sm text-muted-foreground">Current Value</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <MetricBadge label="List Price" value={result.median_list_price} />
              <MetricBadge label="Sale Price" value={result.median_sale_price} />
              <MetricBadge label="Inventory" value={result.inventory} />
              <MetricBadge label="Heat Index" value={result.heat_index} />
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            disabled={currentPage === 0}
            onClick={() =>
              onQueryChange({
                ...query,
                offset: Math.max(0, (currentPage - 1) * data.page_size),
              })
            }
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {currentPage + 1} of {totalPages}
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
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

function MetricBadge({ label, value }: { label: string; value?: number | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <Badge variant="secondary">
        {value !== null && value !== undefined ? value.toLocaleString() : 'N/A'}
      </Badge>
    </div>
  );
}