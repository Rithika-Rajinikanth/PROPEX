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

interface SearchFiltersProps {
  query: SearchQuery;
  onChange: (query: SearchQuery) => void;
}

export function SearchFilters({ query, onChange }: SearchFiltersProps) {
  const updateQuery = (updates: Partial<SearchQuery>) => {
    onChange({ ...query, ...updates, offset: 0 });
  };

  const resetFilters = () => {
    onChange({
      limit: 20,
      offset: 0,
    });
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters</h2>
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          Reset All
        </Button>
      </div>

      {/* State Filter */}
      <div className="space-y-2">
        <Label>State</Label>
        <Select
          value={query.state || 'all'}
          onValueChange={(value) => updateQuery({ state: value === 'all' ? undefined : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All States" />
          </SelectTrigger>
          <SelectContent>
            {/* ✅ FIX: Changed from "" to "all" */}
            <SelectItem value="all">All States</SelectItem>
            <SelectItem value="CA">California</SelectItem>
            <SelectItem value="TX">Texas</SelectItem>
            <SelectItem value="NY">New York</SelectItem>
            <SelectItem value="FL">Florida</SelectItem>
            <SelectItem value="IL">Illinois</SelectItem>
            <SelectItem value="PA">Pennsylvania</SelectItem>
            <SelectItem value="OH">Ohio</SelectItem>
            <SelectItem value="MA">Massachusetts</SelectItem>
            <SelectItem value="WA">Washington</SelectItem>
            <SelectItem value="CT">Connecticut</SelectItem>
            <SelectItem value="WI">Wisconsin</SelectItem>
            <SelectItem value="MI">Michigan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Region Type */}
      <div className="space-y-2">
        <Label>Region Type</Label>
        <Select
          value={query.region_type || 'all'}
          onValueChange={(value) => updateQuery({ region_type: value === 'all' ? undefined : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            {/* ✅ FIX: Changed from "" to "all" */}
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="city">City</SelectItem>
            <SelectItem value="metro">Metro</SelectItem>
            <SelectItem value="county">County</SelectItem>
            <SelectItem value="zip">Zip Code</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <Label>Price Range</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={query.price_min || ''}
            onChange={(e) => updateQuery({ price_min: e.target.value ? Number(e.target.value) : undefined })}
          />
          <Input
            type="number"
            placeholder="Max"
            value={query.price_max || ''}
            onChange={(e) => updateQuery({ price_max: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
      </div>

      {/* Heat Index */}
      <div className="space-y-2">
        <Label>Minimum Heat Index</Label>
        <Input
          type="number"
          placeholder="0-100"
          value={query.heat_index_min || ''}
          onChange={(e) => updateQuery({ heat_index_min: e.target.value ? Number(e.target.value) : undefined })}
        />
        <p className="text-xs text-muted-foreground">
          Higher heat index = more active market
        </p>
      </div>
    </Card>
  );
}