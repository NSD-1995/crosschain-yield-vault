"use client";

import { useEffect, useState } from "react";
import { getVaultStats } from "@/services/api";

export default function VaultStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadStats() {
      try {
        const data = await getVaultStats();
        if (mounted) {
          setStats(data);
          setError("");
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Failed to load vault stats");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadStats();
    const id = setInterval(loadStats, 5000);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border p-4 shadow-sm">Loading stats...</div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="rounded-2xl border p-4 shadow-sm">
        <div className="text-sm text-gray-500">TVL</div>
        <div className="mt-2 text-xl font-bold">{stats?.tvl ?? "0"}</div>
      </div>

      <div className="rounded-2xl border p-4 shadow-sm">
        <div className="text-sm text-gray-500">APY</div>
        <div className="mt-2 text-xl font-bold">{stats?.apy ?? "0"}%</div>
      </div>

      <div className="rounded-2xl border p-4 shadow-sm">
        <div className="text-sm text-gray-500">Total Shares</div>
        <div className="mt-2 text-xl font-bold">
          {stats?.totalShares ?? "0"}
        </div>
      </div>
    </div>
  );
}
