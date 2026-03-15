// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract YieldVault is ERC4626, Pausable, ReentrancyGuard, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    uint256 public depositCap;

    constructor(IERC20 asset_) ERC20("Vault Share", "vUSDC") ERC4626(asset_) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);

        depositCap = 1_000_000 * 10 ** 6; // cap example
    }

    /*
    -------------------------
    Deposit with protections
    -------------------------
    */

    function deposit(
        uint256 assets,
        address receiver
    ) public override whenNotPaused nonReentrant returns (uint256) {
        require(totalAssets() + assets <= depositCap, "Deposit cap exceeded");

        return super.deposit(assets, receiver);
    }

    /*
    -------------------------
    Withdraw protections
    -------------------------
    */

    function redeem(
        uint256 shares,
        address receiver,
        address owner
    ) public override whenNotPaused nonReentrant returns (uint256) {
        return super.redeem(shares, receiver, owner);
    }

    /*
    -------------------------
    Admin controls
    -------------------------
    */

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    function updateDepositCap(uint256 newCap) external onlyRole(ADMIN_ROLE) {
        depositCap = newCap;
    }

    /*
    -------------------------
    Simulate Yield
    -------------------------
    */

    function simulateYield(uint256 amount) external onlyRole(ADMIN_ROLE) {
        IERC20(asset()).transferFrom(msg.sender, address(this), amount);
    }
}
