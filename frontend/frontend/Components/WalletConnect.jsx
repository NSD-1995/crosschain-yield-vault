"use client";

import useWallet from "@/hooks/useWallet";

const EXPECTED_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 31337);

export default function WalletConnect() {
  const { account, chainId, isConnected, error, connectWallet } = useWallet();

  const wrongNetwork = isConnected && chainId !== EXPECTED_CHAIN_ID;

  return (
    <div className="rounded-2xl border p-4 shadow-sm space-y-3">
      <h2 className="text-lg font-semibold">Wallet</h2>

      {!isConnected ? (
        <button
          onClick={connectWallet}
          className="rounded-xl bg-black px-4 py-2 text-white"
        >
          Connect MetaMask
        </button>
      ) : (
        <div className="space-y-2">
          <div>
            <span className="text-sm text-gray-500">Connected:</span>
            <div className="font-medium break-all">{account}</div>
          </div>

          <div>
            <span className="text-sm text-gray-500">Chain ID:</span>
            <div className="font-medium">{chainId}</div>
          </div>

          {wrongNetwork && (
            <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-3 text-yellow-800">
              Wrong network. Please switch to chain ID {EXPECTED_CHAIN_ID}.
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
