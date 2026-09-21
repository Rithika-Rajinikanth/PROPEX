// src/components/shared/ExternalDataBadge.tsx
'use client';

import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, ExternalLink } from 'lucide-react';

interface ExternalDataBadgeProps {
  loading?: boolean;
  error?: boolean;
}

export function ExternalDataBadge({ loading, error }: ExternalDataBadgeProps) {
  if (loading) {
    return (
      <Badge variant="outline" className="text-blue-600 border-blue-200">
        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        Loading market data...
      </Badge>
    );
  }

  if (error) {
    return (
      <Badge variant="outline" className="text-red-600 border-red-200">
        <ExternalLink className="h-3 w-3 mr-1" />
        Data unavailable
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-green-600 border-green-200">
      <CheckCircle2 className="h-3 w-3 mr-1" />
      Live market data
    </Badge>
  );
}