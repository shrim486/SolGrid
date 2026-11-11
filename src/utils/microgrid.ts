/**
 * Microgrid Calculation and Utility Engine for SolGrid
 * Handles kWh to NRG token math, pricing calculations, carbon offsets, and IoT solar models.
 */

// 1 kWh = 1 NRG Token with 18 decimals
export const DECIMALS = 18n;
export const WEI_PER_NRG = 10n ** 18n;

// Average EPA standard: 0.85 kg CO2 offset per 1 kWh of solar replacing fossil grid
export const CO2_KG_PER_KWH = 0.85;

// Average urban tree absorbs ~21.77 kg CO2 per year (~0.0596 kg/day)
export const CO2_KG_PER_TREE_YEAR = 21.77;

/**
 * Converts a decimal kWh number to NRG Token Wei (BigInt with 18 decimals)
 */
export function kwhToNrgWei(kwh: number): bigint {
  if (kwh <= 0 || !isFinite(kwh)) return 0n;
  // Use fixed precision of 6 decimal digits to prevent floating point inaccuracies
  const fixed = kwh.toFixed(6);
  const [whole, fraction] = fixed.split('.');
  const wholeBig = BigInt(whole) * WEI_PER_NRG;
  const fractionBig = BigInt(fraction.padEnd(18, '0'));
  return wholeBig + fractionBig;
}

/**
 * Converts NRG Token Wei (BigInt or hex string) to human-readable kWh float
 */
export function nrgWeiToKwh(wei: bigint | string): number {
  try {
    const bWei = typeof wei === 'string' ? BigInt(wei) : wei;
    if (bWei === 0n) return 0;
    const whole = bWei / WEI_PER_NRG;
    const remainder = bWei % WEI_PER_NRG;
    // Keep 6 decimal places of precision
    const fraction = Number(remainder * 1_000_000n / WEI_PER_NRG) / 1_000_000;
    return Number(whole) + fraction;
  } catch {
    return 0;
  }
}

/**
 * Calculate total price in Wei given energy amount (in 18 decimals) and pricePerKwh (in Wei)
 * Formula matching Solidity: (energyAmount * pricePerKwh) / 1e18
 */
export function calculateTotalPriceWei(energyAmountWei: bigint, pricePerKwhWei: bigint): bigint {
  if (energyAmountWei <= 0n || pricePerKwhWei <= 0n) return 0n;
  return (energyAmountWei * pricePerKwhWei) / WEI_PER_NRG;
}

/**
 * Calculates CO2 offset in kg and tree-years equivalent for green solar energy generated
 */
export function calculateCo2Offset(kwhAmount: number): { co2Kg: number; treesEquivalent: number } {
  if (kwhAmount <= 0 || !isFinite(kwhAmount)) {
    return { co2Kg: 0, treesEquivalent: 0 };
  }
  const co2Kg = Number((kwhAmount * CO2_KG_PER_KWH).toFixed(3));
  const treesEquivalent = Number((co2Kg / CO2_KG_PER_TREE_YEAR).toFixed(2));
  return { co2Kg, treesEquivalent };
}

/**
 * Diurnal solar irradiance model based on time of day (hour: 0 to 24)
 * Returns irradiance in W/m² (0 to ~1000 W/m²)
 */
export function calculateSolarIrradiance(hourOfDay: number, cloudFactor: number = 1.0): number {
  // Sunlight between 6:00 (6.0) and 19:30 (19.5)
  if (hourOfDay < 6.0 || hourOfDay > 19.5) return 0;
  const daylightHours = 13.5;
  const angle = ((hourOfDay - 6.0) / daylightHours) * Math.PI;
  const peakIrradiance = 980; // W/m²
  const base = Math.sin(angle) * peakIrradiance;
  const clampedCloud = Math.max(0.1, Math.min(1.0, cloudFactor));
  return Math.max(0, Math.round(base * clampedCloud));
}

/**
 * Truncate an Ethereum address for UI display (e.g. 0x71C...49A2)
 */
export function formatAddress(address: string, start: number = 6, end: number = 4): string {
  if (!address || address.length < start + end + 3) return address || '0x00...0000';
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

/**
 * Format Wei to clean decimal string (ETH / MATIC)
 */
export function formatWei(wei: bigint | string, precision: number = 4): string {
  try {
    const bWei = typeof wei === 'string' ? BigInt(wei) : wei;
    if (bWei === 0n) return '0.0000';
    const whole = bWei / WEI_PER_NRG;
    const remainder = bWei % WEI_PER_NRG;
    const factor = 10n ** BigInt(18 - precision);
    const fractionPart = remainder / factor;
    const padded = fractionPart.toString().padStart(precision, '0');
    return `${whole.toString()}.${padded}`;
  } catch {
    return '0.0000';
  }
}

export interface ListingItem {
  id: number;
  seller: string;
  sellerName?: string;
  energyAmountKwh: number;
  energyAmountWei: bigint;
  pricePerKwhWei: bigint;
  pricePerKwhEth: string;
  totalPriceWei: bigint;
  totalPriceEth: string;
  active: boolean;
  createdAt: number;
  greenCertified?: boolean;
}

/**
 * Filter and sort marketplace listings
 */
export function filterAndSortListings(
  listings: ListingItem[],
  options: {
    search?: string;
    onlyActive?: boolean;
    sortBy?: 'price_asc' | 'price_desc' | 'amount_asc' | 'amount_desc' | 'newest';
    maxPriceEth?: number;
  }
): ListingItem[] {
  let result = [...listings];

  if (options.onlyActive) {
    result = result.filter(item => item.active);
  }

  if (options.search) {
    const q = options.search.toLowerCase().trim();
    result = result.filter(item =>
      item.seller.toLowerCase().includes(q) ||
      (item.sellerName && item.sellerName.toLowerCase().includes(q)) ||
      item.id.toString() === q
    );
  }

  if (options.maxPriceEth !== undefined && options.maxPriceEth > 0) {
    result = result.filter(item => parseFloat(item.pricePerKwhEth) <= (options.maxPriceEth || 999));
  }

  switch (options.sortBy) {
    case 'price_asc':
      result.sort((a, b) => (a.pricePerKwhWei < b.pricePerKwhWei ? -1 : 1));
      break;
    case 'price_desc':
      result.sort((a, b) => (a.pricePerKwhWei > b.pricePerKwhWei ? -1 : 1));
      break;
    case 'amount_asc':
      result.sort((a, b) => a.energyAmountKwh - b.energyAmountKwh);
      break;
    case 'amount_desc':
      result.sort((a, b) => b.energyAmountKwh - a.energyAmountKwh);
      break;
    case 'newest':
    default:
      result.sort((a, b) => b.createdAt - a.createdAt);
      break;
  }

  return result;
}
