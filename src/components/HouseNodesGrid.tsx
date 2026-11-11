import React from 'react';
import {
  Sun,
  Home,
  Zap,
  Battery,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Flame,
  Radio,
  PlusCircle
} from 'lucide-react';
import { useMicrogrid } from '../context/MicrogridContext';
import { DEMO_ACCOUNTS, DemoAccount } from '../contracts/config';
import { formatAddress } from '../utils/microgrid';

export const HouseNodesGrid: React.FC = () => {
  const {
    account,
    selectDemoAccount,
    currentIrradiance,
    triggerManualGenerationPulse
  } = useMicrogrid();

  // Compute dynamic stats per house based on irradiance
  const getHouseTelemetry = (house: DemoAccount) => {
    if (house.id === 'house_a') {
      const genKw = Number(((currentIrradiance / 1000) * house.pvCapacityKw * 0.95).toFixed(2));
      const loadKw = 1.4;
      const netKw = Number((genKw - loadKw).toFixed(2));
      return {
        genKw,
        loadKw,
        netKw,
        status: genKw > loadKw ? 'Exporting to Microgrid' : 'Self-Sustaining',
        statusColor: 'emerald',
        badge: 'High PV Surplus'
      };
    } else if (house.id === 'house_b') {
      const genKw = 0.0;
      const loadKw = 6.8;
      const netKw = -6.8;
      return {
        genKw,
        loadKw,
        netKw,
        status: 'Net Buyer (P2P Demanding)',
        statusColor: 'rose',
        badge: 'EV Charging Active'
      };
    } else {
      // House C
      const genKw = Number(((currentIrradiance / 1000) * house.pvCapacityKw * 0.95).toFixed(2));
      const loadKw = 2.6;
      const netKw = Number((genKw - loadKw).toFixed(2));
      return {
        genKw,
        loadKw,
        netKw,
        status: 'Battery Buffer Active',
        statusColor: 'cyan',
        badge: 'Net Zero Eco'
      };
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-400" />
            Microgrid Prosumer Nodes (IoT Meters)
          </h2>
          <p className="text-xs text-slate-400">
            Smart meters feeding telemetry directly to the SolGrid Smart Contracts.
          </p>
        </div>
        <span className="text-xs font-mono text-slate-500 hidden sm:inline-block">3 Nodes Registered</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {DEMO_ACCOUNTS.map((house) => {
          const telem = getHouseTelemetry(house);
          const isCurrentActive = account.toLowerCase() === house.address.toLowerCase();

          return (
            <div
              key={house.id}
              className={`glass-panel p-5 rounded-2xl relative transition-all duration-300 flex flex-col justify-between ${
                isCurrentActive
                  ? 'border-emerald-500/50 bg-slate-900/80 shadow-lg shadow-emerald-500/10'
                  : 'hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${house.avatarBg} flex items-center justify-center text-white shadow`}>
                      <Home className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white tracking-tight">{house.name}</h4>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {formatAddress(house.address, 6, 4)}
                      </div>
                    </div>
                  </div>

                  {isCurrentActive && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold border border-emerald-500/40">
                      Active Wallet
                    </span>
                  )}
                </div>

                {/* Node Tag & Specs */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-medium">
                    {house.tag}
                  </span>
                  {house.pvCapacityKw > 0 && (
                    <span className="text-[10px] text-amber-400 font-mono">
                      {house.pvCapacityKw} kWp Solar
                    </span>
                  )}
                  {house.batteryCapacityKwh > 0 && (
                    <span className="text-[10px] text-cyan-400 font-mono">
                      {house.batteryCapacityKwh} kWh Storage
                    </span>
                  )}
                </div>

                {/* Telemetry Numbers */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 mb-4 font-mono text-center">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">PV Gen</div>
                    <div className="text-sm font-bold text-emerald-400">{telem.genKw} kW</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">Load</div>
                    <div className="text-sm font-bold text-slate-200">{telem.loadKw} kW</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">Net Flow</div>
                    <div className={`text-sm font-bold ${telem.netKw >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {telem.netKw >= 0 ? `+${telem.netKw}` : telem.netKw} kW
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                {!isCurrentActive ? (
                  <button
                    onClick={() => selectDemoAccount(house.id)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 hover:text-white transition cursor-pointer"
                  >
                    Switch to this Node
                  </button>
                ) : (
                  <span className="flex-1 text-center py-1.5 text-xs font-semibold text-emerald-400">
                    Currently Selected
                  </span>
                )}

                {house.pvCapacityKw > 0 && (
                  <button
                    onClick={() => triggerManualGenerationPulse(house.id, 4.0)}
                    className="py-1.5 px-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                    title="Simulate solar meter spike and mint NRG tokens"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+Mint NRG</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
