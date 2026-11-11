# SolGrid — Decentralized Microgrid Energy Trading Platform ⚡☀️

SolGrid is a production-grade Web3 decentralized microgrid platform that connects rooftop solar prosumers and neighborhood consumers for direct, peer-to-peer (P2P) renewable energy trading. 

Featuring audited Solidity 0.8.20+ smart contracts, an IoT smart meter telemetry simulator, and a dark-themed glassmorphic Web3 dashboard.

---

## 🌟 Key Highlights

- **Smart Contracts (Solidity 0.8.20+)**:
  - `EnergyToken.sol`: Standard ERC-20 token (`NRG`) representing verified kilowatt-hours ($1\text{ NRG} = 1\text{ kWh}$).
  - `EnergyMarketplace.sol`: Non-custodial escrow protocol executing atomic swaps of native currency (`ETH` / `MATIC`) for `$NRG` tokens.
  - Role-based smart meter oracle permissions calling `recordSolarGeneration()`.
- **Live IoT Microgrid Simulator (`simulator/simulator.js`)**:
  - Simulates 3 houses: House A (Solar Producer - 8.5 kWp), House B (Heavy Consumer - EV & HVAC), House C (Net-Zero Prosumer).
  - Calculates diurnal solar irradiance curves (W/m²), ambient panel temperature, and grid stability (50.02 Hz / 230.1 V).
- **Web3 Dashboard (React + Vite + Tailwind CSS + Ethers.js v6)**:
  - Real-time `Recharts` area chart of solar generation vs household load.
  - P2P order book with listing and buying flows.
  - Real-time cryptographic audit trail of all minted and traded energy.
  - Dual-mode wallet connection: Supports real MetaMask extension or simulated local testnet personas.

---

## 🛠️ Tech Stack

- **Smart Contracts**: Solidity 0.8.20, Ethers.js v6, Hardhat
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Recharts, Motion
- **Telemetry Engine**: Node.js ES Modules, Ethers.js JsonRpcProvider

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Web App
```bash
npm run dev
```

### 3. Run the Smart Contracts Deployment Script
```bash
node scripts/deploy.js
```

### 4. Run the Real-Time IoT Telemetry Simulator
```bash
node simulator/simulator.js
```

### 5. Run Unit Tests
```bash
npx tsx --test src/utils/microgrid.test.ts
```

---

## 📜 Smart Contract Architecture

```
                 SOLGRID PROTOCOL FLOW
 ┌──────────────────────┐         ┌─────────────────────────┐
 │   IoT Smart Meter    │───────► │   recordSolarGeneration │
 │ (SunPeak Residence)  │         │  (EnergyMarketplace.sol)│
 └──────────────────────┘         └───────────┬─────────────┘
                                              │ Mints 1:1
                                              ▼
 ┌──────────────────────┐         ┌─────────────────────────┐
 │  Seller (House A)    │◄─────── │    EnergyToken (NRG)    │
 │ (Locks NRG in Escrow)│         │     (ERC-20 Token)      │
 └──────────┬───────────┘         └─────────────────────────┘
            │
            │ listEnergy(amount, price)
            ▼
 ┌──────────────────────────────────────────────────────────┐
 │               EnergyMarketplace Escrow                   │
 └──────────────────────────┬───────────────────────────────┘
                            │ buyEnergy(listingId)
                            ▼
 ┌──────────────────────────────────────────────────────────┐
 │ Atomic Swap: Buyer pays ETH ──► Seller receives ETH      │
 │              Escrow sends NRG ──► Buyer receives NRG     │
 └──────────────────────────────────────────────────────────┘
```

---

## 📄 License
MIT License.
