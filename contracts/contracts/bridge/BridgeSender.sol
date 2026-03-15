// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BridgeSender is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    IERC20 public token;
    uint256 public nonce;

    event BridgeInitiated(address indexed user, uint256 amount, uint256 nonce);

    constructor(address token_) {
        token = IERC20(token_);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function bridge(uint256 amount) external {
        require(amount > 0, "Invalid amount");

        token.transferFrom(msg.sender, address(this), amount);

        nonce++;

        emit BridgeInitiated(msg.sender, amount, nonce);
    }
}
