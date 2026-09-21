// src/app/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { UserPortfolioSummary } from '@/types/propx';
import {
  Wallet,
  TrendingUp,
  Building,
  Layers,
  ShieldCheck,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Lock,
  Hotel,
  UserCheck,
  PlusCircle,
  FileCheck,
} from 'lucide-react';

type Persona = 'investor' | 'landlord' | 'institutional' | 'hybrid';

export default function UnifiedDashboardPage() {
  const [persona, setPersona] = useState<Persona>('investor');
  const [portfolio, setPortfolio] = useState<UserPortfolioSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [accruedDividends, setAccruedDividends] = useState<number>(142.85);

  // Seed investor ID from our database seed
  const DEMO_USER_ID = '11111111-1111-1111-1111-111111111111';

  useEffect(() => {
    async function loadPortfolio() {
      try {
        setLoading(true);
        const data = await api.getUserPortfolio(DEMO_USER_ID);
        setPortfolio(data);
      } catch (err) {
        console.error('Failed to load portfolio:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPortfolio();
  }, []);

  // Real-time ticking dividend accrual counter (simulating per-second rental dividend streaming)
  useEffect(() => {
    const interval = setInterval(() => {
      setAccruedDividends((prev) => prev + 0.0035);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalValue = portfolio
    ? Number(portfolio.wallet_balance_aed) + Number(portfolio.total_portfolio_value_aed)
    : 184500;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header with Multi-Persona Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[hsl(38_80%_57%)] bg-[hsl(38_40%_18%)] px-3 py-1 rounded-full border border-[hsl(38_80%_57%/0.3)]">
                UNIFIED MULTI-PERSONA IDENTITY
              </span>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                KYC Tier 2 Verified
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mt-2">
              Zayed Al-Maktoum Portfolio & Asset Terminal
            </h1>
            <p className="text-xs font-mono text-muted-foreground mt-1">
              One Unified Wallet • Multi-Role Rights: Investor, Landlord & Developer
            </p>
          </div>

          {/* Persona Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 bg-[hsl(222_18%_12%)] border border-[hsl(222_14%_22%)] rounded-xl overflow-x-auto">
            <button
              type="button"
              onClick={() => setPersona('investor')}
              className={`px-3 py-2 rounded-lg text-xs font-mono font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                persona === 'investor'
                  ? 'bg-[hsl(38_80%_57%)] text-[hsl(222_20%_9%)] shadow-md shadow-[hsl(38_80%_57%/0.2)]'
                  : 'text-muted-foreground hover:text-white'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              Investor Persona
            </button>

            <button
              type="button"
              onClick={() => setPersona('landlord')}
              className={`px-3 py-2 rounded-lg text-xs font-mono font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                persona === 'landlord'
                  ? 'bg-[hsl(38_80%_57%)] text-[hsl(222_20%_9%)] shadow-md shadow-[hsl(38_80%_57%/0.2)]'
                  : 'text-muted-foreground hover:text-white'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              Landlord / Owner
            </button>

            <button
              type="button"
              onClick={() => setPersona('institutional')}
              className={`px-3 py-2 rounded-lg text-xs font-mono font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                persona === 'institutional'
                  ? 'bg-[hsl(38_80%_57%)] text-[hsl(222_20%_9%)] shadow-md shadow-[hsl(38_80%_57%/0.2)]'
                  : 'text-muted-foreground hover:text-white'
              }`}
            >
              <Hotel className="w-3.5 h-3.5" />
              Institutional Developer
            </button>

            <button
              type="button"
              onClick={() => setPersona('hybrid')}
              className={`px-3 py-2 rounded-lg text-xs font-mono font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                persona === 'hybrid'
                  ? 'bg-[hsl(38_80%_57%)] text-[hsl(222_20%_9%)] shadow-md shadow-[hsl(38_80%_57%/0.2)]'
                  : 'text-muted-foreground hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Dual Hybrid View
            </button>
          </div>
        </div>

        {/* Top Wallet & Accrual Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 bg-[hsl(222_18%_12%)] border border-[hsl(222_14%_22%)] rounded-2xl shadow-lg">
            <span className="text-xs font-mono text-muted-foreground block mb-1">
              Total Net Asset Value
            </span>
            <span className="text-2xl font-bold font-mono text-foreground">
              AED {totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-mono text-emerald-400 flex items-center mt-2">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              +14.2% Past 30 Days
            </span>
          </div>

          <div className="p-5 bg-[hsl(222_18%_12%)] border border-[hsl(222_14%_22%)] rounded-2xl shadow-lg">
            <span className="text-xs font-mono text-muted-foreground block mb-1">
              Liquid Cash Balance
            </span>
            <span className="text-2xl font-bold font-mono text-[hsl(38_80%_62%)]">
              AED{' '}
              {portfolio
                ? Number(portfolio.wallet_balance_aed).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : '50,000.00'}
            </span>
            <span className="text-xs font-mono text-muted-foreground mt-2 block">
              Instant T+0 settlement ready
            </span>
          </div>

          <div className="p-5 bg-[hsl(222_18%_12%)] border border-[hsl(38_80%_57%/0.3)] rounded-2xl shadow-lg bg-gradient-to-br from-[hsl(222_18%_12%)] to-[hsl(38_40%_18%/0.2)]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono text-muted-foreground">
                Streaming Rental Dividends
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <span className="text-2xl font-bold font-mono text-emerald-400">
              AED {accruedDividends.toFixed(4)}
            </span>
            <span className="text-xs font-mono text-neutral-400 mt-2 block">
              Auto-compounds daily
            </span>
          </div>

          <div className="p-5 bg-[hsl(222_18%_12%)] border border-[hsl(222_14%_22%)] rounded-2xl shadow-lg">
            <span className="text-xs font-mono text-muted-foreground block mb-1">
              Zero-Broker P2P Escrow
            </span>
            <span className="text-2xl font-bold font-mono text-foreground">
              AED 0.00 Active
            </span>
            <span className="text-xs font-mono text-emerald-400 mt-2 block">
              100% Direct Buyer-to-Seller
            </span>
          </div>
        </div>

        {/* Dynamic Persona Workspace */}

        {/* 1. INVESTOR PERSONA */}
        {(persona === 'investor' || persona === 'hybrid') && (
          <div className="mb-10 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-bold text-foreground flex items-center gap-2">
                <Coins className="w-5 h-5 text-[hsl(38_80%_57%)]" />
                Fractional Real Estate Holdings
              </h3>
              <Link
                href="/exchange"
                className="text-xs font-mono text-[hsl(38_80%_57%)] hover:underline flex items-center gap-1"
              >
                Browse All Tranches <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-[hsl(222_18%_12%)] border border-[hsl(222_14%_22%)] rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-[hsl(222_20%_9%)] border-b border-[hsl(222_14%_20%)] text-muted-foreground uppercase text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Asset / District</th>
                      <th className="py-3 px-4 text-right">Shares Owned</th>
                      <th className="py-3 px-4 text-right">Cost Basis</th>
                      <th className="py-3 px-4 text-right">Market Price</th>
                      <th className="py-3 px-4 text-right">Unrealized PnL</th>
                      <th className="py-3 px-4 text-right">Annual Dividend</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[hsl(222_14%_18%)] text-neutral-200">
                    {portfolio && portfolio.holdings.length > 0 ? (
                      portfolio.holdings.map((holding) => (
                        <tr
                          key={holding.property_id}
                          className="hover:bg-[hsl(222_16%_15%)] transition-colors"
                        >
                          <td className="py-4 px-4">
                            <span className="font-bold text-foreground block font-serif text-sm">
                              {holding.title}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {holding.district}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right font-bold">
                            {holding.shares_count.toLocaleString()} sh
                          </td>
                          <td className="py-4 px-4 text-right text-muted-foreground">
                            AED {Number(holding.cost_basis_aed).toFixed(2)}
                          </td>
                          <td className="py-4 px-4 text-right text-foreground font-semibold">
                            AED {Number(holding.current_market_price_aed).toFixed(2)}
                          </td>
                          <td className="py-4 px-4 text-right text-emerald-400 font-bold">
                            +AED {Number(holding.unrealized_pnl_aed).toFixed(2)} ({Number(holding.unrealized_pnl_pct).toFixed(1)}%)
                          </td>
                          <td className="py-4 px-4 text-right text-[hsl(38_80%_62%)] font-semibold">
                            AED {Number(holding.projected_annual_dividend_aed).toFixed(2)}/yr
                          </td>
                          <td className="py-4 px-4 text-center">
                            <Link
                              href={`/exchange/${holding.property_id}`}
                              className="px-3 py-1.5 rounded-lg bg-[hsl(38_40%_18%)] hover:bg-[hsl(38_40%_25%)] text-[hsl(38_80%_62%)] border border-[hsl(38_80%_57%/0.3)] text-[11px] font-semibold transition-colors"
                            >
                              Trade
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-muted-foreground">
                          No active shares yet. Explore the{' '}
                          <Link href="/exchange" className="text-[hsl(38_80%_57%)] underline">
                            PropX Exchange
                          </Link>{' '}
                          to buy fractional Dubai properties starting at AED 15.00/share!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. LANDLORD / PROPERTY OWNER PERSONA */}
        {(persona === 'landlord' || persona === 'hybrid') && (
          <div className="mb-10 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-foreground flex items-center gap-2">
                  <Building className="w-5 h-5 text-[hsl(38_80%_57%)]" />
                  My Tokenized Properties & Room Partition Revenue
                </h3>
                <p className="text-xs font-mono text-muted-foreground mt-0.5">
                  Properties registered under your Emirates ID with Dubai Land Dept (DLD)
                </p>
              </div>
              <button className="px-4 py-2 bg-[hsl(38_80%_57%)] hover:bg-[hsl(38_80%_65%)] text-[hsl(222_20%_9%)] text-xs font-mono font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4" />
                Tokenize New Asset
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Asset 1: Marina Gate */}
              <div className="p-6 bg-[hsl(222_18%_12%)] border border-[hsl(222_14%_22%)] rounded-2xl shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> DLD Title Deed Validated
                    </span>
                    <span className="text-xs font-mono text-[hsl(38_80%_57%)] font-bold">
                      TRADING ACTIVE
                    </span>
                  </div>
                  <h4 className="font-serif text-lg font-bold text-foreground">
                    Marina Gate Luxury Waterfront Penthouse
                  </h4>
                  <p className="text-xs font-mono text-muted-foreground mb-4">
                    Makani 12894 73491 • Dubai Marina • 100,000 Total Shares
                  </p>

                  <div className="grid grid-cols-3 gap-2 p-3 bg-[hsl(222_20%_9%)] rounded-xl border border-[hsl(222_14%_20%)] font-mono text-xs mb-4">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Occupancy</span>
                      <span className="text-foreground font-bold">96.4%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Net Yield</span>
                      <span className="text-emerald-400 font-bold">9.2% APY</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Monthly Payout</span>
                      <span className="text-[hsl(38_80%_62%)] font-bold">AED 44,166</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[hsl(222_14%_18%)] flex justify-between items-center text-xs font-mono">
                  <span className="text-muted-foreground">Partitions Installed: +2 Suites</span>
                  <Link
                    href="/exchange"
                    className="text-[hsl(38_80%_57%)] hover:underline flex items-center gap-1"
                  >
                    Inspect Ledger <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Tokenization In-Progress Card */}
              <div className="p-6 bg-[hsl(222_18%_12%)] border border-dashed border-[hsl(222_14%_25%)] rounded-2xl flex flex-col items-center justify-center text-center p-8">
                <div className="w-12 h-12 rounded-2xl bg-[hsl(38_40%_18%)] text-[hsl(38_80%_57%)] flex items-center justify-center mb-4">
                  <Layers className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-base font-bold text-foreground mb-1">
                  Have a Dubai Apartment or Villa?
                </h4>
                <p className="text-xs font-mono text-muted-foreground max-w-sm mb-4">
                  Upload your Title Deed PDF or Makani number. Our AI Auditor will authenticate ownership
                  in 12 seconds and simulate optimal partition yields.
                </p>
                <button className="px-5 py-2.5 rounded-xl bg-[hsl(222_16%_16%)] hover:bg-[hsl(222_16%_20%)] text-foreground border border-[hsl(222_14%_24%)] text-xs font-mono font-semibold transition-colors">
                  Run Free AI Property Audit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. INSTITUTIONAL DEVELOPER / HOTEL OPERATOR PERSONA */}
        {(persona === 'institutional' || persona === 'hybrid') && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-foreground flex items-center gap-2">
                  <Hotel className="w-5 h-5 text-[hsl(38_80%_57%)]" />
                  Institutional Developer & Hotel Tranche Hub
                </h3>
                <p className="text-xs font-mono text-muted-foreground mt-0.5">
                  Multi-unit tranches, hotel room stock issuance, and zero-broker cryptographic settlement
                </p>
              </div>
            </div>

            <div className="bg-[hsl(222_18%_12%)] border border-[hsl(222_14%_22%)] rounded-2xl p-6 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 font-mono text-xs">
                <div className="p-4 bg-[hsl(222_20%_9%)] rounded-xl">
                  <span className="text-muted-foreground block text-[11px]">Tranches Issued</span>
                  <span className="text-2xl font-bold text-foreground">4 Projects</span>
                  <span className="text-emerald-400 block text-[11px] mt-1">100% Sold Out</span>
                </div>
                <div className="p-4 bg-[hsl(222_20%_9%)] rounded-xl">
                  <span className="text-muted-foreground block text-[11px]">Direct Escrow Balance</span>
                  <span className="text-2xl font-bold text-[hsl(38_80%_62%)]">AED 2,500,000</span>
                  <span className="text-neutral-400 block text-[11px] mt-1">Held in Smart Vault</span>
                </div>
                <div className="p-4 bg-[hsl(222_20%_9%)] rounded-xl">
                  <span className="text-muted-foreground block text-[11px]">Broker Fees Saved</span>
                  <span className="text-2xl font-bold text-emerald-400">AED 375,000</span>
                  <span className="text-neutral-400 block text-[11px] mt-1">Direct P2P Clearing</span>
                </div>
              </div>

              {/* Direct Escrow Contracts Table */}
              <h4 className="font-serif text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">
                Active Direct Peer-to-Peer Escrow Settlements (Zero Broker)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-[hsl(222_20%_9%)] border-b border-[hsl(222_14%_20%)] text-muted-foreground uppercase text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Escrow ID</th>
                      <th className="py-2.5 px-3">Asset Tranche</th>
                      <th className="py-2.5 px-3">Agreed Price</th>
                      <th className="py-2.5 px-3">Deposit Locked</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Cryptographic Stamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[hsl(222_14%_18%)] text-neutral-300">
                    <tr className="hover:bg-[hsl(222_16%_15%)]">
                      <td className="py-3 px-3 font-bold text-foreground">ESC-8921</td>
                      <td className="py-3 px-3">Seven Palm Luxury Hotel Suite #702</td>
                      <td className="py-3 px-3">AED 1,500,000</td>
                      <td className="py-3 px-3 text-emerald-400">AED 150,000 (10%)</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          Buyer & Seller Signed
                        </span>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground font-mono text-[11px]">
                        0x7a3f...d89e (Verified)
                      </td>
                    </tr>
                    <tr className="hover:bg-[hsl(222_16%_15%)]">
                      <td className="py-3 px-3 font-bold text-foreground">ESC-8924</td>
                      <td className="py-3 px-3">The Opus by Zaha Hadid #1204</td>
                      <td className="py-3 px-3">AED 4,500,000</td>
                      <td className="py-3 px-3 text-emerald-400">AED 450,000 (10%)</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-[hsl(38_40%_18%)] text-[hsl(38_80%_62%)] border border-[hsl(38_80%_57%/0.3)]">
                          DLD Transfer Pending
                        </span>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground font-mono text-[11px]">
                        0x4c1e...b201 (Verified)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
