import React, { useState } from 'react';
import {
  Zap,
  Sun,
  ShieldCheck,
  ChevronDown,
  Copy,
  Check,
  Activity,
  Sliders,
  Code2,
  ExternalLink,
  Layers,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { useMicrogrid } from '../context/MicrogridContext';
import { formatAddress } from '../utils/microgrid';
import { DEMO_ACCOUNTS, NETWORKS } from '../contracts/config';

interface HeaderProps {
  onOpenContractsModal: () => void;
  onOpenSimModal: () => void;
  onOpenListModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenContractsModal,
  onOpenSimModal,
  onOpenListModal
}) => {
  const {
    account,
    selectedDemoAccount,
    isMetaMaskConnected,
    ethBalance,
    nrgBalance,
    currentNetwork,
    switchNetwork,
    selectDemoAccount,
    connectMetaMask,
    gridFrequency,
    gridVoltage,
    isSimulatorActive,
    toggleSimulator
  } = useMicrogrid();

  const [copied, setCopied] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(account);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand & Live Protocol Badge */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 p-[1px] shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Zap className="w-6 h-6 text-emerald-400 fill-emerald-400/20" />
              </div>
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-950 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  Sol<span className="text-emerald-400">Grid</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Microgrid L2
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Decentralized P2P Solar Energy Trading</p>
            </div>
          </div>

          {/* Microgrid Live Frequency & Voltage Bar */}
          <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-800/80">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-emerald-400 font-semibold">{gridFrequency} Hz</span>
              <span className="text-slate-600">|</span>
              <span className="text-cyan-400 font-semibold">{gridVoltage} V</span>
              <span className="text-slate-500 text-[10px] uppercase ml-1">Grid Balanced</span>
            </div>
          </div>
        </div>

        {/* Center / Action Controls */}
        <div className="hidden md:flex items-center gap-2">
          {/* IoT Telemetry Engine Toggle */}
          <button
            onClick={onOpenSimModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-emerald-300 transition-all cursor-pointer"
            title="Configure simulated IoT houses and solar weather"
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>IoT Controls</span>
            <span className={`w-1.5 h-1.5 rounded-full ${isSimulatorActive ? 'bg-emerald-400' : 'bg-slate-500'}`} />
          </button>

          {/* Smart Contracts Explorer Button */}
          <button
            onClick={onOpenContractsModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-cyan-300 transition-all cursor-pointer"
            title="Inspect Solidity Smart Contracts & ABIs"
          >
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Contracts & ABI</span>
          </button>

          {/* Sell / List Power CTA */}
          <button
            onClick={onOpenListModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-semibold text-xs shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all cursor-pointer"
          >
            <Sun className="w-3.5 h-3.5" />
            <span>+ List Energy</span>
          </button>
        </div>

        {/* Web3 Wallet, Network & Persona Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Network Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNetworkDropdown(prev => !prev);
                setShowAccountDropdown(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-300 hover:border-slate-700 transition cursor-pointer"
              aria-label="Select Network"
            >
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="hidden sm:inline">{currentNetwork.name}</span>
              <span className="sm:hidden">{currentNetwork.currency}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showNetworkDropdown && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900/95 border border-slate-800 shadow-2xl p-1.5 backdrop-blur-xl z-50">
                <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Select Blockchain
                </div>
                {Object.entries(NETWORKS).map(([key, net]) => (
                  <button
                    key={key}
                    onClick={() => {
                      switchNetwork(key);
                      setShowNetworkDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition cursor-pointer ${
                      currentNetwork.chainId === net.chainId
                        ? 'bg-emerald-500/10 text-emerald-300 font-medium border border-emerald-500/30'
                        : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${currentNetwork.chainId === net.chainId ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                      <span>{net.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Chain {net.chainId}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Account & Balances Widget */}
          <div className="relative">
            <button
              onClick={() => {
                setShowAccountDropdown(prev => !prev);
                setShowNetworkDropdown(false);
              }}
              className="flex items-center gap-2.5 pl-2.5 pr-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 transition shadow-inner cursor-pointer"
              aria-label="Account details and persona switcher"
            >
              {/* Balances Pill */}
              <div className="hidden sm:flex items-center gap-2 pr-2 border-r border-slate-800 font-mono text-xs">
                <span className="text-slate-300 font-medium">
                  {ethBalance} <span className="text-slate-500 text-[10px]">{currentNetwork.currency}</span>
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-semibold text-[11px] border border-emerald-500/30">
                  <Zap className="w-2.5 h-2.5 fill-emerald-400" />
                  {nrgBalance.toFixed(1)} NRG
                </span>
              </div>

              {/* Persona Avatar & Address */}
              <div className="flex items-center gap-1.5">
                <div className={`w-6 h-6 rounded-full bg-gradient-to-tr ${selectedDemoAccount ? selectedDemoAccount.avatarBg : 'from-indigo-500 to-purple-600'} flex items-center justify-center text-[10px] font-bold text-white shadow`}>
                  {selectedDemoAccount ? selectedDemoAccount.name.slice(0, 1) : 'M'}
                </div>
                <span className="text-xs font-mono text-slate-200">
                  {formatAddress(account, 4, 3)}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
            </button>

            {/* Account Switcher Dropdown */}
            {showAccountDropdown && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl p-3 backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* Active Account Overview */}
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      {isMetaMaskConnected ? 'MetaMask Wallet' : 'Simulated Microgrid Account'}
                    </span>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-400 transition"
                      title="Copy Address"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-xs text-slate-200 truncate select-all">{account}</div>

                  {/* Mobile balance indicator */}
                  <div className="sm:hidden grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/80">
                    <div>
                      <div className="text-[10px] text-slate-400">Native Balance</div>
                      <div className="text-xs font-mono font-semibold text-slate-200">{ethBalance} {currentNetwork.currency}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Energy Tokens</div>
                      <div className="text-xs font-mono font-semibold text-emerald-400">{nrgBalance.toFixed(1)} NRG</div>
                    </div>
                  </div>
                </div>

                {/* Persona Switcher Section */}
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1 mb-1.5 flex items-center justify-between">
                  <span>Switch Microgrid Persona</span>
                  <span className="text-[10px] text-emerald-400 normal-case">Instant Local Testing</span>
                </div>

                <div className="space-y-1 mb-3">
                  {DEMO_ACCOUNTS.map((persona) => {
                    const isSelected = !isMetaMaskConnected && selectedDemoAccount?.id === persona.id;
                    return (
                      <button
                        key={persona.id}
                        onClick={() => {
                          selectDemoAccount(persona.id);
                          setShowAccountDropdown(false);
                        }}
                        className={`w-full text-left p-2 rounded-xl transition flex items-center gap-2.5 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/10 border border-emerald-500/30'
                            : 'hover:bg-slate-800/60 border border-transparent'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${persona.avatarBg} flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm`}>
                          {persona.id.slice(-1).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-medium text-slate-200 truncate">{persona.name}</div>
                            {isSelected && <span className="text-[10px] text-emerald-400 font-semibold">Active</span>}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">{persona.tag}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Connect Real MetaMask */}
                <div className="pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => {
                      connectMetaMask();
                      setShowAccountDropdown(false);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-xs font-medium text-slate-200 flex items-center justify-center gap-2 transition cursor-pointer border border-slate-700/50"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{isMetaMaskConnected ? 'Reconnect MetaMask' : 'Connect Real MetaMask Wallet'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
