// src/app/marketplace/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import type { PropXProperty } from '@/types/propx';
import { getPropertyVisual } from '@/lib/propertyVisuals';
import {
  Building2,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Bed,
  Bath,
  Maximize,
  SlidersHorizontal,
  Search,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

export default function MarketplacePage() {
  const [properties, setProperties] = useState<PropXProperty[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minYield, setMinYield] = useState<number>(0);

  useEffect(() => {
    async function loadProperties() {
      try {
        setLoading(true);
        const data = await api.getExchangeProperties();
        setProperties(data);
      } catch (err) {
        console.error('Failed to load marketplace properties:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProperties();
  }, []);

  const districts = ['All', 'Downtown Dubai', 'Dubai Marina', 'Palm Jumeirah', 'Business Bay'];

  const filtered = properties.filter((p) => {
    const matchesDistrict =
      selectedDistrict === 'All' ||
      p.district.toLowerCase() === selectedDistrict.toLowerCase();
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.property_type || p.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYield = Number(p.rental_yield_pct ?? p.projected_net_yield_pct ?? 0) >= minYield;
    return matchesDistrict && matchesSearch && matchesYield;
  });

  return (
    <div className="min-h-screen bg-[#080C16] text-slate-100 font-sans py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Marketplace Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold mb-3">
            <Building2 className="w-3.5 h-3.5" />
            DUBAI VERIFIED ASSET CATALOG
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-white">
            PropX Property Marketplace
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl font-sans">
            Explore verified fractional real estate assets across premier Dubai districts. 
            All listings are backed by official Dubai Land Department (DLD) title deeds.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="hud-glass p-5 rounded-2xl border border-cyan-500/20 mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, district, or style..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#060A14] border border-white/10 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* District Selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 font-mono text-xs">
              {districts.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDistrict(d)}
                  className={`px-3 py-2 rounded-xl whitespace-nowrap font-bold transition-all ${
                    selectedDistrict === d
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                      : 'bg-[#060A14] text-slate-400 border border-white/5 hover:text-white'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Min Yield Filter */}
            <div className="flex items-center gap-3 bg-[#060A14] px-4 py-2 rounded-xl border border-white/10">
              <span className="text-xs font-mono text-slate-400 whitespace-nowrap">
                Min Net Yield:
              </span>
              <input
                type="range"
                min="0"
                max="12"
                step="0.5"
                value={minYield}
                onChange={(e) => setMinYield(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
              <span className="text-xs font-mono font-bold text-emerald-400 whitespace-nowrap">
                {minYield}%+
              </span>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-6 font-mono text-xs text-slate-400">
          <span>Showing {filtered.length} of {properties.length} Dubai Assets</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% DLD Title Deed Backed
          </span>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {filtered.map((property) => {
            const visual = getPropertyVisual(property.id);
            const progressPct = Math.min(
              100,
              Math.round(
                ((property.total_shares - property.available_shares) /
                  property.total_shares) *
                  100
              )
            );

            return (
              <div
                key={property.id}
                className="hud-glass rounded-3xl overflow-hidden border border-cyan-500/20 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,242,254,0.15)] flex flex-col group"
              >
                {/* Big Visual House Image */}
                <div className="relative w-full h-72 sm:h-80 overflow-hidden bg-slate-900">
                  <Image
                    src={visual.image}
                    alt={property.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080C16] via-[#080C16]/30 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#080C16]/80 backdrop-blur-md text-cyan-300 border border-cyan-500/40">
                        {property.district}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-950/80 backdrop-blur-md text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        DLD Verified
                      </span>
                    </div>

                    <div className="w-11 h-11 rounded-full bg-[#080C16]/90 border border-cyan-400/60 backdrop-blur-md flex flex-col items-center justify-center shadow-lg">
                      <span className="text-[9px] font-mono text-slate-400 uppercase leading-none">SCORE</span>
                      <span className="text-xs font-mono font-extrabold text-cyan-300">
                        {visual.investorScore}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Specs on Image */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-mono text-slate-300">
                    <div className="flex items-center gap-4 bg-[#080C16]/80 px-3.5 py-1.5 rounded-xl backdrop-blur-md border border-white/10">
                      <span className="flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5 text-cyan-400" />
                        {visual.beds} Beds
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath className="w-3.5 h-3.5 text-cyan-400" />
                        {visual.baths} Baths
                      </span>
                      <span className="flex items-center gap-1">
                        <Maximize className="w-3.5 h-3.5 text-cyan-400" />
                        {visual.sqft.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} sqft
                      </span>
                    </div>
                    <span className="text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-500/40 text-[11px]">
                      DTCM: {(visual.dtcmPermit || 'DTCM-VERIFIED').slice(0, 10)}
                    </span>
                  </div>
                </div>

                {/* Card Content Area */}
                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-6">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-xs font-mono text-slate-400 tracking-wider uppercase block mb-1">
                          {property.property_type || property.category}
                        </span>
                        <h3 className="font-serif text-xl sm:text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {property.title}
                        </h3>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-mono text-slate-400 block uppercase">Net APY</span>
                        <span className="text-lg sm:text-xl font-mono font-extrabold text-emerald-400">
                          {Number(property.rental_yield_pct ?? property.projected_net_yield_pct ?? 0).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Funding Progress Bar */}
                    <div className="mt-5 space-y-2">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-400">Tokenized Liquidity</span>
                        <span className="text-cyan-300 font-bold">{progressPct}% Funded</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Price Grid */}
                    <div className="grid grid-cols-2 gap-3 mt-6 p-3.5 rounded-2xl bg-[#060A14] border border-white/5">
                      <div>
                        <span className="text-[11px] font-mono text-slate-400 block">Share Price</span>
                        <span className="text-lg font-mono font-bold text-cyan-300">
                          AED {Number(property.share_price_aed ?? property.initial_share_price_aed ?? 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="border-l border-white/10 pl-3">
                        <span className="text-[11px] font-mono text-slate-400 block">Asset Valuation</span>
                        <span className="text-lg font-mono font-bold text-white">
                          AED {(Number(property.total_valuation_aed) / 1_000_000).toFixed(1)}M
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Direct Link to Exchange Order Book */}
                  <Link
                    href={`/exchange/${property.id}`}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-[#080C16] text-xs font-mono font-extrabold tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>TRADE FRACTIONAL SHARES ON EXCHANGE</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
