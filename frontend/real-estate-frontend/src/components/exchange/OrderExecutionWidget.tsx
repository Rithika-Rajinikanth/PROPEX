// src/components/exchange/OrderExecutionWidget.tsx
'use client';

import React, { useState, useEffect } from 'react';
import type { PropXProperty, OrderResponse } from '@/types/propx';
import { api } from '@/lib/api';
import { useAuthStore } from '@/hooks/useAuth';
import { AuthModal } from '@/components/auth/AuthModal';
import { ShieldCheck, CheckCircle2, AlertCircle, Loader2, Zap, ArrowRight, Lock } from 'lucide-react';

interface OrderExecutionWidgetProps {
  property: PropXProperty;
  selectedPrice?: number | null;
  onOrderSuccess?: (result: OrderResponse) => void;
}

export function OrderExecutionWidget({
  property,
  selectedPrice,
  onOrderSuccess,
}: OrderExecutionWidgetProps) {
  const { isAuthenticated } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [direction, setDirection] = useState<'Buy' | 'Sell'>('Buy');
  const [orderType, setOrderType] = useState<'Limit' | 'Market'>('Limit');
  const [price, setPrice] = useState<string>(
    selectedPrice ? selectedPrice.toString() : Number(property.initial_share_price_aed).toFixed(2)
  );
  const [quantity, setQuantity] = useState<number>(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<OrderResponse | null>(null);

  useEffect(() => {
    if (selectedPrice) {
      setPrice(selectedPrice.toFixed(2));
      setOrderType('Limit');
    }
  }, [selectedPrice]);

  const numPrice = parseFloat(price) || 0;
  const totalAmountAed = numPrice * quantity;
  const annualDividendPerShareAed =
    (Number(property.initial_share_price_aed) * Number(property.projected_net_yield_pct)) / 100;
  const totalProjectedAnnualDividendAed = annualDividendPerShareAed * quantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessResult(null);

    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (quantity <= 0) {
      setError('Quantity must be at least 1 share');
      return;
    }
    if (numPrice <= 0) {
      setError('Price per share must be greater than zero');
      return;
    }

    try {
      setLoading(true);
      const res = await api.submitOrder({
        property_id: property.id,
        direction: (direction.toLowerCase() === 'sell' ? 'sell' : 'buy') as any,
        quantity: quantity,
        price_per_share_aed: numPrice,
      });
      setSuccessResult(res);
      onOrderSuccess?.(res);
    } catch (err: any) {
      console.error('Order placement failed:', err);
      const backendMsg =
        typeof err.response?.data === 'string'
          ? err.response.data
          : err.response?.data?.message ||
            err.message ||
            'Order placement failed. Check balance or try again.';
      setError(backendMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hud-glass rounded-2xl p-6 border border-cyan-500/20 shadow-2xl flex flex-col space-y-5">
      {/* Direction Toggle */}
      <div className="grid grid-cols-2 p-1 bg-[#070B14] rounded-xl border border-white/10">
        <button
          type="button"
          onClick={() => {
            setDirection('Buy');
            setSuccessResult(null);
          }}
          className={`py-2.5 text-xs font-mono font-bold rounded-lg transition-all ${
            direction === 'Buy'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-[#080C16] shadow-lg shadow-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          BUY FRACTIONAL SHARES
        </button>
        <button
          type="button"
          onClick={() => {
            setDirection('Sell');
            setSuccessResult(null);
          }}
          className={`py-2.5 text-xs font-mono font-bold rounded-lg transition-all ${
            direction === 'Sell'
              ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          SELL SHARES
        </button>
      </div>

      {/* Order Type */}
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-slate-400 uppercase">Execution Type</span>
        <div className="flex gap-2">
          {(['Limit', 'Market'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setOrderType(type)}
              className={`px-3 py-1 rounded-lg transition-colors ${
                orderType === type
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Price Input */}
        <div>
          <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
            Share Limit Price (AED)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0.1"
              value={price}
              disabled={orderType === 'Market'}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-[#070B14] border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-cyan-400 transition-colors disabled:opacity-50"
            />
            <span className="absolute right-4 top-3 text-xs text-slate-400 font-mono">
              AED
            </span>
          </div>
        </div>

        {/* Quantity Input */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-mono uppercase text-slate-400">
              Quantity (Shares)
            </label>
            <span className="text-xs font-mono text-cyan-400">
              {quantity} / {property.available_shares.toLocaleString()} left
            </span>
          </div>
          <input
            type="number"
            min="1"
            max={property.available_shares || 10000}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full bg-[#070B14] border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-cyan-400 transition-colors"
          />

          {/* Quick Buttons */}
          <div className="grid grid-cols-4 gap-2 mt-2">
            {[10, 50, 100, 500].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setQuantity(q)}
                className={`py-1.5 text-xs font-mono rounded-lg border transition-all ${
                  quantity === q
                    ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 font-bold'
                    : 'border-white/5 bg-[#070B14] text-slate-400 hover:text-white'
                }`}
              >
                {q} sh
              </button>
            ))}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="p-4 bg-[#070B14] border border-white/5 rounded-xl space-y-2.5 text-xs font-mono">
          <div className="flex justify-between">
            <span className="text-slate-400">Order Total:</span>
            <span className="text-white font-bold text-sm">
              AED {totalAmountAed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Brokerage Fee:</span>
            <span className="text-emerald-400 font-bold">AED 0.00 (Zero Broker)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Est. Rental Dividend:</span>
            <span className="text-amber-400 font-bold">
              {Number(property.projected_net_yield_pct).toFixed(1)}% (AED {totalProjectedAnnualDividendAed.toFixed(2)}/yr)
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2 text-xs text-rose-400 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Result */}
        {successResult && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex flex-col gap-1.5 text-xs text-emerald-300 font-mono">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Order Filled: {successResult.status}</span>
            </div>
            <p className="text-slate-300 text-[11px]">
              {successResult.executed_trades.length > 0
                ? `Matched ${successResult.executed_trades.reduce((acc, t) => acc + t.shares, 0)} shares on FIFO engine!`
                : 'Order registered on order book.'}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3.5 px-4 rounded-xl font-bold font-mono text-sm transition-all flex items-center justify-center gap-2 shadow-xl ${
            !isAuthenticated
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-[#080C16] shadow-cyan-500/25'
              : direction === 'Buy'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-[#080C16] shadow-emerald-500/25'
              : 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white shadow-rose-500/25'
          } disabled:opacity-50`}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Executing in Engine...
            </>
          ) : !isAuthenticated ? (
            <>
              <Lock className="w-4 h-4" />
              SIGN IN TO {direction === 'Buy' ? 'BUY' : 'SELL'} (AED {totalAmountAed.toFixed(0)})
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              {direction === 'Buy' ? 'CONFIRM BUY ORDER' : 'CONFIRM SELL ORDER'} (AED {totalAmountAed.toFixed(0)})
            </>
          )}
        </button>

        {!isAuthenticated ? (
          <p className="text-[11px] text-center text-amber-400 font-mono flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            Guest Browsing Active: Sign in required only to trade
          </p>
        ) : (
          <p className="text-[11px] text-center text-slate-400 font-mono flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Secured by SHA-256 Ledger & DLD Registry
          </p>
        )}
      </form>

      {/* Action-Gated Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
        }}
        defaultTab="login"
      />
    </div>
  );
}
