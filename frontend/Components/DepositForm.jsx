"use client";

import { useState } from "react";
import useWallet from "@/hooks/useWallet";
import { approveToken, depositToVault } from "@/services/contract";
import { useUiStore } from "@/store/ui-store";
const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_MOCK_USDC_ADDRESS;
const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS;

export default function DepositForm() {
  const { account, isConnected, chainId } = useWallet();
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");
  const { addTx, updateTx, setGlobalError } = useUiStore();
  const expectedChainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 31337);
  const wrongNetwork = isConnected && chainId !== expectedChainId;

  async function handleDeposit(e) {
    e.preventDefault();
    setError("");
    setTxHash("");

    if (!isConnected || !account) {
      const message = "Connect wallet first";
      setError(message);
      setGlobalError(message);
      return;
    }

    if (wrongNetwork) {
      const message = "Wrong network. Please switch to the correct chain.";
      setError(message);
      setGlobalError(message);
      return;
    }

    if (!amount || Number(amount) <= 0) {
      const message = "Enter valid amount";
      setError(message);
      return;
    }

    let depositHash = "";

    try {
      setStatus("pending");

      const approveTx = await approveToken(
        TOKEN_ADDRESS,
        VAULT_ADDRESS,
        amount,
      );
      await approveTx.wait();

      const depositTx = await depositToVault(amount, account);
      depositHash = depositTx.hash;
      setTxHash(depositHash);

      addTx({
        hash: depositHash,
        type: "deposit",
        status: "pending",
        createdAt: Date.now(),
        error: "",
      });

      const receipt = await depositTx.wait();

      if (receipt?.status === 1) {
        updateTx(depositHash, {
          status: "confirmed",
          error: "",
        });

        setStatus("confirmed");
        setAmount("");
      } else {
        updateTx(depositHash, {
          status: "failed",
          error: "Transaction reverted",
        });

        setStatus("failed");
        setError("Deposit transaction reverted");
        setGlobalError("Deposit transaction reverted");
      }
    } catch (err) {
      let message = err.message || "Deposit failed";

      const lower = message.toLowerCase();

      if (lower.includes("paused")) {
        message = "Vault is paused. Deposits are temporarily disabled.";
      } else if (lower.includes("network")) {
        message = "Network or RPC issue. Please retry.";
      } else if (lower.includes("user rejected")) {
        message = "Transaction rejected in wallet.";
      } else if (lower.includes("insufficient")) {
        message = "Insufficient balance or allowance.";
      }

      if (depositHash) {
        updateTx(depositHash, {
          status: "failed",
          error: message,
        });
      }

      setStatus("failed");
      setError(message);
      setGlobalError(message);
    }
  }

  return (
    <form
      onSubmit={handleDeposit}
      className="rounded-2xl border p-4 shadow-sm space-y-3"
    >
      <h2 className="text-lg font-semibold">Deposit</h2>

      <input
        type="number"
        step="0.000001"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full rounded-xl border px-3 py-2"
      />

      <button
        type="submit"
        className="rounded-xl bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        disabled={!isConnected || wrongNetwork || status === "pending"}
      >
        {status === "pending" ? "Depositing..." : "Deposit"}
      </button>

      {txHash && (
        <div className="rounded-xl border border-green-300 bg-green-50 p-3 text-green-700 break-all">
          Deposit submitted: {txHash}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}
    </form>
  );
}
