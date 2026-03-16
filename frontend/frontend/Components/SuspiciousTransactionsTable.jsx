"use client";

import { useEffect, useState } from "react";
import { getSuspiciousTransactions } from "@/services/api";

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

  return (
    <div className="rounded-2xl border p-4 shadow-sm space-y-3">
      <h2 className="text-lg font-semibold">Suspicious Transactions</h2>

      {loading && (
        <div className="text-sm text-gray-500">
          Loading suspicious transactions...
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && !rows.length ? (
        <div className="text-sm text-gray-500">
          No suspicious transactions detected yet.
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <div
              key={row.id || row.tx_hash}
              className="rounded-xl border p-3 space-y-2"
            >
              <div className="font-medium capitalize">{row.type}</div>
              <div className="text-sm text-gray-600 break-all">
                User: {row.user_address}
              </div>
              <div className="text-sm text-gray-600">Amount: {row.amount}</div>
              <div className="text-sm text-gray-600">Status: {row.status}</div>
              <div className="text-sm text-gray-600">
                Chain: {row.chain_name}
              </div>
              <div className="text-xs break-all text-gray-500">
                {row.tx_hash}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
