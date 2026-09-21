// src/components/exchange/DigitalTwinViewer.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { getPropertyVisual } from '@/lib/propertyVisuals';
import {
  Box,
  Compass,
  Sparkles,
  Maximize2,
  Layers,
  CheckCircle2,
  Info,
  Volume2,
  Eye,
  Sliders,
} from 'lucide-react';

interface DigitalTwinViewerProps {
  propertyId?: string;
  title: string;
  splatUrl?: string;
  district: string;
}

export function DigitalTwinViewer({
  propertyId = 'cccccccc-cccc-cccc-cccc-cccccccccccc',
  title,
  district,
}: DigitalTwinViewerProps) {
  const visual = getPropertyVisual(propertyId);
  const [activeTourNode, setActiveTourNode] = useState<'main' | 'balcony' | 'bedroom' | 'partitions'>('main');
  const [selectedHotspot, setSelectedHotspot] = useState<any | null>(null);
  const [showScanlines, setShowScanlines] = useState<boolean>(true);

  // Choose display image based on active node
  const activeImage =
    activeTourNode === 'partitions'
      ? '/images/properties/partition_render.jpg'
      : visual.imageUrl;

  const tourNodes = [
    { id: 'main', name: 'Open Living', badge: '3D Splat' },
    { id: 'balcony', name: 'Terrace & View', badge: visual.view.slice(0, 15) },
    { id: 'bedroom', name: 'Master Suite', badge: `${visual.beds} Bed Ensuite` },
    { id: 'partitions', name: 'Partition Layout', badge: '+Yield Mode ⚡' },
  ];

  return (
    <div className="hud-glass rounded-2xl overflow-hidden flex flex-col border border-cyan-500/20 shadow-2xl relative">
      {/* 3D Viewport Header */}
      <div className="px-5 py-3 bg-[#0B1120]/90 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Box className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block">
              3D LiDAR GAUSSIAN SPLAT TWIN
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {title} • {district}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowScanlines(!showScanlines)}
            className={`px-2 py-1 rounded text-[10px] font-mono font-semibold transition-colors flex items-center gap-1 ${
              showScanlines
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'bg-white/5 text-slate-400'
            }`}
          >
            <Compass className="w-3 h-3 animate-spin" style={{ animationDuration: '10s' }} />
            HUD SCAN
          </button>
          <span className="px-2 py-1 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            60 FPS SPATIAL
          </span>
        </div>
      </div>

      {/* Interactive 3D Viewport with Real Luxury Photo Background */}
      <div
        className="relative h-80 sm:h-96 w-full overflow-hidden group select-none"
        style={{ position: 'relative', width: '100%', height: '380px', minHeight: '380px' }}
      >
        {/* Real House / Property Image Background */}
        <Image
          src={activeImage}
          alt={title}
          fill
          sizes="100vw"
          priority
          className="object-cover transition-all duration-700 group-hover:scale-105"
        />

        {/* Cyberpunk Vignette & Lighting Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080C16] via-transparent to-black/40 pointer-events-none" />

        {/* Scanline / Grid Overlay */}
        {showScanlines && (
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(0, 242, 254, 0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 242, 254, 0.25) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
        )}

        {/* Top Left Status Badge */}
        <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
          <span className="px-2.5 py-1 rounded-full bg-[#080C16]/80 backdrop-blur-md text-[11px] font-mono text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5 shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            Active Mode: {tourNodes.find((n) => n.id === activeTourNode)?.name}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-[#080C16]/80 backdrop-blur-md text-[11px] font-mono text-emerald-400 border border-emerald-500/30 shadow-lg">
            {visual.beds > 0 ? `${visual.beds} Bed • ${visual.baths} Bath` : 'Commercial Wing'}
          </span>
        </div>

        {/* Interactive Hotspot Pins Overlaid on the Property */}
        {visual.tourHotspots.map((spot) => (
          <div
            key={spot.id}
            style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
          >
            <button
              type="button"
              onClick={() => setSelectedHotspot(spot)}
              className="relative group/pin p-2 focus:outline-none"
            >
              <span className="absolute inset-0 rounded-full bg-cyan-400/30 animate-pulse-ring" />
              <div className="w-6 h-6 rounded-full bg-cyan-500 border-2 border-white flex items-center justify-center text-[#080C16] shadow-[0_0_15px_#00F2FE] hover:scale-125 transition-transform">
                <Sparkles className="w-3.5 h-3.5" />
              </div>

              {/* Pin Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover/pin:flex flex-col items-center pointer-events-none whitespace-nowrap z-30">
                <div className="px-3 py-1.5 rounded-lg bg-[#0B1120]/95 backdrop-blur-md border border-cyan-500/40 text-xs font-mono shadow-2xl">
                  <span className="font-bold text-white block">{spot.title}</span>
                  <span className="text-emerald-400 font-semibold text-[11px]">{spot.yieldBoost} Yield Impact</span>
                </div>
                <div className="w-2 h-2 bg-[#0B1120] rotate-45 border-r border-b border-cyan-500/40 -mt-1" />
              </div>
            </button>
          </div>
        ))}

        {/* Selected Hotspot Bottom Drawer */}
        {selectedHotspot && (
          <div className="absolute bottom-4 left-4 right-4 z-30 p-4 rounded-xl bg-[#090E1B]/95 backdrop-blur-xl border border-cyan-500/40 shadow-2xl animate-fade-in flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h5 className="text-sm font-bold text-white font-sans">{selectedHotspot.title}</h5>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {selectedHotspot.yieldBoost}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-mono mt-0.5">
                  {selectedHotspot.description}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedHotspot(null)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-mono text-white transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Camera Tour Node Navigation */}
      <div className="p-3 bg-[#0B1120] border-t border-white/10 flex gap-2 overflow-x-auto">
        {tourNodes.map((node) => (
          <button
            key={node.id}
            type="button"
            onClick={() => {
              setActiveTourNode(node.id as any);
              setSelectedHotspot(null);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTourNode === node.id
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-lg shadow-cyan-500/25 border border-cyan-400/50'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
            }`}
          >
            <span>{node.name}</span>
            <span className={`text-[10px] font-bold ${activeTourNode === node.id ? 'text-cyan-200' : 'text-cyan-400'}`}>
              {node.badge}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
