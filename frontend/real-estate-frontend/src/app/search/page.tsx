// src/app/search/page.tsx
'use client';

import { useState } from 'react';
import { useSearch } from '@/hooks/useSearch';
import { SearchFilters } from '@/components/search/SearchFilters';
import { SearchResults } from '@/components/search/SearchResults';
import { Card } from '@/components/ui/card';
import type { SearchQuery } from '@/types/models';

export default function SearchPage() {
  const [query, setQuery] = useState<SearchQuery>({
    limit: 20,
    offset: 0,
  });

  const { data, isLoading, error } = useSearch(query);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Property Search</h1>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <SearchFilters query={query} onChange={setQuery} />
        </div>

        <div className="lg:col-span-3">
          {isLoading ? (
            <Card className="p-8 text-center">
              <p>Loading results...</p>
            </Card>
          ) : error ? (
            <Card className="p-8 text-center text-red-500">
              <p>Error loading results</p>
            </Card>
          ) : (
            <SearchResults data={data} query={query} onQueryChange={setQuery} />
          )}
        </div>
      </div>
    </div>
  );
}
