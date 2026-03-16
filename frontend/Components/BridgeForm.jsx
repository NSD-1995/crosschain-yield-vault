"use client";

import { useState } from "react";
import useWallet from "@/hooks/useWallet";
import { approveToken, bridgeTokens } from "@/services/contract";
import { initiateBridge } from "@/services/api";
import { useUiStore } from "@/store/ui-store";
import {
  ArrowRightLeft,
  Coins,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Info,
  Wallet,
} from "lucide-react";

const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_MOCK_USDC_ADDRESS;
const BRIDGE_SENDER_ADDRESS = process.env.NEXT_PUBLIC_BRIDGE_SENDER_ADDRESS;

export default function BridgeForm() {
  const { account, isConnected, chainId } = useWallet();
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");
  const [bridgeApiMessage, setBridgeApiMessage] = useState("");
  const { addTx, updateTx, setGlobalError } = useUiStore();

  const expectedChainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 31337);
  const wrongNetwork = isConnected && chainId !== expectedChainId;

  async function handleBridge(e) {
    e.preventDefault();
    setError("");
    setTxHash("");
    setBridgeApiMessage("");

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

    let bridgeHash = "";

    try {
      setStatus("pending");

      const approveTx = await approveToken(
        TOKEN_ADDRESS,
        BRIDGE_SENDER_ADDRESS,
        amount,
      );
      await approveTx.wait();

      const tx = await bridgeTokens(amount);
      bridgeHash = tx.hash;

      addTx({
        hash: bridgeHash,
        type: "bridge",
        status: "pending",
        createdAt: Date.now(),
        error: "",
      });

      const receipt = await tx.wait();

      if (receipt?.status === 1) {
        updateTx(bridgeHash, { status: "confirmed", error: "" });

        try {
          const bridgeRes = await initiateBridge({
            tx_hash: bridgeHash,
            user_address: account,
            amount: amount,
            nonce: Date.now(),
            source_chain: "hardhat",
            destination_chain: "arbitrum",
          });

          setBridgeApiMessage(
            `Bridge record created: ${bridgeRes.tx_hash || bridgeHash}`,
          );
        } catch (apiErr) {
          console.error("Bridge DB initiation failed:", apiErr);
          setBridgeApiMessage(
            "Bridge transaction succeeded, but backend status record was not created.",
          );
        }

        setStatus("confirmed");
      } else {
        updateTx(bridgeHash, {
          status: "failed",
          error: "Bridge reverted",
        });

        setStatus("failed");
        setError("Bridge transaction reverted");
      }

      setTxHash(bridgeHash);
      setAmount("");
    } catch (err) {
      let message = err.message || "Bridge failed";

      if (message.toLowerCase().includes("expired")) {
        message = "Bridge signature expired. Please initiate bridge again.";
      }

      if (bridgeHash) {
        updateTx(bridgeHash, {
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
      onSubmit={handleBridge}
      className="space-y-5 rounded-3xl bg-gradient-to-br from-white to-slate-50 p-5 shadow-md ring-1 ring-slate-200"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
            <ArrowRightLeft className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Cross-Chain Bridge
            </h2>
            <p className="text-sm text-slate-500">
              Move assets securely across supported chains
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

      <div className="grid gap-4">
        <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
            <Coins className="h-4 w-4 text-slate-500" />
            Bridge Amount
          </label>

          <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-3 transition focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200">
            <input
              type="number"
              step="0.000001"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-2xl bg-transparent py-3 outline-none placeholder:text-slate-400"
            />
            <span className="text-sm font-medium text-slate-500">USDC</span>
          </div>

          <p className="mt-2 text-xs text-slate-400">
            Approve token first, then submit bridge transaction.
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
              Network
            </p>
            <div className="text-sm font-medium text-slate-800">
              {chainId ?? "-"}
            </div>
          </div>
        </div>
      </div>

      {wrongNetwork && (
        <div className="flex items-start gap-3 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Wrong network detected</p>
            <p className="text-sm">
              Please switch to chain ID {expectedChainId} before bridging.
            </p>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={!isConnected || wrongNetwork || status === "pending"}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.01] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "pending" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Bridging...
          </>
        ) : (
          <>
            <ArrowRightLeft className="h-4 w-4" />
            Bridge Assets
          </>
        )}
      </button>

      {txHash && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-green-700">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Bridge submitted successfully</p>
              <p className="mt-1 break-all text-sm">
                <span className="hidden sm:inline">{txHash}</span>
                <span className="sm:hidden">{shortHash(txHash)}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {bridgeApiMessage && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-700">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Backend status</p>
              <p className="mt-1 break-all text-sm">{bridgeApiMessage}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Bridge failed</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
