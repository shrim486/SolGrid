import React, { useState } from 'react';
import {
  X,
  Sun,
  Zap,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Lock,
  Leaf
} from 'lucide-react';
import { useMicrogrid } from '../context/MicrogridContext';
import { calculateCo2Offset } from '../utils/microgrid';

interface ListEnergyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ListEnergyModal: React.FC<ListEnergyModalProps> = ({ isOpen, onClose }) => {
  const {
    nrgBalance,
    createListing,
    currentNetwork,
    selectedDemoAccount
  } = useMicrogrid();

  const [energyAmount, setEnergyAmount] = useState<string>('20.0');
  const [pricePerKwh, setPricePerKwh] = useState<string>('0.0012');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successTx, setSuccessTx] = useState<string | null>(null);

  if (!isOpen) return null;

  const parsedAmount = parseFloat(energyAmount) || 0;
  const parsedPrice = parseFloat(pricePerKwh) || 0;
  const totalPayoutEth = (parsedAmount * parsedPrice).toFixed(4);
  const totalPayoutUsd = (parseFloat(totalPayoutEth) * 3150).toFixed(2);
  const co2Data = calculateCo2Offset(parsedAmount);

  const handleMax = () => {
    setEnergyAmount(nrgBalance.toFixed(1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (parsedAmount <= 0) {
      setErrorMsg('Please enter a valid energy amount greater than 0.');
      return;
    }
    if (parsedAmount > nrgBalance) {
      setErrorMsg(`Insufficient NRG. You have ${nrgBalance.toFixed(1)} NRG available.`);
      return;
    }
    if (parsedPrice <= 0) {
      setErrorMsg('Price per kWh must be greater than 0.');
      return;
    }

    setIsSubmitting(true);
    const res = await createListing(parsedAmount, parsedPrice);
    setIsSubmitting(false);

    if (res.success && res.txHash) {
      setSuccessTx(res.txHash);
    } else {
      setErrorMsg(res.error || 'Failed to create energy listing.');
    }
  };

  const handleResetAndClose = () => {
    setSuccessTx(null);
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 relative overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">List Energy for Sale</h3>
              <p className="text-xs text-slate-400">Lock generated solar NRG tokens into Escrow</p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successTx ? (
          /* Success Screen */
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Order Listed on Smart Escrow!</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {parsedAmount} NRG ({parsedAmount} kWh) has been locked into the EnergyMarketplace escrow and is now active in the peer-to-peer order book.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-left font-mono text-xs space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Listed Volume:</span>
                <span className="text-white font-bold">{parsedAmount} NRG</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Asking Rate:</span>
                <span className="text-white">{parsedPrice} {currentNetwork.currency} / kWh</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Escrow Tx Hash:</span>
                <span className="text-emerald-400 truncate max-w-[200px]">{successTx}</span>
              </div>
            </div>

            <button
              onClick={handleResetAndClose}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition cursor-pointer"
            >
              Done & Return to Market
            </button>
          </div>
        ) : (
          /* Form Screen */
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Energy Input */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  Energy Volume (NRG / kWh)
                </label>
                <div className="flex items-center gap-1 text-slate-400 font-mono">
                  <span>Balance:</span>
                  <span className="text-emerald-400 font-bold">{nrgBalance.toFixed(1)} NRG</span>
                  <button
                    type="button"
                    onClick={handleMax}
                    className="ml-1 text-[10px] text-cyan-400 hover:underline uppercase font-bold cursor-pointer"
                  >
                    Max
                  </button>
                </div>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max={nrgBalance}
                  value={energyAmount}
                  onChange={(e) => setEnergyAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-emerald-500/60"
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                  kWh
                </span>
              </div>
            </div>

            {/* Price Input */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label className="font-semibold text-slate-300">
                  Price per kWh ({currentNetwork.currency})
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  Benchmark: ~0.0012 {currentNetwork.currency}
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  value={pricePerKwh}
                  onChange={(e) => setPricePerKwh(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-emerald-500/60"
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                  {currentNetwork.currency}
                </span>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-400">
                <span>Estimated Total Payout:</span>
                <span className="text-white font-bold text-sm">
                  {totalPayoutEth} {currentNetwork.currency} <span className="text-slate-500 text-xs">(≈ ${totalPayoutUsd})</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Microgrid Protocol Fee:</span>
                <span className="text-emerald-400 font-semibold">0.00% (Zero Fee Microgrid)</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>CO₂ Offset Yield:</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <Leaf className="w-3 h-3" />
                  {co2Data.co2Kg} kg CO₂
                </span>
              </div>
            </div>

            {/* Escrow safety alert */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-[11px] text-emerald-300">
              <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Tokens will be transferred to EnergyMarketplace smart contract escrow until bought.</span>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting || nrgBalance <= 0}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>{isSubmitting ? 'Locking in Escrow...' : 'Confirm & List on Order Book'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
