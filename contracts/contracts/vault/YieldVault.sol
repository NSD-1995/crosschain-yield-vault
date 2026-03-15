// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC4626Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract YieldVault is
    Initializable,
    ERC4626Upgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    AccessControlUpgradeable,
    UUPSUpgradeable
{
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    uint256 public depositCap;
    uint256 public minInitialDeposit;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        IERC20Upgradeable asset_,
        uint256 depositCap_,
        uint256 minInitialDeposit_
    ) public initializer {
        __ERC20_init("Vault Share", "vUSDC");
        __ERC4626_init(asset_);
        __Pausable_init();
        __ReentrancyGuard_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);

        depositCap = depositCap_;
        minInitialDeposit = minInitialDeposit_;
    }

    /*
    -------------------------
    Deposit / Mint protections
    -------------------------
    */

    function deposit(
        uint256 assets,
        address receiver
    ) public override whenNotPaused nonReentrant returns (uint256) {
        if (totalSupply() == 0) {
            require(assets >= minInitialDeposit, "Initial deposit too small");
        }

        require(totalAssets() + assets <= depositCap, "Deposit cap exceeded");

        return super.deposit(assets, receiver);
    }

    function mint(
        uint256 shares,
        address receiver
    ) public override whenNotPaused nonReentrant returns (uint256) {
        uint256 requiredAssets = previewMint(shares);

        if (totalSupply() == 0) {
            require(
                requiredAssets >= minInitialDeposit,
                "Initial deposit too small"
            );
        }

        require(
            totalAssets() + requiredAssets <= depositCap,
            "Deposit cap exceeded"
        );

        return super.mint(shares, receiver);
    }

    /*
    -------------------------
    Withdraw / Redeem protections
    -------------------------
    */

    function withdraw(
        uint256 assets,
        address receiver,
        address owner
    ) public override whenNotPaused nonReentrant returns (uint256) {
        return super.withdraw(assets, receiver, owner);
    }

    function redeem(
        uint256 shares,
        address receiver,
        address owner
    ) public override whenNotPaused nonReentrant returns (uint256) {
        return super.redeem(shares, receiver, owner);
    }

    /*
    -------------------------
    View helpers
    -------------------------
    */

    function maxDeposit(address) public view override returns (uint256) {
        if (paused()) return 0;
        if (totalAssets() >= depositCap) return 0;

        return depositCap - totalAssets();
    }

    function maxMint(address) public view override returns (uint256) {
        if (paused()) return 0;

        uint256 remainingAssets = depositCap > totalAssets()
            ? depositCap - totalAssets()
            : 0;

        if (remainingAssets == 0) return 0;

        return convertToShares(remainingAssets);
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
        require(newCap >= totalAssets(), "Cap below current assets");
        depositCap = newCap;
    }

    function updateMinInitialDeposit(
        uint256 newMin
    ) external onlyRole(ADMIN_ROLE) {
        minInitialDeposit = newMin;
    }

    /*
    -------------------------
    Simulate Yield
    -------------------------
    */

    function simulateYield(uint256 amount) external onlyRole(ADMIN_ROLE) {
        IERC20Upgradeable(asset()).transferFrom(
            msg.sender,
            address(this),
            amount
        );
    }

    /*
    -------------------------
    UUPS upgrade authorization
    -------------------------
    */

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyRole(UPGRADER_ROLE) {}
}
