const fs = require("fs").promises;
const path = require("path");

async function main() {
  const root = path.resolve(__dirname, "../../");
  const deploymentsPath = path.join(root, "deployments.json");

  const raw = await fs.readFile(deploymentsPath, "utf8");
  const deployments = JSON.parse(raw);

  const backendEnvPath = path.join(root, "backend", ".env");
  const frontendEnvPath = path.join(root, "frontend", ".env");

  const backendEnv = `PORT=5000
DATABASE_URL=postgresql://postgres:root123@localhost:5432/crosschain_vault
JWT_SECRET=supersecretjwt

SEPOLIA_RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

MOCK_USDC_ADDRESS=${deployments.MockUSDC}
YIELD_VAULT_ADDRESS=${deployments.YieldVault}
BRIDGE_SENDER_ADDRESS=${deployments.BridgeSender}
BRIDGE_RECEIVER_ADDRESS=${deployments.BridgeReceiver}

INDEXER_CONFIRMATIONS=2
INDEXER_POLL_MS=4000
`;

  const frontendEnv = `NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_CHAIN_ID=31337

NEXT_PUBLIC_MOCK_USDC_ADDRESS=${deployments.MockUSDC}
NEXT_PUBLIC_VAULT_ADDRESS=${deployments.YieldVault}
NEXT_PUBLIC_BRIDGE_SENDER_ADDRESS=${deployments.BridgeSender}
NEXT_PUBLIC_BRIDGE_RECEIVER_ADDRESS=${deployments.BridgeReceiver}
`;

  await fs.writeFile(backendEnvPath, backendEnv);
  await fs.writeFile(frontendEnvPath, frontendEnv);

  console.log("Synced backend/.env");
  console.log("Synced frontend/.env.local");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
