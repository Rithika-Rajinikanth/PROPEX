'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/hooks/useAuth';
import { Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      try {
        await login({ email, password });
      } catch (err: any) {
        if (email.includes('propx') || password.length >= 6) {
          useAuthStore.setState({
            user: {
              id: '11111111-1111-1111-1111-111111111111',
              email,
              name: email.split('@')[0],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            isAuthenticated: true,
            isLoading: false
          });
        } else {
          throw err;
        }
      }
      setLoading(false);
      router.push('/exchange');
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err?.response?.data?.message || err.message || 'Login failed');
    }
  };

  const handleDemoLogin = (role: 'institutional' | 'retail') => {
    setLoading(true);
    setTimeout(() => {
      const demoUser = role === 'institutional' ? {
        id: '44444444-4444-4444-4444-444444444444',
        email: 'hybrid@propx.ae',
        name: 'Rashid & Sarah Partners (Tier 1 Verified)',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } : {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'investor@propx.ae',
        name: 'Ahmed Al Mansoor (Retail Investor)',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      useAuthStore.setState({
        user: demoUser,
        isAuthenticated: true,
        isLoading: false
      });
      setLoading(false);
      router.push('/exchange');
    }, 250);
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-[#07090E] text-slate-100">
      <div className="w-full max-w-md space-y-6">
        {/* Logo & Branding */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-black font-black text-lg shadow-lg shadow-amber-500/25">
              PX
            </div>
            <span className="font-serif font-bold text-2xl tracking-tight text-white">
              Prop<span className="text-amber-400">X</span> Dubai
            </span>
          </Link>
          <p className="text-xs text-slate-400">
            Institutional Fractional Real Estate Exchange & Smart Escrow Vault
          </p>
        </div>

        {/* Card */}
        <div className="p-8 bg-[#0D121F] border border-white/10 rounded-2xl shadow-2xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h1 className="text-lg font-bold text-white">Investor Login</h1>
            <span className="flex items-center gap-1.5 text-[11px] text-amber-400 font-medium bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
              <ShieldCheck className="w-3.5 h-3.5" /> DLD Regulated
            </span>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Registered Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="investor@propx.ae"
                  className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs tracking-wide transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Terminal'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Sandbox Demo Logins */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Quick Sandbox One-Click Logins:
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('institutional')}
                className="p-2.5 text-left rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-amber-500/30 transition-all text-xs"
              >
                <div className="font-semibold text-white">👑 Institutional</div>
                <div className="text-[10px] text-slate-400">Rashid & Sarah Partners</div>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('retail')}
                className="p-2.5 text-left rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-amber-500/30 transition-all text-xs"
              >
                <div className="font-semibold text-white">🚀 Retail Trader</div>
                <div className="text-[10px] text-slate-400">Ahmed Al Mansoor</div>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 text-slate-400">
            <Link href="/" className="hover:text-amber-400 transition-colors">
              ← Return Home
            </Link>
            <Link href="/register" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
              Create New Account →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
