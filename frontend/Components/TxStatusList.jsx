"use client";

import { useEffect, useState } from "react";
import useWallet from "@/hooks/useWallet";
import { getTransactions } from "@/services/api";

function getStatusColor(status) {
  if (status === "confirmed")
    return "text-green-700 bg-green-50 border-green-300";
  if (status === "pending")
    return "text-yellow-700 bg-yellow-50 border-yellow-300";
  if (status === "failed") return "text-red-700 bg-red-50 border-red-300";
  return "text-gray-700 bg-gray-50 border-gray-300";
}

export default function TxStatusList() {
  const { account, isConnected } = useWallet();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadTransactions() {
      if (!isConnected || !account) {
        setItems([]);
        return;
      }

      try {
        const data = await getTransactions(account);
        if (mounted) {
          setItems(Array.isArray(data) ? data : []);
          setError("");
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Failed to load transactions");
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

  return (
    <div className="rounded-2xl border p-4 shadow-sm space-y-3">
      <h2 className="text-lg font-semibold">Transaction Lifecycle</h2>

      {error && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      {!items.length ? (
        <div className="text-sm text-gray-500">No transactions yet.</div>
      ) : (
        <div className="space-y-3">
          {items.map((tx) => (
            <div
              key={tx.id || tx.tx_hash}
              className="rounded-xl border p-3 space-y-2"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="font-medium capitalize">{tx.type}</div>
                <span
                  className={`rounded-full border px-2 py-1 text-xs ${getStatusColor(tx.status)}`}
                >
                  {tx.status || "confirmed"}
                </span>
              </div>

              <div className="text-sm text-gray-600">Amount: {tx.amount}</div>
              <div className="text-sm text-gray-600">
                Chain: {tx.chain_name}
              </div>
              <div className="text-xs break-all text-gray-500">
                {tx.tx_hash}
              </div>
              {tx.status === "failed" && (
                <button
                  className="text-sm underline"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
