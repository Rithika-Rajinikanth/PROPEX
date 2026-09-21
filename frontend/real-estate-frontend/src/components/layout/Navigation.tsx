// src/components/layout/Navigation.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  TrendingUp,
  Briefcase,
  Building2,
  Brain,
  BarChart3,
  Sparkles,
  ShieldCheck,
  Menu,
  X,
  Coins,
  ChevronRight,
  Flame,
  LogIn,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { useAuthStore } from '@/hooks/useAuth';
import { AuthModal } from '@/components/auth/AuthModal';

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();

  const navItems = [
    { name: 'Home', href: '/', icon: Building2 },
    { name: 'Exchange', href: '/exchange', icon: TrendingUp, badge: 'LIVE' },
    { name: 'Portfolio Hub', href: '/dashboard', icon: Briefcase },
    { name: 'Marketplace', href: '/marketplace', icon: Building2 },
    { name: 'AI Assistant', href: '/ai-chat', icon: Brain, glow: true },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#070B14]/90 backdrop-blur-xl border-b border-cyan-500/20 shadow-2xl">
      {/* Top Mini Ticker Strip */}
      <div className="bg-[#05080F] border-b border-white/5 py-1 px-4 text-[11px] font-mono text-slate-400 overflow-hidden hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              CLOB MATCHING ENGINE ONLINE
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-cyan-300">SEVEN-PALM: AED 23.50 (+4.2%)</span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-300">THE-OPUS: AED 31.00 (+6.5%)</span>
            <span className="text-slate-500">|</span>
            <span className="text-amber-300">BURJ-CROWN: AED 18.20 (+1.8%)</span>
            <span className="text-slate-500">|</span>
            <span className="text-cyan-300">MARINA-GATE: AED 27.80 (+3.1%)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              DLD Title Registry Synced (100%)
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/50 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(0,242,254,0.4)]">
              <span className="text-xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300">
                X
              </span>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold font-serif text-white tracking-tight">
                  Prop<span className="text-cyan-400">X</span>
                </span>
                <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30">
                  DUBAI
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400 tracking-wider">
                LIQUID REAL ESTATE ASSET EXCHANGE
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 font-mono text-xs">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    relative px-3.5 py-2 rounded-xl font-bold transition-all duration-200 flex items-center gap-2
                    ${
                      active
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-400/40 shadow-lg shadow-cyan-500/10'
                        : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                  {item.glow && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Header Badges: Level 42 Trader & Live Wallet or Sign In */}
          {isAuthenticated ? (
            <div className="hidden sm:flex items-center gap-3">
              {/* Level 42 Trader Tier */}
              <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-300 text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" style={{ animationDuration: '8s' }} />
                <span className="font-bold">LVL 42</span>
                <span className="text-[10px] text-purple-400/80">DIAMOND VIP</span>
              </div>

              {/* Live Wallet AED Balance */}
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500/15 to-teal-500/15 hover:from-emerald-500/25 hover:to-teal-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/10 group"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>AED 184,500</span>
                <ChevronRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              {/* Logout button */}
              <button
                type="button"
                onClick={() => logout()}
                title="Sign Out"
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-mono text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                GUEST ACCESS (UNLOCKED)
              </div>

              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-[#080C16] text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Demo</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-cyan-500/20 space-y-2 animate-fade-in">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center justify-between px-4 py-3 rounded-xl font-mono text-sm font-semibold transition-all
                    ${
                      active
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-cyan-400" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between px-2">
              <span className="text-xs font-mono text-slate-400">Available Wallet Balance:</span>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1"
              >
                AED 184,500 <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setAuthModalOpen(false)}
        defaultTab="login"
      />
    </header>
  );
}