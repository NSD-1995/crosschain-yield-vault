// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BridgeReceiver is AccessControl {
    bytes32 public constant RELAYER_ROLE = keccak256("RELAYER_ROLE");

    IERC20 public token;

    mapping(uint256 => bool) public processedNonces;

    event BridgeCompleted(address indexed user, uint256 amount, uint256 nonce);

    constructor(address token_) {
        token = IERC20(token_);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(RELAYER_ROLE, msg.sender);
    }

    function completeBridge(
        address user,
        uint256 amount,
        uint256 nonce
    ) external onlyRole(RELAYER_ROLE) {
        require(!processedNonces[nonce], "Bridge already processed");

        processedNonces[nonce] = true;

        token.transfer(user, amount);

        emit BridgeCompleted(user, amount, nonce);
    }
}
