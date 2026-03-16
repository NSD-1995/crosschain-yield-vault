"use client";

export default function ErrorBanner({ message }) {
  if (!message) return null;

  return (
    <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-red-700">
      {message}
    </div>
  );
}
