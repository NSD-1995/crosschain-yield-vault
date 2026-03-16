"use client";

import { useEffect, useState } from "react";
import { getVaultStats } from "@/services/api";
import { Landmark, TrendingUp, PieChart, AlertCircle } from "lucide-react";

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

  function formatValue(value) {
    if (value === null || value === undefined) return "0";

    const num = Number(value);
    if (Number.isNaN(num)) return value;

    return num.toLocaleString();
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="animate-pulse rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="h-4 w-24 rounded bg-slate-200" />
              <div className="h-10 w-10 rounded-2xl bg-slate-200" />
            </div>
            <div className="h-8 w-32 rounded bg-slate-200" />
            <div className="mt-3 h-3 w-20 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 rounded-3xl border border-red-200 bg-red-50 p-4 text-red-700">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">Unable to load vault stats</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="rounded-3xl bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm ring-1 ring-blue-100 transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm font-medium text-slate-500">TVL</div>
            <div className="mt-3 text-2xl font-bold text-slate-900">
              {formatValue(stats?.tvl)}
            </div>
            <div className="mt-2 text-xs text-slate-400">
              Total value locked
            </div>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
            <Landmark className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-gradient-to-br from-green-50 to-white p-5 shadow-sm ring-1 ring-green-100 transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm font-medium text-slate-500">APY</div>
            <div className="mt-3 text-2xl font-bold text-green-600">
              {formatValue(stats?.apy)}%
            </div>
            <div className="mt-2 text-xs text-slate-400">
              Annual percentage yield
            </div>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100 text-green-600">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-gradient-to-br from-purple-50 to-white p-5 shadow-sm ring-1 ring-purple-100 transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm font-medium text-slate-500">
              Total Shares
            </div>
            <div className="mt-3 text-2xl font-bold text-slate-900">
              {formatValue(stats?.totalShares)}
            </div>
            <div className="mt-2 text-xs text-slate-400">
              Issued vault shares
            </div>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-100 text-purple-600">
            <PieChart className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
