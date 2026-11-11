import React, { useState } from 'react';
import {
  ShoppingBag,
  Zap,
  Tag,
  Search,
  SlidersHorizontal,
  CheckCircle,
  Clock,
  ArrowUpDown,
  ExternalLink,
  Plus,
  ShieldCheck,
  Sparkles,
  Info
} from 'lucide-react';
import { useMicrogrid } from '../context/MicrogridContext';
import { formatAddress, ListingItem, filterAndSortListings } from '../utils/microgrid';

interface MarketplaceOrderBookProps {
  onSelectListForPurchase: (listing: ListingItem) => void;
  onOpenListModal: () => void;
}

export const MarketplaceOrderBook: React.FC<MarketplaceOrderBookProps> = ({
  onSelectListForPurchase,
  onOpenListModal
}) => {
  const {
    listings,
    account,
    cancelListing,
    currentNetwork
  } = useMicrogrid();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'my'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'amount_desc'>('price_asc');
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  // Filter listings
  const filteredListings = filterAndSortListings(listings, {
    search: searchQuery,
    onlyActive: filterTab === 'all',
    sortBy
  }).filter(item => {
    if (filterTab === 'my') {
      return item.seller.toLowerCase() === account.toLowerCase();
    }
    return true;
  });

  const handleCancel = async (id: number) => {
    setCancellingId(id);
    await cancelListing(id);
    setCancellingId(null);
  };

  return (
    <div className="glass-panel p-6 rounded-2xl relative">
      {/* Top Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              Peer-to-Peer Energy Order Book
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-semibold border border-cyan-500/20">
              Escrow Smart Contract v1
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Trade clean kilowatt-hours directly with local prosumers. Zero utility markups.
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenListModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>List Energy for Sale</span>
          </button>
        </div>
      </div>

      {/* Filter and Tab Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        {/* Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer font-medium ${
              filterTab === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Active Market ({listings.filter(l => l.active).length})
          </button>
          <button
            onClick={() => setFilterTab('my')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer font-medium ${
              filterTab === 'my'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            My Orders ({listings.filter(l => l.seller.toLowerCase() === account.toLowerCase()).length})
          </button>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2 flex-1 sm:justify-end">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by seller, node or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition font-mono"
            />
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as unknown as 'newest' | 'price_asc' | 'price_desc' | 'amount_desc')}
              className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer"
            >
              <option value="price_asc" className="bg-slate-900">Price: Low to High</option>
              <option value="price_desc" className="bg-slate-900">Price: High to Low</option>
              <option value="amount_desc" className="bg-slate-900">Largest Volume</option>
              <option value="newest" className="bg-slate-900">Newest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table / Cards */}
      {filteredListings.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-800 bg-slate-950/40">
          <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-300">No active orders found</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {filterTab === 'my'
              ? 'You have not placed any sell orders with this account yet. Click "List Energy for Sale" to earn ETH!'
              : 'Try clearing your search filters or be the first to list surplus power into the microgrid pool.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Order ID</th>
                <th className="py-3 px-3">Prosumer Seller</th>
                <th className="py-3 px-3">Available Power</th>
                <th className="py-3 px-3">Rate / kWh</th>
                <th className="py-3 px-3">Total Escrow</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-xs">
              {filteredListings.map((item) => {
                const isMyListing = item.seller.toLowerCase() === account.toLowerCase();
                const isCancelling = cancellingId === item.id;

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-800/30 transition-colors group"
                  >
                    {/* Order ID */}
                    <td className="py-3.5 px-3 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500">#</span>
                        <span className="text-white font-semibold">{item.id}</span>
                        {!item.active && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                            Sold / Inactive
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Prosumer Seller */}
                    <td className="py-3.5 px-3">
                      <div>
                        <div className="flex items-center gap-1.5 font-medium text-slate-200">
                          <span>{item.sellerName || formatAddress(item.seller, 6, 4)}</span>
                          {item.greenCertified && (
                            <span title="Verified Rooftop Solar Producer">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 inline" />
                            </span>
                          )}
                          {isMyListing && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              You
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-[11px] text-slate-500">
                          {formatAddress(item.seller, 6, 4)}
                        </div>
                      </div>
                    </td>

                    {/* Available Power (NRG) */}
                    <td className="py-3.5 px-3 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
                        <span className="text-sm font-bold text-white">
                          {item.energyAmountKwh.toFixed(1)}
                        </span>
                        <span className="text-slate-400 text-[11px]">NRG (kWh)</span>
                      </div>
                    </td>

                    {/* Rate / kWh */}
                    <td className="py-3.5 px-3 font-mono">
                      <div>
                        <div className="text-slate-200 font-semibold">
                          {item.pricePerKwhEth} <span className="text-slate-400 text-[10px]">{currentNetwork.currency}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          ≈ ${(parseFloat(item.pricePerKwhEth) * 3150).toFixed(2)}/kWh
                        </div>
                      </div>
                    </td>

                    {/* Total Escrow */}
                    <td className="py-3.5 px-3 font-mono">
                      <div>
                        <div className="text-emerald-400 font-bold text-sm">
                          {item.totalPriceEth} <span className="text-[10px] text-slate-400 font-normal">{currentNetwork.currency}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          ≈ ${(parseFloat(item.totalPriceEth) * 3150).toFixed(2)} USD
                        </div>
                      </div>
                    </td>

                    {/* Action: Buy or Cancel */}
                    <td className="py-3.5 px-3 text-right">
                      {item.active ? (
                        isMyListing ? (
                          <button
                            onClick={() => handleCancel(item.id)}
                            disabled={isCancelling}
                            className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium transition cursor-pointer disabled:opacity-50"
                          >
                            {isCancelling ? 'Cancelling...' : 'Cancel Listing'}
                          </button>
                        ) : (
                          <button
                            onClick={() => onSelectListForPurchase(item)}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all cursor-pointer transform active:scale-95"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>Buy Power</span>
                          </button>
                        )
                      ) : (
                        <span className="text-xs text-slate-500 font-mono">Completed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Escrow safety notice */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5 text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Non-custodial smart escrow: NRG locked until native payment settles.</span>
        </div>
        <span className="font-mono text-[11px] hidden sm:inline">Contract Escrow 0xe7f1...0512</span>
      </div>
    </div>
  );
};
