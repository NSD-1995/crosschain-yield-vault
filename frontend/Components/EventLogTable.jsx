"use client";

import { useEffect, useState } from "react";
import { getAdminEvents } from "@/services/api";

export default function EventLogTable({ token }) {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!token) return;

      try {
        setLoading(true);

        const data = await getAdminEvents(token);

        if (mounted) {
          setRows(Array.isArray(data) ? data : []);
          setError("");
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Failed to load event logs");
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
      <h2 className="text-lg font-semibold">Event Logs</h2>

      {loading && (
        <div className="text-sm text-gray-500">Loading events...</div>
      )}

      {error && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && !rows.length ? (
        <div className="text-sm text-gray-500">No events recorded yet.</div>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <div
              key={row.event_id || row.tx_hash}
              className="rounded-xl border p-3 space-y-1"
            >
              <div className="font-medium">{row.event_name}</div>

              <div className="text-sm text-gray-600">
                Chain: {row.chain_name}
              </div>

              <div className="text-sm text-gray-600 break-all">
                TX: {row.tx_hash}
              </div>

              <div className="text-sm text-gray-600">
                Block: {row.block_number}
              </div>

              <div className="text-xs text-gray-500 break-all">
                {JSON.stringify(row.payload)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
