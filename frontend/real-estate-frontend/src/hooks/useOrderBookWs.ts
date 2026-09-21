// src/hooks/useOrderBookWs.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { OrderBookDepthResponse } from '@/types/propx';

interface UseOrderBookWsReturn {
  depth: OrderBookDepthResponse | null;
  isConnected: boolean;
  error: string | null;
  reconnect: () => void;
}

export function useOrderBookWs(
  propertyId: string | null,
  initialDepth?: OrderBookDepthResponse | null
): UseOrderBookWsReturn {
  const [depth, setDepth] = useState<OrderBookDepthResponse | null>(initialDepth || null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update initial depth if passed from SSR / initial fetch
  useEffect(() => {
    if (initialDepth) {
      setDepth(initialDepth);
    }
  }, [initialDepth]);

  const connect = useCallback(() => {
    if (!propertyId || typeof window === 'undefined') return;

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:8085';
    const socketUrl = `${wsUrl}/api/v1/exchange/ws/${propertyId}`;

    try {
      const ws = new WebSocket(socketUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && (data.bids || data.asks)) {
            setDepth((prev) => ({
              property_id: data.property_id || propertyId,
              bids: data.bids || prev?.bids || [],
              asks: data.asks || prev?.asks || [],
              spread_aed: data.spread_aed !== undefined ? data.spread_aed : prev?.spread_aed ?? null,
              last_traded_price_aed:
                data.last_traded_price_aed !== undefined
                  ? data.last_traded_price_aed
                  : prev?.last_traded_price_aed ?? null,
            }));
          }
        } catch (parseErr) {
          console.warn('[OrderBookWs] Failed to parse message:', parseErr);
        }
      };

      ws.onerror = (evt) => {
        setError('WebSocket error encountered');
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Auto-reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };
    } catch (err: any) {
      setError(err?.message || 'Failed to connect WebSocket');
      setIsConnected(false);
    }
  }, [propertyId]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  const reconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    connect();
  }, [connect]);

  return {
    depth,
    isConnected,
    error,
    reconnect,
  };
}
