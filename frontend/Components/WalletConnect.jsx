"use client";

import useWallet from "@/hooks/useWallet";
import {
  Wallet,
  Link2,
  AlertTriangle,
  LogOut,
  ShieldCheck,
} from "lucide-react";

const EXPECTED_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 31337);

export default function WalletConnect() {
  const {
    account,
    chainId,
    isConnected,
    error,
    connectWallet,
    disconnectWallet,
  } = useWallet();

  const wrongNetwork = isConnected && chainId !== EXPECTED_CHAIN_ID;

  function formatAddress(address) {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  return (
    <div className="space-y-4 rounded-3xl bg-gradient-to-br from-white to-slate-50 p-5 shadow-md ring-1 ring-slate-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
            <Wallet className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">Wallet</h2>
            <p className="text-sm text-slate-500">
              Connect your wallet to access vault actions
            </p>
          </div>
        </div>

        <div
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isConnected
              ? "bg-green-100 text-green-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {isConnected ? "Connected" : "Not Connected"}
        </div>
      </div>

      {!isConnected ? (
        <button
          onClick={connectWallet}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 font-medium text-white shadow-lg transition hover:scale-[1.01] hover:shadow-xl"
        >
          <Wallet className="h-4 w-4" />
          Connect MetaMask
        </button>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
                <Link2 className="h-4 w-4" />
                Connected Address
              </div>
              <div className="font-semibold text-slate-900 break-all">
                <span className="hidden sm:inline">{account}</span>
                <span className="sm:hidden">{formatAddress(account)}</span>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
                <ShieldCheck className="h-4 w-4" />
                Chain ID
              </div>
              <div className="font-semibold text-slate-900">{chainId}</div>
            </div>
          </div>

          {wrongNetwork && (
            <div className="flex items-start gap-3 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">Wrong network detected</p>
                <p className="text-sm">
                  Please switch MetaMask to chain ID {EXPECTED_CHAIN_ID}.
                </p>
              </div>
            </div>
          )}

          <button
            onClick={disconnectWallet}
            className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-red-700"
          >
            <LogOut className="h-4 w-4" />
            Disconnect Wallet
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <p className="font-semibold">Wallet Error</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
