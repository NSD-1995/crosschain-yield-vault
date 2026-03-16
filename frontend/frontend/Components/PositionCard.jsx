"use client";

import { useEffect, useState } from "react";
import useWallet from "@/hooks/useWallet";
import { getUserPosition } from "@/services/api";

export default function PositionCard() {
  const { account, isConnected } = useWallet();
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadPosition() {
      if (!isConnected || !account) {
        setPosition(null);
        return;
      }

      try {
        setLoading(true);
        const data = await getUserPosition(account);
        if (mounted) {
          setPosition(data);
          setError("");
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Failed to load position");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadPosition();
    const id = setInterval(loadPosition, 5000);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [account, isConnected]);

  if (!isConnected) {
    return (
      <div className="rounded-2xl border p-4 shadow-sm">
        Connect wallet to view your position.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-2xl border p-4 shadow-sm">
        Loading position...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border p-4 shadow-sm space-y-3">
      <h2 className="text-lg font-semibold">Position Overview</h2>

      <div>
        <div className="text-sm text-gray-500">Asset Balance</div>
        <div className="text-xl font-bold">
          {position?.asset_balance ?? "0"}
        </div>
      </div>

      <div>
        <div className="text-sm text-gray-500">Share Balance</div>
        <div className="text-xl font-bold">
          {position?.share_balance ?? "0"}
        </div>
      </div>
    </div>
  );
}
