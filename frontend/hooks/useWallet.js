"use client";

import { useEffect, useState } from "react";

export default function useWallet() {
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState("");

  const EXPECTED_CHAIN = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 31337);

  async function readWalletState() {
    try {
      if (!window.ethereum) {
        setError("MetaMask not installed.");
        setIsConnected(false);
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      const chainHex = await window.ethereum.request({
        method: "eth_chainId",
      });

      const parsedChainId = parseInt(chainHex, 16);

      setAccount(accounts[0] || "");
      setChainId(parsedChainId);
      setIsConnected(accounts.length > 0);

      if (parsedChainId !== EXPECTED_CHAIN) {
        setError(`Wrong network. Please switch to chain ID ${EXPECTED_CHAIN}.`);
      } else {
        setError("");
      }
    } catch (err) {
      setError(err.message || "Failed to read wallet state");
      setIsConnected(false);
    }
  }

  async function connectWallet() {
    try {
      setError("");

      if (!window.ethereum) {
        throw new Error("MetaMask not found");
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const chainHex = await window.ethereum.request({
        method: "eth_chainId",
      });

      const parsedChainId = parseInt(chainHex, 16);

      setAccount(accounts[0] || "");
      setChainId(parsedChainId);
      setIsConnected(accounts.length > 0);

      if (parsedChainId !== EXPECTED_CHAIN) {
        setError(`Wrong network. Please switch to chain ID ${EXPECTED_CHAIN}.`);
      }
    } catch (err) {
      setError(err.message || "Wallet connection failed");
    }
  }

  function disconnectWallet() {
    setAccount("");
    setChainId(null);
    setIsConnected(false);
    setError("");
  }

  useEffect(() => {
    readWalletState();

    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      setAccount(accounts[0] || "");
      setIsConnected(accounts.length > 0);
    };

    const handleChainChanged = (chainHex) => {
      const parsedChainId = parseInt(chainHex, 16);
      setChainId(parsedChainId);

      if (parsedChainId !== EXPECTED_CHAIN) {
        setError(`Wrong network. Please switch to chain ID ${EXPECTED_CHAIN}.`);
      } else {
        setError("");
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged,
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [EXPECTED_CHAIN]);

  return {
    account,
    chainId,
    isConnected,
    error,
    connectWallet,
    disconnectWallet,
  };
}
