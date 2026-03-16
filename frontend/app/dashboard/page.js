"use client";

import { useRouter } from "next/navigation";

import BackendStatus from "@/Components/BackendStatus";
import BridgeForm from "@/Components/BridgeForm";
import BridgeStatusTracker from "@/Components/BridgeStatusTracker";
import DepositForm from "@/Components/DepositForm";
import PositionCard from "@/Components/PositionCard";
import TxStatusList from "@/Components/TxStatusList";
import VaultStats from "@/Components/VaultStats";
import WalletConnect from "@/Components/WalletConnect";
import WithdrawForm from "@/Components/WithdrawForm";

export default function DashboardPage() {
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <section className="rounded-3xl border border-white/50 bg-white/70 p-6 shadow-xl backdrop-blur-xl md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-blue-600">
                Cross-Chain Yield Vault
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
                User Dashboard
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
                Monitor your vault performance, manage deposits and withdrawals,
                and track bridge activity in one place.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 text-white shadow-lg">
                <p className="text-sm text-blue-100">Portfolio Overview</p>
                <p className="text-xl font-semibold">
                  Secure • Fast • Transparent
                </p>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="rounded-xl bg-red-600 px-4 py-3 font-semibold text-white shadow hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </section>

        {/* Remaining Dashboard Content */}

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">
                Wallet Connection
              </h2>
              <WalletConnect />
            </div>

            <div className="flex flex-col gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">
                  Vault Statistics
                </h2>
                <VaultStats />
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">
                  Your Position
                </h2>
                <PositionCard />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              <h2 className="mb-5 text-lg font-semibold text-slate-900">
                Vault Actions
              </h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <DepositForm />
                <WithdrawForm />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              <h2 className="mb-5 text-lg font-semibold text-slate-900">
                Cross-Chain Bridge
              </h2>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <BridgeForm />
                <BridgeStatusTracker />
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <TxStatusList />
            <BackendStatus />
          </aside>
        </section>
      </div>
    </main>
  );
}
