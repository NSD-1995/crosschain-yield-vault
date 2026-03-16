"use client";

import { AlertTriangle } from "lucide-react";

export default function ErrorBanner({ message }) {
  if (!message) return null;

  return (
    <div className="flex items-start gap-3 rounded-3xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-600">
        <AlertTriangle size={18} />
      </div>

      <div className="flex-1">
        <p className="font-semibold">Something went wrong</p>
        <p className="text-sm text-red-600">{message}</p>
      </div>
    </div>
  );
}
