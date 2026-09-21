// src/components/marketplace/QuickSearch.tsx
'use client';

import { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { SearchQuery } from '@/types/models';

interface QuickSearchProps {
  onSearch: (query: Partial<SearchQuery>) => void;
}

export function QuickSearch({ onSearch }: QuickSearchProps) {
  const [searchText, setSearchText] = useState('');

  const handleSearch = () => {
    if (!searchText.trim()) return;

    // Parse search text for filters
    const query: Partial<SearchQuery> = {};

    // Extract state (e.g., "CA", "California")
    const stateMatch = searchText.match(/\b(CA|TX|NY|FL|IL|WA|AZ|CO|OR|NV|California|Texas|New York|Florida|Washington|Arizona|Colorado|Oregon|Nevada)\b/i);
    if (stateMatch) {
      const stateMap: Record<string, string> = {
        'California': 'CA',
        'Texas': 'TX',
        'New York': 'NY',
        'Florida': 'FL',
        'Washington': 'WA',
        'Arizona': 'AZ',
        'Colorado': 'CO',
        'Oregon': 'OR',
        'Nevada': 'NV',
      };
      query.state = stateMap[stateMatch[1]] || stateMatch[1].toUpperCase().slice(0, 2);
    }

    // Extract price (e.g., "under 500k", "< $500,000", "under $500000")
    const priceMatch = searchText.match(/(?:under|<|less than|below)\s*\$?([0-9,]+)k?/i);
    if (priceMatch) {
      let price = parseInt(priceMatch[1].replace(/,/g, ''));
      // Check if it ends with 'k' or 'K'
      if (priceMatch[0].toLowerCase().includes('k')) {
        price = price * 1000;
      }
      query.price_max = price;
    }

    // Extract city name (basic pattern)
    const cityMatch = searchText.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/);
    if (cityMatch && !stateMatch?.includes(cityMatch[1])) {
      query.location = cityMatch[1];
    }

    onSearch(query);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by city, state, or price (e.g., 'Seattle WA under 700k')"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pl-9 bg-[hsl(222_16%_14%)] border-[hsl(222_14%_22%)] text-foreground placeholder:text-muted-foreground/50 focus:border-[hsl(38_80%_57%/0.5)] focus:ring-[hsl(38_80%_57%/0.1)]"
        />
      </div>
      <Button onClick={handleSearch} className="bg-[hsl(38_80%_57%)] text-[hsl(222_20%_9%)] hover:bg-[hsl(38_80%_65%)] font-semibold border-0 shadow-md shadow-[hsl(38_80%_57%/0.15)]">
        Search
      </Button>
      <Button 
        variant="outline" 
        onClick={() => window.location.href = '/ai-chat'}
        className="border-[hsl(222_14%_25%)] text-muted-foreground hover:text-[hsl(38_80%_57%)] hover:border-[hsl(38_80%_57%/0.4)] hover:bg-[hsl(38_40%_18%)]"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        AI Search
      </Button>
    </div>
  );
}
