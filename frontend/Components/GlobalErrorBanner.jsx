"use client";

import { useUiStore } from "@/store/ui-store";
import { AlertTriangle, X } from "lucide-react";

export default function GlobalErrorBanner() {
  const { globalError, clearGlobalError } = useUiStore();

  if (!globalError) return null;

  return (
    <div className="flex items-start justify-between gap-4 rounded-3xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-600">
          <AlertTriangle size={18} />
        </div>

        <div>
          <p className="font-semibold">System Error</p>
          <p className="text-sm text-red-600">{globalError}</p>
        </div>
      </div>

      <button
        onClick={clearGlobalError}
        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-red-100 transition"
      >
        <X size={16} />
      </button>
    </div>
  );
}
