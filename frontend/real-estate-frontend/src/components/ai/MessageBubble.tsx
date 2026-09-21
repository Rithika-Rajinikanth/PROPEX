// src/components/ai/MessageBubble.tsx
'use client';

import { PropertyCard } from './PropertyCard';
import { SuggestionChips } from './SuggestionChips';
import type { ChatMessage } from '@/types/models';
import { useEffect, useState } from 'react';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps {
  message: ChatMessage;
  onSuggestionClick: (suggestion: string) => void;
}

async function fetchPropertyData(regionId: string) {
  try {
    // Relative URL — proxied by Next.js middleware to backend
    const res = await fetch(`/api/v1/regions/${regionId}/metrics`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.region_id) data.region_id = parseInt(regionId);

    try {
      // Relative URL — proxied by Next.js middleware to ML service via /ml/*
      const extRes = await fetch('/ml/external/combined', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region_name: data.region_name, state: data.state_name }),
      });
      if (extRes.ok) {
        const extData = await extRes.json();
        data.external_data = extData.data;
      }
    } catch {
      // External data service unavailable — skip silently
    }

    return data;
  } catch (err) {
    console.error(`Failed to fetch region ${regionId}:`, err);
    return null;
  }
}

export function MessageBubble({ message, onSuggestionClick }: MessageBubbleProps) {
  const [properties, setProperties] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const isUser = message.role === 'user';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isUser) return;
    const loadProperties = async () => {
      const regex = /\/regions\/(\d+)/g;
      const matches = [...message.content.matchAll(regex)];
      if (matches.length === 0) return;
      const ids = [...new Set(matches.map((m) => m[1]))];
      const fetched = await Promise.all(ids.map(fetchPropertyData));
      setProperties(fetched.filter(Boolean));
    };
    loadProperties();
  }, [message.content, isUser]);

  const cleanContent = message.content.replace(/\/regions\/\d+/g, '').trim();

  const formatTime = () => {
    try {
      const d = message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp);
      return d.toLocaleTimeString();
    } catch {
      return '';
    }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex gap-3 max-w-3xl ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
            isUser
              ? 'bg-[hsl(38_80%_57%)] shadow-[hsl(38_80%_57%/0.25)]'
              : 'bg-[hsl(222_18%_20%)] border border-[hsl(222_14%_26%)]'
          }`}
        >
          {isUser ? (
            <User className="w-4 h-4 text-[hsl(222_20%_9%)]" />
          ) : (
            <Bot className="w-4 h-4 text-[hsl(38_80%_57%)]" />
          )}
        </div>

        {/* Bubble */}
        <div
          className={`flex flex-col gap-3 rounded-2xl px-5 py-4 ${
            isUser
              ? 'bg-[hsl(38_80%_57%)] text-[hsl(222_20%_9%)] shadow-lg shadow-[hsl(38_80%_57%/0.15)]'
              : 'bg-[hsl(222_18%_14%)] border border-[hsl(222_14%_22%)]'
          }`}
        >
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              components={{
                p: ({ node, ...props }) => (
                  <p
                    {...props}
                    className={`m-0 text-sm leading-relaxed ${
                      isUser ? 'text-[hsl(222_20%_9%)]' : 'text-foreground'
                    }`}
                  />
                ),
                strong: ({ node, ...props }) => (
                  <strong
                    {...props}
                    className={
                      isUser ? 'text-[hsl(222_20%_9%)]' : 'text-foreground font-semibold'
                    }
                  />
                ),
              }}
            >
              {cleanContent}
            </ReactMarkdown>
          </div>

          {properties.length > 0 && (
            <div className="mt-1 space-y-3">
              {properties.map((property) => (
                <PropertyCard key={property.region_id} property={property} />
              ))}
            </div>
          )}

          {message.suggestions && message.suggestions.length > 0 && (
            <SuggestionChips suggestions={message.suggestions} onClick={onSuggestionClick} />
          )}

          {/* Only render timestamp after client hydration to avoid SSR mismatch */}
          {mounted && (
            <div
              className={`text-[10px] mt-0.5 ${
                isUser ? 'text-[hsl(222_20%_9%/0.6)]' : 'text-muted-foreground'
              }`}
            >
              {formatTime()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
