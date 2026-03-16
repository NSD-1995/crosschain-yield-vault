"use client";

import { useState } from "react";
import { getBridgeStatus } from "@/services/api";
import {
  Search,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ArrowRightLeft,
  Hash,
  Boxes,
} from "lucide-react";

export default function BridgeStatusTracker() {
  const [txHash, setTxHash] = useState("");
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCheck(e) {
    e.preventDefault();
    setError("");
    setStatus(null);

    if (!txHash) {
      setError("Enter transaction hash");
      return;
    }

    try {
      setLoading(true);
      const data = await getBridgeStatus(txHash);
      setStatus(data);
    } catch (err) {
      setError(err.message || "Failed to fetch bridge status");
    } finally {
      setLoading(false);
    }
  }

  function getStatusStyles(value) {
    const normalized = String(value || "").toLowerCase();

    if (
      normalized === "confirmed" ||
      normalized === "completed" ||
      normalized === "success"
    ) {
      return "bg-green-100 text-green-700";
    }

    if (normalized === "pending" || normalized === "processing") {
      return "bg-yellow-100 text-yellow-700";
    }

    if (normalized === "failed" || normalized === "reverted") {
      return "bg-red-100 text-red-700";
    }

    return "bg-slate-100 text-slate-700";
  }

  function shortHash(hash) {
    if (!hash) return "";
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  }

  return (
    <div className="space-y-5 rounded-3xl bg-gradient-to-br from-white to-slate-50 p-5 shadow-md ring-1 ring-slate-200">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
          <ArrowRightLeft className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Bridge Status Tracker
          </h2>
          <p className="text-sm text-slate-500">
            Check the latest status of your bridge transaction
          </p>
        </div>
      </div>

      <form onSubmit={handleCheck} className="space-y-4">
        <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
            <Hash className="h-4 w-4 text-slate-500" />
            Transaction Hash
          </label>

          <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-3 transition focus-within:border-slate-500 focus-within:ring-2 focus-within:ring-slate-200">
            <input
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="Enter bridge tx hash"
              className="w-full bg-transparent py-3 outline-none placeholder:text-slate-400"
            />
          </div>

          <p className="mt-2 text-xs text-slate-400">
            Paste the source-chain bridge transaction hash to fetch status.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Check Status
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Unable to fetch bridge status</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {status && (
        <div className="space-y-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">Transaction</p>
              <p className="font-semibold text-slate-900 break-all">
                <span className="hidden sm:inline">{txHash}</span>
                <span className="sm:hidden">{shortHash(txHash)}</span>
              </p>
            </div>

            <div
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${getStatusStyles(
                status.status,
              )}`}
            >
              {String(status.status || "").toLowerCase() === "pending" ? (
                <Clock3 className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {status.status || "Unknown"}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Amount
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {status.amount ?? "-"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Nonce
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {status.nonce ?? "-"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                <Boxes className="h-4 w-4" />
                Source Chain
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {status.source_chain ?? "-"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                <ArrowRightLeft className="h-4 w-4" />
                Destination Chain
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {status.destination_chain ?? "-"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
