// src/components/analytics/MarketSignalsWidget.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  TrendingUp,
  Zap,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Clock,
  Coins,
  ChevronRight,
  BarChart2,
  CheckCircle2,
} from 'lucide-react';

interface MarketSignalItem {
  property_id: string;
  title: string;
  district: string;
  signal: 'STRONG BUY' | 'BUY' | 'ACCUMULATE' | 'HOLD' | 'TAKE PROFIT';
  confidence_pct: number;
  projected_total_return_pct: number;
  projected_12m_profit_aed: number;
  yield_momentum: string;
  rsi_14: number;
  order_book_depth_ratio: number;
  liquidity_alert: string;
  developer_partner: string;
  developer_credit_score: string;
  reasoning: string;
}

interface MarketSignalsResponse {
  algorithm: string;
  average_prime_yield: string;
  market_sentiment: string;
  status: string;
  timestamp: string;
  signals: MarketSignalItem[];
}

export function MarketSignalsWidget() {
  const [data, setData] = useState<MarketSignalsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedSignal, setSelectedSignal] = useState<MarketSignalItem | null>(null);

  const fetchSignals = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);
      const res = await api.getAnalyticsSignals();
      if (res && res.signals) {
        setData(res);
        if (!selectedSignal && res.signals.length > 0) {
          setSelectedSignal(res.signals[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load market signals:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSignals();
  }, []);

  const getSignalBadge = (signal: string) => {
    switch (signal) {
      case 'STRONG BUY':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/20';
      case 'BUY':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/40 shadow-teal-500/20';
      case 'ACCUMULATE':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-cyan-500/20';
      case 'HOLD':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-500/20';
      default:
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-rose-500/20';
    }
  };

  if (loading) {
    return (
      <div className="hud-glass rounded-3xl p-8 border border-cyan-500/20 shadow-2xl flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-10 h-10 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-cyan-300 tracking-wider">
          COMPUTING MULTI-FACTOR MOMENTUM SIGNALS & LIQUIDITY DEPTH...
        </span>
      </div>
    );
  }

  if (!data || !data.signals || data.signals.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Alert Strip */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/50 via-slate-900 to-blue-950/50 border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shrink-0">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                {data.algorithm}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {data.market_sentiment} SENTIMENT
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              Average Prime Dubai Yield: <span className="text-emerald-400 font-bold">{data.average_prime_yield}</span> • Continuous microsecond rebalancing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <button
            type="button"
            onClick={() => fetchSignals(true)}
            disabled={refreshing}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Re-scan Engine</span>
          </button>
        </div>
      </div>

      {/* Grid of Asset Signals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.signals.map((item) => {
          const isSelected = selectedSignal?.property_id === item.property_id;
          return (
            <div
              key={item.property_id}
              onClick={() => setSelectedSignal(item)}
              className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 relative border ${
                isSelected
                  ? 'bg-cyan-950/30 border-cyan-400 shadow-xl shadow-cyan-500/20 scale-[1.02]'
                  : 'hud-glass border-white/10 hover:border-cyan-500/40 hover:bg-white/5'
              }`}
            >
              {/* Signal Badge & District */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold border shadow-sm ${getSignalBadge(
                    item.signal
                  )}`}
                >
                  {item.signal}
                </span>
                <span className="text-[11px] font-mono text-slate-400 truncate">
                  {item.district}
                </span>
              </div>

              {/* Title */}
              <h4 className="font-serif text-sm font-bold text-white line-clamp-1 mb-3">
                {item.title}
              </h4>

              {/* Forecast Profit & Confidence */}
              <div className="space-y-2 pt-2 border-t border-white/5 text-xs font-mono">
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-400 text-[11px]">12M Profit Est:</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    +AED {item.projected_12m_profit_aed.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[11px]">Target Return:</span>
                  <span className="text-cyan-300 font-bold">
                    +{item.projected_total_return_pct}% Total
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[11px]">AI Confidence:</span>
                  <span className="text-white font-bold">{item.confidence_pct}%</span>
                </div>
              </div>

              {/* Real-time Liquidity Alert Chip */}
              <div className="mt-3.5 pt-2.5 border-t border-white/5">
                <span className="text-[10px] font-mono text-cyan-300/90 line-clamp-1 block">
                  ⚡ {item.liquidity_alert}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deep-Dive Inspection Card for Selected Asset */}
      {selectedSignal && (
        <div className="p-6 rounded-3xl hud-glass border border-cyan-500/30 shadow-2xl space-y-5 animate-fade-in">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono font-extrabold border shadow-sm ${getSignalBadge(
                    selectedSignal.signal
                  )}`}
                >
                  {selectedSignal.signal}
                </span>
                <span className="text-xs font-mono text-cyan-400">
                  {selectedSignal.district}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  • Backed by {selectedSignal.developer_partner} ({selectedSignal.developer_credit_score})
                </span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-white">
                {selectedSignal.title}
              </h3>
            </div>

            <Link
              href={`/exchange/${selectedSignal.property_id}`}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-[#080C16] text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/25 self-start lg:self-auto"
            >
              <span>Trade Shares on Order Book</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Reasoning & Momentum telemetry */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-3">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
                Algorithmic Underwriting & Synthesis
              </span>
              <p className="text-sm font-sans text-slate-300 leading-relaxed bg-[#070B14] p-4 rounded-2xl border border-white/5">
                {selectedSignal.reasoning}
              </p>
              <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 flex items-center gap-3">
                <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-xs font-mono text-cyan-200">
                  {selectedSignal.liquidity_alert}
                </span>
              </div>
            </div>

            {/* Quantitative Indicator Grid */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3.5 bg-[#070B14] rounded-2xl border border-white/5">
                <span className="text-slate-400 block text-[11px]">12M Projected Profit</span>
                <span className="text-emerald-400 font-bold text-base">
                  AED {selectedSignal.projected_12m_profit_aed.toLocaleString()}
                </span>
              </div>
              <div className="p-3.5 bg-[#070B14] rounded-2xl border border-white/5">
                <span className="text-slate-400 block text-[11px]">Target Total Return</span>
                <span className="text-cyan-300 font-bold text-base">
                  +{selectedSignal.projected_total_return_pct}% APY
                </span>
              </div>
              <div className="p-3.5 bg-[#070B14] rounded-2xl border border-white/5">
                <span className="text-slate-400 block text-[11px]">Depth Imbalance Ratio</span>
                <span className="text-white font-bold text-base">
                  {selectedSignal.order_book_depth_ratio}x Bids
                </span>
              </div>
              <div className="p-3.5 bg-[#070B14] rounded-2xl border border-white/5">
                <span className="text-slate-400 block text-[11px]">14-Day RSI</span>
                <span className={`font-bold text-base ${selectedSignal.rsi_14 > 65 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {selectedSignal.rsi_14} ({selectedSignal.rsi_14 < 45 ? 'Oversold Accumulation' : selectedSignal.rsi_14 > 65 ? 'Consolidating' : 'Neutral Momentum'})
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
