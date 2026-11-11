import test from 'node:test';
import assert from 'node:assert/strict';
import {
  kwhToNrgWei,
  nrgWeiToKwh,
  calculateTotalPriceWei,
  calculateCo2Offset,
  calculateSolarIrradiance,
  formatAddress,
  formatWei,
  filterAndSortListings,
  ListingItem,
  WEI_PER_NRG
} from './microgrid';

test('kwhToNrgWei converts kWh to 18-decimal token units accurately', () => {
  assert.equal(kwhToNrgWei(1), WEI_PER_NRG);
  assert.equal(kwhToNrgWei(10.5), 10_500_000_000_000_000_000n);
  assert.equal(kwhToNrgWei(0), 0n);
  assert.equal(kwhToNrgWei(-5), 0n);
});

test('nrgWeiToKwh converts 18-decimal token units back to kWh number', () => {
  assert.equal(nrgWeiToKwh(WEI_PER_NRG), 1.0);
  assert.equal(nrgWeiToKwh(10_500_000_000_000_000_000n), 10.5);
  assert.equal(nrgWeiToKwh(0n), 0);
  assert.equal(nrgWeiToKwh('1000000000000000000'), 1.0);
});

test('calculateTotalPriceWei calculates correct escrow price', () => {
  // 10 kWh @ 0.001 ETH (1e15 wei) per kWh = 0.01 ETH (1e16 wei)
  const energyWei = 10n * WEI_PER_NRG;
  const pricePerKwhWei = 1_000_000_000_000_000n; // 0.001 ETH
  const totalWei = calculateTotalPriceWei(energyWei, pricePerKwhWei);
  assert.equal(totalWei, 10_000_000_000_000_000n); // 0.01 ETH
});

test('calculateCo2Offset computes carbon savings and tree equivalents', () => {
  const result = calculateCo2Offset(100); // 100 kWh
  assert.equal(result.co2Kg, 85.0); // 100 * 0.85 kg
  assert.equal(result.treesEquivalent, 3.9); // 85 / 21.77
});

test('calculateSolarIrradiance respects diurnal solar profile', () => {
  // Night time: 0
  assert.equal(calculateSolarIrradiance(2.0), 0);
  assert.equal(calculateSolarIrradiance(22.0), 0);
  // Noon peak: close to max peak ~980 W/m²
  const noon = calculateSolarIrradiance(12.5);
  assert.ok(noon >= 900 && noon <= 1000);
  // Morning vs afternoon symmetry
  const morning = calculateSolarIrradiance(9.0);
  assert.ok(morning > 0 && morning < noon);
});

test('formatAddress formats ethereum addresses correctly', () => {
  const addr = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
  assert.equal(formatAddress(addr), '0x7099...79C8');
  assert.equal(formatAddress(''), '0x00...0000');
});

test('formatWei formats wei into readable ether string', () => {
  assert.equal(formatWei(10_000_000_000_000_000n), '0.0100');
  assert.equal(formatWei(1_000_000_000_000_000_000n), '1.0000');
});

test('filterAndSortListings filters and sorts properly', () => {
  const sampleListings: ListingItem[] = [
    {
      id: 1,
      seller: '0x1111111111111111111111111111111111111111',
      sellerName: 'House A (SunPeak)',
      energyAmountKwh: 50,
      energyAmountWei: 50n * WEI_PER_NRG,
      pricePerKwhWei: 2_000_000_000_000_000n,
      pricePerKwhEth: '0.0020',
      totalPriceWei: 100_000_000_000_000_000n,
      totalPriceEth: '0.1000',
      active: true,
      createdAt: 1000
    },
    {
      id: 2,
      seller: '0x2222222222222222222222222222222222222222',
      sellerName: 'Solar Farm B',
      energyAmountKwh: 200,
      energyAmountWei: 200n * WEI_PER_NRG,
      pricePerKwhWei: 1_000_000_000_000_000n,
      pricePerKwhEth: '0.0010',
      totalPriceWei: 200_000_000_000_000_000n,
      totalPriceEth: '0.2000',
      active: true,
      createdAt: 2000
    },
    {
      id: 3,
      seller: '0x3333333333333333333333333333333333333333',
      sellerName: 'Microgrid C',
      energyAmountKwh: 20,
      energyAmountWei: 20n * WEI_PER_NRG,
      pricePerKwhWei: 3_000_000_000_000_000n,
      pricePerKwhEth: '0.0030',
      totalPriceWei: 60_000_000_000_000_000n,
      totalPriceEth: '0.0600',
      active: false,
      createdAt: 3000
    }
  ];

  // Filter only active
  const activeList = filterAndSortListings(sampleListings, { onlyActive: true });
  assert.equal(activeList.length, 2);

  // Search by name
  const searched = filterAndSortListings(sampleListings, { search: 'SunPeak' });
  assert.equal(searched.length, 1);
  assert.equal(searched[0].id, 1);

  // Sort by price ascending
  const sortedPrice = filterAndSortListings(sampleListings, { sortBy: 'price_asc' });
  assert.equal(sortedPrice[0].id, 2); // 0.001 ETH
  assert.equal(sortedPrice[2].id, 3); // 0.003 ETH
});
