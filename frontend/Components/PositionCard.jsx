"use client";

import { useEffect, useState } from "react";
import useWallet from "@/hooks/useWallet";
import { getUserPosition } from "@/services/api";
import {
  Wallet,
  PieChart,
  Coins,
  Loader2,
  AlertTriangle,
  BarChart3,
} from "lucide-react";

export default function PositionCard() {
  const { account, isConnected } = useWallet();
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadPosition() {
      if (!isConnected || !account) {
        setPosition(null);
        return;
      }

      try {
        setLoading(true);
        const data = await getUserPosition(account);
        if (mounted) {
          setPosition(data);
          setError("");
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Failed to load position");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadPosition();
    const id = setInterval(loadPosition, 5000);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [account, isConnected]);

  function formatValue(value) {
    if (value === null || value === undefined) return "0";
    const num = Number(value);
    if (Number.isNaN(num)) return value;
    return num.toLocaleString();
  }

  if (!isConnected) {
    return (
      <div className="rounded-3xl bg-gradient-to-br from-white to-slate-50 p-5 shadow-md ring-1 ring-slate-200">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
            <Wallet className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Position Overview
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Connect your wallet to view your vault position.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-3xl bg-gradient-to-br from-white to-slate-50 p-5 shadow-md ring-1 ring-slate-200">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Position Overview
            </h2>
            <p className="text-sm text-slate-500">
              Fetching your latest balances
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading position...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Failed to load position</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 rounded-3xl bg-gradient-to-br from-white to-slate-50 p-5 shadow-md ring-1 ring-slate-200">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-100 text-purple-600">
          <PieChart className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Position Overview
          </h2>
          <p className="text-sm text-slate-500">
            Your current vault asset and share balances
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-blue-50 p-4 ring-1 ring-blue-100">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
            <Coins className="h-4 w-4 text-blue-600" />
            Asset Balance
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {formatValue(position?.asset_balance)}
          </div>
          <p className="mt-2 text-xs text-slate-400">Underlying vault assets</p>
        </div>

        <div className="rounded-2xl bg-purple-50 p-4 ring-1 ring-purple-100">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
            <PieChart className="h-4 w-4 text-purple-600" />
            Share Balance
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {formatValue(position?.share_balance)}
          </div>
          <p className="mt-2 text-xs text-slate-400">Vault shares owned</p>
        </div>
      </div>
    </div>
  );
}
