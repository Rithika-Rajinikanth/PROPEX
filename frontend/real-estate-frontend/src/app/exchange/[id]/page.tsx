// src/app/exchange/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import type { PropXProperty, OrderBookDepthResponse } from '@/types/propx';
import { getPropertyVisual } from '@/lib/propertyVisuals';
import { useOrderBookWs } from '@/hooks/useOrderBookWs';
import { OrderBookTable } from '@/components/exchange/OrderBookTable';
import { OrderExecutionWidget } from '@/components/exchange/OrderExecutionWidget';
import { PartitionSimulatorModal } from '@/components/exchange/PartitionSimulatorModal';
import { AuditBadge } from '@/components/exchange/AuditBadge';
import { DigitalTwinViewer } from '@/components/exchange/DigitalTwinViewer';
import {
  ChevronLeft,
  Share2,
  Bookmark,
  TrendingUp,
  Layers,
  Building,
  ShieldCheck,
  FileText,
  Activity,
  Bed,
  Bath,
  Maximize,
  ArrowUpRight,
  Sparkles,
  Zap,
} from 'lucide-react';

export default function AssetTradingTerminalPage() {
  const params = useParams();
  const propertyId = params?.id as string;

  const [property, setProperty] = useState<PropXProperty | null>(null);
  const [initialDepth, setInitialDepth] = useState<OrderBookDepthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [isSimModalOpen, setIsSimModalOpen] = useState<boolean>(false);

  // WebSocket connection for live order book streaming
  const { depth, isConnected } = useOrderBookWs(propertyId, initialDepth);

  useEffect(() => {
    if (!propertyId) return;

    async function loadData() {
      try {
        setLoading(true);
        const [propData, bookData] = await Promise.all([
          api.getPropertyDetail(propertyId),
          api.getOrderBookDepth(propertyId).catch(() => null),
        ]);
        setProperty(propData);
        if (bookData) setInitialDepth(bookData);
      } catch (err) {
        console.error('Failed to load asset details:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [propertyId]);

  if (loading || !property) {
    return (
      <div className="min-h-screen bg-[#080C16] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-cyan-300 tracking-wider">
            SYNCHRONIZING PROPX MATCHING ENGINE & 3D DIGITAL TWIN...
          </span>
        </div>
      </div>
    );
  }

  const visual = getPropertyVisual(property.id);

  const sharePrice =
    depth?.last_traded_price_aed !== null && depth?.last_traded_price_aed !== undefined
      ? Number(depth.last_traded_price_aed)
      : Number(property.initial_share_price_aed);

  const yieldPct = Number(property.projected_net_yield_pct);
  const totalValuation = Number(property.total_valuation_aed);
  const dailyDividendPerShare = (sharePrice * (yieldPct / 100)) / 365;

  return (
    <div className="min-h-screen bg-[#080C16] text-white pb-16">
      {/* 🌟 LUXURY PROPERTY HERO BANNER */}
      <div className="relative border-b border-white/10 bg-[#090E1B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Top Breadcrumb & Actions */}
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/exchange"
              className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Dubai Exchange</span>
            </Link>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                TRADING ACTIVE (T+0)
              </span>
            </div>
          </div>

          {/* Property Identity & Live Market Stats Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {property.category}
                </span>
                <span className="text-xs font-mono text-cyan-400">
                  {property.district} • {property.building_name}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Unit {property.unit_number} • Makani {property.makani_number}
                </span>
              </div>

              <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-white">
                {property.title}
              </h1>

              {/* Architectural Spec Pills */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-300 pt-1">
                {visual.beds > 0 && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10">
                    <Bed className="w-3.5 h-3.5 text-cyan-400" />
                    {visual.beds} Bed{visual.beds > 1 ? 's' : ''}
                  </span>
                )}
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10">
                  <Bath className="w-3.5 h-3.5 text-cyan-400" />
                  {visual.baths} Bath
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10">
                  <Maximize className="w-3.5 h-3.5 text-cyan-400" />
                  {visual.sqft.toLocaleString()} SqFt
                </span>
                <span className="text-slate-400 italic">• {visual.view}</span>
              </div>
            </div>

            {/* Live Ticker & Action Strip */}
            <div className="flex flex-wrap items-center gap-6 p-4 rounded-2xl bg-[#070B14] border border-white/10 font-mono">
              <div>
                <span className="text-[11px] text-slate-400 block uppercase">Share Price</span>
                <span className="text-2xl font-extrabold text-cyan-300">
                  AED {sharePrice.toFixed(2)}
                </span>
              </div>

              <div className="h-8 w-px bg-white/10" />

              <div>
                <span className="text-[11px] text-slate-400 block uppercase">Net Yield</span>
                <span className="text-2xl font-extrabold text-emerald-400 flex items-center">
                  {yieldPct.toFixed(1)}% APY
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </span>
              </div>

              <div className="h-8 w-px bg-white/10" />

              <div>
                <span className="text-[11px] text-slate-400 block uppercase">Daily Dividend</span>
                <span className="text-sm font-bold text-white">
                  AED {dailyDividendPerShare.toFixed(4)} / sh
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsSimModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-[#080C16] text-xs font-bold transition-all shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
              >
                <Layers className="w-4 h-4" />
                Simulate Partitions (+Yield)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 MAIN TRADING & 3D TERMINAL WORKSPACE */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Live Order Book Depth (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <OrderBookTable
              depth={depth}
              isConnected={isConnected}
              onPriceSelect={(p) => setSelectedPrice(p)}
            />

            {/* Quick Room Partitioning Feature Card */}
            <div className="p-5 rounded-2xl hud-glass border border-cyan-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-white block">
                  Dynamic Room Partitioning
                </span>
                <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                  Boost yield from {yieldPct}% to {(yieldPct + 4.8).toFixed(1)}% APY
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsSimModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#080C16] text-xs font-mono font-bold transition-all shadow-md shadow-cyan-500/20"
              >
                Simulate +
              </button>
            </div>
          </div>

          {/* Center Column: 3D Digital Twin LiDAR & Fraud Audit Badge (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <DigitalTwinViewer
              propertyId={property.id}
              title={property.title}
              splatUrl={property.splat_url}
              district={property.district}
            />

            <AuditBadge
              makaniNumber={property.makani_number}
              plotNumber={property.plot_number}
              unitNumber={property.unit_number}
            />

            {/* Financial Underwriting Breakdown */}
            <div className="hud-glass rounded-2xl p-6 border border-white/10 shadow-xl space-y-4">
              <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                Financial Underwriting Breakdown
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3.5 bg-[#070B14] rounded-xl border border-white/5">
                  <span className="text-slate-400 block text-[11px]">Total Asset Valuation</span>
                  <span className="text-white font-bold text-sm">
                    AED {totalValuation.toLocaleString()}
                  </span>
                </div>
                <div className="p-3.5 bg-[#070B14] rounded-xl border border-white/5">
                  <span className="text-slate-400 block text-[11px]">Annual Gross Rent</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    AED {Number(property.annual_gross_rent_aed).toLocaleString()}
                  </span>
                </div>
                <div className="p-3.5 bg-[#070B14] rounded-xl border border-white/5">
                  <span className="text-slate-400 block text-[11px]">Service Charge / SqFt</span>
                  <span className="text-slate-200 font-bold">
                    AED {Number(property.service_charge_per_sqft_aed).toFixed(2)}
                  </span>
                </div>
                <div className="p-3.5 bg-[#070B14] rounded-xl border border-white/5">
                  <span className="text-slate-400 block text-[11px]">Tokenized Shares</span>
                  <span className="text-cyan-300 font-bold">
                    {property.total_shares.toLocaleString()} Shares
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Execution Widget (3 cols) */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <OrderExecutionWidget
              property={property}
              selectedPrice={selectedPrice}
            />
          </div>
        </div>
      </div>

      {/* Dynamic Room Partitioning Modal */}
      <PartitionSimulatorModal
        property={property}
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
      />
    </div>
  );
}
