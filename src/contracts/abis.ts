/**
 * ABI definitions for SolGrid Smart Contracts
 */

export const ENERGY_TOKEN_ABI = [
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function decimals() external view returns (uint8)",
  "function totalSupply() external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
  "function mint(address to, uint256 amount) external returns (bool)",
  "function isMinter(address minter) external view returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event MinterStatusUpdated(address indexed minter, bool isAuthorized)"
];

export const ENERGY_MARKETPLACE_ABI = [
  "function energyToken() external view returns (address)",
  "function owner() external view returns (address)",
  "function nextListingId() external view returns (uint256)",
  "function totalEnergyTraded() external view returns (uint256)",
  "function totalEtherVolume() external view returns (uint256)",
  "function totalEnergyMinted() external view returns (uint256)",
  "function listings(uint256) external view returns (uint256 id, address seller, uint256 energyAmount, uint256 pricePerKwh, uint256 totalPrice, bool active, uint256 createdAt)",
  "function listEnergy(uint256 energyAmount, uint256 pricePerKwh) external returns (uint256)",
  "function buyEnergy(uint256 listingId) external payable",
  "function cancelListing(uint256 listingId) external",
  "function recordSolarGeneration(address prosumer, uint256 kwhAmount) external",
  "function setMeterAuthorization(address meter, bool isAuthorized) external",
  "function authorizedMeters(address meter) external view returns (bool)",
  "event EnergyMinted(address indexed prosumer, uint256 kwhAmount, uint256 timestamp)",
  "event EnergyListed(uint256 indexed listingId, address indexed seller, uint256 energyAmount, uint256 pricePerKwh, uint256 timestamp)",
  "event EnergyPurchased(uint256 indexed listingId, address indexed buyer, address indexed seller, uint256 energyAmount, uint256 totalPrice, uint256 timestamp)",
  "event ListingCancelled(uint256 indexed listingId, address indexed seller, uint256 energyAmount, uint256 timestamp)"
];
