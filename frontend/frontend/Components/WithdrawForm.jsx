"use client";

import { useState } from "react";
import useWallet from "@/hooks/useWallet";
import { redeemFromVault } from "@/services/contract";
import { useUiStore } from "@/store/ui-store";
export default function WithdrawForm() {
  const { account, isConnected, chainId } = useWallet();
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");
  const { addTx, updateTx, setGlobalError } = useUiStore();
  const expectedChainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 31337);
  const wrongNetwork = isConnected && chainId !== expectedChainId;

  async function handleWithdraw(e) {
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
      const message = "Wrong network";
      setError(message);
      setGlobalError(message);
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError("Enter valid amount");
      return;
    }

    let txHashLocal = "";

    try {
      setStatus("pending");

      const tx = await redeemFromVault(amount, account, account);
      txHashLocal = tx.hash;

      addTx({
        hash: txHashLocal,
        type: "withdraw",
        status: "pending",
        createdAt: Date.now(),
        error: "",
      });

      const receipt = await tx.wait();

      if (receipt?.status === 1) {
        updateTx(txHashLocal, { status: "confirmed" });
        setStatus("confirmed");
        setAmount("");
      } else {
        updateTx(txHashLocal, {
          status: "failed",
          error: "Withdraw reverted",
        });

        setStatus("failed");
        setError("Withdraw reverted");
      }

      setTxHash(txHashLocal);
    } catch (err) {
      let message = err.message || "Withdraw failed";

      if (message.toLowerCase().includes("paused")) {
        message = "Vault is paused.";
      }

      if (txHashLocal) {
        updateTx(txHashLocal, {
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
      onSubmit={handleWithdraw}
      className="rounded-2xl border p-4 shadow-sm space-y-3"
    >
      <h2 className="text-lg font-semibold">Withdraw</h2>

      <input
        type="number"
        step="0.000001"
        placeholder="Enter share amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full rounded-xl border px-3 py-2"
      />

      <button
        type="submit"
        className="rounded-xl bg-purple-600 px-4 py-2 text-white disabled:opacity-50"
        disabled={!isConnected || wrongNetwork || status === "pending"}
      >
        {status === "pending" ? "Withdrawing..." : "Withdraw"}
      </button>

      {txHash && (
        <div className="rounded-xl border border-green-300 bg-green-50 p-3 text-green-700 break-all">
          Withdraw submitted: {txHash}
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
