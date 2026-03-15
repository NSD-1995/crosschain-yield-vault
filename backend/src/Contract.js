const { ethers } = require("ethers");
const config = require("./config");

const provider = new ethers.JsonRpcProvider(config.rpcUrl);
const signer = new ethers.Wallet(config.privateKey, provider);

const vaultAbi = [
  "event Deposit(address indexed sender, address indexed owner, uint256 assets, uint256 shares)",
  "event Withdraw(address indexed sender, address indexed receiver, address indexed owner, uint256 assets, uint256 shares)",
  "function totalAssets() view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function pause()",
  "function updateDepositCap(uint256 newCap)",
  "function simulateYield(uint256 amount)",
];

const bridgeSenderAbi = [
  "event BridgeInitiated(address indexed user, uint256 amount, uint256 nonce)",
];

const bridgeReceiverAbi = [
  "event BridgeCompleted(address indexed user, uint256 amount, uint256 nonce, uint256 expiry)",
];

const vault = new ethers.Contract(config.vaultAddress, vaultAbi, signer);
const vaultRead = new ethers.Contract(config.vaultAddress, vaultAbi, provider);

const bridgeSender = new ethers.Contract(
  config.bridgeSenderAddress,
  bridgeSenderAbi,
  provider,
);
const bridgeReceiver = new ethers.Contract(
  config.bridgeReceiverAddress,
  bridgeReceiverAbi,
  provider,
);

module.exports = {
  provider,
  signer,
  vault,
  vaultRead,
  bridgeSender,
  bridgeReceiver,
};
