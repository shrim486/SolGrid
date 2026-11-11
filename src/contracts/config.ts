/**
 * Network and Smart Contract Configurations for SolGrid
 */

export interface NetworkConfig {
  name: string;
  chainId: number;
  currency: string;
  rpcUrl: string;
  explorerUrl: string;
  isTestnet: boolean;
}

export const NETWORKS: Record<string, NetworkConfig> = {
  amoy: {
    name: 'Polygon Amoy',
    chainId: 80002,
    currency: 'MATIC',
    rpcUrl: 'https://rpc-amoy.polygon.technology',
    explorerUrl: 'https://amoy.polygonscan.com',
    isTestnet: true
  },
  sepolia: {
    name: 'Ethereum Sepolia',
    chainId: 11155111,
    currency: 'ETH',
    rpcUrl: 'https://rpc.sepolia.org',
    explorerUrl: 'https://sepolia.etherscan.io',
    isTestnet: true
  },
  hardhat: {
    name: 'Localhost Hardhat',
    chainId: 31337,
    currency: 'ETH',
    rpcUrl: 'http://127.0.0.1:8545',
    explorerUrl: '',
    isTestnet: true
  },
  solgrid: {
    name: 'SolGrid Microgrid L2',
    chainId: 94101,
    currency: 'ETH',
    rpcUrl: 'https://rpc.solgrid.network',
    explorerUrl: 'https://explorer.solgrid.network',
    isTestnet: true
  }
};

export const CONTRACT_ADDRESSES = {
  energyToken: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  energyMarketplace: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
};

export interface DemoAccount {
  id: string;
  name: string;
  address: string;
  role: 'producer' | 'consumer' | 'prosumer';
  tag: string;
  ethBalance: string;
  nrgBalance: number;
  pvCapacityKw: number;
  batteryCapacityKwh: number;
  avatarBg: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: 'house_a',
    name: 'House A (SunPeak Residence)',
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    role: 'producer',
    tag: 'Solar Prosumer (Surplus)',
    ethBalance: '3.4500',
    nrgBalance: 245.8,
    pvCapacityKw: 8.5,
    batteryCapacityKwh: 10.0,
    avatarBg: 'from-emerald-500 to-teal-700'
  },
  {
    id: 'house_b',
    name: 'House B (Oakridge EV Hub)',
    address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    role: 'consumer',
    tag: 'Heavy Consumer (EV & HVAC)',
    ethBalance: '5.8200',
    nrgBalance: 14.2,
    pvCapacityKw: 0.0,
    batteryCapacityKwh: 0.0,
    avatarBg: 'from-rose-500 to-orange-700'
  },
  {
    id: 'house_c',
    name: 'House C (GreenLeaf EcoHome)',
    address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    role: 'prosumer',
    tag: 'Net-Zero Prosumer',
    ethBalance: '2.1900',
    nrgBalance: 98.4,
    pvCapacityKw: 4.2,
    batteryCapacityKwh: 13.5,
    avatarBg: 'from-cyan-500 to-blue-700'
  }
];
