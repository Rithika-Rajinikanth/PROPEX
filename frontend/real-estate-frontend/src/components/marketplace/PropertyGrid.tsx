// src/components/marketplace/PropertyGrid.tsx
'use client';

import { PropertyCard } from '@/components/marketplace/PropertyCard';
import { Button } from '@/components/ui/button';
import type { Region, RegionMetrics, SearchQuery } from '@/types/models';

interface PropertyGridProps {
  properties: RegionMetrics[];
  query: SearchQuery;
  onQueryChange: (query: SearchQuery) => void;
  total: number;
  pageSize: number;
  currentPage: number;
}

export function PropertyGrid({
  properties,
  query,
  onQueryChange,
  total,
  pageSize,
  currentPage,
}: PropertyGridProps) {
  const totalPages = Math.ceil(total / pageSize);

  const handlePrevious = () => {
    if (currentPage > 0) {
      onQueryChange({
        ...query,
        offset: (currentPage - 1) * pageSize,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      onQueryChange({
        ...query,
        offset: (currentPage + 1) * pageSize,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Property Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {properties.map((property, index) => (
          <PropertyCard key={`${property.region_id}-${index}`}
          region={property} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentPage === 0}
            className="border-[hsl(222_14%_25%)] text-muted-foreground hover:text-foreground hover:border-[hsl(222_14%_32%)] hover:bg-[hsl(222_16%_16%)] disabled:opacity-40"
          >
            Previous
          </Button>
          
          <span className="text-sm text-muted-foreground">
            Page <span className="text-foreground font-medium">{currentPage + 1}</span> of {totalPages}
          </span>
          
          <Button
            variant="outline"
            onClick={handleNext}
            disabled={currentPage >= totalPages - 1}
            className="border-[hsl(222_14%_25%)] text-muted-foreground hover:text-foreground hover:border-[hsl(222_14%_32%)] hover:bg-[hsl(222_16%_16%)] disabled:opacity-40"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
