"use client";

import { useState } from "react";
import useWallet from "@/hooks/useWallet";
import { approveToken, bridgeTokens } from "@/services/contract";
import { initiateBridge } from "@/services/api";
import { useUiStore } from "@/store/ui-store";

const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_MOCK_USDC_ADDRESS;
const BRIDGE_SENDER_ADDRESS = process.env.NEXT_PUBLIC_BRIDGE_SENDER_ADDRESS;

export default function BridgeForm() {
  const { account, isConnected, chainId } = useWallet();
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");
  const [bridgeApiMessage, setBridgeApiMessage] = useState("");
  const { addTx, updateTx, setGlobalError } = useUiStore();

  const expectedChainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 31337);
  const wrongNetwork = isConnected && chainId !== expectedChainId;

  async function handleBridge(e) {
    e.preventDefault();
    setError("");
    setTxHash("");
    setBridgeApiMessage("");

    if (!isConnected || !account) {
      const message = "Connect wallet first";
      setError(message);
      setGlobalError(message);
      return;
    }

    if (wrongNetwork) {
      const message = "Wrong network";
      setError(message);
      setGlobalError(message);
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError("Enter valid amount");
      return;
    }

    let bridgeHash = "";

    try {
      setStatus("pending");

      const approveTx = await approveToken(
        TOKEN_ADDRESS,
        BRIDGE_SENDER_ADDRESS,
        amount,
      );
      await approveTx.wait();

      const tx = await bridgeTokens(amount);
      bridgeHash = tx.hash;

      addTx({
        hash: bridgeHash,
        type: "bridge",
        status: "pending",
        createdAt: Date.now(),
        error: "",
      });

      const receipt = await tx.wait();

      if (receipt?.status === 1) {
        updateTx(bridgeHash, { status: "confirmed", error: "" });

        // Save bridge record in backend DB
        try {
          const bridgeRes = await initiateBridge({
            tx_hash: bridgeHash,
            user_address: account,
            amount: amount,
            nonce: Date.now(),
            source_chain: "hardhat",
            destination_chain: "arbitrum",
          });

          setBridgeApiMessage(
            `Bridge record created: ${bridgeRes.tx_hash || bridgeHash}`,
          );
        } catch (apiErr) {
          console.error("Bridge DB initiation failed:", apiErr);
          setBridgeApiMessage(
            "Bridge transaction succeeded, but backend status record was not created.",
          );
        }

        setStatus("confirmed");
      } else {
        updateTx(bridgeHash, {
          status: "failed",
          error: "Bridge reverted",
        });

        setStatus("failed");
        setError("Bridge transaction reverted");
      }

      setTxHash(bridgeHash);
      setAmount("");
    } catch (err) {
      let message = err.message || "Bridge failed";

      if (message.toLowerCase().includes("expired")) {
        message = "Bridge signature expired. Please initiate bridge again.";
      }

      if (bridgeHash) {
        updateTx(bridgeHash, {
          status: "failed",
          error: message,
        });
      }

      setStatus("failed");
      setError(message);
      setGlobalError(message);
    }
  }

  return (
    <form
      onSubmit={handleBridge}
      className="rounded-2xl border p-4 shadow-sm space-y-3"
    >
      <h2 className="text-lg font-semibold">Bridge</h2>

      <input
        type="number"
        step="0.000001"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full rounded-xl border px-3 py-2"
      />

      <button
        type="submit"
        className="rounded-xl bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
        disabled={!isConnected || wrongNetwork || status === "pending"}
      >
        {status === "pending" ? "Bridging..." : "Bridge"}
      </button>

      {txHash && (
        <div className="rounded-xl border border-green-300 bg-green-50 p-3 text-green-700 break-all">
          Bridge submitted: {txHash}
        </div>
      )}

      {bridgeApiMessage && (
        <div className="rounded-xl border border-blue-300 bg-blue-50 p-3 text-blue-700 break-all">
          {bridgeApiMessage}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}
    </form>
  );
}
