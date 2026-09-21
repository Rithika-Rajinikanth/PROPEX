// src/components/marketplace/FiltersSidebar.tsx - COMPLETE FIX

'use client';

import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { SearchQuery } from '@/types/models';
import { useState } from 'react';

interface FiltersSidebarProps {
  query: SearchQuery;
  onChange: (query: SearchQuery) => void;
}

export function FiltersSidebar({ query, onChange }: FiltersSidebarProps) {
  const [priceMin, setPriceMin] = useState<string>(query.price_min?.toString() || '');
  const [priceMax, setPriceMax] = useState<string>(query.price_max?.toString() || '');

  const updateQuery = (updates: Partial<SearchQuery>) => {
    onChange({ ...query, ...updates, offset: 0 });
  };

  const applyPriceFilter = () => {
    updateQuery({
      price_min: priceMin ? Number(priceMin) : undefined,
      price_max: priceMax ? Number(priceMax) : undefined,
    });
  };

  const resetFilters = () => {
    setPriceMin('');
    setPriceMax('');
    onChange({
      limit: 20,
      offset: 0,
    });
  };

  return (
    <Card className="p-5 space-y-6 bg-[hsl(222_18%_12%)] border border-[hsl(222_14%_20%)]">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-foreground text-base">Filters</h2>
        <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs text-muted-foreground hover:text-[hsl(38_80%_57%)] hover:bg-[hsl(38_40%_18%)] h-7 px-2">
          Reset
        </Button>
      </div>

      <div className="h-px bg-[hsl(222_14%_20%)]" />

      {/* Location */}
      <div className="space-y-2">
        <Label className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground">State</Label>
        <Select
          value={query.state || 'all'}
          onValueChange={(value) => updateQuery({ state: value === 'all' ? undefined : value })}
        >
          <SelectTrigger className="bg-[hsl(222_16%_14%)] border-[hsl(222_14%_22%)] text-foreground focus:border-[hsl(38_80%_57%/0.5)] focus:ring-[hsl(38_80%_57%/0.1)]">
            <SelectValue placeholder="All States" />
          </SelectTrigger>
          <SelectContent className="bg-[hsl(222_18%_14%)] border-[hsl(222_14%_22%)]">
            <SelectItem value="all">All States</SelectItem>
            <SelectItem value="CA">California</SelectItem>
            <SelectItem value="TX">Texas</SelectItem>
            <SelectItem value="NY">New York</SelectItem>
            <SelectItem value="FL">Florida</SelectItem>
            <SelectItem value="IL">Illinois</SelectItem>
            <SelectItem value="WA">Washington</SelectItem>
            <SelectItem value="AZ">Arizona</SelectItem>
            <SelectItem value="CO">Colorado</SelectItem>
            <SelectItem value="OR">Oregon</SelectItem>
            <SelectItem value="NV">Nevada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <Label className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground">Price Range</Label>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="number"
              placeholder="Min"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              className="bg-[hsl(222_16%_14%)] border-[hsl(222_14%_22%)] text-foreground placeholder:text-muted-foreground/50 focus:border-[hsl(38_80%_57%/0.5)]"
            />
          </div>
          <div className="flex-1">
            <Input
              type="number"
              placeholder="Max"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              className="bg-[hsl(222_16%_14%)] border-[hsl(222_14%_22%)] text-foreground placeholder:text-muted-foreground/50 focus:border-[hsl(38_80%_57%/0.5)]"
            />
          </div>
        </div>
        <Button onClick={applyPriceFilter} className="w-full bg-[hsl(38_80%_57%)] text-[hsl(222_20%_9%)] hover:bg-[hsl(38_80%_65%)] font-semibold border-0 shadow-md shadow-[hsl(38_80%_57%/0.15)]">
          Apply Price Filter
        </Button>
      </div>

      {/* Region Type */}
      <div className="space-y-2">
        <Label className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground">Region Type</Label>
        <Select
          value={query.region_type || 'all'}
          onValueChange={(value) => updateQuery({ region_type: value === 'all' ? undefined : value })}
        >
          <SelectTrigger className="bg-[hsl(222_16%_14%)] border-[hsl(222_14%_22%)] text-foreground focus:border-[hsl(38_80%_57%/0.5)]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent className="bg-[hsl(222_18%_14%)] border-[hsl(222_14%_22%)]">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="city">City</SelectItem>
            <SelectItem value="metro">Metro</SelectItem>
            <SelectItem value="county">County</SelectItem>
            <SelectItem value="zip">Zip Code</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Heat Index */}
      <div className="space-y-2">
        <Label className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground">Min Heat Index</Label>
        <Input
          type="number"
          placeholder="0–100"
          value={query.heat_index_min || ''}
          onChange={(e) =>
            updateQuery({
              heat_index_min: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className="bg-[hsl(222_16%_14%)] border-[hsl(222_14%_22%)] text-foreground placeholder:text-muted-foreground/50 focus:border-[hsl(38_80%_57%/0.5)]"
        />
        <p className="text-[11px] text-muted-foreground">
          Higher = more active market
        </p>
      </div>

      {/* Inventory */}
      <div className="space-y-2">
        <Label className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground">Min Inventory</Label>
        <Input
          type="number"
          placeholder="Min properties"
          value={query.inventory_min || ''}
          onChange={(e) =>
            updateQuery({
              inventory_min: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className="bg-[hsl(222_16%_14%)] border-[hsl(222_14%_22%)] text-foreground placeholder:text-muted-foreground/50 focus:border-[hsl(38_80%_57%/0.5)]"
        />
      </div>
    </Card>
  );
}
