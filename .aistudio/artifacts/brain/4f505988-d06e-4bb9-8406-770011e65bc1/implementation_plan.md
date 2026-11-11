# SolGrid — Classroom Live Presentation & Demo Walkthrough Plan

A structured classroom demonstration plan and step-by-step "click-and-speak" presentation script for pitching and demonstrating SolGrid—a decentralized microgrid energy trading platform combining IoT solar telemetry with ERC-20 token escrow settlements.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed Presentation Format**: The user selected a **Step-by-Step Click-and-Speak Live Demo Script** for their classroom presentation.
> 
> **Interactive Feature Enhancement**: To make presenting effortless in front of a live audience, we will add an optional **"Classroom Demo Mode / Presenter Script"** toggle drawer directly in the app. This provides a collapsible prompt HUD with exact speaking cues, highlighted interactive click targets, and a 1-click test flow without altering the core Web3 dApp design.

---

### 1. Overview & Core Concept

- **What It Does**: SolGrid enables decentralized, peer-to-peer (P2P) trading of rooftop solar electricity within a neighborhood microgrid. When houses generate surplus solar energy, smart meters verify the output and mint standard ERC-20 `$NRG` tokens (1 NRG = 1 kWh). Neighbors with energy deficits (e.g., charging EVs or running appliances) can buy this clean electricity directly with native cryptocurrency (`MATIC` or `ETH`) through non-custodial smart contract escrow, bypassing utility monopolies and reducing grid losses.
- **Target Audience / Persona**:
  - *Prosumers (Producers + Consumers)*: Homeowners with rooftop solar (House A) who monetize excess generation.
  - *Consumers*: Neighbors with high electrical loads (House B) who purchase cheaper, 100% green local power.
  - *Net-Zero Homes*: Battery-buffered residences (House C) that stabilize grid balance.
- **Key Value**:
  - Eliminates middleman utility price gouging (typically ~22% savings for buyers, higher revenue for solar owners).
  - Verifiable carbon offset tracking (0.85 kg CO₂ avoided per kWh).
  - Microgrid resiliency during macrogrid brownouts.

---

### 2. User Experience & Live Classroom Demo Script

The 4-stage presentation is designed for a **5–7 minute classroom delivery** with exact actions to perform on screen while speaking:

```
┌────────────────────────────────────────────────────────────────────────┐
│ STAGE 1: The Problem & High-Level Architecture (Slide / Introduction) │
│ STAGE 2: Real-Time Solar Ingress & IoT Telemetry (Live Chart)         │
│ STAGE 3: Peer-to-Peer Trading & Atomic Escrow Settlement (Order Book) │
│ STAGE 4: Immutable Audit Trail & Smart Contract Verification (Feed)   │
└────────────────────────────────────────────────────────────────────────┘
```

#### Stage 1: The Hook & Introduction (1 Minute)
- **Click**: Keep the dashboard open on the standard desktop view.
- **Speak**:
  > *"Traditional energy grids are centralized, fossil-reliant, and inefficient—transmitting power over hundreds of miles loses up to 10% of electricity, while utility monopolies take huge markups. SolGrid changes this by turning neighborhoods into self-balancing microgrids where neighbors trade rooftop solar peer-to-peer using blockchain and smart meters."*

#### Stage 2: IoT Telemetry & Automatic Token Minting (1.5 Minutes)
- **Click**: Point to the **Top Metrics Bar** and the **Live Solar Telemetry Chart**.
- **Action**: Click **"IoT Controls"** in the header $\rightarrow$ Toggle weather from **Clear Sun** to **Partly Cloud**, then click **"+15.0 NRG (High Sun)"** to inject a telemetry pulse.
- **Speak**:
  > *"Here on our live dashboard, simulated IoT smart meters feed solar irradiance and kilowatt-hour generation every 5 seconds. As House A produces 7.8 kW of rooftop PV power, our Solidity contract automatically calls `recordSolarGeneration()`, minting 1 $NRG token for every verified kilowatt-hour directly to the prosumer's Web3 wallet."*

#### Stage 3: Peer-to-Peer Trading & Non-Custodial Escrow (2 Minutes)
- **Click**: Scroll down to the **Peer-to-Peer Energy Order Book**.
- **Action**: Click **"+ List Energy for Sale"** $\rightarrow$ Enter `10` kWh at `0.0012 MATIC` $\rightarrow$ Click **"Confirm & List on Order Book"**.
- **Action**: In the header, click the account dropdown and switch persona to **House B (Oakridge EV Hub)** $\rightarrow$ Click **"Buy Power"** on the newly listed order $\rightarrow$ Click **"Confirm & Pay"**.
- **Speak**:
  > *"When House A has surplus power, they lock it into the EnergyMarketplace smart contract escrow. House B, which is charging an electric vehicle, can buy this energy directly. Notice how this is an atomic swap: the smart contract releases native currency to House A and transfers the certified green $NRG tokens to House B with zero counterparty risk and zero utility fee."*

#### Stage 4: Cryptographic Audit Trail & Contract Inspection (1.5 Minutes)
- **Click**: Scroll to the **On-Chain Audit & Verification Feed**, then click **"Contracts & ABI"** in the top navigation bar.
- **Speak**:
  > *"Every single solar pulse, listing, and purchase is immutably logged on-chain with block numbers and transaction hashes. If an energy regulator or auditor needs to inspect the protocol, our smart contracts are completely open, verified, and can be deployed with Hardhat or tested via our standalone Node.js simulator script."*

---

### 3. Key Technical Decisions & Trade-Offs

- **Dual-Mode Web3 Architecture (MetaMask + Local Personas)**:
  - *Chosen Approach*: Real `window.ethereum` MetaMask integration using Ethers.js v6 with automatic instant switching between House A (Producer), House B (Consumer), and House C (Net Zero).
  - *Why*: Allows presenting live in any classroom projector, lab machine, or browser without installing MetaMask or risking testnet faucet rate limits.
- **Atomic Escrow Protocol**:
  - *Chosen Approach*: `EnergyMarketplace.sol` acts as non-custodial escrow holding `$NRG` tokens and routing native currency on purchase.
  - *Why*: Prevents double-spending of solar electricity and guarantees sellers receive payment simultaneously upon transfer.
- **Pure SVG/Recharts Real-Time Stream**:
  - *Chosen Approach*: 5-second animated telemetry loop with diurnal sun angle modeling and weather multiplier coefficients.
  - *Why*: Visually communicates IoT smart meter heartbeat to a live audience far better than static data.

---

### 4. Technical Architecture & System Diagram

```
                 SOLGRID MICROGRID ARCHITECTURE
 ┌─────────────────────────────────────────────────────────────┐
 │                      IoT Physical Layer                     │
 │   House A (PV Producer)    House B (EV Hub)    House C (Bat)│
 │     8.5 kWp Solar             7.2 kW EV         13.5 kWh    │
 └──────────────┬──────────────────────────────────────────────┘
                │ Verified Telemetry (5s Heartbeat)
                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                   Oracles & Simulator Layer                 │
 │          simulator.js / In-Browser Weather Sandbox          │
 └──────────────┬──────────────────────────────────────────────┘
                │ recordSolarGeneration(prosumer, kwhAmount)
                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                Smart Contracts Layer (Solidity)             │
 │                                                             │
 │   ┌──────────────────────┐       ┌──────────────────────┐   │
 │   │   EnergyToken.sol    │◄─────►│ EnergyMarketplace.sol│   │
 │   │   ($NRG - ERC20)     │       │ (Escrow & OrderBook) │   │
 │   └──────────────────────┘       └──────────┬───────────┘   │
 └─────────────────────────────────────────────┼───────────────┘
                                               │
                ┌──────────────────────────────┴───────────────┐
                ▼                                              ▼
 ┌──────────────────────────────┐       ┌──────────────────────────────┐
 │    Prosumer Sell Orders      │       │     P2P Buyer Settlements    │
 │ (Tokens Locked in Escrow)    │       │ (Atomic Native Swap for NRG) │
 └──────────────┬───────────────┘       └──────────────┬───────────────┘
                │                                      │
                └──────────────────────┬───────────────┘
                                       │ Real-time Events
                                       ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                  SolGrid Frontend Dashboard                 │
 │       Top Metrics ─── Telemetry Chart ─── Order Book        │
 │              Audit Log ─── Presenter Demo Script            │
 └─────────────────────────────────────────────────────────────┘
```

---

### 5. Implementation Steps for Classroom Demo Mode

1. **Presenter Script HUD (Optional Enhancement)**:
   - Add a lightweight "Presenter Mode" button in the header that opens an overlay sidebar containing the 4-stage script, allowing you to glance at speaking points while demonstrating on a split screen or projector.
2. **One-Click Demo Reset**:
   - Provide a quick "Reset Demo State" button in the IoT controls to return balances, orders, and telemetry to the pristine default state between presentation rehearsals.
3. **Verification**:
   - Verify all modal transitions, button handlers, and contract inspection tabs with unit tests and browser checks.
