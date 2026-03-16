"use client";

import { useEffect, useState } from "react";
import { getSuspiciousTransactions } from "@/services/api";
import {
  ShieldAlert,
  AlertTriangle,
  Loader2,
  SearchX,
  Wallet,
  ArrowRightLeft,
  BadgeAlert,
  Activity,
} from "lucide-react";

export default function SuspiciousTransactionsTable({ token }) {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!token) {
        setRows([]);
        return;
      }

      try {
        setLoading(true);
        const data = await getSuspiciousTransactions(token);

        if (mounted) {
          setRows(Array.isArray(data) ? data : []);
          setError("");
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Failed to load suspicious transactions");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [token]);

  function shortHash(value) {
    if (!value) return "-";
    return `${value.slice(0, 10)}...${value.slice(-8)}`;
  }

  function getStatusStyles(status) {
    const normalized = String(status || "").toLowerCase();

    if (
      normalized.includes("flagged") ||
      normalized.includes("suspicious") ||
      normalized.includes("failed")
    ) {
      return "bg-red-100 text-red-700";
    }

    if (
      normalized.includes("pending") ||
      normalized.includes("review") ||
      normalized.includes("processing")
    ) {
      return "bg-yellow-100 text-yellow-700";
    }

    if (
      normalized.includes("resolved") ||
      normalized.includes("cleared") ||
      normalized.includes("confirmed")
    ) {
      return "bg-green-100 text-green-700";
    }

    return "bg-slate-100 text-slate-700";
  }

  function getTypeStyles(type) {
    const normalized = String(type || "").toLowerCase();

    if (normalized.includes("bridge") || normalized.includes("cross")) {
      return "bg-indigo-100 text-indigo-700";
    }

    if (normalized.includes("withdraw")) {
      return "bg-orange-100 text-orange-700";
    }

    if (normalized.includes("deposit")) {
      return "bg-blue-100 text-blue-700";
    }

    return "bg-slate-100 text-slate-700";
  }

  return (
    <div className="space-y-5 rounded-3xl bg-gradient-to-br from-white to-slate-50 p-5 shadow-md ring-1 ring-slate-200">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-600">
          <ShieldAlert className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Suspicious Transactions
          </h2>
          <p className="text-sm text-slate-500">
            Review flagged user activity and potentially risky transactions
          </p>
        </div>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="h-5 w-28 rounded bg-slate-200" />
                <div className="h-6 w-20 rounded-full bg-slate-200" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-3/4 rounded bg-slate-100" />
                <div className="h-4 w-1/2 rounded bg-slate-100" />
                <div className="h-4 w-2/3 rounded bg-slate-100" />
              </div>
            </div>
          ))}

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading suspicious transactions...
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">
                Failed to load suspicious transactions
              </p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && !rows.length && (
        <div className="rounded-2xl bg-slate-50 p-6 text-center ring-1 ring-slate-200">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-600">
            <SearchX className="h-5 w-5" />
          </div>
          <p className="font-medium text-slate-700">
            No suspicious transactions detected
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Flagged transactions will appear here for review when detected.
          </p>
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="space-y-4">
          {rows.map((row) => (
            <div
              key={row.id || row.tx_hash}
              className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md"
            >
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-2">
                  <BadgeAlert className="h-5 w-5 text-red-500" />
                  <h3 className="text-base font-semibold capitalize text-slate-900">
                    {row.type || "Unknown"}
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getTypeStyles(
                      row.type,
                    )}`}
                  >
                    {row.type || "Unknown Type"}
                  </span>

                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyles(
                      row.status,
                    )}`}
                  >
                    {row.status || "Unknown Status"}
                  </span>

                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {row.chain_name || "Unknown Chain"}
                  </span>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
                  <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                    <Wallet className="h-4 w-4" />
                    User Address
                  </div>
                  <div className="break-all text-sm font-medium text-slate-800">
                    <span className="hidden sm:inline">
                      {row.user_address || "-"}
                    </span>
                    <span className="sm:hidden">
                      {shortHash(row.user_address)}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
                  <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                    <Activity className="h-4 w-4" />
                    Amount
                  </div>
                  <div className="text-sm font-medium text-slate-800">
                    {row.amount ?? "-"}
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200 md:col-span-2">
                  <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                    <ArrowRightLeft className="h-4 w-4" />
                    Transaction Hash
                  </div>
                  <div className="break-all text-sm font-medium text-slate-800">
                    <span className="hidden sm:inline">
                      {row.tx_hash || "-"}
                    </span>
                    <span className="sm:hidden">{shortHash(row.tx_hash)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
