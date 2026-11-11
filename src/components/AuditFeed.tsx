import React, { useState } from 'react';
import {
  FileText,
  Zap,
  ShoppingBag,
  ExternalLink,
  Copy,
  Check,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { useMicrogrid, AuditEvent } from '../context/MicrogridContext';
import { formatAddress } from '../utils/microgrid';

export const AuditFeed: React.FC = () => {
  const { auditEvents, currentNetwork } = useMicrogrid();
  const [filterType, setFilterType] = useState<string>('all');
  const [copiedTx, setCopiedTx] = useState<string | null>(null);

  const handleCopyTx = (tx: string) => {
    navigator.clipboard.writeText(tx);
    setCopiedTx(tx);
    setTimeout(() => setCopiedTx(null), 2000);
  };

  const filteredEvents = auditEvents.filter(evt => {
    if (filterType === 'all') return true;
    return evt.type.toLowerCase().includes(filterType.toLowerCase());
  });

  const getEventBadge = (type: AuditEvent['type']) => {
    switch (type) {
      case 'EnergyMinted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Zap className="w-3 h-3 fill-emerald-400/30" />
            EnergyMinted
          </span>
        );
      case 'EnergyListed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <Layers className="w-3 h-3" />
            EnergyListed
          </span>
        );
      case 'EnergyPurchased':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <ShoppingBag className="w-3 h-3" />
            EnergyPurchased
          </span>
        );
      case 'ListingCancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-700/40 text-slate-400 border border-slate-700">
            ListingCancelled
          </span>
        );
    }
  };

  const formatRelativeTime = (timestamp: number) => {
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSec < 5) return 'just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    return `${diffHours}h ago`;
  };

  return (
    <div className="glass-panel p-6 rounded-2xl relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              On-Chain Audit & Verification Feed
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
              Live Contract Events
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable cryptographic trail of all solar energy generation, escrow listings, and settlements.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center p-1 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
              filterType === 'all' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Logs
          </button>
          <button
            onClick={() => setFilterType('minted')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
              filterType === 'minted' ? 'bg-emerald-500/20 text-emerald-300 font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            Minted
          </button>
          <button
            onClick={() => setFilterType('listed')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
              filterType === 'listed' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            Listed
          </button>
          <button
            onClick={() => setFilterType('purchased')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
              filterType === 'purchased' ? 'bg-purple-500/20 text-purple-300 font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            Purchased
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono text-xs"
          >
            {/* Event Type & Entities */}
            <div className="flex items-start md:items-center gap-3">
              <div className="shrink-0">{getEventBadge(event.type)}</div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-slate-200">
                  {event.type === 'EnergyMinted' && (
                    <span>
                      Minted to <span className="font-semibold text-emerald-400">{event.sourceHouse || formatAddress(event.prosumer || '', 6, 4)}</span>
                    </span>
                  )}
                  {event.type === 'EnergyListed' && (
                    <span>
                      Seller <span className="text-cyan-400 font-semibold">{formatAddress(event.seller || '', 6, 4)}</span> locked power
                    </span>
                  )}
                  {event.type === 'EnergyPurchased' && (
                    <span>
                      Buyer <span className="text-purple-400 font-semibold">{formatAddress(event.buyer || '', 6, 4)}</span> bought from <span className="text-slate-300">{formatAddress(event.seller || '', 4, 3)}</span>
                    </span>
                  )}
                  {event.type === 'ListingCancelled' && (
                    <span>
                      Seller <span className="text-slate-400 font-semibold">{formatAddress(event.seller || '', 6, 4)}</span> cancelled listing
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-2">
                  <span>Block #{event.blockNumber}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-600" />
                    {formatRelativeTime(event.timestamp)}
                  </span>
                </div>
              </div>
            </div>

            {/* Value & Tx Hash info */}
            <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/60">
              {/* Energy Amount */}
              <div className="text-right">
                <div className="font-bold text-white text-xs flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  {event.amountKwh.toFixed(1)} NRG
                </div>
                {event.totalPriceEth && (
                  <div className="text-[10px] text-slate-400">
                    {event.totalPriceEth} {currentNetwork.currency}
                  </div>
                )}
              </div>

              {/* Hash with copy */}
              <div className="flex items-center gap-1.5 pl-3 border-l border-slate-800/80">
                <span className="text-[11px] text-slate-400 font-mono">
                  {formatAddress(event.txHash, 4, 3)}
                </span>
                <button
                  onClick={() => handleCopyTx(event.txHash)}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition cursor-pointer"
                  title="Copy Transaction Hash"
                >
                  {copiedTx === event.txHash ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
