import React, { useState } from 'react';
import {
  X,
  Code2,
  Copy,
  Check,
  FileCode,
  ShieldCheck,
  Terminal,
  ExternalLink,
  Cpu
} from 'lucide-react';
import { CONTRACT_ADDRESSES } from '../contracts/config';

interface ContractsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ENERGY_TOKEN_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EnergyToken {
    string public name = "Microgrid Energy Token";
    string public symbol = "NRG";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    address public owner;
    mapping(address => bool) public isMinter;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event MinterStatusUpdated(address indexed minter, bool isAuthorized);

    modifier onlyOwner() {
        require(msg.sender == owner, "caller is not the owner");
        _;
    }

    modifier onlyMinter() {
        require(isMinter[msg.sender] || msg.sender == owner, "caller not authorized to mint");
        _;
    }

    constructor() {
        owner = msg.sender;
        isMinter[msg.sender] = true;
    }

    function setMinter(address _minter, bool _isAuthorized) external onlyOwner {
        isMinter[_minter] = _isAuthorized;
        emit MinterStatusUpdated(_minter, _isAuthorized);
    }

    function mint(address _to, uint256 _amount) external onlyMinter returns (bool) {
        totalSupply += _amount;
        balanceOf[_to] += _amount;
        emit Transfer(address(0), _to, _amount);
        return true;
    }

    function transfer(address _to, uint256 _amount) external returns (bool) {
        require(balanceOf[msg.sender] >= _amount, "insufficient balance");
        balanceOf[msg.sender] -= _amount;
        balanceOf[_to] += _amount;
        emit Transfer(msg.sender, _to, _amount);
        return true;
    }

    function approve(address _spender, uint256 _amount) external returns (bool) {
        allowance[msg.sender][_spender] = _amount;
        emit Approval(msg.sender, _spender, _amount);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _amount) external returns (bool) {
        require(balanceOf[_from] >= _amount, "insufficient balance");
        require(allowance[_from][msg.sender] >= _amount, "allowance exceeded");
        allowance[_from][msg.sender] -= _amount;
        balanceOf[_from] -= _amount;
        balanceOf[_to] += _amount;
        emit Transfer(_from, _to, _amount);
        return true;
    }
}`;

const ENERGY_MARKETPLACE_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IEnergyToken {
    function mint(address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract EnergyMarketplace {
    IEnergyToken public immutable energyToken;
    address public owner;
    uint256 public nextListingId = 1;

    struct Listing {
        uint256 id;
        address payable seller;
        uint256 energyAmount;
        uint256 pricePerKwh;
        uint256 totalPrice;
        bool active;
        uint256 createdAt;
    }

    mapping(uint256 => Listing) public listings;
    mapping(address => bool) public authorizedMeters;

    event EnergyMinted(address indexed prosumer, uint256 kwhAmount, uint256 timestamp);
    event EnergyListed(uint256 indexed listingId, address indexed seller, uint256 energyAmount, uint256 pricePerKwh, uint256 timestamp);
    event EnergyPurchased(uint256 indexed listingId, address indexed buyer, address indexed seller, uint256 energyAmount, uint256 totalPrice, uint256 timestamp);

    constructor(address _energyTokenAddress) {
        energyToken = IEnergyToken(_energyTokenAddress);
        owner = msg.sender;
        authorizedMeters[msg.sender] = true;
    }

    function recordSolarGeneration(address prosumer, uint256 kwhAmount) external {
        require(authorizedMeters[msg.sender] || msg.sender == owner, "unauthorized meter");
        energyToken.mint(prosumer, kwhAmount);
        emit EnergyMinted(prosumer, kwhAmount, block.timestamp);
    }

    function listEnergy(uint256 energyAmount, uint256 pricePerKwh) external returns (uint256) {
        uint256 totalPrice = (energyAmount * pricePerKwh) / 1e18;
        energyToken.transferFrom(msg.sender, address(this), energyAmount);

        uint256 listingId = nextListingId++;
        listings[listingId] = Listing(listingId, payable(msg.sender), energyAmount, pricePerKwh, totalPrice, true, block.timestamp);
        emit EnergyListed(listingId, msg.sender, energyAmount, pricePerKwh, block.timestamp);
        return listingId;
    }

    function buyEnergy(uint256 listingId) external payable {
        Listing storage listing = listings[listingId];
        require(listing.active, "listing inactive");
        require(msg.value >= listing.totalPrice, "insufficient ETH sent");

        listing.active = false;
        listing.seller.transfer(listing.totalPrice);
        energyToken.transfer(msg.sender, listing.energyAmount);

        emit EnergyPurchased(listingId, msg.sender, listing.seller, listing.energyAmount, listing.totalPrice, block.timestamp);
    }
}`;

export const ContractsModal: React.FC<ContractsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'token' | 'marketplace' | 'commands'>('marketplace');
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const currentCode = activeTab === 'token' ? ENERGY_TOKEN_CODE : ENERGY_MARKETPLACE_CODE;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[90vh] rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 relative flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Smart Contracts & Deployment</h3>
              <p className="text-xs text-slate-400">Audited Solidity 0.8.20 Source & Local CLI Run Guide</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Addresses Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono">
            <div className="text-[10px] text-slate-500 uppercase">EnergyToken (NRG) ERC-20</div>
            <div className="text-emerald-400 truncate font-semibold mt-0.5">{CONTRACT_ADDRESSES.energyToken}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono">
            <div className="text-[10px] text-slate-500 uppercase">EnergyMarketplace Escrow</div>
            <div className="text-cyan-400 truncate font-semibold mt-0.5">{CONTRACT_ADDRESSES.energyMarketplace}</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`px-3 py-1.5 rounded-lg transition font-medium cursor-pointer ${
                activeTab === 'marketplace' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              EnergyMarketplace.sol
            </button>
            <button
              onClick={() => setActiveTab('token')}
              className={`px-3 py-1.5 rounded-lg transition font-medium cursor-pointer ${
                activeTab === 'token' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              EnergyToken.sol (NRG)
            </button>
            <button
              onClick={() => setActiveTab('commands')}
              className={`px-3 py-1.5 rounded-lg transition font-medium cursor-pointer ${
                activeTab === 'commands' ? 'bg-slate-800 text-amber-400 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              CLI Run Guide
            </button>
          </div>

          {activeTab !== 'commands' && (
            <button
              onClick={() => handleCopy(currentCode)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium transition cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy Solidity'}</span>
            </button>
          )}
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-y-auto rounded-2xl bg-slate-950 border border-slate-800/80 p-4 font-mono text-xs text-slate-300">
          {activeTab === 'commands' ? (
            <div className="space-y-4">
              <div>
                <h4 className="text-white font-bold flex items-center gap-2 text-sm">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  Step 1: Deploy Contracts with Hardhat
                </h4>
                <div className="mt-2 p-3 rounded-xl bg-slate-900 border border-slate-800 text-emerald-300 select-all">
                  node scripts/deploy.js
                </div>
                <p className="text-slate-400 text-[11px] mt-1">
                  Runs the deployment script targeting Polygon Amoy, Sepolia, or Hardhat local network.
                </p>
              </div>

              <div>
                <h4 className="text-white font-bold flex items-center gap-2 text-sm">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  Step 2: Run Real-time IoT Microgrid Simulator
                </h4>
                <div className="mt-2 p-3 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 select-all">
                  node simulator/simulator.js
                </div>
                <p className="text-slate-400 text-[11px] mt-1">
                  Simulates House A (Producer), House B (Consumer), House C (Net Zero) with colorful ANSI terminal output, calculating solar irradiance every 5 seconds and calling <code className="text-slate-200">recordSolarGeneration()</code> on-chain.
                </p>
              </div>
            </div>
          ) : (
            <pre className="whitespace-pre overflow-x-auto leading-relaxed">
              <code>{currentCode}</code>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};
