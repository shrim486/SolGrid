import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import {
  NETWORKS,
  CONTRACT_ADDRESSES,
  DEMO_ACCOUNTS,
  DemoAccount,
  NetworkConfig
} from '../contracts/config';
import {
  ListingItem,
  kwhToNrgWei,
  nrgWeiToKwh,
  calculateTotalPriceWei,
  calculateSolarIrradiance,
  formatWei,
  calculateCo2Offset,
  WEI_PER_NRG
} from '../utils/microgrid';
import { ENERGY_MARKETPLACE_ABI, ENERGY_TOKEN_ABI } from '../contracts/abis';

export interface AuditEvent {
  id: string;
  type: 'EnergyMinted' | 'EnergyListed' | 'EnergyPurchased' | 'ListingCancelled';
  prosumer?: string;
  seller?: string;
  buyer?: string;
  amountKwh: number;
  pricePerKwhEth?: string;
  totalPriceEth?: string;
  txHash: string;
  blockNumber: number;
  timestamp: number;
  sourceHouse?: string;
}

export interface TelemetryPoint {
  time: string;
  solarGenKw: number;
  gridLoadKw: number;
  irradiance: number; // W/m²
  netExportKw: number;
  batterySoc: number; // %
}

interface MicrogridContextType {
  // Wallet & Account
  account: string;
  selectedDemoAccount: DemoAccount | null;
  isMetaMaskConnected: boolean;
  ethBalance: string;
  nrgBalance: number;
  currentNetwork: NetworkConfig;
  switchNetwork: (key: string) => void;
  selectDemoAccount: (id: string) => void;
  connectMetaMask: () => Promise<void>;
  disconnectWallet: () => void;

  // Marketplace & Orders
  listings: ListingItem[];
  createListing: (energyKwh: number, pricePerKwhEth: number) => Promise<{ success: boolean; error?: string; txHash?: string }>;
  buyListing: (listingId: number) => Promise<{ success: boolean; error?: string; txHash?: string }>;
  cancelListing: (listingId: number) => Promise<{ success: boolean; error?: string }>;

  // Audit Logs & Events
  auditEvents: AuditEvent[];

  // Live Telemetry
  telemetryHistory: TelemetryPoint[];
  currentIrradiance: number;
  ambientTemp: number;
  gridFrequency: string;
  gridVoltage: string;
  timeOfDayHours: number;
  weatherCondition: 'sunny' | 'cloudy' | 'overcast' | 'night';
  setWeatherCondition: (weather: 'sunny' | 'cloudy' | 'overcast' | 'night') => void;
  isSimulatorActive: boolean;
  toggleSimulator: () => void;
  triggerManualGenerationPulse: (houseId?: string, kwh?: number) => void;

  // Aggregated Stats
  totalGridOutputKwh: number;
  totalVolumeTradedKwh: number;
  totalCo2AvoidedKg: number;
  treesPlantedEquivalent: number;
  activeOrderCount: number;
  averagePriceEth: string;
}

const MicrogridContext = createContext<MicrogridContextType | null>(null);

// Initial Seed Listings
const INITIAL_LISTINGS: ListingItem[] = [
  {
    id: 101,
    seller: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    sellerName: 'House A (SunPeak PV)',
    energyAmountKwh: 35.0,
    energyAmountWei: 35n * WEI_PER_NRG,
    pricePerKwhWei: 1_200_000_000_000_000n, // 0.0012 ETH
    pricePerKwhEth: '0.0012',
    totalPriceWei: 42_000_000_000_000_000n, // 0.042 ETH
    totalPriceEth: '0.0420',
    active: true,
    createdAt: Date.now() - 1000 * 60 * 18,
    greenCertified: true
  },
  {
    id: 102,
    seller: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    sellerName: 'House C (GreenLeaf Storage)',
    energyAmountKwh: 18.5,
    energyAmountWei: 18_500_000_000_000_000_000n,
    pricePerKwhWei: 1_100_000_000_000_000n, // 0.0011 ETH
    pricePerKwhEth: '0.0011',
    totalPriceWei: 20_350_000_000_000_000n,
    totalPriceEth: '0.0204',
    active: true,
    createdAt: Date.now() - 1000 * 60 * 45,
    greenCertified: true
  },
  {
    id: 103,
    seller: '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
    sellerName: 'SolCommunity Array #4',
    energyAmountKwh: 80.0,
    energyAmountWei: 80n * WEI_PER_NRG,
    pricePerKwhWei: 1_350_000_000_000_000n, // 0.00135 ETH
    pricePerKwhEth: '0.00135',
    totalPriceWei: 108_000_000_000_000_000n,
    totalPriceEth: '0.1080',
    active: true,
    createdAt: Date.now() - 1000 * 60 * 92,
    greenCertified: true
  },
  {
    id: 104,
    seller: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    sellerName: 'EcoRooftop #12',
    energyAmountKwh: 12.0,
    energyAmountWei: 12n * WEI_PER_NRG,
    pricePerKwhWei: 1_050_000_000_000_000n, // 0.00105 ETH
    pricePerKwhEth: '0.00105',
    totalPriceWei: 12_600_000_000_000_000n,
    totalPriceEth: '0.0126',
    active: true,
    createdAt: Date.now() - 1000 * 60 * 130,
    greenCertified: true
  }
];

const INITIAL_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'evt-1',
    type: 'EnergyMinted',
    prosumer: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    sourceHouse: 'House A (SunPeak)',
    amountKwh: 14.5,
    txHash: '0x4f82c91a78e1b23c4a5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b',
    blockNumber: 18492041,
    timestamp: Date.now() - 1000 * 60 * 12
  },
  {
    id: 'evt-2',
    type: 'EnergyListed',
    seller: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    amountKwh: 35.0,
    pricePerKwhEth: '0.0012',
    totalPriceEth: '0.0420',
    txHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    blockNumber: 18492048,
    timestamp: Date.now() - 1000 * 60 * 18
  },
  {
    id: 'evt-3',
    type: 'EnergyPurchased',
    buyer: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    seller: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    amountKwh: 22.0,
    pricePerKwhEth: '0.00115',
    totalPriceEth: '0.0253',
    txHash: '0x7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f',
    blockNumber: 18492055,
    timestamp: Date.now() - 1000 * 60 * 27
  },
  {
    id: 'evt-4',
    type: 'EnergyMinted',
    prosumer: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    sourceHouse: 'House C (GreenLeaf)',
    amountKwh: 8.2,
    txHash: '0x3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e',
    blockNumber: 18492062,
    timestamp: Date.now() - 1000 * 60 * 35
  }
];

export const MicrogridProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Accounts & Network
  const [currentNetwork, setCurrentNetwork] = useState<NetworkConfig>(NETWORKS.amoy);
  const [selectedDemoAccount, setSelectedDemoAccount] = useState<DemoAccount | null>(DEMO_ACCOUNTS[0]);
  const [account, setAccount] = useState<string>(DEMO_ACCOUNTS[0].address);
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState<boolean>(false);
  const [ethBalance, setEthBalance] = useState<string>(DEMO_ACCOUNTS[0].ethBalance);
  const [nrgBalance, setNrgBalance] = useState<number>(DEMO_ACCOUNTS[0].nrgBalance);

  // Orders & Events
  const [listings, setListings] = useState<ListingItem[]>(INITIAL_LISTINGS);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(INITIAL_AUDIT_EVENTS);

  // Microgrid Telemetry State
  const [timeOfDayHours, setTimeOfDayHours] = useState<number>(13.2); // ~1:12 PM
  const [weatherCondition, setWeatherCondition] = useState<'sunny' | 'cloudy' | 'overcast' | 'night'>('sunny');
  const [isSimulatorActive, setIsSimulatorActive] = useState<boolean>(true);
  const [gridFrequency, setGridFrequency] = useState<string>('50.02');
  const [gridVoltage, setGridVoltage] = useState<string>('230.2');
  const [totalGridOutputKwh, setTotalGridOutputKwh] = useState<number>(1248.5);
  const [totalVolumeTradedKwh, setTotalVolumeTradedKwh] = useState<number>(684.2);

  // Initial telemetry series for graph
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryPoint[]>(() => {
    const points: TelemetryPoint[] = [];
    const now = Date.now();
    for (let i = 20; i >= 0; i--) {
      const t = new Date(now - i * 5000);
      const timeStr = t.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const solarGen = 7.8 + Math.sin(i * 0.3) * 0.8 + (Math.random() - 0.5) * 0.4;
      const load = 4.2 + Math.cos(i * 0.4) * 0.9;
      points.push({
        time: timeStr,
        solarGenKw: Number(solarGen.toFixed(2)),
        gridLoadKw: Number(load.toFixed(2)),
        irradiance: Math.round(solarGen * 115),
        netExportKw: Number((solarGen - load).toFixed(2)),
        batterySoc: Math.round(76 + Math.sin(i * 0.2) * 5)
      });
    }
    return points;
  });

  // Weather multiplier
  const getWeatherMultiplier = useCallback(() => {
    switch (weatherCondition) {
      case 'sunny': return 1.0;
      case 'cloudy': return 0.65;
      case 'overcast': return 0.28;
      case 'night': return 0.0;
    }
  }, [weatherCondition]);

  const currentIrradiance = Math.round(calculateSolarIrradiance(timeOfDayHours, getWeatherMultiplier()));
  const ambientTemp = Math.round(22 + (currentIrradiance / 1000) * 8.5);

  // Switch network
  const switchNetwork = (key: string) => {
    if (NETWORKS[key]) {
      setCurrentNetwork(NETWORKS[key]);
    }
  };

  // Switch demo account persona
  const selectDemoAccount = (id: string) => {
    const found = DEMO_ACCOUNTS.find(a => a.id === id);
    if (found) {
      setSelectedDemoAccount(found);
      setAccount(found.address);
      setEthBalance(found.ethBalance);
      setNrgBalance(found.nrgBalance);
      setIsMetaMaskConnected(false);
    }
  };

  // Real MetaMask connect if available
  const connectMetaMask = async () => {
    if (typeof window !== 'undefined' && (window as unknown as { ethereum?: unknown }).ethereum) {
      try {
        const ethereum = (window as unknown as { ethereum: { request: (args: { method: string }) => Promise<string[]> } }).ethereum;
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts[0]) {
          setAccount(accounts[0]);
          setIsMetaMaskConnected(true);
          setSelectedDemoAccount(null);
          // fetch real balance via ethers
          const provider = new ethers.BrowserProvider(ethereum as unknown as ethers.Eip1193Provider);
          const bal = await provider.getBalance(accounts[0]);
          setEthBalance(parseFloat(ethers.formatEther(bal)).toFixed(4));
          // give starting NRG for demo
          setNrgBalance(50.0);
        }
      } catch (err) {
        console.warn('MetaMask connect cancelled or failed:', err);
      }
    } else {
      // Fallback: cycle to demo account or notify
      alert('MetaMask browser extension not detected. You are using SolGrid High-Fidelity Testnet Simulation Mode.');
    }
  };

  const disconnectWallet = () => {
    setIsMetaMaskConnected(false);
    selectDemoAccount('house_a');
  };

  // Create Listing
  const createListing = async (energyKwh: number, pricePerKwhEth: number): Promise<{ success: boolean; error?: string; txHash?: string }> => {
    if (energyKwh <= 0) return { success: false, error: 'Energy amount must be greater than 0' };
    if (pricePerKwhEth <= 0) return { success: false, error: 'Price must be greater than 0' };
    if (nrgBalance < energyKwh) {
      return { success: false, error: `Insufficient NRG balance. You have ${nrgBalance.toFixed(1)} NRG, attempted to list ${energyKwh} NRG.` };
    }

    // Deduct NRG from user balance into escrow
    setNrgBalance(prev => Math.max(0, prev - energyKwh));

    const energyWei = kwhToNrgWei(energyKwh);
    const pricePerKwhWei = ethers.parseEther(pricePerKwhEth.toString());
    const totalWei = calculateTotalPriceWei(energyWei, pricePerKwhWei);
    const totalEth = ethers.formatEther(totalWei);

    const newId = listings.length > 0 ? Math.max(...listings.map(l => l.id)) + 1 : 101;
    const sellerTitle = selectedDemoAccount ? selectedDemoAccount.name : 'Connected Prosumer';

    const newListing: ListingItem = {
      id: newId,
      seller: account,
      sellerName: sellerTitle,
      energyAmountKwh: energyKwh,
      energyAmountWei: energyWei,
      pricePerKwhWei,
      pricePerKwhEth: pricePerKwhEth.toString(),
      totalPriceWei: totalWei,
      totalPriceEth: totalEth,
      active: true,
      createdAt: Date.now(),
      greenCertified: true
    };

    const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newBlock = 18492000 + Math.floor(Math.random() * 500);

    setListings(prev => [newListing, ...prev]);

    // Record on-chain audit event
    const newEvent: AuditEvent = {
      id: `evt-${Date.now()}`,
      type: 'EnergyListed',
      seller: account,
      amountKwh: energyKwh,
      pricePerKwhEth: pricePerKwhEth.toString(),
      totalPriceEth: totalEth,
      txHash,
      blockNumber: newBlock,
      timestamp: Date.now()
    };
    setAuditEvents(prev => [newEvent, ...prev]);

    return { success: true, txHash };
  };

  // Buy Listing
  const buyListing = async (listingId: number): Promise<{ success: boolean; error?: string; txHash?: string }> => {
    const listing = listings.find(l => l.id === listingId);
    if (!listing || !listing.active) {
      return { success: false, error: 'Listing is not available or already sold.' };
    }
    if (listing.seller.toLowerCase() === account.toLowerCase()) {
      return { success: false, error: 'You cannot purchase your own listing.' };
    }

    const costEth = parseFloat(listing.totalPriceEth);
    const userEth = parseFloat(ethBalance);

    if (userEth < costEth) {
      return { success: false, error: `Insufficient ETH balance. You need ${costEth} ETH, have ${userEth} ETH.` };
    }

    // Process escrow transfers:
    // Deduct ETH from buyer, add NRG tokens
    setEthBalance(prev => (Math.max(0, parseFloat(prev) - costEth)).toFixed(4));
    setNrgBalance(prev => prev + listing.energyAmountKwh);

    // Update listing status
    setListings(prev => prev.map(item => item.id === listingId ? { ...item, active: false } : item));
    setTotalVolumeTradedKwh(prev => prev + listing.energyAmountKwh);

    const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newBlock = 18492000 + Math.floor(Math.random() * 500);

    // Record on-chain audit event
    const newEvent: AuditEvent = {
      id: `evt-${Date.now()}`,
      type: 'EnergyPurchased',
      buyer: account,
      seller: listing.seller,
      amountKwh: listing.energyAmountKwh,
      pricePerKwhEth: listing.pricePerKwhEth,
      totalPriceEth: listing.totalPriceEth,
      txHash,
      blockNumber: newBlock,
      timestamp: Date.now()
    };
    setAuditEvents(prev => [newEvent, ...prev]);

    return { success: true, txHash };
  };

  // Cancel Listing
  const cancelListing = async (listingId: number): Promise<{ success: boolean; error?: string }> => {
    const listing = listings.find(l => l.id === listingId);
    if (!listing || !listing.active) {
      return { success: false, error: 'Listing not found or already inactive' };
    }

    // Refund NRG to seller if current account is the seller
    if (listing.seller.toLowerCase() === account.toLowerCase()) {
      setNrgBalance(prev => prev + listing.energyAmountKwh);
    }

    setListings(prev => prev.map(item => item.id === listingId ? { ...item, active: false } : item));

    const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newBlock = 18492000 + Math.floor(Math.random() * 500);

    const newEvent: AuditEvent = {
      id: `evt-${Date.now()}`,
      type: 'ListingCancelled',
      seller: listing.seller,
      amountKwh: listing.energyAmountKwh,
      txHash,
      blockNumber: newBlock,
      timestamp: Date.now()
    };
    setAuditEvents(prev => [newEvent, ...prev]);

    return { success: true };
  };

  // Trigger manual generation pulse from IoT meter
  const triggerManualGenerationPulse = (houseId: string = 'house_a', kwh: number = 3.5) => {
    const targetAccount = DEMO_ACCOUNTS.find(a => a.id === houseId) || DEMO_ACCOUNTS[0];
    const generatedAmount = kwh;

    // If current user is this house, boost balance
    if (account.toLowerCase() === targetAccount.address.toLowerCase()) {
      setNrgBalance(prev => Number((prev + generatedAmount).toFixed(2)));
    }

    setTotalGridOutputKwh(prev => Number((prev + generatedAmount).toFixed(2)));

    const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newBlock = 18492000 + Math.floor(Math.random() * 500);

    const mintEvent: AuditEvent = {
      id: `evt-${Date.now()}`,
      type: 'EnergyMinted',
      prosumer: targetAccount.address,
      sourceHouse: targetAccount.name,
      amountKwh: generatedAmount,
      txHash,
      blockNumber: newBlock,
      timestamp: Date.now()
    };

    setAuditEvents(prev => [mintEvent, ...prev]);
  };

  const toggleSimulator = () => {
    setIsSimulatorActive(prev => !prev);
  };

  // Telemetry Heartbeat (every 5 seconds)
  useEffect(() => {
    if (!isSimulatorActive) return;

    const interval = setInterval(() => {
      // Advance day slightly
      setTimeOfDayHours(prev => (prev + 0.04) % 24);

      // Microgrid frequency & voltage fluctuations
      const freq = (50.0 + (Math.random() - 0.5) * 0.05).toFixed(2);
      const volt = (230.0 + (Math.random() - 0.5) * 1.6).toFixed(1);
      setGridFrequency(freq);
      setGridVoltage(volt);

      // Irradiance calculation
      const mult = getWeatherMultiplier();
      const irrad = calculateSolarIrradiance(timeOfDayHours, mult);
      const solarGen = Number(((irrad / 1000) * 8.4 + (Math.random() - 0.5) * 0.3).toFixed(2));
      const gridLoad = Number((4.1 + Math.sin(Date.now() / 20000) * 1.5 + (Math.random() - 0.5) * 0.3).toFixed(2));
      const netExport = Number((solarGen - gridLoad).toFixed(2));
      const batterySoc = Math.min(100, Math.max(20, Math.round(75 + (solarGen > gridLoad ? 1 : -1) * (Math.random() * 2))));

      // Add to telemetry series
      const nowStr = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setTelemetryHistory(prev => {
        const next = [...prev.slice(1), {
          time: nowStr,
          solarGenKw: Math.max(0, solarGen),
          gridLoadKw: Math.max(0.5, gridLoad),
          irradiance: irrad,
          netExportKw: netExport,
          batterySoc
        }];
        return next;
      });

      // Small solar increment (5s tick in kWh)
      const tickKwh = Number((solarGen * (5 / 3600) * 10).toFixed(4));
      setTotalGridOutputKwh(prev => Number((prev + tickKwh).toFixed(2)));

      // If connected as House A (solar producer), grant portion of minted NRG
      if (account.toLowerCase() === DEMO_ACCOUNTS[0].address.toLowerCase()) {
        setNrgBalance(prev => Number((prev + tickKwh).toFixed(2)));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isSimulatorActive, timeOfDayHours, getWeatherMultiplier, account]);

  // Derived aggregate metrics
  const activeListings = listings.filter(l => l.active);
  const activeOrderCount = activeListings.length;
  const totalCo2Data = calculateCo2Offset(totalGridOutputKwh);
  const totalCo2AvoidedKg = totalCo2Data.co2Kg;
  const treesPlantedEquivalent = totalCo2Data.treesEquivalent;

  const averagePriceEth = activeListings.length > 0
    ? (activeListings.reduce((acc, curr) => acc + parseFloat(curr.pricePerKwhEth), 0) / activeListings.length).toFixed(4)
    : '0.0012';

  return (
    <MicrogridContext.Provider
      value={{
        account,
        selectedDemoAccount,
        isMetaMaskConnected,
        ethBalance,
        nrgBalance,
        currentNetwork,
        switchNetwork,
        selectDemoAccount,
        connectMetaMask,
        disconnectWallet,
        listings,
        createListing,
        buyListing,
        cancelListing,
        auditEvents,
        telemetryHistory,
        currentIrradiance,
        ambientTemp,
        gridFrequency,
        gridVoltage,
        timeOfDayHours,
        weatherCondition,
        setWeatherCondition,
        isSimulatorActive,
        toggleSimulator,
        triggerManualGenerationPulse,
        totalGridOutputKwh,
        totalVolumeTradedKwh,
        totalCo2AvoidedKg,
        treesPlantedEquivalent,
        activeOrderCount,
        averagePriceEth
      }}
    >
      {children}
    </MicrogridContext.Provider>
  );
};

export const useMicrogrid = () => {
  const ctx = useContext(MicrogridContext);
  if (!ctx) {
    throw new Error('useMicrogrid must be used within a MicrogridProvider');
  }
  return ctx;
};
