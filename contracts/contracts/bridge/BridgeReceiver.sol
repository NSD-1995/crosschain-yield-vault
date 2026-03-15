// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract BridgeReceiver is AccessControl {
    using ECDSA for bytes32;

    bytes32 public constant RELAYER_ROLE = keccak256("RELAYER_ROLE");

    IERC20 public token;

    mapping(uint256 => bool) public processedNonces;

    event BridgeCompleted(
        address indexed user,
        uint256 amount,
        uint256 nonce,
        uint256 expiry
    );

    event SignerUpdated(address indexed signer, bool allowed);

    // Optional extra signer registry
    mapping(address => bool) public allowedSigners;

    constructor(address token_) {
        token = IERC20(token_);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(RELAYER_ROLE, msg.sender);

        allowedSigners[msg.sender] = true;
        emit SignerUpdated(msg.sender, true);
    }

    /*
    -------------------------
    Admin controls
    -------------------------
    */

    function setAllowedSigner(
        address signer,
        bool allowed
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        allowedSigners[signer] = allowed;
        emit SignerUpdated(signer, allowed);
    }

    /*
    -------------------------
    Bridge completion
    -------------------------
    */

    function completeBridge(
        address user,
        uint256 amount,
        uint256 nonce,
        uint256 expiry,
        bytes calldata signature
    ) external onlyRole(RELAYER_ROLE) {
        require(user != address(0), "Invalid user");
        require(amount > 0, "Invalid amount");
        require(block.timestamp <= expiry, "Signature expired");
        require(!processedNonces[nonce], "Bridge already processed");

        bytes32 messageHash = getMessageHash(user, amount, nonce, expiry);
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();

        address signer = ECDSA.recover(ethSignedMessageHash, signature);
        require(allowedSigners[signer], "Invalid signer");

        processedNonces[nonce] = true;

        require(token.transfer(user, amount), "Token transfer failed");

        emit BridgeCompleted(user, amount, nonce, expiry);
    }

    /*
    -------------------------
    Signature helpers
    -------------------------
    */

    function getMessageHash(
        address user,
        uint256 amount,
        uint256 nonce,
        uint256 expiry
    ) public view returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    address(this),
                    block.chainid,
                    user,
                    amount,
                    nonce,
                    expiry
                )
            );
    }
}
