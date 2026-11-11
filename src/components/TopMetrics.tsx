import React from 'react';
import {
  Zap,
  TrendingUp,
  Leaf,
  Layers,
  ArrowUpRight,
  Sun,
  ShieldCheck,
  TreeDeciduous,
  Activity
} from 'lucide-react';
import { useMicrogrid } from '../context/MicrogridContext';

export const TopMetrics: React.FC = () => {
  const {
    totalGridOutputKwh,
    activeOrderCount,
    averagePriceEth,
    totalCo2AvoidedKg,
    treesPlantedEquivalent,
    currentNetwork,
    currentIrradiance
  } = useMicrogrid();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Grid Output */}
      <div className="glass-panel glass-panel-hover p-5 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Grid Output
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Zap className="w-4 h-4 fill-emerald-400/30" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1.5">
          <span className="text-3xl font-extrabold font-mono tracking-tight text-white">
            {totalGridOutputKwh.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          </span>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">kWh</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            +14.8% <span className="text-slate-400 font-normal">24h generation</span>
          </span>
          <span className="font-mono text-[11px] text-slate-500">Live Meter Feed</span>
        </div>
      </div>

      {/* 2. Active Trade Orders */}
      <div className="glass-panel glass-panel-hover p-5 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Active Trade Orders
          </span>
          <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1.5">
          <span className="text-3xl font-extrabold font-mono tracking-tight text-white">
            {activeOrderCount}
          </span>
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Live Listings</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1 text-cyan-400 font-medium">
            <Activity className="w-3.5 h-3.5" />
            Escrow Protected
          </span>
          <span className="text-slate-500 font-mono text-[11px]">Peer-to-Peer</span>
        </div>
      </div>

      {/* 3. Current Average Price / kWh */}
      <div className="glass-panel glass-panel-hover p-5 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Avg Price / kWh
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1.5">
          <span className="text-3xl font-extrabold font-mono tracking-tight text-white">
            {averagePriceEth}
          </span>
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
            {currentNetwork.currency}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="text-slate-300 font-mono">
            ≈ ${(parseFloat(averagePriceEth) * 3150).toFixed(2)} / kWh
          </span>
          <span className="text-emerald-400 text-[11px] font-semibold">-22% vs Utility</span>
        </div>
      </div>

      {/* 4. Total CO2 Offset */}
      <div className="glass-panel glass-panel-hover p-5 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total CO₂ Offset
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Leaf className="w-4 h-4 fill-emerald-400/30" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1.5">
          <span className="text-3xl font-extrabold font-mono tracking-tight text-white">
            {totalCo2AvoidedKg.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          </span>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">kg CO₂</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <TreeDeciduous className="w-3.5 h-3.5" />
            {treesPlantedEquivalent} trees/yr eq.
          </span>
          <span className="text-slate-500 text-[11px]">EPA Factor 0.85</span>
        </div>
      </div>
    </div>
  );
};
