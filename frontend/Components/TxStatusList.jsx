"use client";

import { useEffect, useState } from "react";
import useWallet from "@/hooks/useWallet";
import { getTransactions } from "@/services/api";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  XCircle,
  RefreshCcw,
  ArrowRightLeft,
  Wallet,
  Hash,
  Loader2,
} from "lucide-react";

function getStatusStyles(status) {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "confirmed") {
    return {
      badge: "text-green-700 bg-green-50 border-green-200",
      icon: <CheckCircle2 className="h-4 w-4" />,
    };
  }

  if (normalized === "pending") {
    return {
      badge: "text-yellow-700 bg-yellow-50 border-yellow-200",
      icon: <Clock3 className="h-4 w-4" />,
    };
  }

  if (normalized === "failed") {
    return {
      badge: "text-red-700 bg-red-50 border-red-200",
      icon: <XCircle className="h-4 w-4" />,
    };
  }

  return {
    badge: "text-slate-700 bg-slate-50 border-slate-200",
    icon: <Activity className="h-4 w-4" />,
  };
}

export default function TxStatusList() {
  const { account, isConnected } = useWallet();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadTransactions() {
      if (!isConnected || !account) {
        setItems([]);
        return;
      }

      try {
        setLoading(true);
        const data = await getTransactions(account);
        if (mounted) {
          setItems(Array.isArray(data) ? data : []);
          setError("");
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Failed to load transactions");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadTransactions();
    const id = setInterval(loadTransactions, 5000);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [account, isConnected]);

  function shortHash(hash) {
    if (!hash) return "-";
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
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
              Transaction Lifecycle
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Connect your wallet to view recent transactions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 rounded-3xl bg-gradient-to-br from-white to-slate-50 p-5 shadow-md ring-1 ring-slate-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <Activity className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Transaction Lifecycle
            </h2>
            <p className="text-sm text-slate-500">
              Track your latest deposit, withdraw, and bridge activity
            </p>
          </div>
        </div>

        {loading && (
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Refreshing
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Unable to load transactions</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && !items.length ? (
        <div className="rounded-2xl bg-slate-50 p-6 text-center ring-1 ring-slate-200">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <ArrowRightLeft className="h-5 w-5" />
          </div>
          <p className="font-medium text-slate-700">No transactions yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Your transaction history will appear here after activity starts.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((tx) => {
            const statusUi = getStatusStyles(tx.status);

            return (
              <div
                key={tx.id || tx.tx_hash}
                className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md"
              >
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-base font-semibold capitalize text-slate-900">
                      {tx.type || "Transaction"}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Recent transaction activity from your wallet
                    </p>
                  </div>

                  <span
                    className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${statusUi.badge}`}
                  >
                    {statusUi.icon}
                    {tx.status || "unknown"}
                  </span>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Amount
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {tx.amount ?? "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Chain
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {tx.chain_name ?? "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200 md:col-span-2">
                    <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                      <Hash className="h-4 w-4" />
                      Transaction Hash
                    </div>
                    <p className="break-all text-sm font-medium text-slate-800">
                      <span className="hidden sm:inline">
                        {tx.tx_hash || "-"}
                      </span>
                      <span className="sm:hidden">{shortHash(tx.tx_hash)}</span>
                    </p>
                  </div>
                </div>

                {String(tx.status).toLowerCase() === "failed" && (
                  <div className="mt-4">
                    <button
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                      onClick={() => window.location.reload()}
                    >
                      <RefreshCcw className="h-4 w-4" />
                      Retry
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
