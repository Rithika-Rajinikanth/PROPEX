// src/app/saved/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { PropertyCard } from '@/components/marketplace/PropertyCard';
import { Loader2, Heart } from 'lucide-react';
import type { Region, RegionMetrics } from '@/types/models';

export default function SavedPropertiesPage() {
  const [savedProperties, setSavedProperties] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSavedProperties = async () => {
      if (typeof window === 'undefined') return;

      const savedIds = JSON.parse(localStorage.getItem('savedProperties') || '[]');
      
      if (savedIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const propertyPromises = savedIds.map((id: number) =>
          fetch(`/api/v1/regions/${id}`).then(res => res.json())
        );

        const properties = await Promise.all(propertyPromises);
        setSavedProperties(properties);
      } catch (error) {
        console.error('Failed to load saved properties:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSavedProperties();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-7 w-7 animate-spin text-[hsl(38_80%_57%)]" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Heart className="h-6 w-6 text-[hsl(12_72%_55%)] fill-[hsl(12_72%_55%)]" />
          <h1 className="font-serif text-foreground">Saved Properties</h1>
        </div>
        <div className="h-0.5 w-10 bg-[hsl(38_80%_57%)] mt-3 mb-2" />
        <p className="text-sm text-muted-foreground">
          {savedProperties.length} {savedProperties.length === 1 ? 'property' : 'properties'} saved
        </p>
      </div>

      {savedProperties.length === 0 ? (
        <div className="text-center py-16 bg-[hsl(222_18%_12%)] border border-[hsl(222_14%_20%)] rounded-md">
          <Heart className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <h2 className="font-serif text-foreground mb-2">No Saved Properties</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Start saving properties by clicking the heart icon
          </p>
          <a
            href="/marketplace"
            className="inline-flex items-center px-5 py-2.5 bg-[hsl(38_80%_57%)] text-[hsl(222_20%_9%)] rounded font-semibold text-sm hover:bg-[hsl(38_80%_65%)] transition-colors shadow-md shadow-[hsl(38_80%_57%/0.15)]"
          >
            Browse Properties
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedProperties.map((property) => (
            <PropertyCard
              key={property.id}
              region={{ ...property, region_id: property.id } as RegionMetrics}
            />
          ))}
        </div>
      )}
    </div>
  );
}
