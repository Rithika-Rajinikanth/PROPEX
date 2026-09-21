// src/components/ai/SuggestionChips.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface SuggestionChipsProps {
  suggestions: string[];
  onClick: (suggestion: string) => void;
}

export function SuggestionChips({ suggestions, onClick }: SuggestionChipsProps) {
  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {suggestions.map((suggestion, i) => (
        <Button
          key={i}
          variant="outline"
          size="sm"
          onClick={() => onClick(suggestion)}
          className="px-3 py-1.5 text-xs bg-[hsl(38_40%_18%)] hover:bg-[hsl(38_80%_57%)] text-[hsl(38_80%_65%)] hover:text-[hsl(222_20%_9%)] border-[hsl(38_80%_57%/0.3)] hover:border-[hsl(38_80%_57%)] rounded-full transition-all duration-200 font-medium"
        >
          <Sparkles className="w-3 h-3 mr-1.5" />
          {suggestion}
        </Button>
      ))}
    </div>
  );
}
