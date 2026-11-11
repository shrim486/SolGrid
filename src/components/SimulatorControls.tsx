import React from 'react';
import {
  X,
  Sliders,
  Sun,
  CloudSun,
  CloudRain,
  Moon,
  Zap,
  RefreshCw,
  Play,
  Pause,
  Thermometer,
  Gauge,
  Radio
} from 'lucide-react';
import { useMicrogrid } from '../context/MicrogridContext';

interface SimulatorControlsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SimulatorControls: React.FC<SimulatorControlsProps> = ({ isOpen, onClose }) => {
  const {
    weatherCondition,
    setWeatherCondition,
    currentIrradiance,
    ambientTemp,
    isSimulatorActive,
    toggleSimulator,
    triggerManualGenerationPulse
  } = useMicrogrid();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 relative overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">IoT Telemetry & Weather Sandbox</h3>
              <p className="text-xs text-slate-400">Real-time Environmental Parameters & Solar Ingress</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Weather Conditions Selector */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Atmospheric & Solar Weather
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => setWeatherCondition('sunny')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition cursor-pointer ${
                  weatherCondition === 'sunny'
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sun className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-semibold">Clear Sun</span>
                <span className="text-[10px] text-slate-500">100% PV</span>
              </button>

              <button
                onClick={() => setWeatherCondition('cloudy')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition cursor-pointer ${
                  weatherCondition === 'cloudy'
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <CloudSun className="w-5 h-5 text-cyan-400" />
                <span className="text-xs font-semibold">Partly Cloud</span>
                <span className="text-[10px] text-slate-500">65% PV</span>
              </button>

              <button
                onClick={() => setWeatherCondition('overcast')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition cursor-pointer ${
                  weatherCondition === 'overcast'
                    ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <CloudRain className="w-5 h-5 text-indigo-400" />
                <span className="text-xs font-semibold">Overcast</span>
                <span className="text-[10px] text-slate-500">28% PV</span>
              </button>

              <button
                onClick={() => setWeatherCondition('night')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition cursor-pointer ${
                  weatherCondition === 'night'
                    ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Moon className="w-5 h-5 text-purple-400" />
                <span className="text-xs font-semibold">Night Mode</span>
                <span className="text-[10px] text-slate-500">0% PV</span>
              </button>
            </div>
          </div>

          {/* Current Live Ingress Stats */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 grid grid-cols-2 gap-4 font-mono">
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Effective Irradiance</div>
              <div className="text-xl font-bold text-amber-400">{currentIrradiance} W/m²</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Ambient Inverter Temp</div>
              <div className="text-xl font-bold text-rose-400">{ambientTemp}°C</div>
            </div>
          </div>

          {/* Instant Generation Spikes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Inject Smart Meter Telemetry Pulse
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => triggerManualGenerationPulse('house_a', 5.0)}
                className="py-2.5 px-3 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-emerald-400 flex flex-col items-center gap-1 transition cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-emerald-400/20" />
                <span>+5.0 NRG (House A)</span>
              </button>

              <button
                onClick={() => triggerManualGenerationPulse('house_c', 3.0)}
                className="py-2.5 px-3 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-cyan-400 flex flex-col items-center gap-1 transition cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-cyan-400/20" />
                <span>+3.0 NRG (House C)</span>
              </button>

              <button
                onClick={() => triggerManualGenerationPulse('house_a', 15.0)}
                className="py-2.5 px-3 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-amber-400 flex flex-col items-center gap-1 transition cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-amber-400/20" />
                <span>+15.0 NRG (High Sun)</span>
              </button>
            </div>
          </div>

          {/* Heartbeat Status */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className={`w-2 h-2 rounded-full ${isSimulatorActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
              <span>Telemetry Loop: {isSimulatorActive ? 'Active (5s Tick)' : 'Paused'}</span>
            </div>

            <button
              onClick={toggleSimulator}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                isSimulatorActive
                  ? 'bg-slate-800 border-slate-700 text-slate-300'
                  : 'bg-emerald-500 text-slate-950 border-emerald-400'
              }`}
            >
              {isSimulatorActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isSimulatorActive ? 'Pause Stream' : 'Resume Stream'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
