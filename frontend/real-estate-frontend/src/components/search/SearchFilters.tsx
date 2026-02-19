// src/components/search/SearchFilters.tsx
'use client';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { SearchQuery } from '@/types/models';

interface SearchFiltersProps {
  query: SearchQuery;
  onChange: (query: SearchQuery) => void;
}

export function SearchFilters({ query, onChange }: SearchFiltersProps) {
  const updateQuery = (updates: Partial<SearchQuery>) => {
    onChange({ ...query, ...updates, offset: 0 });
  };

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-lg font-semibold">Filters</h2>

      <div className="space-y-2">
        <Label>Location</Label>
        <Input
          placeholder="City or region name"
          value={query.location || ''}
          onChange={(e) => updateQuery({ location: e.target.value || undefined })}
        />
      </div>

      <div className="space-y-2">
        <Label>State</Label>
        <Select
          value={query.state || ''}
          onValueChange={(value) => updateQuery({ state: value || undefined })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select state" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All States</SelectItem>
            <SelectItem value="CA">California</SelectItem>
            <SelectItem value="TX">Texas</SelectItem>
            <SelectItem value="NY">New York</SelectItem>
            <SelectItem value="FL">Florida</SelectItem>
            <SelectItem value="IL">Illinois</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Region Type</Label>
        <Select
          value={query.region_type || ''}
          onValueChange={(value) => updateQuery({ region_type: value || undefined })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            <SelectItem value="city">City</SelectItem>
            <SelectItem value="metro">Metro</SelectItem>
            <SelectItem value="county">County</SelectItem>
            <SelectItem value="zip">Zip Code</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Price Range</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={query.price_min || ''}
            onChange={(e) =>
              updateQuery({
                price_min: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
          <Input
            type="number"
            placeholder="Max"
            value={query.price_max || ''}
            onChange={(e) =>
              updateQuery({
                price_max: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Min Heat Index</Label>
        <Input
          type="number"
          placeholder="0-100"
          value={query.heat_index_min || ''}
          onChange={(e) =>
            updateQuery({
              heat_index_min: e.target.value ? Number(e.target.value) : undefined,
            })
          }
        />
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={() =>
          onChange({
            limit: 20,
            offset: 0,
          })
        }
      >
        Reset Filters
      </Button>
    </Card>
  );
}