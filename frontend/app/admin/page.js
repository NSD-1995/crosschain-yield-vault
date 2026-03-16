"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  pauseVault,
  unpauseVault,
  updateCap,
  simulateYield,
} from "@/services/api";
import AdminMetrics from "@/Components/AdminMetrics";
import SuspiciousTransactionsTable from "@/Components/SuspiciousTransactionsTable";
import EventLogTable from "@/Components/EventLogTable";
import {
  Shield,
  KeyRound,
  PauseCircle,
  PlayCircle,
  WalletCards,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  LogOut,
} from "lucide-react";

export default function AdminPage() {
  const router = useRouter();

  const [token, setToken] = useState("");
  const [newCap, setNewCap] = useState("");
  const [yieldAmount, setYieldAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login");
  }

  async function handlePause() {
    try {
      setMessage("");
      setError("");
      await pauseVault();
      setMessage("Vault paused successfully");
    } catch (err) {
      setError(err.message || "Pause failed");
    }
  }

  async function handleUnpause() {
    try {
      setMessage("");
      setError("");
      await unpauseVault();
      setMessage("Vault unpaused successfully");
    } catch (err) {
      setError(err.message || "Unpause failed");
    }
  }

  async function handleCapUpdate() {
    try {
      setMessage("");
      setError("");
      await updateCap(newCap);
      setMessage("Deposit cap updated successfully");
      setNewCap("");
    } catch (err) {
      setError(err.message || "Cap update failed");
    }
  }

  async function handleYieldUpdate() {
    try {
      setMessage("");
      setError("");
      await simulateYield(yieldAmount);
      setMessage("Yield simulated successfully");
      setYieldAmount("");
    } catch (err) {
      setError(err.message || "Yield update failed");
    }
  }

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50 px-4 py-8 md:px-6 xl:px-8">
      <div className="w-full space-y-8">
        <section className="rounded-3xl border border-white/50 bg-white/70 p-6 shadow-xl backdrop-blur-xl md:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 shadow-sm">
                <Shield className="h-7 w-7" />
              </div>

              <div>
                <p className="text-sm font-medium uppercase tracking-wider text-red-600">
                  Admin Control Center
                </p>
                <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
                  Admin Dashboard
                </h1>
                <p className="mt-2 max-w-3xl text-sm text-slate-600 md:text-base">
                  Manage vault controls, monitor suspicious activity, inspect
                  event logs, and operate protocol-level administrative actions.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-900 px-5 py-4 text-white shadow-lg">
                <p className="text-sm text-slate-300">Control Panel</p>
                <p className="text-xl font-semibold">
                  Secure • Monitored • Admin Only
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-4 font-semibold text-white shadow-sm transition hover:bg-red-700"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </section>

        <AdminMetrics />

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <div className="rounded-3xl bg-white p-5 shadow-md ring-1 ring-slate-200 md:p-6">
              <div className="mb-5 flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                  <PauseCircle className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Vault Controls
                  </h2>
                  <p className="text-sm text-slate-500">
                    Pause or resume vault operations at the protocol level.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handlePause}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-red-700"
                >
                  <PauseCircle className="h-4 w-4" />
                  Pause Vault
                </button>

                <button
                  onClick={handleUnpause}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-green-700"
                >
                  <PlayCircle className="h-4 w-4" />
                  Unpause Vault
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-3xl bg-white p-5 shadow-md ring-1 ring-slate-200 md:p-6">
                <div className="mb-5 flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                    <WalletCards className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Update Deposit Cap
                    </h2>
                    <p className="text-sm text-slate-500">
                      Set a new protocol deposit limit.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <input
                    value={newCap}
                    onChange={(e) => setNewCap(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
                    placeholder="Enter new cap"
                  />

                  <button
                    onClick={handleCapUpdate}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
                  >
                    <WalletCards className="h-4 w-4" />
                    Update Cap
                  </button>
                </div>
              </div>

              <div className="rounded-3xl bg-white p-5 shadow-md ring-1 ring-slate-200 md:p-6">
                <div className="mb-5 flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100 text-green-600">
                    <TrendingUp className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Simulate Yield
                    </h2>
                    <p className="text-sm text-slate-500">
                      Apply simulated yield for testing and admin review.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <input
                    value={yieldAmount}
                    onChange={(e) => setYieldAmount(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-200"
                    placeholder="Enter yield amount"
                  />

                  <button
                    onClick={handleYieldUpdate}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-green-700"
                  >
                    <TrendingUp className="h-4 w-4" />
                    Simulate Yield
                  </button>
                </div>
              </div>
            </div>

            {message && (
              <div className="rounded-3xl border border-green-200 bg-green-50 p-4 text-green-700 shadow-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-semibold">Success</p>
                    <p className="text-sm">{message}</p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-semibold">Action Failed</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-lg">
              <h3 className="text-lg font-semibold">Admin Notes</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Use vault controls carefully. Admin actions affect all users and
                can change vault behavior immediately across the system.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-md ring-1 ring-slate-200">
              <h3 className="text-base font-semibold text-slate-900">
                Monitoring Access
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Protected monitoring tables below use the admin JWT token you
                provide above.
              </p>
            </div>
          </aside>
        </section>

        <section className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
          <SuspiciousTransactionsTable token={token} />
          <EventLogTable token={token} />
        </section>
      </div>
    </main>
  );
}
