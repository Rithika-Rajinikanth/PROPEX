// src/components/exchange/PartitionSimulatorModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import type { PropXProperty, PartitionSimulationResponse } from '@/types/propx';
import { api } from '@/lib/api';
import {
  X,
  Layers,
  TrendingUp,
  Clock,
  Hammer,
  DollarSign,
  ArrowRight,
  Sparkles,
  VolumeX,
  Zap,
  CheckCircle2,
} from 'lucide-react';

interface PartitionSimulatorModalProps {
  property: PropXProperty;
  isOpen: boolean;
  onClose: () => void;
}

export function PartitionSimulatorModal({
  property,
  isOpen,
  onClose,
}: PartitionSimulatorModalProps) {
  const [partitions, setPartitions] = useState<number>(2);
  const [averageRent, setAverageRent] = useState<number>(4500);
  const [simulation, setSimulation] = useState<PartitionSimulationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    async function runSim() {
      try {
        setLoading(true);
        const res = await api.simulatePartition({
          property_id: property.id,
          additional_partitions: partitions,
          average_partition_rent_aed: averageRent,
        });
        if (active) {
          setSimulation(res);
        }
      } catch (err) {
        console.error('Failed to simulate partition:', err);
      } finally {
        if (active) setLoading(false);
      }
    }

    runSim();
    return () => {
      active = false;
    };
  }, [isOpen, property.id, partitions, averageRent]);

  if (!isOpen) return null;

  const currentYield = Number(property.projected_net_yield_pct);
  const yieldBoost = simulation ? Number(simulation.yield_increase_pct) : 0;
  const simulatedYield = currentYield + yieldBoost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#090E1B] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-500/10 max-h-[92vh] overflow-y-auto">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/15 px-3 py-0.5 rounded-full border border-cyan-500/30">
                DYNAMIC ROOM PARTITIONING ENGINE
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {property.building_name}
              </span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-white mt-1">
              Micro-Suite Partitioning & Yield Multiplier
            </h2>
          </div>
        </div>

        {/* Visual 3D Cutaway Floorplan Rendering */}
        <div
          className="relative h-56 sm:h-64 w-full rounded-2xl overflow-hidden mb-6 border border-cyan-500/30 group"
          style={{ position: 'relative', width: '100%', height: '260px', minHeight: '260px' }}
        >
          <Image
            src="/images/properties/partition_render.jpg"
            alt="3D Partition Cutaway"
            fill
            sizes="100vw"
            priority
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090E1B] via-transparent to-black/30 pointer-events-none" />

          {/* Floating HUD Chips */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="px-3 py-1 rounded-full bg-[#080C16]/90 backdrop-blur-md text-[11px] font-mono text-cyan-400 border border-cyan-500/30">
              ⚡ STC 55 Acoustic Isolation
            </span>
            <span className="px-3 py-1 rounded-full bg-[#080C16]/90 backdrop-blur-md text-[11px] font-mono text-emerald-400 border border-emerald-500/30">
              +{partitions} Dual Executive Suites
            </span>
          </div>

          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
            <span className="text-xs font-mono text-white bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg">
              Dividing Master Suite into self-contained rental micro-units
            </span>
          </div>
        </div>

        {/* Sliders & Controls */}
        <div className="space-y-6 bg-[#070B14] p-5 rounded-2xl border border-white/5 mb-6">
          {/* Partitions Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-mono uppercase text-slate-400 flex items-center gap-2">
                <Hammer className="w-4 h-4 text-cyan-400" />
                Additional Partitioned Suites
              </label>
              <span className="text-sm font-bold font-mono text-cyan-300 bg-cyan-500/20 px-3 py-1 rounded-lg border border-cyan-500/30">
                +{partitions} {partitions === 1 ? 'Suite' : 'Suites'}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="4"
              step="1"
              value={partitions}
              onChange={(e) => setPartitions(parseInt(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-1">
              <span>+1 Suite</span>
              <span>+2 Suites</span>
              <span>+3 Suites</span>
              <span>+4 Suites</span>
            </div>
          </div>

          {/* Average Rent Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-mono uppercase text-slate-400 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Est. Monthly Rent per Partitioned Suite
              </label>
              <span className="text-sm font-bold font-mono text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-lg border border-emerald-500/30">
                AED {averageRent.toLocaleString()} / mo
              </span>
            </div>
            <input
              type="range"
              min="2500"
              max="8000"
              step="250"
              value={averageRent}
              onChange={(e) => setAverageRent(parseInt(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Dynamic Calculation Results */}
        {simulation && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Yield Surge */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0B1426] to-[#0A1A2E] border border-cyan-500/40 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                <span>Net Rental Yield Surge</span>
                <span className="text-emerald-400 font-bold">+{yieldBoost.toFixed(1)}% Boost</span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-xl font-mono text-slate-500 line-through">
                  {currentYield.toFixed(1)}%
                </span>
                <ArrowRight className="w-5 h-5 text-cyan-400" />
                <span className="text-3xl font-extrabold font-mono text-emerald-400">
                  {simulatedYield.toFixed(1)}% APY
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-2">
                Increases dividend distributions directly to fractional shareholders
              </p>
            </div>

            {/* Projected Rent */}
            <div className="p-5 rounded-2xl bg-[#070B14] border border-white/5">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                <span>Annual Gross Rent</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-2">
                AED {Number(simulation.simulated_gross_annual_rent_aed).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-2">
                +AED {(Number(simulation.simulated_gross_annual_rent_aed) - Number(simulation.current_gross_annual_rent_aed)).toLocaleString()} incremental cashflow
              </p>
            </div>

            {/* Fit-out Cost */}
            <div className="p-5 rounded-2xl bg-[#070B14] border border-white/5">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                <span>Acoustic Partition Fit-Out</span>
                <Hammer className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl font-bold font-mono text-amber-400 mt-2">
                AED {Number(simulation.estimated_renovation_cost_aed).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-2">
                Demountable acoustic gypsum + smart card keypads
              </p>
            </div>

            {/* Payback Period */}
            <div className="p-5 rounded-2xl bg-[#070B14] border border-white/5">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                <span>Capital Payback Period</span>
                <Clock className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-2">
                {Number(simulation.payback_period_months).toFixed(1)} Months
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-2">
                Pure net dividend gain every month thereafter
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-4 border-t border-white/10">
          <span className="text-xs text-slate-400 font-mono">
            Fully certified by Dubai Civil Defense & DTCM guidelines
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold font-mono text-xs rounded-xl transition-all shadow-lg shadow-cyan-500/25"
          >
            Apply Partition Model to Asset
          </button>
        </div>
      </div>
    </div>
  );
}
