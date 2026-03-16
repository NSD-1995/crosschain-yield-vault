"use client";

import { useState } from "react";
import {
  pauseVault,
  unpauseVault,
  updateCap,
  simulateYield,
} from "@/services/api";
import AdminMetrics from "@/Components/AdminMetrics";
import SuspiciousTransactionsTable from "@/Components/SuspiciousTransactionsTable";
import EventLogTable from "@/Components/EventLogTable";

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [newCap, setNewCap] = useState("");
  const [yieldAmount, setYieldAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handlePause() {
    try {
      setMessage("");
      setError("");

      await pauseVault(token);

      setMessage("Vault paused successfully");
    } catch (err) {
      setError(err.message || "Pause failed");
    }
  }

  async function handleUnpause() {
    try {
      setMessage("");
      setError("");

      await unpauseVault(token);

      setMessage("Vault unpaused successfully");
    } catch (err) {
      setError(err.message || "Unpause failed");
    }
  }

  async function handleCapUpdate() {
    try {
      setMessage("");
      setError("");

      await updateCap(token, newCap);

      setMessage("Deposit cap updated successfully");
      setNewCap("");
    } catch (err) {
      setError(err.message || "Cap update failed");
    }
  }

  async function handleYieldUpdate() {
    try {
      setMessage("");
      setError("");

      await simulateYield(token, yieldAmount);

      setMessage("Yield simulated successfully");
      setYieldAmount("");
    } catch (err) {
      setError(err.message || "Yield update failed");
    }
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>

      <AdminMetrics />

      {/* Admin Token */}
      <div className="rounded-2xl border p-4 shadow-sm space-y-3">
        <label className="block text-sm font-medium">Admin JWT Token</label>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="min-h-[100px] w-full rounded-xl border p-3"
          placeholder="Paste admin token"
        />
      </div>

      {/* Vault Controls */}
      <div className="rounded-2xl border p-4 shadow-sm space-y-3">
        <h2 className="text-lg font-semibold">Vault Controls</h2>

        <div className="flex gap-3">
          <button
            onClick={handlePause}
            className="rounded-xl bg-red-600 px-4 py-2 text-white"
          >
            Pause Vault
          </button>

          <button
            onClick={handleUnpause}
            className="rounded-xl bg-green-600 px-4 py-2 text-white"
          >
            Unpause Vault
          </button>
        </div>
      </div>

      {/* Update Cap */}
      <div className="rounded-2xl border p-4 shadow-sm space-y-3">
        <h2 className="text-lg font-semibold">Update Deposit Cap</h2>

        <input
          value={newCap}
          onChange={(e) => setNewCap(e.target.value)}
          className="w-full rounded-xl border px-3 py-2"
          placeholder="Enter new cap"
        />

        <button
          onClick={handleCapUpdate}
          className="rounded-xl bg-blue-600 px-4 py-2 text-white"
        >
          Update Cap
        </button>
      </div>

      {/* Simulate Yield */}
      <div className="rounded-2xl border p-4 shadow-sm space-y-3">
        <h2 className="text-lg font-semibold">Simulate Yield</h2>

        <input
          value={yieldAmount}
          onChange={(e) => setYieldAmount(e.target.value)}
          className="w-full rounded-xl border px-3 py-2"
          placeholder="Enter yield amount"
        />

        <button
          onClick={handleYieldUpdate}
          className="rounded-xl bg-green-600 px-4 py-2 text-white"
        >
          Simulate Yield
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className="rounded-xl border border-green-300 bg-green-50 p-3 text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      {/* Admin Monitoring */}
      <SuspiciousTransactionsTable token={token} />
      <EventLogTable token={token} />
    </main>
  );
}
