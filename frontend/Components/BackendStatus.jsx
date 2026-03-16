"use client";

import { useEffect, useState } from "react";

export default function BackendStatus() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    async function check() {
      try {
        await fetch("http://localhost:5000/health");
        setOffline(false);
      } catch {
        setOffline(true);
      }
    }

    check();
    const id = setInterval(check, 5000);

    return () => clearInterval(id);
  }, []);

  if (!offline) return null;

  return (
    <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-red-700">
      Backend unavailable. Data may be outdated.
    </div>
  );
}
