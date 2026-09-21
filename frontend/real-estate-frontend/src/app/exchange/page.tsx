// src/app/exchange/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import type { PropXProperty } from '@/types/propx';
import { getPropertyVisual } from '@/lib/propertyVisuals';
import { PartitionSimulatorModal } from '@/components/exchange/PartitionSimulatorModal';
import {
  TrendingUp,
  ShieldCheck,
  Layers,
  ArrowUpRight,
  Activity,
  Building,
  Coins,
  Sparkles,
  CheckCircle2,
  Bed,
  Bath,
  Maximize,
  Compass,
  Trophy,
  Zap,
  Flame,
  ChevronRight,
} from 'lucide-react';

export default function ExchangeMarketPage() {
  const [properties, setProperties] = useState<PropXProperty[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [simulatingProperty, setSimulatingProperty] = useState<PropXProperty | null>(null);

  useEffect(() => {
    async function loadMarkets() {
      try {
        setLoading(true);
        const data = await api.getExchangeProperties();
        setProperties(data);
      } catch (err) {
        console.error('Failed to load exchange properties:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMarkets();
  }, []);

  const districts = ['All', 'Downtown Dubai', 'Dubai Marina', 'Palm Jumeirah', 'Business Bay'];

  const filteredProperties = properties.filter((p) => {
    if (selectedDistrict === 'All') return true;
    return p.district.toLowerCase() === selectedDistrict.toLowerCase();
  });

  const totalValuationAed = properties.reduce(
    (acc, p) => acc + Number(p.total_valuation_aed),
    0
  );

  return (
    <div className="min-h-screen bg-[#080C16] text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* 🎮 GAMING / FINTECH HUD TICKER & QUEST STRIP */}
        <div className="p-4 rounded-2xl hud-glass border border-cyan-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-[#080C16] font-bold shadow-lg shadow-amber-500/20 shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-400">TRADER TIER: DIAMOND WHITELIST</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  LVL 42
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <div className="w-36 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="w-3/4 h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full" />
                </div>
                <span className="text-[11px] font-mono text-slate-400">750 / 1000 XP to Next Yield Boost</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-300 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-white/5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-emerald-400 font-bold">MATCHING ENGINE ACTIVE</span>
            </div>
            <div className="h-4 w-px bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-1.5 text-cyan-300">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>24h Vol: AED {(totalValuationAed / 1_000_000).toFixed(1)}M</span>
            </div>
          </div>
        </div>

        {/* 🌟 HERO SHOWCASE SECTION */}
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-14 hud-glass border border-cyan-500/30 shadow-2xl">
          {/* Background Ambient Glows */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-cyan-500/15 via-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold tracking-wide">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
              DUBAI REAL ESTATE ASSET & STOCK EXCHANGE
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
              Invest in Iconic Dubai Houses. <br />
              <span className="text-gradient-cyan">Earn Streaming Dividends.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-sans max-w-2xl">
              Real luxury properties. Zero broker middleman markups. Trade liquid fractional shares starting from
              <span className="text-amber-400 font-semibold font-mono"> AED 15/share</span>, explore 3D LiDAR digital twins,
              and simulate instant room-partition yield multipliers.
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-[#0B1120]/80 border border-white/10 backdrop-blur-md">
                <span className="text-xs font-mono text-slate-400 block mb-1">Exchange Market Cap</span>
                <span className="text-2xl font-bold font-mono text-white">
                  AED {(totalValuationAed / 1_000_000).toFixed(1)}M
                </span>
                <span className="text-[11px] font-mono text-emerald-400 mt-1 block">+18.4% this month</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0B1120]/80 border border-emerald-500/30 backdrop-blur-md">
                <span className="text-xs font-mono text-slate-400 block mb-1">Avg Net Rental Yield</span>
                <span className="text-2xl font-bold font-mono text-emerald-400">8.8% APY</span>
                <span className="text-[11px] font-mono text-slate-400 mt-1 block">Paid to wallet daily</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0B1120]/80 border border-white/10 backdrop-blur-md">
                <span className="text-xs font-mono text-slate-400 block mb-1">Broker Commissions</span>
                <span className="text-2xl font-bold font-mono text-cyan-400">0.0% P2P</span>
                <span className="text-[11px] font-mono text-emerald-400 mt-1 block">Zero intermediary fees</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0B1120]/80 border border-white/10 backdrop-blur-md">
                <span className="text-xs font-mono text-slate-400 block mb-1">Title Deed Audit</span>
                <span className="text-2xl font-bold font-mono text-amber-400">100% Sync</span>
                <span className="text-[11px] font-mono text-slate-400 mt-1 block">Dubai Land Dept validated</span>
              </div>
            </div>
          </div>
        </div>

        {/* 🗺️ DISTRICT FILTER TABS */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
            {districts.map((district) => (
              <button
                key={district}
                type="button"
                onClick={() => setSelectedDistrict(district)}
                className={`px-5 py-2.5 rounded-xl text-xs font-mono transition-all whitespace-nowrap flex items-center gap-2 ${
                  selectedDistrict === district
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-lg shadow-cyan-500/30 border border-cyan-400/50 scale-105'
                    : 'bg-[#0E1526] text-slate-400 hover:text-white hover:bg-[#152038] border border-white/5'
                }`}
              >
                <span>{district}</span>
              </button>
            ))}
          </div>

          <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
            <span>Verified Luxury Stock Listings:</span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
              {filteredProperties.length} Properties
            </span>
          </div>
        </div>

        {/* 🏡 REAL PROPERTY BOXES / LUXURY ASSET CARDS */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[500px] rounded-3xl bg-[#0E1526] border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredProperties.map((prop) => {
              const visual = getPropertyVisual(prop.id);
              const sharePrice = Number(prop.initial_share_price_aed);
              const yieldPct = Number(prop.projected_net_yield_pct);
              const valuation = Number(prop.total_valuation_aed);
              const percentFunded = Math.round(
                ((prop.total_shares - prop.available_shares) / prop.total_shares) * 100
              );

              return (
                <div
                  key={prop.id}
                  className="hud-glass rounded-3xl overflow-hidden border border-white/10 hover:border-cyan-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/15 flex flex-col group"
                >
                  {/* Big Visual House Image Header with Badges */}
                  <div
                    className="relative h-72 w-full overflow-hidden"
                    style={{ position: 'relative', width: '100%', height: '288px', minHeight: '288px' }}
                  >
                    <Image
                      src={visual.imageUrl}
                      alt={prop.title}
                      fill
                      sizes="(max-width: 1200px) 100vw, 50vw"
                      priority
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />

                    {/* Gradient Overlay for Text Legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090E1B] via-[#090E1B]/20 to-black/50" />

                    {/* Top Floating Badges */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#080C16]/90 backdrop-blur-md text-amber-400 border border-amber-500/30 shadow-lg">
                          {prop.category}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 backdrop-blur-md text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shadow-lg">
                          <CheckCircle2 className="w-3.5 h-3.5" /> DLD Validated
                        </span>
                      </div>

                      {/* Yield Pill */}
                      <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-extrabold bg-gradient-to-r from-emerald-500 to-teal-500 text-[#080C16] shadow-lg shadow-emerald-500/30 flex items-center gap-1">
                        <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
                        {yieldPct.toFixed(1)}% APY
                      </span>
                    </div>

                    {/* Bottom Image Overlay: Title & District */}
                    <div className="absolute bottom-4 left-4 right-4 z-10">
                      <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                        {prop.district} • {prop.building_name}
                      </span>
                      <h3 className="font-serif text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {prop.title}
                      </h3>
                    </div>
                  </div>

                  {/* Property Specifications Box */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-5 bg-[#0A0F1D]">
                    {/* Beds, Baths, SqFt & View Pills */}
                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-300 pb-4 border-b border-white/5">
                      {visual.beds > 0 && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                          <Bed className="w-4 h-4 text-cyan-400" />
                          {visual.beds} Bedroom{visual.beds > 1 ? 's' : ''}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                        <Bath className="w-4 h-4 text-cyan-400" />
                        {visual.baths} Bath
                      </span>
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                        <Maximize className="w-4 h-4 text-cyan-400" />
                        {visual.sqft.toLocaleString()} SqFt
                      </span>
                      <span className="text-slate-400 italic text-[11px] truncate max-w-[200px]">
                        • {visual.view}
                      </span>
                    </div>

                    {/* Financial Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#070B14] border border-white/5 font-mono text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Share Price</span>
                        <span className="text-base font-bold text-amber-400">
                          AED {sharePrice.toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Annual Rent</span>
                        <span className="text-base font-bold text-emerald-400">
                          AED {(Number(prop.annual_gross_rent_aed) / 1000).toFixed(0)}k/yr
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Total Valuation</span>
                        <span className="text-sm font-semibold text-white">
                          AED {(valuation / 1_000_000).toFixed(2)}M
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Occupancy</span>
                        <span className="text-sm font-semibold text-cyan-300">
                          {visual.occupancyRate}%
                        </span>
                      </div>
                    </div>

                    {/* Funding Progress Bar */}
                    <div className="space-y-1.5 font-mono text-xs">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">
                          {prop.available_shares.toLocaleString()} / {prop.total_shares.toLocaleString()} Shares Left
                        </span>
                        <span className="text-cyan-400 font-bold">{percentFunded}% Tokenized</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-1000"
                          style={{ width: `${percentFunded}%` }}
                        />
                      </div>
                    </div>

                    {/* Amenities Lifestyle Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {visual.amenities.map((amenity, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-white/5 text-[11px] font-mono text-slate-300 border border-white/5"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setSimulatingProperty(prop)}
                        className="py-3 px-4 rounded-xl text-xs font-mono font-bold bg-[#141C30] hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                      >
                        <Layers className="w-4 h-4 text-cyan-400" />
                        Simulate Partition (+Yield)
                      </button>

                      <Link
                        href={`/exchange/${prop.id}`}
                        className="py-3 px-4 rounded-xl text-xs font-mono font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 hover:scale-[1.02]"
                      >
                        <Coins className="w-4 h-4" />
                        Trade Shares & Tour <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Embedded Dynamic Room Partitioning Simulation Modal */}
      {simulatingProperty && (
        <PartitionSimulatorModal
          property={simulatingProperty}
          isOpen={!!simulatingProperty}
          onClose={() => setSimulatingProperty(null)}
        />
      )}
    </div>
  );
}
