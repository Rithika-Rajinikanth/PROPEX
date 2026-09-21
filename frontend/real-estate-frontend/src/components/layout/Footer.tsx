// src/components/layout/Footer.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShieldCheck,
  Building2,
  Cpu,
  Layers,
  Sparkles,
  ArrowUpRight,
  Lock,
  Mail,
  MapPin,
  FileText,
  Compass,
} from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-cyan-500/20 bg-[#05080F] text-slate-400 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top Feature Highlights Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 mb-12 border-b border-white/5">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Microsecond CLOB
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                In-memory limit & market matching engine with instant secondary liquidity.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                DLD Anti-Fraud Shield
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Title deed OCR & Makani geofence validation with zero-bank solvency underwriting.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                3D Spatial Twins
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                LiDAR & Gaussian splat spatial telemetry with interactive yield hotspots.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Yield Multiplier
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Acoustic room partition simulator turning luxury units into co-living micro-suites.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/50 flex items-center justify-center">
                <span className="text-xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300">
                  X
                </span>
              </div>
              <div>
                <span className="text-xl font-bold font-serif text-white tracking-tight">
                  Prop<span className="text-cyan-400">X</span> Dubai
                </span>
                <p className="text-[10px] font-mono text-cyan-300 tracking-wider">
                  LIQUID REAL ESTATE ASSET EXCHANGE
                </p>
              </div>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              PropX transforms prime Dubai property into high-frequency, fractional liquid assets.
              Featuring dual-sided AI title deed verification, 3D LiDAR spatial twins, instant 
              secondary order books, and dynamic room-partition yield multipliers.
            </p>

            <div className="space-y-1.5 text-xs font-mono text-slate-400 pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>DIFC Innovation One, Level 14, Dubai, UAE</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Dubai Land Department (DLD) Sandboxed Regulatory Framework</span>
              </div>
            </div>
          </div>

          {/* Exchange & Markets */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold tracking-widest uppercase text-cyan-400">
              Exchange & Markets
            </h3>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <Link href="/exchange" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                  Live Order Book
                </Link>
              </li>
              <li>
                <Link href="/exchange/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" className="hover:text-white transition-colors">
                  Seven Palm Beachfront
                </Link>
              </li>
              <li>
                <Link href="/exchange/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb" className="hover:text-white transition-colors">
                  The Opus by Zaha Hadid
                </Link>
              </li>
              <li>
                <Link href="/exchange/cccccccc-cccc-cccc-cccc-cccccccccccc" className="hover:text-white transition-colors">
                  Burj Crown Downtown
                </Link>
              </li>
              <li>
                <Link href="/exchange/dddddddd-dddd-dddd-dddd-dddddddddddd" className="hover:text-white transition-colors">
                  Marina Gate Penthouse
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Innovation */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold tracking-widest uppercase text-emerald-400">
              Key Features
            </h3>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Portfolio & Staking Hub
                </Link>
              </li>
              <li>
                <Link href="/ai-chat" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  AI Market Advisor
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  Dubai Asset Catalog
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  Cap Rate & Macro Trends
                </Link>
              </li>
            </ul>
          </div>

          {/* Governance & Trust */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold tracking-widest uppercase text-purple-400">
              Regulatory & AI
            </h3>
            <ul className="space-y-2 text-xs font-mono">
              <li className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                OCR Title Deed Audit
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                Makani Geofence #31289
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <FileText className="w-3.5 h-3.5 text-purple-400" />
                Smart Escrow Contracts
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                STC 55 Acoustic Specs
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Copyright */}
        <div className="mt-14 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <p>© {currentYear} PropX Dubai Technologies FZ-LLC. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="text-emerald-400">System Status: All Engines Operational</span>
            <span>API v1.4.2</span>
            <span>Rust Axum + Next.js</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
