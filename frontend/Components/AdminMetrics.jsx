"use client";

import { useEffect, useState } from "react";
import { getVaultStats } from "@/services/api";
import { Landmark, TrendingUp, PieChart, AlertCircle } from "lucide-react";

export default function AdminMetrics() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await getVaultStats();
        if (mounted) {
          setStats(data);
          setError("");
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Failed to load metrics");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();
    const id = setInterval(load, 5000);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  function formatNumber(num) {
    if (!num) return "0";
    return Number(num).toLocaleString();
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 rounded-3xl border border-red-200 bg-red-50 p-4 text-red-700">
        <AlertCircle className="h-5 w-5 mt-0.5" />
        <div>
          <p className="font-semibold">Admin Metrics Error</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-3xl bg-white p-6 shadow-sm"
          >
            <div className="h-4 w-24 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 w-32 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {/* TVL */}
      <div className="rounded-3xl bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm hover:shadow-md transition">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Total Value Locked</p>
            <p className="text-2xl font-bold mt-2 text-gray-900">
              {formatNumber(stats?.tvl)}
            </p>
          </div>

          <div className="h-11 w-11 flex items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
            <Landmark size={20} />
          </div>
        </div>
      </div>

      {/* APY */}
      <div className="rounded-3xl bg-gradient-to-br from-green-50 to-white p-6 shadow-sm hover:shadow-md transition">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Vault APY</p>
            <p className="text-2xl font-bold mt-2 text-green-600">
              {formatNumber(stats?.apy)}%
            </p>
          </div>

          <div className="h-11 w-11 flex items-center justify-center rounded-2xl bg-green-100 text-green-600">
            <TrendingUp size={20} />
          </div>
        </div>
      </div>

      {/* Shares */}
      <div className="rounded-3xl bg-gradient-to-br from-purple-50 to-white p-6 shadow-sm hover:shadow-md transition">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Total Shares</p>
            <p className="text-2xl font-bold mt-2 text-gray-900">
              {formatNumber(stats?.totalShares)}
            </p>
          </div>

          <div className="h-11 w-11 flex items-center justify-center rounded-2xl bg-purple-100 text-purple-600">
            <PieChart size={20} />
          </div>
        </div>
      </div>
    </div>
  );
}
