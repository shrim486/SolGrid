/**
 * SolGrid Live IoT Microgrid Telemetry Simulator (Node.js)
 * Simulates real-time solar irradiance, household load demands, and on-chain generation recording.
 *
 * Simulates 3 houses:
 *  - House A: "SunPeak 104" (Solar Producer) -> Generates high surplus PV power (8.5 kWp system)
 *  - House B: "Oakridge 208" (Heavy Consumer) -> Net buyer (EV charging + HVAC load)
 *  - House C: "GreenLeaf 312" (Net Zero)      -> Balanced solar + battery storage
 *
 * Runs every 5 seconds: generates solar irradiance, calculates kWh output, logs colorful CLI stats,
 * and calls EnergyMarketplace.recordSolarGeneration(houseA, kwhAmount) on-chain.
 */

import { ethers } from 'ethers';
import { fileURLToPath } from 'url';

// ANSI Terminal Colors for high-tech telemetry output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  emerald: "\x1b[38;2;16;185;129m",
  cyan: "\x1b[38;2;6;182;212m",
  amber: "\x1b[38;2;245;158;11m",
  rose: "\x1b[38;2;244;63;94m",
  purple: "\x1b[38;2;168;85;247m",
  blue: "\x1b[38;2;59;130;246m",
  gray: "\x1b[90m",
  white: "\x1b[97m",
  bgDark: "\x1b[48;2;15;23;42m"
};

// Configuration
export const CONFIG = {
  RPC_URL: process.env.RPC_URL || "http://127.0.0.1:8545",
  MARKETPLACE_ADDRESS: process.env.MARKETPLACE_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  INTERVAL_MS: 5000,
  METER_ORACLE_KEY: process.env.METER_ORACLE_KEY || "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
  HOUSE_A_ADDRESS: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Producer
  HOUSE_B_ADDRESS: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Heavy Consumer
  HOUSE_C_ADDRESS: "0x90F79bf6EB2c4f870365E785982E1f101E93b906"  // Net Zero
};

const MARKETPLACE_ABI = [
  "function recordSolarGeneration(address prosumer, uint256 kwhAmount) external",
  "function totalEnergyMinted() external view returns (uint256)",
  "event EnergyMinted(address indexed prosumer, uint256 kwhAmount, uint256 timestamp)"
];

export class MicrogridSimulator {
  constructor() {
    this.tickCount = 0;
    this.totalGeneratedKwh = 0;
    this.timeOfDayHours = 12.5; // Starts at 12:30 PM (peak sun)
    this.isOnline = false;
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.intervalHandle = null;
  }

  async init() {
    console.log(`${colors.emerald}${colors.bright}⚡ ======================================================== ⚡${colors.reset}`);
    console.log(`${colors.emerald}${colors.bright}   SOLGRID IOT TELEMETRY SIMULATOR & SMART METER ORACLE      ${colors.reset}`);
    console.log(`${colors.cyan}   Decentralized Microgrid Real-Time Solar Irradiance Engine ${colors.reset}`);
    console.log(`${colors.emerald}${colors.bright}⚡ ======================================================== ⚡${colors.reset}\n`);

    try {
      this.provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
      const network = await Promise.race([
        this.provider.getNetwork(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("RPC Timeout")), 1200))
      ]);
      this.signer = new ethers.Wallet(CONFIG.METER_ORACLE_KEY, this.provider);
      this.contract = new ethers.Contract(CONFIG.MARKETPLACE_ADDRESS, MARKETPLACE_ABI, this.signer);
      this.isOnline = true;
      console.log(`${colors.emerald}✔ Connected to RPC:${colors.reset} ${CONFIG.RPC_URL} (Chain ID: ${network.chainId})`);
      console.log(`${colors.cyan}✔ Marketplace Contract:${colors.reset} ${CONFIG.MARKETPLACE_ADDRESS}`);
      console.log(`${colors.purple}✔ Meter Oracle Key Active:${colors.reset} ${await this.signer.getAddress()}\n`);
    } catch {
      this.isOnline = false;
      console.log(`${colors.amber}⚠ Note: RPC node at ${CONFIG.RPC_URL} is offline or starting up.${colors.reset}`);
      console.log(`${colors.cyan}ℹ Simulator running in STANDALONE TELEMETRY MODE (emulating on-chain calls).${colors.reset}\n`);
    }

    console.log(`${colors.gray}Microgrid Nodes Registered:${colors.reset}`);
    console.log(`  🏠 ${colors.emerald}House A (Solar Producer):${colors.reset} ${CONFIG.HOUSE_A_ADDRESS} [8.5 kWp PV Array, 10 kWh Battery]`);
    console.log(`  🏡 ${colors.rose}House B (Heavy Consumer):${colors.reset} ${CONFIG.HOUSE_B_ADDRESS} [EV Charger 7.2 kW + Heat Pump]`);
    console.log(`  🏢 ${colors.cyan}House C (Net-Zero Prosumer):${colors.reset} ${CONFIG.HOUSE_C_ADDRESS} [4.0 kWp PV Array + 13.5 kWh Powerwall]\n`);

    console.log(`${colors.dim}Starting real-time telemetry heartbeat...${colors.reset}\n`);
    console.log(`${colors.gray}-------------------------------------------------------------------------------------------------${colors.reset}`);
  }

  calculateIrradiance(hour) {
    if (hour < 6.0 || hour > 19.5) return 0;
    const peakHour = 12.5;
    const daylightHours = 13.5;
    const angle = ((hour - 6.0) / daylightHours) * Math.PI;
    const baseIrradiance = Math.sin(angle) * 980; // Peak 980 W/m²
    const cloudNoise = (Math.random() - 0.48) * 80;
    return Math.max(0, Math.round(baseIrradiance + cloudNoise));
  }

  async runStep() {
    this.tickCount++;
    this.timeOfDayHours = (this.timeOfDayHours + 0.05) % 24;
    const hour = Math.floor(this.timeOfDayHours);
    const minute = Math.floor((this.timeOfDayHours % 1) * 60);
    const timeFormatted = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

    const irradiance = this.calculateIrradiance(this.timeOfDayHours); // W/m²
    const ambientTemp = Math.round(21 + (irradiance / 1000) * 8 + (Math.random() * 1.5));

    // House A: 8.5 kWp system
    const houseA_GenKw = Number(((irradiance / 1000) * 8.2).toFixed(2));
    const houseA_LoadKw = Number((1.1 + Math.random() * 0.4).toFixed(2));
    const houseA_NetKw = Number((houseA_GenKw - houseA_LoadKw).toFixed(2));
    const houseA_GeneratedKwh = Number((houseA_GenKw * (5 / 3600) * 12).toFixed(4));
    this.totalGeneratedKwh += houseA_GeneratedKwh;

    // House B: Heavy Consumer
    const houseB_GenKw = 0.0;
    const houseB_LoadKw = Number((5.4 + Math.sin(this.tickCount * 0.2) * 1.8 + Math.random() * 0.5).toFixed(2));
    const houseB_NetKw = -houseB_LoadKw;

    // House C: Net Zero
    const houseC_GenKw = Number(((irradiance / 1000) * 3.8).toFixed(2));
    const houseC_LoadKw = Number((2.8 + Math.random() * 0.6).toFixed(2));
    const houseC_NetKw = Number((houseC_GenKw - houseC_LoadKw).toFixed(2));
    const houseC_BatterySoC = Math.min(100, Math.max(15, Math.round(78 + Math.sin(this.tickCount * 0.1) * 12)));

    // Grid status
    const gridFreq = (50.0 + (Math.random() - 0.5) * 0.04).toFixed(2);
    const gridVolt = (230.4 + (Math.random() - 0.5) * 1.2).toFixed(1);

    // Call on-chain if online
    let onChainStatus = `${colors.cyan}Simulated Tx (0x${Math.random().toString(16).slice(2, 10)}...)${colors.reset}`;
    if (this.isOnline && this.contract && houseA_GeneratedKwh > 0) {
      try {
        const tokenAmountWei = ethers.parseUnits(houseA_GeneratedKwh.toString(), 18);
        const tx = await this.contract.recordSolarGeneration(CONFIG.HOUSE_A_ADDRESS, tokenAmountWei);
        onChainStatus = `${colors.emerald}✔ Mined On-Chain: ${tx.hash.slice(0, 10)}...${colors.reset}`;
      } catch (err) {
        onChainStatus = `${colors.rose}Tx Err: ${err.message?.slice(0, 30) || "reverted"}${colors.reset}`;
      }
    }

    const timestamp = new Date().toLocaleTimeString();
    console.log(
      `${colors.dim}[${timestamp}]${colors.reset} ` +
      `${colors.bright}Tick #${this.tickCount}${colors.reset} | ` +
      `🕒 ${colors.cyan}${timeFormatted}${colors.reset} | ` +
      `☀️  ${colors.amber}${irradiance} W/m²${colors.reset} (${ambientTemp}°C) | ` +
      `⚡ Grid: ${colors.emerald}${gridVolt}V / ${gridFreq}Hz${colors.reset}`
    );

    console.log(
      `   🏠 ${colors.emerald}House A (Solar Peak):${colors.reset} ` +
      `Gen: ${colors.emerald}${houseA_GenKw} kW${colors.reset} | ` +
      `Load: ${houseA_LoadKw} kW | ` +
      `Net: ${houseA_NetKw >= 0 ? colors.emerald + "+" + houseA_NetKw : colors.rose + houseA_NetKw} kW | ` +
      `+${colors.emerald}${houseA_GeneratedKwh} NRG Minted${colors.reset}`
    );

    console.log(
      `   🏡 ${colors.rose}House B (Consumer):  ${colors.reset} ` +
      `Gen: 0.0 kW | ` +
      `Load: ${colors.rose}${houseB_LoadKw} kW${colors.reset} | ` +
      `Deficit: ${colors.rose}${houseB_NetKw} kW${colors.reset} (Purchasing via P2P Market)`
    );

    console.log(
      `   🏢 ${colors.cyan}House C (Net-Zero):  ${colors.reset} ` +
      `Gen: ${houseC_GenKw} kW | ` +
      `Load: ${houseC_LoadKw} kW | ` +
      `Battery: ${colors.cyan}${houseC_BatterySoC}% SoC${colors.reset} | ` +
      `Status: ${onChainStatus}`
    );

    console.log(
      `${colors.gray}   📊 Cumulative Grid Energy Minted: ${colors.white}${this.totalGeneratedKwh.toFixed(4)} kWh (NRG)${colors.reset} | ` +
      `CO₂ Avoided: ${colors.emerald}${(this.totalGeneratedKwh * 0.85).toFixed(3)} kg${colors.reset}\n`
    );
  }

  start() {
    this.runStep();
    this.intervalHandle = setInterval(() => this.runStep(), CONFIG.INTERVAL_MS);
  }

  stop() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
    }
  }
}

// Execute if run directly from terminal
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const sim = new MicrogridSimulator();
  sim.init().then(() => sim.start());
}
