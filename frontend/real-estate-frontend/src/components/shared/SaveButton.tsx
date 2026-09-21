// src/components/shared/SaveButton.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

interface SaveButtonProps {
  propertyId: number;
}

export function SaveButton({ propertyId }: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Check if property is saved
    if (typeof window !== 'undefined') {
      const saved = JSON.parse(localStorage.getItem('savedProperties') || '[]');
      setIsSaved(saved.includes(propertyId));
    }
  }, [propertyId]);

  const handleToggleSave = () => {
    if (typeof window === 'undefined') return;

    const saved = JSON.parse(localStorage.getItem('savedProperties') || '[]');
    
    if (isSaved) {
      // Remove from saved
      const filtered = saved.filter((id: number) => id !== propertyId);
      localStorage.setItem('savedProperties', JSON.stringify(filtered));
      setIsSaved(false);
    } else {
      // Add to saved
      saved.push(propertyId);
      localStorage.setItem('savedProperties', JSON.stringify(saved));
      setIsSaved(true);
    }
  };

  return (
    <Button
      variant={isSaved ? 'default' : 'outline'}
      size="lg"
      onClick={handleToggleSave}
      className={isSaved ? 'bg-red-500 hover:bg-red-600' : ''}
    >
      <Heart className={`h-5 w-5 mr-2 ${isSaved ? 'fill-white' : ''}`} />
      {isSaved ? 'Saved' : 'Save'}
    </Button>
  );
}