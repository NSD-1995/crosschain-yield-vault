// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./YieldVault.sol";

contract YieldVaultV2 is YieldVault {
    function version() external pure returns (uint256) {
        return 2;
    }
}
