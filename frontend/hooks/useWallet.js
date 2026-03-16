"use client";

import { useEffect, useState } from "react";

export default function useWallet() {
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState("");

  const EXPECTED_CHAIN = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 31337);

  async function connectWallet() {
    try {
      setError("");

      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("MetaMask not installed");
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const chainHex = await window.ethereum.request({
        method: "eth_chainId",
      });

      const currentChainId = parseInt(chainHex, 16);

      setAccount(accounts[0] || "");
      setChainId(currentChainId);
      setIsConnected(accounts.length > 0);

      if (currentChainId !== EXPECTED_CHAIN) {
        setError("Wrong network connected.");
      }
    } catch (err) {
      setError(err?.message || "Wallet connection failed");
    }
  }

  async function refreshWallet() {
    try {
      if (typeof window === "undefined" || !window.ethereum) {
        setError("MetaMask not installed.");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      const chainHex = await window.ethereum.request({
        method: "eth_chainId",
      });

      const currentChainId = parseInt(chainHex, 16);

      setAccount(accounts[0] || "");
      setChainId(currentChainId);
      setIsConnected(accounts.length > 0);

      if (currentChainId !== EXPECTED_CHAIN) {
        setError("Wrong network connected.");
      } else {
        setError("");
      }
    } catch (err) {
      setError(err?.message || "Wallet refresh failed");
    }
  }

  useEffect(() => {
    refreshWallet();

    if (typeof window === "undefined" || !window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      setAccount(accounts[0] || "");
      setIsConnected(accounts.length > 0);
    };

    const handleChainChanged = (chainHex) => {
      const currentChainId = parseInt(chainHex, 16);
      setChainId(currentChainId);

      if (currentChainId !== EXPECTED_CHAIN) {
        setError("Wrong network connected.");
      } else {
        setError("");
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      if (!window.ethereum?.removeListener) return;
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [EXPECTED_CHAIN]);

  return {
    account,
    chainId,
    isConnected,
    error,
    connectWallet,
  };
}
