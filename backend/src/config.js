require("dotenv").config();

module.exports = {
  port: Number(process.env.PORT || 3001),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  rpcUrl: process.env.SEPOLIA_RPC_URL,
  privateKey: process.env.PRIVATE_KEY,

  mockUsdcAddress: process.env.MOCK_USDC_ADDRESS,
  vaultAddress: process.env.YIELD_VAULT_ADDRESS,
  bridgeSenderAddress: process.env.BRIDGE_SENDER_ADDRESS,
  bridgeReceiverAddress: process.env.BRIDGE_RECEIVER_ADDRESS,

  confirmations: Number(process.env.INDEXER_CONFIRMATIONS || 2),
  pollMs: Number(process.env.INDEXER_POLL_MS || 4000),
};
