import React, { useState } from 'react';
import {
  X,
  Zap,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Lock,
  Wallet
} from 'lucide-react';
import { useMicrogrid } from '../context/MicrogridContext';
import { ListingItem, formatAddress } from '../utils/microgrid';

interface BuyEnergyModalProps {
  listing: ListingItem | null;
  onClose: () => void;
}

export const BuyEnergyModal: React.FC<BuyEnergyModalProps> = ({ listing, onClose }) => {
  const {
    buyListing,
    ethBalance,
    currentNetwork,
    account
  } = useMicrogrid();

  const [isPurchasing, setIsPurchasing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successTx, setSuccessTx] = useState<string | null>(null);

  if (!listing) return null;

  const costEth = parseFloat(listing.totalPriceEth);
  const currentEth = parseFloat(ethBalance);
  const remainingEth = (currentEth - costEth).toFixed(4);
  const isInsufficientFunds = currentEth < costEth;

  const handleConfirmPurchase = async () => {
    setErrorMsg(null);
    if (isInsufficientFunds) {
      setErrorMsg(`Insufficient funds. You have ${ethBalance} ${currentNetwork.currency}, but this order requires ${listing.totalPriceEth} ${currentNetwork.currency}.`);
      return;
    }

    setIsPurchasing(true);
    const res = await buyListing(listing.id);
    setIsPurchasing(false);

    if (res.success && res.txHash) {
      setSuccessTx(res.txHash);
    } else {
      setErrorMsg(res.error || 'Failed to complete escrow purchase.');
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
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Zap className="w-5 h-5 fill-cyan-400/20" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Buy Microgrid Power</h3>
              <p className="text-xs text-slate-400">Smart Contract Escrow Direct Settlement</p>
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
              <h4 className="text-lg font-bold text-white">Power Successfully Purchased!</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {listing.energyAmountKwh} NRG tokens ({listing.energyAmountKwh} kWh) have been released from escrow to your wallet, and {listing.totalPriceEth} {currentNetwork.currency} was transferred to the prosumer seller.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-left font-mono text-xs space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Energy Received:</span>
                <span className="text-emerald-400 font-bold">+{listing.energyAmountKwh} NRG</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Paid:</span>
                <span className="text-white">{listing.totalPriceEth} {currentNetwork.currency}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Seller:</span>
                <span className="text-slate-300">{formatAddress(listing.seller, 6, 4)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tx Hash:</span>
                <span className="text-cyan-400 truncate max-w-[200px]">{successTx}</span>
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
          /* Confirmation Breakdown */
          <div className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Order Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Listing #</span>
                <span className="text-white font-bold">{listing.id}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Prosumer Seller:</span>
                <span className="text-slate-200">
                  {listing.sellerName || formatAddress(listing.seller, 6, 4)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Energy Amount:</span>
                <span className="text-emerald-400 font-bold text-sm flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-emerald-400" />
                  {listing.energyAmountKwh.toFixed(1)} NRG (kWh)
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Unit Price:</span>
                <span className="text-slate-300">
                  {listing.pricePerKwhEth} {currentNetwork.currency} / kWh
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 text-sm">
                <span className="text-white font-semibold">Total Escrow Value:</span>
                <span className="text-white font-bold text-base">
                  {listing.totalPriceEth} {currentNetwork.currency}
                </span>
              </div>
            </div>

            {/* Buyer Balance & Remaining */}
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-400">
                <Wallet className="w-4 h-4 text-cyan-400" />
                <span>Your Balance:</span>
              </div>
              <div className="text-right">
                <span className={`font-bold ${isInsufficientFunds ? 'text-rose-400' : 'text-slate-200'}`}>
                  {ethBalance} {currentNetwork.currency}
                </span>
                {!isInsufficientFunds && (
                  <div className="text-[10px] text-slate-500">
                    Remaining after: {remainingEth} {currentNetwork.currency}
                  </div>
                )}
              </div>
            </div>

            {/* Escrow routing note */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-[11px] text-cyan-300">
              <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>
                Atomic Swap: EnergyMarketplace contract transfers {listing.totalPriceEth} {currentNetwork.currency} to seller and delivers {listing.energyAmountKwh} NRG to you simultaneously.
              </span>
            </div>

            {/* Action buttons */}
            <button
              onClick={handleConfirmPurchase}
              disabled={isPurchasing || isInsufficientFunds}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>{isPurchasing ? 'Processing Escrow Transaction...' : `Confirm & Pay ${listing.totalPriceEth} ${currentNetwork.currency}`}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
