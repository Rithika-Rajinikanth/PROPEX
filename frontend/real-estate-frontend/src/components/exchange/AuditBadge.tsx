// src/components/exchange/AuditBadge.tsx
'use client';

import React from 'react';
import {
  ShieldCheck,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Lock,
  ExternalLink,
} from 'lucide-react';

interface AuditBadgeProps {
  makaniNumber: string;
  plotNumber?: string;
  unitNumber?: string;
  ownerSimilarity?: number;
  isDldVerified?: boolean;
  overallRiskScore?: number;
  auditHash?: string;
}

export function AuditBadge({
  makaniNumber,
  plotNumber = 'Plot 318-492',
  unitNumber = 'Unit 2404',
  ownerSimilarity = 99.4,
  isDldVerified = true,
  overallRiskScore = 2,
  auditHash = '8f4c2e1b9a7d6e5c3b2a1f0e9d8c7b6a5e4d3c2b1a0f9e8d7c6b5a4e3d2c1b0a',
}: AuditBadgeProps) {
  return (
    <div className="bg-[hsl(222_18%_12%)] border border-[hsl(222_14%_22%)] rounded-xl p-5 shadow-lg shadow-black/20">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[hsl(222_14%_20%)] mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif text-sm font-semibold text-foreground flex items-center gap-1.5">
              AI Anti-Fraud & Title Deed Audit
            </h4>
            <p className="text-[11px] text-muted-foreground font-mono">
              Dual-Sided Cryptographic Verification
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            PASSED (Risk: {overallRiskScore}/100)
          </span>
        </div>
      </div>

      {/* Verification Checkpoints */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono mb-4">
        <div className="p-3 bg-[hsl(222_20%_9%)] rounded-lg border border-[hsl(222_14%_20%)] flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-muted-foreground block text-[11px]">DLD Registry Sync</span>
            <span className="text-foreground font-semibold">Title Deed Authenticated</span>
          </div>
        </div>

        <div className="p-3 bg-[hsl(222_20%_9%)] rounded-lg border border-[hsl(222_14%_20%)] flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-muted-foreground block text-[11px]">Owner Name Levenshtein Match</span>
            <span className="text-foreground font-semibold">{ownerSimilarity.toFixed(1)}% Match (Pass)</span>
          </div>
        </div>

        <div className="p-3 bg-[hsl(222_20%_9%)] rounded-lg border border-[hsl(222_14%_20%)] flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-muted-foreground block text-[11px]">Makani Geo-Coordinates</span>
            <span className="text-foreground font-semibold">{makaniNumber}</span>
          </div>
        </div>

        <div className="p-3 bg-[hsl(222_20%_9%)] rounded-lg border border-[hsl(222_14%_20%)] flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-muted-foreground block text-[11px]">Bank Mortgage / NOC Check</span>
            <span className="text-foreground font-semibold">Freehold & Unencumbered</span>
          </div>
        </div>
      </div>

      {/* Duplicate Prevention & Cryptographic Stamp */}
      <div className="p-3 bg-[hsl(222_20%_8%)] rounded-lg border border-[hsl(222_14%_18%)] space-y-1.5 text-[11px] font-mono">
        <div className="flex justify-between items-center text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[hsl(38_80%_57%)]" />
            Duplicate Tokenization Guard:
          </span>
          <span className="text-emerald-400 font-semibold">Active & Locked</span>
        </div>
        <div className="flex justify-between items-center text-muted-foreground">
          <span>SHA-256 Audit Hash:</span>
          <span className="text-neutral-400 truncate max-w-[200px]" title={auditHash}>
            {auditHash.slice(0, 16)}...{auditHash.slice(-8)}
          </span>
        </div>
      </div>
    </div>
  );
}
