// src/components/shared/ShareButton.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Check } from 'lucide-react';
import type { Region } from '@/types/models';

interface ShareButtonProps {
  property: Region;
}

export function ShareButton({ property }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/regions/${property.id}`;
    const text = `Check out this property in ${property.region_name}, ${property.state_name}!`;

    // Try native share first
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${property.region_name}, ${property.state_name}`,
          text,
          url,
        });
        return;
      } catch (error) {
        // User cancelled or share failed, fall back to clipboard
      }
    }

    // Fall back to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={handleShare}
      className={copied ? 'bg-green-50 border-green-500 text-green-700' : ''}
    >
      {copied ? (
        <>
          <Check className="h-5 w-5 mr-2" />
          Copied!
        </>
      ) : (
        <>
          <Share2 className="h-5 w-5 mr-2" />
          Share
        </>
      )}
    </Button>
  );
}