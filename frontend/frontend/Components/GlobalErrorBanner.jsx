"use client";

import { useUiStore } from "@/store/ui-store";

export default function GlobalErrorBanner() {
  const { globalError, clearGlobalError } = useUiStore();

  if (!globalError) return null;

  return (
    <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-red-700 flex items-start justify-between gap-4">
      <div>{globalError}</div>
      <button onClick={clearGlobalError} className="text-sm underline">
        Dismiss
      </button>
    </div>
  );
}
