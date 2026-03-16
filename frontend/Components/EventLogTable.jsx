"use client";

import { useEffect, useState } from "react";
import { getAdminEvents } from "@/services/api";
import {
  Activity,
  AlertTriangle,
  Database,
  Hash,
  Blocks,
  FileJson,
  Loader2,
} from "lucide-react";

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

  function shortHash(hash) {
    if (!hash) return "-";
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  }

  return (
    <div className="space-y-5 rounded-3xl bg-gradient-to-br from-white to-slate-50 p-5 shadow-md ring-1 ring-slate-200">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
          <Activity className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900">Event Logs</h2>
          <p className="text-sm text-slate-500">
            Recent admin-level blockchain and backend events
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
                <div className="h-5 w-32 rounded bg-slate-200" />
                <div className="h-6 w-20 rounded-full bg-slate-200" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-40 rounded bg-slate-100" />
                <div className="h-4 w-3/4 rounded bg-slate-100" />
                <div className="h-4 w-28 rounded bg-slate-100" />
              </div>
            </div>
          ))}

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading events...
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Failed to load event logs</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && !rows.length && (
        <div className="rounded-2xl bg-slate-50 p-6 text-center ring-1 ring-slate-200">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <Database className="h-5 w-5" />
          </div>
          <p className="font-medium text-slate-700">No events recorded yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Admin events will appear here after transactions and backend
            actions.
          </p>
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="space-y-4">
          {rows.map((row) => (
            <div
              key={row.event_id || row.tx_hash}
              className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md"
            >
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    {row.event_name || "Unknown Event"}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Event activity captured from admin systems
                  </p>
                </div>

                <span className="inline-flex w-fit items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  {row.chain_name || "Unknown Chain"}
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
                  <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                    <Hash className="h-4 w-4" />
                    Transaction Hash
                  </div>
                  <div className="break-all text-sm font-medium text-slate-800">
                    <span className="hidden sm:inline">
                      {row.tx_hash || "-"}
                    </span>
                    <span className="sm:hidden">{shortHash(row.tx_hash)}</span>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
                  <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                    <Blocks className="h-4 w-4" />
                    Block Number
                  </div>
                  <div className="text-sm font-medium text-slate-800">
                    {row.block_number ?? "-"}
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded-2xl bg-slate-950 p-4 text-slate-100">
                <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                  <FileJson className="h-4 w-4" />
                  Payload
                </div>

                <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs leading-6 text-slate-300">
                  {JSON.stringify(row.payload ?? {}, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
