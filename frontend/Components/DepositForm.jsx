"use client";

import { useState } from "react";
import useWallet from "@/hooks/useWallet";
import { approveToken, depositToVault } from "@/services/contract";
import { useUiStore } from "@/store/ui-store";
import {
  ArrowDownToLine,
  Coins,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from "lucide-react";

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

  function shortHash(hash) {
    if (!hash) return "";
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  }

  return (
    <form
      onSubmit={handleDeposit}
      className="space-y-5 rounded-3xl bg-gradient-to-br from-white to-slate-50 p-5 shadow-md ring-1 ring-slate-200"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
            <ArrowDownToLine className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">Deposit</h2>
            <p className="text-sm text-slate-500">
              Supply assets to the vault and receive shares
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
          Deposit Amount
        </label>

        <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-3 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
          <input
            type="number"
            step="0.000001"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-transparent py-3 outline-none placeholder:text-slate-400"
          />
          <span className="text-sm font-medium text-slate-500">USDC</span>
        </div>

        <p className="mt-2 text-xs text-slate-400">
          Token approval will be requested before deposit execution.
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
                Please switch to chain ID {expectedChainId} before depositing.
              </p>
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.01] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!isConnected || wrongNetwork || status === "pending"}
      >
        {status === "pending" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Depositing...
          </>
        ) : (
          <>
            <ArrowDownToLine className="h-4 w-4" />
            Deposit to Vault
          </>
        )}
      </button>

      {txHash && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-green-700">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Deposit submitted successfully</p>
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
              <p className="font-semibold">Deposit failed</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
