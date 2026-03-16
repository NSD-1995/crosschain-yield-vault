"use client";

import { useState } from "react";
import { getBridgeStatus } from "@/services/api";

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

  return (
    <div className="rounded-2xl border p-4 shadow-sm space-y-3">
      <h2 className="text-lg font-semibold">Bridge Status</h2>

      <form onSubmit={handleCheck} className="space-y-3">
        <input
          value={txHash}
          onChange={(e) => setTxHash(e.target.value)}
          placeholder="Enter bridge tx hash"
          className="w-full rounded-xl border px-3 py-2"
        />

        <button
          type="submit"
          className="rounded-xl bg-slate-800 px-4 py-2 text-white"
          disabled={loading}
        >
          {loading ? "Checking..." : "Check Status"}
        </button>
      </form>

      {error && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      {status && (
        <div className="rounded-xl border p-3 space-y-2">
          <div>
            <span className="text-gray-500">Status:</span> {status.status}
          </div>
          <div>
            <span className="text-gray-500">Amount:</span> {status.amount}
          </div>
          <div>
            <span className="text-gray-500">Nonce:</span> {status.nonce}
          </div>
          <div>
            <span className="text-gray-500">Source:</span> {status.source_chain}
          </div>
          <div>
            <span className="text-gray-500">Destination:</span>{" "}
            {status.destination_chain}
          </div>
        </div>
      )}
    </div>
  );
}
