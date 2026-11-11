import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  Sun,
  Zap,
  BatteryCharging,
  Gauge,
  Thermometer,
  CloudSun,
  Clock,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react';
import { useMicrogrid } from '../context/MicrogridContext';

export const SolarTelemetryChart: React.FC = () => {
  const {
    telemetryHistory,
    currentIrradiance,
    ambientTemp,
    isSimulatorActive,
    toggleSimulator,
    weatherCondition,
    triggerManualGenerationPulse
  } = useMicrogrid();

  const [activeMetric, setActiveMetric] = useState<'both' | 'solar' | 'load'>('both');

  const latestPoint = telemetryHistory[telemetryHistory.length - 1] || {
    solarGenKw: 7.8,
    gridLoadKw: 4.2,
    netExportKw: 3.6,
    batterySoc: 78
  };

  return (
    <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
      {/* Top Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-400 animate-spin-slow" />
              Live Solar Telemetry & Microgrid Dispatch
            </h2>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              5s Heartbeat
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time IoT smart meter irradiance feeds validating on-chain NRG token generation.
          </p>
        </div>

        {/* Filter buttons & pause simulator toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
            <button
              onClick={() => setActiveMetric('both')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                activeMetric === 'both' ? 'bg-slate-800 text-white font-medium shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Signals
            </button>
            <button
              onClick={() => setActiveMetric('solar')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                activeMetric === 'solar' ? 'bg-emerald-500/20 text-emerald-300 font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              PV Gen
            </button>
            <button
              onClick={() => setActiveMetric('load')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                activeMetric === 'load' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Grid Load
            </button>
          </div>

          <button
            onClick={toggleSimulator}
            className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition cursor-pointer ${
              isSimulatorActive
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-amber-400'
                : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
            }`}
            title={isSimulatorActive ? 'Pause live simulator' : 'Resume live simulator'}
          >
            {isSimulatorActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-amber-400" />}
          </button>

          <button
            onClick={() => triggerManualGenerationPulse('house_a', 2.5)}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
            title="Inject simulated solar spike"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Pulse Meter</span>
          </button>
        </div>
      </div>

      {/* Real-time Submetrics Pill Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {/* Irradiance */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">Solar Irradiance</div>
            <div className="text-base font-bold font-mono text-white flex items-center gap-1">
              {currentIrradiance} <span className="text-xs text-amber-400 font-normal">W/m²</span>
            </div>
          </div>
        </div>

        {/* Ambient Temperature */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Thermometer className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">Panel Temp</div>
            <div className="text-base font-bold font-mono text-white flex items-center gap-1">
              {ambientTemp}°C <span className="text-[10px] text-slate-500 font-normal">Optimal</span>
            </div>
          </div>
        </div>

        {/* Current Net Export */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">Microgrid Net Flow</div>
            <div className="text-base font-bold font-mono text-emerald-400 flex items-center gap-1">
              +{latestPoint.netExportKw} <span className="text-xs text-slate-400 font-normal">kW Export</span>
            </div>
          </div>
        </div>

        {/* Battery Storage SoC */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <BatteryCharging className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">Battery SoC</div>
            <div className="text-base font-bold font-mono text-cyan-400 flex items-center gap-1">
              {latestPoint.batterySoc}% <span className="text-[10px] text-slate-500 font-normal">Charging</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Recharts Visual Area */}
      <div className="w-full h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={telemetryHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="solarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="loadGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
            <XAxis
              dataKey="time"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#1e293b' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#1e293b' }}
              tickFormatter={(v) => `${v} kW`}
              domain={[0, 'dataMax + 2']}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-xl bg-slate-900/95 border border-slate-700/80 p-3 shadow-2xl backdrop-blur-xl font-mono text-xs">
                      <div className="text-slate-400 mb-2 border-b border-slate-800 pb-1 flex items-center justify-between gap-4">
                        <span>Time: {label}</span>
                        <span className="text-[10px] text-emerald-400">Live IoT</span>
                      </div>
                      {payload.map((entry, index) => (
                        <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
                          <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            {entry.name}:
                          </span>
                          <span className="font-bold text-white">{entry.value} kW</span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />

            {(activeMetric === 'both' || activeMetric === 'solar') && (
              <Area
                type="monotone"
                dataKey="solarGenKw"
                name="Solar PV Generation"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#solarGradient)"
                isAnimationActive={false}
              />
            )}

            {(activeMetric === 'both' || activeMetric === 'load') && (
              <Area
                type="monotone"
                dataKey="gridLoadKw"
                name="Microgrid Household Demand"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#loadGradient)"
                isAnimationActive={false}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between mt-3 text-[11px] text-slate-500 font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            Solar Generation (kW)
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500" />
            Microgrid Load (kW)
          </span>
        </div>
        <span className="text-slate-400">Inverter Ingress: 97.8% EFF</span>
      </div>
    </div>
  );
};
