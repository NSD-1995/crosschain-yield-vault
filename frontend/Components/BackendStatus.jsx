"use client";

import { useEffect, useState } from "react";
import { Server, AlertTriangle } from "lucide-react";

export default function BackendStatus() {
  const [offline, setOffline] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      try {
        await fetch("http://localhost:5000/health");
        setOffline(false);
      } catch {
        setOffline(true);
      } finally {
        setLoading(false);
      }
    }

    check();
    const id = setInterval(check, 5000);

    return () => clearInterval(id);
  }, []);

  if (loading) return null;

  if (!offline) {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-green-50 p-4 ring-1 ring-green-200">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
          <Server size={18} />
        </div>

        <div className="flex items-center gap-2 text-green-700 font-medium">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
          Backend Online
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
        <AlertTriangle size={18} />
      </div>

      <div>
        <p className="font-semibold">Backend Unavailable</p>
        <p className="text-sm text-red-600">
          API service is not responding. Some dashboard data may be outdated.
        </p>
      </div>
    </div>
  );
}
