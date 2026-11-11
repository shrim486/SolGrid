// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title EnergyToken (NRG)
 * @dev ERC-20 token representing verified green kilowatt-hours (kWh) generated within the SolGrid microgrid.
 * 1 NRG token = 1 kWh of certified clean solar energy (with 18 standard decimals).
 * Mintable strictly by authorized minters (e.g. the EnergyMarketplace smart contract or verified IoT Oracles).
 */
contract EnergyToken {
    // --- ERC-20 State ---
    string public name = "Microgrid Energy Token";
    string public symbol = "NRG";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    address public owner;
    mapping(address => bool) public isMinter;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    // --- Events ---
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event MinterStatusUpdated(address indexed minter, bool isAuthorized);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "EnergyToken: caller is not the owner");
        _;
    }

    modifier onlyMinter() {
        require(isMinter[msg.sender] || msg.sender == owner, "EnergyToken: caller is not authorized to mint");
        _;
    }

    constructor() {
        owner = msg.sender;
        isMinter[msg.sender] = true;
        emit MinterStatusUpdated(msg.sender, true);
    }

    /**
     * @notice Authorize or revoke an address (e.g. EnergyMarketplace contract) to mint NRG tokens.
     */
    function setMinter(address _minter, bool _isAuthorized) external onlyOwner {
        require(_minter != address(0), "EnergyToken: zero address");
        isMinter[_minter] = _isAuthorized;
        emit MinterStatusUpdated(_minter, _isAuthorized);
    }

    /**
     * @notice Mint NRG tokens to a prosumer upon verified solar generation telemetry.
     */
    function mint(address _to, uint256 _amount) external onlyMinter returns (bool) {
        require(_to != address(0), "EnergyToken: mint to zero address");
        totalSupply += _amount;
        balanceOf[_to] += _amount;
        emit Transfer(address(0), _to, _amount);
        return true;
    }

    /**
     * @notice Standard ERC-20 transfer.
     */
    function transfer(address _to, uint256 _amount) external returns (bool) {
        require(_to != address(0), "EnergyToken: transfer to zero address");
        require(balanceOf[msg.sender] >= _amount, "EnergyToken: insufficient balance");

        balanceOf[msg.sender] -= _amount;
        balanceOf[_to] += _amount;
        emit Transfer(msg.sender, _to, _amount);
        return true;
    }

    /**
     * @notice Standard ERC-20 approve.
     */
    function approve(address _spender, uint256 _amount) external returns (bool) {
        require(_spender != address(0), "EnergyToken: approve to zero address");
        allowance[msg.sender][_spender] = _amount;
        emit Approval(msg.sender, _spender, _amount);
        return true;
    }

    /**
     * @notice Standard ERC-20 transferFrom with escrow allowance.
     */
    function transferFrom(address _from, address _to, uint256 _amount) external returns (bool) {
        require(_to != address(0), "EnergyToken: transfer to zero address");
        require(balanceOf[_from] >= _amount, "EnergyToken: insufficient balance");
        require(allowance[_from][msg.sender] >= _amount, "EnergyToken: allowance exceeded");

        allowance[_from][msg.sender] -= _amount;
        balanceOf[_from] -= _amount;
        balanceOf[_to] += _amount;
        emit Transfer(_from, _to, _amount);
        return true;
    }

    /**
     * @notice Transfer ownership of the token contract.
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "EnergyToken: new owner is zero address");
        emit OwnershipTransferred(owner, _newOwner);
        owner = _newOwner;
    }
}
