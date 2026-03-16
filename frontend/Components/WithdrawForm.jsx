"use client";

import { useState } from "react";
import useWallet from "@/hooks/useWallet";
import { redeemFromVault } from "@/services/contract";
import { useUiStore } from "@/store/ui-store";
import {
  ArrowUpFromLine,
  Wallet,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Coins,
} from "lucide-react";

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
        updateTx(txHashLocal, { status: "confirmed", error: "" });
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
      } else if (message.toLowerCase().includes("user rejected")) {
        message = "Transaction rejected in wallet.";
      } else if (message.toLowerCase().includes("insufficient")) {
        message = "Insufficient share balance.";
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

  function shortHash(hash) {
    if (!hash) return "";
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  }

  return (
    <form
      onSubmit={handleWithdraw}
      className="space-y-5 rounded-3xl bg-gradient-to-br from-white to-slate-50 p-5 shadow-md ring-1 ring-slate-200"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-100 text-purple-600">
            <ArrowUpFromLine className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">Withdraw</h2>
            <p className="text-sm text-slate-500">
              Redeem your vault shares and withdraw assets
            </p>
          </div>
        </div>

        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {status === "pending"
            ? "Processing"
            : status === "confirmed"
              ? "Completed"
              : status === "failed"
                ? "Failed"
                : "Ready"}
        </div>
      </div>

      <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
          <Coins className="h-4 w-4 text-slate-500" />
          Share Amount
        </label>

        <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-3 transition focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-200">
          <input
            type="number"
            step="0.000001"
            placeholder="Enter share amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-transparent py-3 outline-none placeholder:text-slate-400"
          />
          <span className="text-sm font-medium text-slate-500">Shares</span>
        </div>

        <p className="mt-2 text-xs text-slate-400">
          Withdrawals redeem vault shares back into underlying assets.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
            Wallet Status
          </p>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
            <Wallet className="h-4 w-4" />
            {isConnected ? "Connected" : "Not Connected"}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
            Chain ID
          </p>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
            <ShieldCheck className="h-4 w-4" />
            {chainId ?? "-"}
          </div>
        </div>
      </div>

      {wrongNetwork && (
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Wrong network detected</p>
              <p className="mt-1 text-sm">
                Please switch to chain ID {expectedChainId} before withdrawing.
              </p>
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.01] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!isConnected || wrongNetwork || status === "pending"}
      >
        {status === "pending" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Withdrawing...
          </>
        ) : (
          <>
            <ArrowUpFromLine className="h-4 w-4" />
            Withdraw from Vault
          </>
        )}
      </button>

      {txHash && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-green-700">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Withdraw submitted successfully</p>
              <p className="mt-1 break-all text-sm">
                <span className="hidden sm:inline">{txHash}</span>
                <span className="sm:hidden">{shortHash(txHash)}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Withdraw failed</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
