// src/components/exchange/OrderBookTable.tsx
'use client';

import React, { useMemo } from 'react';
import type { OrderBookDepthResponse } from '@/types/propx';
import { ArrowUpRight, ArrowDownRight, Activity, Zap } from 'lucide-react';

interface OrderBookTableProps {
  depth: OrderBookDepthResponse | null;
  isConnected: boolean;
  onPriceSelect?: (price: number) => void;
}

export function OrderBookTable({ depth, isConnected, onPriceSelect }: OrderBookTableProps) {
  const { bids, asks, spread_aed, last_traded_price_aed } = depth || {
    bids: [],
    asks: [],
    spread_aed: null,
    last_traded_price_aed: null,
  };

  const maxShareVolume = useMemo(() => {
    let max = 1;
    for (const b of bids) if (b.total_shares > max) max = b.total_shares;
    for (const a of asks) if (a.total_shares > max) max = a.total_shares;
    return max;
  }, [bids, asks]);

  const displayAsks = useMemo(() => {
    return [...asks].sort((a, b) => Number(b.price_aed) - Number(a.price_aed)).slice(-7);
  }, [asks]);

  const displayBids = useMemo(() => {
    return [...bids].sort((a, b) => Number(b.price_aed) - Number(a.price_aed)).slice(0, 7);
  }, [bids]);

  return (
    <div className="hud-glass rounded-2xl p-5 flex flex-col h-full border border-cyan-500/20 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
            Live Order Book Depth
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'
            }`}
          />
          <span className="text-[10px] text-cyan-300 font-mono font-semibold">
            {isConnected ? 'LIVE WS FEED' : 'RECONNECTING'}
          </span>
        </div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-3 text-[11px] font-mono uppercase tracking-wider text-slate-400 pb-2 px-1 border-b border-white/5">
        <span className="text-left">Price (AED)</span>
        <span className="text-right">Shares</span>
        <span className="text-right">Total (AED)</span>
      </div>

      {/* Asks (Sell Orders) */}
      <div className="flex flex-col gap-1 py-1.5">
        {displayAsks.length === 0 ? (
          <div className="py-4 text-center text-xs text-slate-400 italic font-mono">
            No active sell orders
          </div>
        ) : (
          displayAsks.map((ask, idx) => {
            const price = Number(ask.price_aed);
            const shares = ask.total_shares;
            const total = price * shares;
            const depthPct = Math.min(100, Math.round((shares / maxShareVolume) * 100));

            return (
              <div
                key={`ask-${idx}-${price}`}
                onClick={() => onPriceSelect?.(price)}
                className="relative grid grid-cols-3 text-xs font-mono py-1.5 px-2 rounded-lg hover:bg-rose-500/20 cursor-pointer transition-colors group"
              >
                <div
                  className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-rose-500/25 to-transparent rounded-lg pointer-events-none transition-all duration-300"
                  style={{ width: `${depthPct}%` }}
                />
                <span className="text-rose-400 font-bold relative z-10 text-left">
                  {price.toFixed(2)}
                </span>
                <span className="text-slate-200 relative z-10 text-right">
                  {shares.toLocaleString()}
                </span>
                <span className="text-slate-400 relative z-10 text-right">
                  {total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Mid-Market Spread & Last Price Bar */}
      <div className="my-2.5 py-2.5 px-4 bg-[#080D1A] border-y border-cyan-500/30 flex items-center justify-between rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 uppercase font-mono">Last Price:</span>
          <span className="text-base font-bold font-mono text-cyan-300 flex items-center">
            {last_traded_price_aed !== null && last_traded_price_aed !== undefined
              ? `AED ${Number(last_traded_price_aed).toFixed(2)}`
              : 'AED 1,000.00'}
            <ArrowUpRight className="w-4 h-4 text-emerald-400 ml-1 inline" />
          </span>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-slate-400 font-mono">
            Spread:{' '}
            <span className="text-emerald-400 font-bold">
              {spread_aed !== null && spread_aed !== undefined
                ? `AED ${Number(spread_aed).toFixed(2)}`
                : 'AED 0.30'}
            </span>
          </span>
        </div>
      </div>

      {/* Bids (Buy Orders) */}
      <div className="flex flex-col gap-1 py-1.5 flex-1">
        {displayBids.length === 0 ? (
          <div className="py-4 text-center text-xs text-slate-400 italic font-mono">
            No active buy orders
          </div>
        ) : (
          displayBids.map((bid, idx) => {
            const price = Number(bid.price_aed);
            const shares = bid.total_shares;
            const total = price * shares;
            const depthPct = Math.min(100, Math.round((shares / maxShareVolume) * 100));

            return (
              <div
                key={`bid-${idx}-${price}`}
                onClick={() => onPriceSelect?.(price)}
                className="relative grid grid-cols-3 text-xs font-mono py-1.5 px-2 rounded-lg hover:bg-emerald-500/20 cursor-pointer transition-colors group"
              >
                <div
                  className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-emerald-500/25 to-transparent rounded-lg pointer-events-none transition-all duration-300"
                  style={{ width: `${depthPct}%` }}
                />
                <span className="text-emerald-400 font-bold relative z-10 text-left">
                  {price.toFixed(2)}
                </span>
                <span className="text-slate-200 relative z-10 text-right">
                  {shares.toLocaleString()}
                </span>
                <span className="text-slate-400 relative z-10 text-right">
                  {total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>Click any row to fill ticket</span>
        <span className="text-cyan-400 font-bold">Instant Settlement (T+0)</span>
      </div>
    </div>
  );
}
