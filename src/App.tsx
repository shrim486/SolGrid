import React, { useState } from 'react';
import { MicrogridProvider, useMicrogrid } from './context/MicrogridContext';
import { Header } from './components/Header';
import { TopMetrics } from './components/TopMetrics';
import { SolarTelemetryChart } from './components/SolarTelemetryChart';
import { HouseNodesGrid } from './components/HouseNodesGrid';
import { MarketplaceOrderBook } from './components/MarketplaceOrderBook';
import { AuditFeed } from './components/AuditFeed';
import { ListEnergyModal } from './components/ListEnergyModal';
import { BuyEnergyModal } from './components/BuyEnergyModal';
import { ContractsModal } from './components/ContractsModal';
import { SimulatorControls } from './components/SimulatorControls';
import { ListingItem } from './utils/microgrid';
import { Zap, ShieldCheck, Github, ExternalLink, Cpu, Terminal } from 'lucide-react';
import { CONTRACT_ADDRESSES } from './contracts/config';

const DashboardContent: React.FC = () => {
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [isContractsModalOpen, setIsContractsModalOpen] = useState(false);
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [selectedListingForPurchase, setSelectedListingForPurchase] = useState<ListingItem | null>(null);

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 bg-grid-pattern relative flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top ambient glow */}
      <div className="bg-radial-gradient fixed inset-0 pointer-events-none z-0" />

      {/* Header */}
      <Header
        onOpenContractsModal={() => setIsContractsModalOpen(true)}
        onOpenSimModal={() => setIsSimModalOpen(true)}
        onOpenListModal={() => setIsListModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        
        {/* Top Key Metrics Bar */}
        <section aria-label="Microgrid Overview Metrics">
          <TopMetrics />
        </section>

        {/* Live Telemetry & Microgrid Prosumer Nodes */}
        <section aria-label="Real-time Solar Generation and Prosumers" className="space-y-6">
          <SolarTelemetryChart />
          <HouseNodesGrid />
        </section>

        {/* Peer-to-Peer Energy Marketplace */}
        <section aria-label="P2P Energy Marketplace Order Book">
          <MarketplaceOrderBook
            onSelectListForPurchase={(item) => setSelectedListingForPurchase(item)}
            onOpenListModal={() => setIsListModalOpen(true)}
          />
        </section>

        {/* Real-Time Immutable On-Chain Audit Feed */}
        <section aria-label="Cryptographic Audit Feed">
          <AuditFeed />
        </section>
      </main>

      {/* Web3 Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md py-6 px-4 sm:px-6 lg:px-8 mt-12 relative z-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-slate-300 font-semibold">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>SolGrid Protocol</span>
            </div>
            <span>•</span>
            <span>Decentralized Microgrid Energy Trading Platform</span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Marketplace: {CONTRACT_ADDRESSES.energyMarketplace.slice(0, 8)}...
            </span>
            <button
              onClick={() => setIsContractsModalOpen(true)}
              className="text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Terminal className="w-3 h-3" />
              <span>Contracts & Simulator</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <ListEnergyModal
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
      />

      <BuyEnergyModal
        listing={selectedListingForPurchase}
        onClose={() => setSelectedListingForPurchase(null)}
      />

      <ContractsModal
        isOpen={isContractsModalOpen}
        onClose={() => setIsContractsModalOpen(false)}
      />

      <SimulatorControls
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <MicrogridProvider>
      <DashboardContent />
    </MicrogridProvider>
  );
}
