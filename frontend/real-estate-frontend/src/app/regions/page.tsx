// src/app/regions/page.tsx - REPLACED
// Uses /api/v1/search (same as marketplace) instead of /api/v1/regions.
// This means only regions with actual Zillow data appear — no more all-N/A zip codes.
'use client';

import { useState } from 'react';
import { useSearch } from '@/hooks/useSearch';
import { PropertyCard } from '@/components/marketplace/PropertyCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import type { SearchQuery } from '@/types/models';

const STATES = [
  { value: 'all', label: 'All States' },
  { value: 'CA', label: 'California' }, { value: 'TX', label: 'Texas' },
  { value: 'NY', label: 'New York' }, { value: 'FL', label: 'Florida' },
  { value: 'IL', label: 'Illinois' }, { value: 'WA', label: 'Washington' },
  { value: 'AZ', label: 'Arizona' }, { value: 'CO', label: 'Colorado' },
  { value: 'OR', label: 'Oregon' }, { value: 'NV', label: 'Nevada' },
  { value: 'MA', label: 'Massachusetts' }, { value: 'PA', label: 'Pennsylvania' },
  { value: 'OH', label: 'Ohio' }, { value: 'WI', label: 'Wisconsin' },
  { value: 'MI', label: 'Michigan' },
];

const REGION_TYPES = [
  { value: 'all', label: 'All Types' }, { value: 'metro', label: 'Metro' },
  { value: 'city', label: 'City' }, { value: 'county', label: 'County' },
  { value: 'zip', label: 'Zip Code' },
];

export default function RegionsPage() {
  const [query, setQuery] = useState<SearchQuery>({ limit: 48, offset: 0 });
  const { data, isLoading, error } = useSearch(query);

  const pageSize = query.limit ?? 48;
  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;
  const currentPage = data?.page ?? 0;

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-foreground">All Regions</h1>
        <div className="h-0.5 w-10 bg-[hsl(38_80%_57%)] mt-3 mb-3" />
        <p className="text-sm text-muted-foreground">
          {data ? `${data.total.toLocaleString()} regions with market data` : 'Loading…'}
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <Select
          value={query.state ?? 'all'}
          onValueChange={(v) => setQuery((q) => ({ ...q, state: v === 'all' ? undefined : v, offset: 0 }))}
        >
          <SelectTrigger className="w-44 bg-[hsl(222_16%_14%)] border-[hsl(222_14%_22%)] text-foreground focus:border-[hsl(38_80%_57%/0.5)]">
            <SelectValue placeholder="All States" />
          </SelectTrigger>
          <SelectContent className="bg-[hsl(222_18%_14%)] border-[hsl(222_14%_22%)]">
            {STATES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select
          value={query.region_type ?? 'all'}
          onValueChange={(v) => setQuery((q) => ({ ...q, region_type: v === 'all' ? undefined : v, offset: 0 }))}
        >
          <SelectTrigger className="w-44 bg-[hsl(222_16%_14%)] border-[hsl(222_14%_22%)] text-foreground focus:border-[hsl(38_80%_57%/0.5)]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent className="bg-[hsl(222_18%_14%)] border-[hsl(222_14%_22%)]">
            {REGION_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => setQuery({ limit: 48, offset: 0 })}
          className="border-[hsl(222_14%_25%)] text-muted-foreground hover:text-foreground hover:border-[hsl(222_14%_32%)] hover:bg-[hsl(222_16%_16%)]"
        >
          Reset
        </Button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="h-64 bg-[hsl(222_18%_14%)] border border-[hsl(222_14%_20%)] animate-pulse rounded-md" />
          ))}
        </div>
      ) : error ? (
        <Card className="p-12 text-center bg-[hsl(222_18%_12%)] border border-[hsl(12_72%_50%/0.25)]">
          <h2 className="font-serif text-[hsl(12_72%_65%)] mb-4">Error loading regions</h2>
          <Button
            onClick={() => window.location.reload()}
            className="bg-[hsl(38_80%_57%)] text-[hsl(222_20%_9%)] hover:bg-[hsl(38_80%_65%)] border-0"
          >
            Retry
          </Button>
        </Card>
      ) : data && data.results.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.results.map((region, i) => (
              <PropertyCard key={`${region.region_id}-${i}`} region={region} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                onClick={() => setQuery((q) => ({ ...q, offset: Math.max(0, (currentPage - 1) * pageSize) }))}
                disabled={currentPage === 0}
                className="border-[hsl(222_14%_25%)] text-muted-foreground hover:text-foreground hover:bg-[hsl(222_16%_16%)] disabled:opacity-40"
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page <span className="text-foreground font-medium">{currentPage + 1}</span> of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setQuery((q) => ({ ...q, offset: (currentPage + 1) * pageSize }))}
                disabled={currentPage >= totalPages - 1}
                className="border-[hsl(222_14%_25%)] text-muted-foreground hover:text-foreground hover:bg-[hsl(222_16%_16%)] disabled:opacity-40"
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card className="p-12 text-center bg-[hsl(222_18%_12%)] border border-[hsl(222_14%_20%)]">
          <p className="text-muted-foreground mb-5">No regions found with market data for these filters.</p>
          <Button
            onClick={() => setQuery({ limit: 48, offset: 0 })}
            className="bg-[hsl(38_80%_57%)] text-[hsl(222_20%_9%)] hover:bg-[hsl(38_80%_65%)] border-0"
          >
            Clear Filters
          </Button>
        </Card>
      )}
    </div>
  );
}
