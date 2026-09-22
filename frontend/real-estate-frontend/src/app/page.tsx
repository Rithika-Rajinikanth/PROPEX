// src/app/page.tsx
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
  Cpu,
  Lock,
  FileCheck,
  UserCheck,
  Sliders,
  DollarSign,
  Percent,
  Search,
  MessageSquare,
  BarChart3,
  Users,
  Briefcase,
  Building2,
  HelpCircle,
  Eye,
  Brain,
} from 'lucide-react';

export default function HomePage() {
  const [properties, setProperties] = useState<PropXProperty[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [simulatingProperty, setSimulatingProperty] = useState<PropXProperty | null>(null);

  // AI Auditor Interactive Widget State
  const [auditorTab, setAuditorTab] = useState<'seller' | 'buyer'>('seller');
  const [auditProgress, setAuditProgress] = useState<number>(100);

  // Partition Interactive Calculator State
  const [simPartitions, setSimPartitions] = useState<number>(2);
  const [simBaseRent, setSimBaseRent] = useState<number>(235000);
  const [simRentPerRoom, setSimRentPerRoom] = useState<number>(4500);

  // Persona Ecosystem State
  const [activePersona, setActivePersona] = useState<'investor' | 'landlord' | 'developer' | 'fund'>('investor');

  useEffect(() => {
    async function loadProperties() {
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
    loadProperties();
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

  // Dynamic calculations for Homepage Partition Calculator
  const simulatedAddedRentAnnual = simPartitions * simRentPerRoom * 12;
  const totalSimulatedRent = simBaseRent + simulatedAddedRentAnnual;
  const simulatedYieldSurgePct = ((simulatedAddedRentAnnual / simBaseRent) * 100).toFixed(1);
  const capexAed = simPartitions * 8000;
  const paybackMonths = (capexAed / (simPartitions * simRentPerRoom)).toFixed(1);

  // Deterministic number formatter to avoid SSR/hydration locale mismatch
  const formatNumber = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return (
    <div className="min-h-screen bg-[#080C16] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 🌟 HERO COMMAND CENTER SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-28 border-b border-cyan-500/10">
        {/* Background Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-bl from-cyan-500/15 via-blue-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Level 42 Trader HUD Quest Strip */}
          <div className="mb-8 p-3.5 rounded-2xl bg-[#0B1120]/90 border border-cyan-500/30 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-400">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-amber-400">QUEST ACTIVE</span>
                  <span className="text-[11px] font-mono text-slate-400">• Level 42 Trader</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                    DIAMOND WHITELIST
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <div className="w-36 h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="w-3/4 h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    750 / 1000 XP to Next Yield Multiplier
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-slate-300 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-white/5">
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

          {/* Main Hero Header */}
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/15 via-blue-500/15 to-purple-500/15 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold tracking-wide shadow-lg shadow-cyan-500/10">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
              DUBAI'S PREMIER LIQUID REAL ESTATE & ASSET EXCHANGE
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] tracking-tight">
              Invest in Iconic Dubai Houses. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
                Liquid. Fractional. AI-Audited.
              </span>
            </h1>

            <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-sans max-w-3xl mx-auto">
              Transform illiquid Dubai luxury properties into 24/7 fractional assets with microsecond order books.
              Featuring dual-sided AI title deed anti-fraud audit, interactive 3D LiDAR digital twins, and
              algorithmic room-partition yield multipliers.
            </p>

            {/* High-Impact Hero Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/exchange"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 text-[#080C16] font-mono font-extrabold text-sm tracking-wide shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] transition-all flex items-center gap-2.5"
              >
                <TrendingUp className="w-5 h-5" />
                <span>TRADE ON LIVE EXCHANGE</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>

              <a
                href="#partition-engine"
                className="px-8 py-4 rounded-2xl bg-[#0D1527] hover:bg-[#131E35] border border-cyan-500/30 text-cyan-300 font-mono font-bold text-sm tracking-wide transition-all flex items-center gap-2.5 shadow-lg shadow-black/40"
              >
                <Sliders className="w-5 h-5 text-cyan-400" />
                <span>SIMULATE ROOM PARTITION</span>
              </a>

              <a
                href="#ai-auditor"
                className="px-8 py-4 rounded-2xl bg-[#0D1527] hover:bg-[#131E35] border border-emerald-500/30 text-emerald-300 font-mono font-bold text-sm tracking-wide transition-all flex items-center gap-2.5 shadow-lg shadow-black/40"
              >
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>AI TITLE DEED AUDITOR</span>
              </a>

              <Link
                href="/ai-chat"
                className="px-8 py-4 rounded-2xl bg-[#0D1527] hover:bg-[#131E35] border border-purple-500/30 text-purple-300 font-mono font-bold text-sm tracking-wide transition-all flex items-center gap-2.5 shadow-lg shadow-black/40"
              >
                <Brain className="w-5 h-5 text-purple-400" />
                <span>AI ADVISOR CHAT</span>
              </Link>
            </div>

            {/* Quick Live Telemetry Counters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 text-left">
              <div className="p-5 rounded-2xl bg-[#0B1120]/80 border border-cyan-500/30 backdrop-blur-md">
                <span className="text-xs font-mono text-slate-400 block mb-1">Exchange Market Cap</span>
                <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
                  AED {(totalValuationAed / 1_000_000).toFixed(1)}M
                </span>
                <span className="text-[11px] font-mono text-emerald-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +18.4% this month
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-[#0B1120]/80 border border-emerald-500/30 backdrop-blur-md">
                <span className="text-xs font-mono text-slate-400 block mb-1">Avg Net Rental Yield</span>
                <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400">8.8% - 14.2%</span>
                <span className="text-[11px] font-mono text-slate-400 mt-1 block">Paid daily to wallet</span>
              </div>

              <div className="p-5 rounded-2xl bg-[#0B1120]/80 border border-purple-500/30 backdrop-blur-md">
                <span className="text-xs font-mono text-slate-400 block mb-1">DLD Title Fraud Rate</span>
                <span className="text-2xl sm:text-3xl font-bold font-mono text-cyan-300">0.00%</span>
                <span className="text-[11px] font-mono text-cyan-400 mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> 100% Registry Synced
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-[#0B1120]/80 border border-amber-500/30 backdrop-blur-md">
                <span className="text-xs font-mono text-slate-400 block mb-1">Matching Engine Latency</span>
                <span className="text-2xl sm:text-3xl font-bold font-mono text-amber-300">&lt; 1.2 ms</span>
                <span className="text-[11px] font-mono text-slate-400 mt-1 block">In-Memory Rust CLOB</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🏢 FEATURED PROPERTY BOXES SHOWCASE */}
      <section className="py-20 border-b border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold mb-3">
                <Building2 className="w-3.5 h-3.5" />
                FLAGSHIP DUBAI ASSET INVENTORY
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-white">
                Live Tokenized Property Catalog
              </h2>
              <p className="text-slate-400 text-sm mt-1 max-w-xl font-sans">
                Each property has passed Dubai Land Department (DLD) OCR title deed checks, Makani geo-verification,
                and DTCM holiday home licensing.
              </p>
            </div>

            {/* District Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none font-mono text-xs">
              {districts.map((district) => (
                <button
                  key={district}
                  onClick={() => setSelectedDistrict(district)}
                  className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap font-bold ${
                    selectedDistrict === district
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-lg shadow-cyan-500/10'
                      : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {district}
                </button>
              ))}
            </div>
          </div>

          {/* Property Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {filteredProperties.map((property) => {
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

                      {/* Investor Score Ring */}
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
                          {formatNumber(visual.sqft)} sqft
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

                        {/* Net APY Pill */}
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
                        <div className="flex justify-between text-[11px] font-mono text-slate-400">
                          <span>{(property.total_shares - property.available_shares).toLocaleString()} shares sold</span>
                          <span>{property.available_shares.toLocaleString()} remaining</span>
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

                    {/* Dual Action CTAs */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <Link
                        href={`/exchange/${property.id}`}
                        className="py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-[#080C16] text-xs font-mono font-extrabold tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20"
                      >
                        <TrendingUp className="w-4 h-4" />
                        <span>TRADE SHARES</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => setSimulatingProperty(property)}
                        className="py-3 px-4 rounded-xl bg-[#0D1527] hover:bg-[#14203D] border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <Sliders className="w-4 h-4 text-cyan-400" />
                        <span>YIELD SIMULATOR</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/exchange"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#0D1527] hover:bg-[#14203D] border border-cyan-500/30 text-cyan-300 text-sm font-mono font-bold shadow-xl transition-all"
            >
              <span>VIEW ALL 4 PROPERTIES ON LIVE ORDER BOOK</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 🛡️ DEEP DIVE FEATURE 1: DUAL-SIDED AI AUDITOR & ANTI-FRAUD SHIELD */}
      <section id="ai-auditor" className="py-24 border-b border-white/5 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold mb-4">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              PATENTED DUAL-SIDED VERIFICATION
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-white">
              Dual-Sided AI Auditor &amp; Anti-Fraud Engine
            </h2>
            <p className="text-slate-300 text-base sm:text-lg mt-3 font-sans">
              Traditional property deals take 30 to 45 days of title searches and bank approvals.
              PropX uses autonomous OCR and underwriting algorithms to execute checks in under 3 seconds.
            </p>
          </div>

          {/* Interactive Auditor Showcase Card */}
          <div className="max-w-5xl mx-auto hud-glass rounded-3xl p-6 sm:p-10 border border-emerald-500/30 shadow-2xl">
            {/* Tab Switcher */}
            <div className="grid grid-cols-2 p-1 bg-[#060A14] rounded-2xl border border-white/10 mb-8 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => setAuditorTab('seller')}
                className={`py-3 text-xs font-mono font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  auditorTab === 'seller'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-[#080C16] shadow-lg shadow-emerald-500/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                <span>SELLER: TITLE DEED ANTI-FRAUD</span>
              </button>

              <button
                type="button"
                onClick={() => setAuditorTab('buyer')}
                className={`py-3 text-xs font-mono font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  auditorTab === 'buyer'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-[#080C16] shadow-lg shadow-cyan-500/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>BUYER: ZERO-BANK SOLVENCY</span>
              </button>
            </div>

            {auditorTab === 'seller' ? (
              /* Seller Title Deed Anti-Fraud View */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    OCR Neural Engine: Deed Document Verified
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                    Automated DLD Registry &amp; Makani Anti-Fraud Check
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed font-sans">
                    Every asset tokenized on PropX undergoes real-time optical character recognition (OCR) 
                    and cross-referencing against the official Dubai Land Department (DLD) title database.
                  </p>

                  <div className="space-y-3 pt-2 font-mono text-xs">
                    <div className="p-3.5 rounded-xl bg-[#060A14] border border-white/5 flex items-center justify-between">
                      <span className="text-slate-400">DLD Title Deed Registry Sync:</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 100% UNENCUMBERED
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#060A14] border border-white/5 flex items-center justify-between">
                      <span className="text-slate-400">Makani Geofence #31289 44812:</span>
                      <span className="text-cyan-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 0.2m GPS BOUNDARY MATCH
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#060A14] border border-white/5 flex items-center justify-between">
                      <span className="text-slate-400">Owner Levenshtein Similarity:</span>
                      <span className="text-emerald-400 font-bold">99.4% CONFIDENCE</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#060A14] border border-white/5 flex items-center justify-between">
                      <span className="text-slate-400">Active Bank Mortgages:</span>
                      <span className="text-emerald-400 font-bold">0 LIENS DETECTED</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Audit Report Card */}
                <div className="p-6 rounded-2xl bg-[#060A14] border border-emerald-500/30 font-mono space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <span className="text-xs font-bold text-white">DLD AUDIT CERTIFICATE</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      PASSED • ZERO FRAUD
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Deed ID:</span>
                      <span className="text-cyan-300">DLD-DXB-2024-99812</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Audited At:</span>
                      <span className="text-slate-300">2026-09-20 18:40 UTC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Risk Score:</span>
                      <span className="text-emerald-400 font-bold">0.04 / 1.0 (LOWEST RISK)</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 leading-relaxed">
                    "All biometric signatures, national IDs, and Dubai Municipality cadastral boundaries 
                    match official records. Title is clean and eligible for 100% fractional liquid trading."
                  </div>

                  <div className="text-center pt-2">
                    <Link
                      href="/exchange"
                      className="text-xs text-cyan-400 hover:text-cyan-300 underline font-semibold"
                    >
                      Inspect Live Audited Deeds on Exchange &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              /* Buyer Solvency & Zero-Bank View */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-mono">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    Instant Solvency Underwriter: Active
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                    Zero-Bank Instant Solvency &amp; EMI Underwriting
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed font-sans">
                    Never wait 3 weeks for mortgage approvals again. PropX underwrites buyer solvency 
                    algorithmically based on liquid asset reserves, portfolio dividend yield, and crypto balances.
                  </p>

                  <div className="space-y-3 pt-2 font-mono text-xs">
                    <div className="p-3.5 rounded-xl bg-[#060A14] border border-white/5 flex items-center justify-between">
                      <span className="text-slate-400">Algorithmic Solvency Tier:</span>
                      <span className="text-cyan-300 font-bold">AAA (PRIME SOVEREIGN)</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#060A14] border border-white/5 flex items-center justify-between">
                      <span className="text-slate-400">Instant EMI Financing Limit:</span>
                      <span className="text-emerald-400 font-bold">AED 250,000 / month</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#060A14] border border-white/5 flex items-center justify-between">
                      <span className="text-slate-400">Smart Contract Escrow Lock:</span>
                      <span className="text-cyan-400 font-bold">AUTOMATED P2P DEBIT</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#060A14] border border-white/5 flex items-center justify-between">
                      <span className="text-slate-400">Approval Time:</span>
                      <span className="text-amber-300 font-bold">&lt; 45 SECONDS</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Buyer Credit Passport */}
                <div className="p-6 rounded-2xl bg-[#060A14] border border-cyan-500/30 font-mono space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-cyan-400" />
                      <span className="text-xs font-bold text-white">BUYER SOLVENCY PASSPORT</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      INSTANT APPROVAL
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Investor ID:</span>
                      <span className="text-cyan-300">USR-DXB-LEVEL-42</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Solvency Coverage Ratio:</span>
                      <span className="text-emerald-400 font-bold">4.2x Required Reserves</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Underwriting Fee:</span>
                      <span className="text-emerald-400 font-bold">0.0% (Zero Broker Commission)</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-300 leading-relaxed">
                    "Buyer verified through UAE Pass biometric credentials. Direct smart escrow line opened 
                    for instant fractional order execution."
                  </div>

                  <div className="text-center pt-2">
                    <Link
                      href="/dashboard"
                      className="text-xs text-cyan-400 hover:text-cyan-300 underline font-semibold"
                    >
                      Check Your Instant Solvency in Portfolio Hub &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 📐 DEEP DIVE FEATURE 2: 3D ACOUSTIC ROOM-PARTITIONING YIELD MULTIPLIER */}
      <section id="partition-engine" className="py-24 border-b border-white/5 relative overflow-hidden bg-[#060A14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold mb-4">
              <Sliders className="w-4 h-4 text-cyan-400" />
              PROPRIETARY VALUE-ADD ALGORITHM
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-white">
              Acoustic Room-Partitioning Yield Multiplier
            </h2>
            <p className="text-slate-300 text-base sm:text-lg mt-3 font-sans">
              Dubai's luxury apartments often contain underutilized expansive living zones. 
              Our AI architectural engine calculates exact acoustic drywall dividing plans to create 
              autonomous executive co-living suites—boosting annual rental yields by over 45%.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Visual 3D Floorplan Cutaway Render */}
            <div className="lg:col-span-6 hud-glass rounded-3xl overflow-hidden border border-cyan-500/20 p-4 relative">
              <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden bg-slate-950">
                <Image
                  src="/images/properties/partition_render.jpg"
                  alt="3D Acoustic Room Partition Cutaway"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080C16] via-transparent to-transparent" />

                {/* Floating Architectural Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-[#080C16]/90 backdrop-blur-md text-cyan-300 border border-cyan-500/40">
                    STC 55 Soundproof Rated
                  </span>
                  <span className="px-3 py-1 rounded-xl text-xs font-mono font-semibold bg-emerald-950/90 backdrop-blur-md text-emerald-300 border border-emerald-500/40">
                    Dubai Municipality Code Compliant
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-[#080C16]/90 backdrop-blur-md border border-white/10 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300">Divider: Heavy Gauge Acoustic Partition</span>
                  <span className="text-emerald-400 font-bold">+45.9% Yield Surge</span>
                </div>
              </div>
            </div>

            {/* Interactive Live Partition Calculator Controls */}
            <div className="lg:col-span-6 hud-glass rounded-3xl p-6 sm:p-8 border border-cyan-500/20 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                  Interactive Yield Calculator
                </h3>
                <span className="text-xs font-mono text-cyan-300 bg-cyan-500/10 px-3 py-1 rounded-lg border border-cyan-500/30">
                  Seven Palm Beachfront
                </span>
              </div>

              {/* Slider: Number of Partitions */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-300">Additional Executive Micro-Suites:</span>
                  <span className="text-cyan-300 text-base font-bold">+{simPartitions} Rooms</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="1"
                  value={simPartitions}
                  onChange={(e) => setSimPartitions(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-500">
                  <span>+1 Room (Studio)</span>
                  <span>+2 Rooms (Optimal)</span>
                  <span>+3 Rooms (Max Co-living)</span>
                </div>
              </div>

              {/* Live Calculation Results Grid */}
              <div className="grid grid-cols-2 gap-4 font-mono">
                <div className="p-4 rounded-2xl bg-[#060A14] border border-white/5">
                  <span className="text-[11px] text-slate-400 block mb-1">Baseline Annual Rent</span>
                  <span className="text-lg font-bold text-slate-300">
                    AED {formatNumber(simBaseRent)}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Standard 1BR layout</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#060A14] border border-emerald-500/30">
                  <span className="text-[11px] text-slate-400 block mb-1">Partitioned Annual Rent</span>
                  <span className="text-lg font-bold text-emerald-400">
                    AED {formatNumber(totalSimulatedRent)}
                  </span>
                  <span className="text-[10px] text-emerald-400/80 mt-0.5 block">
                    +{simulatedYieldSurgePct}% rental surge!
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#060A14] border border-white/5">
                  <span className="text-[11px] text-slate-400 block mb-1">Estimated Capex</span>
                  <span className="text-lg font-bold text-amber-400">
                    AED {formatNumber(capexAed)}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">STC-55 certified drywall</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#060A14] border border-cyan-500/30">
                  <span className="text-[11px] text-slate-400 block mb-1">Capex Payback Period</span>
                  <span className="text-lg font-bold text-cyan-300">{paybackMonths} Months</span>
                  <span className="text-[10px] text-cyan-400/80 mt-0.5 block">Instant ROI recovery</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const sample = properties[0];
                    if (sample) setSimulatingProperty(sample);
                  }}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-[#080C16] text-xs font-mono font-extrabold tracking-wider hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20"
                >
                  <Sliders className="w-4 h-4" />
                  <span>LAUNCH FULL SIMULATOR ON ACTUAL PROPERTIES</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🌐 DEEP DIVE FEATURE 3: 3D SPATIAL LIDAR DIGITAL TWINS */}
      <section className="py-24 border-b border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold">
                <Layers className="w-4 h-4 text-purple-400" />
                NEURAL GAUSSIAN SPLATS &amp; LIDAR
              </div>

              <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-white leading-tight">
                Inspect Properties Remotely with 3D Spatial Twins
              </h2>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-sans">
                Never rely on static photos or misleading marketing renders. 
                PropX deploys LiDAR 3D scanning drones and Gaussian splat neural rendering 
                to generate hyper-accurate sub-millimeter spatial twins for every asset.
              </p>

              <div className="grid grid-cols-2 gap-4 font-mono text-xs pt-2">
                <div className="p-4 rounded-2xl bg-[#060A14] border border-white/5">
                  <span className="text-purple-400 font-bold block mb-1">IoT Telemetry Pins</span>
                  <span className="text-slate-300">
                    Live telemetry for HVAC power draw, water consumption, and structural integrity.
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#060A14] border border-white/5">
                  <span className="text-cyan-400 font-bold block mb-1">Yield Hotspot Map</span>
                  <span className="text-slate-300">
                    Visual heatmaps showing high-demand rental zones within the residence.
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/exchange/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-purple-200 text-xs font-mono font-bold transition-all shadow-lg shadow-purple-500/10"
                >
                  <Eye className="w-4 h-4 text-purple-400" />
                  <span>EXPERIENCE LIVE 3D TWIN ON SEVEN PALM</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Visual Digital Twin Viewport Graphic */}
            <div className="hud-glass rounded-3xl p-4 border border-purple-500/20 shadow-2xl relative">
              <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden bg-slate-950">
                <Image
                  src="/images/properties/seven_palm.jpg"
                  alt="3D LiDAR Spatial Twin Preview"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080C16] via-transparent to-[#080C16]/40" />

                {/* Simulated Pulsing Hotspots */}
                <div className="absolute top-1/3 left-1/3 p-2 rounded-xl bg-[#080C16]/90 border border-cyan-400 text-cyan-300 text-xs font-mono backdrop-blur-md shadow-xl flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                  <span>Floor-to-Ceiling Glazing (+4.2% Premium)</span>
                </div>

                <div className="absolute bottom-1/4 right-1/4 p-2 rounded-xl bg-[#080C16]/90 border border-emerald-400 text-emerald-300 text-xs font-mono backdrop-blur-md shadow-xl flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Acoustic Partition Node (STC 55)</span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-mono text-slate-300 bg-[#080C16]/80 p-2.5 rounded-xl backdrop-blur-md border border-white/10">
                  <span>LiDAR Resolution: 0.8mm Point Cloud</span>
                  <span className="text-emerald-400">FPS: 60 (WebGL Optimized)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 👥 MULTI-PERSONA ECOSYSTEM SECTION */}
      <section className="py-24 border-b border-white/5 relative bg-[#060A14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold mb-4">
              <Users className="w-4 h-4 text-amber-400" />
              INCLUSIVE ARCHITECTURE FOR ALL PARTICIPANTS
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-white">
              Built for Every Real Estate Persona
            </h2>
            <p className="text-slate-300 text-base sm:text-lg mt-3 font-sans">
              Whether you are a retail investor seeking passive daily rent, a landlord needing instant equity liquidity,
              or an institutional developer selling off-plan tranches.
            </p>
          </div>

          {/* Persona Tabs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto mb-10 font-mono text-xs">
            <button
              type="button"
              onClick={() => setActivePersona('investor')}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                activePersona === 'investor'
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/10'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Coins className="w-5 h-5" />
              <span className="font-bold">Retail Investor</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePersona('landlord')}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                activePersona === 'landlord'
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-500/10'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Building className="w-5 h-5" />
              <span className="font-bold">Landlord / Owner</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePersona('developer')}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                activePersona === 'developer'
                  ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-lg shadow-purple-500/10'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-5 h-5" />
              <span className="font-bold">Developer (Emaar/Damac)</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePersona('fund')}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                activePersona === 'fund'
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-lg shadow-amber-500/10'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-5 h-5" />
              <span className="font-bold">Fund / Arbitrage</span>
            </button>
          </div>

          {/* Persona Detail Display */}
          <div className="max-w-4xl mx-auto hud-glass rounded-3xl p-8 sm:p-10 border border-cyan-500/20">
            {activePersona === 'investor' && (
              <div className="space-y-4">
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block">
                  Persona: Retail Fractional Investor
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  Invest from AED 50. Earn Daily Rent. Exit Anytime.
                </h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-sans">
                  No multi-million dirham down payments or mortgage underwriting hurdles. 
                  Buy shares in iconic Palm Jumeirah or Downtown penthouses, receive proportional daily rental yields 
                  streamed directly to your connected wallet, and trade your shares on the secondary market in seconds.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 font-mono text-xs">
                  <div className="p-3.5 rounded-xl bg-[#080C16] border border-white/5">
                    <span className="text-slate-400 block mb-1">Minimum Investment</span>
                    <span className="text-white font-bold text-base">AED 15 / share</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#080C16] border border-white/5">
                    <span className="text-slate-400 block mb-1">Dividend Payouts</span>
                    <span className="text-emerald-400 font-bold text-base">Daily Streaming in AED</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#080C16] border border-white/5">
                    <span className="text-slate-400 block mb-1">Secondary Liquidity</span>
                    <span className="text-cyan-300 font-bold text-base">24/7 CLOB Order Book</span>
                  </div>
                </div>
              </div>
            )}

            {activePersona === 'landlord' && (
              <div className="space-y-4">
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider block">
                  Persona: Landlord &amp; Property Owner
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  Unlock Up to 80% Equity in 48 Hours Without Selling the Entire Deed
                </h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-sans">
                  Need capital for a new venture without selling your entire Dubai property? 
                  List 20% to 50% of your property as fractional shares on PropX. Retain master tenancy management 
                  or delegate to our verified DTCM holiday operators while accessing immediate institutional liquidity.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 font-mono text-xs">
                  <div className="p-3.5 rounded-xl bg-[#080C16] border border-white/5">
                    <span className="text-slate-400 block mb-1">Liquidity Speed</span>
                    <span className="text-emerald-400 font-bold text-base">48h Tokenization</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#080C16] border border-white/5">
                    <span className="text-slate-400 block mb-1">Broker Commissions</span>
                    <span className="text-white font-bold text-base">0.0% (Zero Middlemen)</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#080C16] border border-white/5">
                    <span className="text-slate-400 block mb-1">Title Deed Custody</span>
                    <span className="text-cyan-300 font-bold text-base">Protected by DLD Trust</span>
                  </div>
                </div>
              </div>
            )}

            {activePersona === 'developer' && (
              <div className="space-y-4">
                <span className="text-xs font-mono text-purple-400 uppercase tracking-wider block">
                  Persona: Institutional Developer (Emaar, Nakheel, Damac)
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  Off-Plan Fractional Pre-Sales with Smart Contract Milestone Escrow
                </h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-sans">
                  Fund new luxury mega-towers with fractional pre-sale liquidity from global investors. 
                  Funds are held in automated smart contract escrow vaults that disburse capital upon 
                  Dubai Municipality construction milestone verifications.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 font-mono text-xs">
                  <div className="p-3.5 rounded-xl bg-[#080C16] border border-white/5">
                    <span className="text-slate-400 block mb-1">Global Reach</span>
                    <span className="text-purple-300 font-bold text-base">140+ Countries</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#080C16] border border-white/5">
                    <span className="text-slate-400 block mb-1">Escrow Automation</span>
                    <span className="text-emerald-400 font-bold text-base">Milestone Smart Vaults</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#080C16] border border-white/5">
                    <span className="text-slate-400 block mb-1">Pre-Sales Velocity</span>
                    <span className="text-cyan-300 font-bold text-base">Instant Secondary Trading</span>
                  </div>
                </div>
              </div>
            )}

            {activePersona === 'fund' && (
              <div className="space-y-4">
                <span className="text-xs font-mono text-amber-400 uppercase tracking-wider block">
                  Persona: Fund Manager &amp; Algorithmic Arbitrage
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  Algorithmic Real Estate Baskets &amp; Spatial Partition Arbitrage
                </h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-sans">
                  Execute programmatic REIT rebalancing across high-cap-rate Dubai districts. 
                  Capitalize on partition yield delta arbitrage by purchasing undervalued units and 
                  sponsoring acoustic room division for immediate 40%+ cash-flow surges.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 font-mono text-xs">
                  <div className="p-3.5 rounded-xl bg-[#080C16] border border-white/5">
                    <span className="text-slate-400 block mb-1">API Trading</span>
                    <span className="text-amber-300 font-bold text-base">REST &amp; WebSockets</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#080C16] border border-white/5">
                    <span className="text-slate-400 block mb-1">Yield Multiplier</span>
                    <span className="text-emerald-400 font-bold text-base">+45.9% STC-55 Arbitrage</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#080C16] border border-white/5">
                    <span className="text-slate-400 block mb-1">Settlement Asset</span>
                    <span className="text-cyan-300 font-bold text-base">AED &amp; USDC Dual Support</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 🤖 FEATURE SPOTLIGHT: PROPX AI INTELLIGENCE TERMINAL */}
      <section className="py-24 border-b border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
                <Brain className="w-4 h-4 text-cyan-400" />
                RAG-POWERED DUBAI REAL ESTATE INTELLIGENCE
              </div>

              <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-white leading-tight">
                Ask PropX AI: Your 24/7 Dubai Market Advisor
              </h2>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-sans">
                Trained on the Dubai Land Department regulatory code, Makani geofencing, short-term rental permits,
                and micro-market cap rates. Get instant answers with verified sources.
              </p>

              {/* Sample Prompt Chips */}
              <div className="space-y-2.5 font-mono text-xs">
                <Link
                  href="/ai-chat"
                  className="p-3 rounded-xl bg-[#060A14] hover:bg-[#0D1527] border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-all flex items-center justify-between block group"
                >
                  <span>"What is the DLD transfer fee structure for fractional shares?"</span>
                  <ArrowUpRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/ai-chat"
                  className="p-3 rounded-xl bg-[#060A14] hover:bg-[#0D1527] border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-all flex items-center justify-between block group"
                >
                  <span>"How does STC 55 acoustic insulation affect DTCM holiday home yield?"</span>
                  <ArrowUpRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/ai-chat"
                  className="p-3 rounded-xl bg-[#060A14] hover:bg-[#0D1527] border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-all flex items-center justify-between block group"
                >
                  <span>"Compare rental yields between Palm Jumeirah and Downtown Dubai."</span>
                  <ArrowUpRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              <div className="pt-2">
                <Link
                  href="/ai-chat"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-[#080C16] text-xs font-mono font-extrabold tracking-wider shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>LAUNCH FULL AI ASSISTANT CHAT</span>
                </Link>
              </div>
            </div>

            {/* Chat Terminal Simulation Graphic */}
            <div className="hud-glass rounded-3xl p-6 border border-cyan-500/20 font-mono text-xs space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="font-bold text-white">PropX Dubai AI Terminal</span>
                </div>
                <span className="text-slate-500 text-[11px]">RAG Model v2.4</span>
              </div>

              <div className="space-y-3">
                {/* Simulated Assistant Message */}
                <div className="p-4 rounded-2xl bg-[#060A14] border border-cyan-500/30 text-slate-300 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>PropX AI Assistant</span>
                  </div>
                  <p className="leading-relaxed">
                    "Welcome! In Downtown Dubai, average 1BR holiday suites yield 7.8% net APY. 
                    However, applying an STC 55 acoustic partition at Burj Crown increases rental income 
                    from AED 195,000 to AED 275,000 (+41.0%), amortizing your capex in under 2.1 months."
                  </p>
                </div>

                {/* Simulated User Message */}
                <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 ml-6 text-right">
                  "Can I trade these shares instantly in AED?"
                </div>

                {/* Simulated Answer */}
                <div className="p-4 rounded-2xl bg-[#060A14] border border-emerald-500/30 text-slate-300 space-y-1">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Instant Execution Engine</span>
                  </div>
                  <p className="leading-relaxed text-emerald-300">
                    "Yes. All fractional shares are listed on our 24/7 in-memory order book. 
                    Orders match in micro-seconds and settle instantly to your portfolio in AED or USDC."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🚀 FINAL CALL TO ACTION */}
      <section className="py-24 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/20 to-transparent pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold">
            <Flame className="w-4 h-4 text-amber-400" />
            JOIN OVER 14,000 GLOBAL TRADERS
          </div>

          <h2 className="font-serif text-4xl sm:text-6xl font-extrabold text-white leading-tight">
            Start Trading Dubai Real Estate <br />
            <span className="text-gradient-cyan">Like High-Yield Tech Stocks</span>
          </h2>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto font-sans leading-relaxed">
            Zero broker lockups. Clean title deeds backed by DLD audit. 
            Daily streaming rent dividends from iconic Dubai properties.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/exchange"
              className="px-10 py-5 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 text-[#080C16] font-mono font-extrabold text-sm tracking-wider shadow-2xl shadow-cyan-500/30 hover:scale-105 transition-all flex items-center gap-2"
            >
              <TrendingUp className="w-5 h-5" />
              <span>LAUNCH PROPX EXCHANGE</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>

            <Link
              href="/dashboard"
              className="px-10 py-5 rounded-2xl bg-[#0D1527] hover:bg-[#131E35] border border-white/20 text-white font-mono font-bold text-sm tracking-wider transition-all flex items-center gap-2"
            >
              <Briefcase className="w-5 h-5 text-cyan-400" />
              <span>VIEW PORTFOLIO HUB</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Partition Simulator Modal */}
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
