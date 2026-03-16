"use client";

import { BrowserProvider, Contract, parseUnits } from "ethers";

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS;
const BRIDGE_SENDER_ADDRESS = process.env.NEXT_PUBLIC_BRIDGE_SENDER_ADDRESS;

const vaultAbi = [
  "function deposit(uint256 assets, address receiver) returns (uint256)",
  "function redeem(uint256 shares, address receiver, address owner) returns (uint256)",
];

const erc20Abi = [
  "function approve(address spender, uint256 amount) returns (bool)",
];

const bridgeSenderAbi = ["function bridge(uint256 amount)"];

export async function getWalletProvider() {
  if (!window.ethereum) {
    throw new Error("MetaMask not found");
  }

  return new BrowserProvider(window.ethereum);
}

export async function getSigner() {
  const provider = await getWalletProvider();
  return provider.getSigner();
}

export async function approveToken(
  tokenAddress,
  spender,
  amount,
  decimals = 6,
) {
  const signer = await getSigner();
  const token = new Contract(tokenAddress, erc20Abi, signer);

  const tx = await token.approve(spender, parseUnits(amount, decimals));
  return tx;
}

export async function depositToVault(amount, receiver) {
  const signer = await getSigner();
  const vault = new Contract(VAULT_ADDRESS, vaultAbi, signer);

  const tx = await vault.deposit(parseUnits(amount, 6), receiver);
  return tx;
}

export async function redeemFromVault(amount, receiver, owner) {
  const signer = await getSigner();
  const vault = new Contract(VAULT_ADDRESS, vaultAbi, signer);

  const tx = await vault.redeem(parseUnits(amount, 6), receiver, owner);
  return tx;
}

export async function bridgeTokens(amount) {
  const signer = await getSigner();
  const bridge = new Contract(BRIDGE_SENDER_ADDRESS, bridgeSenderAbi, signer);

  const tx = await bridge.bridge(parseUnits(amount, 6));
  return tx;
}
