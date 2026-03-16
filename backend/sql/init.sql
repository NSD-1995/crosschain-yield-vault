CREATE TABLE IF NOT EXISTS chain_cursors (
  chain_name TEXT PRIMARY KEY,
  last_processed_block BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS processed_events (
  id SERIAL PRIMARY KEY,
  event_id TEXT UNIQUE NOT NULL,
  chain_name TEXT NOT NULL,
  contract_address TEXT NOT NULL,
  tx_hash TEXT NOT NULL,
  log_index INTEGER NOT NULL,
  block_number BIGINT NOT NULL,
  block_hash TEXT NOT NULL,
  event_name TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_positions (
  user_address TEXT PRIMARY KEY,
  asset_balance NUMERIC NOT NULL DEFAULT 0,
  share_balance NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vault_stats (
  id SERIAL PRIMARY KEY,
  tvl NUMERIC NOT NULL DEFAULT 0,
  total_shares NUMERIC NOT NULL DEFAULT 0,
  apy NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_address TEXT NOT NULL,
  tx_hash TEXT NOT NULL,
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  chain_name TEXT NOT NULL,
  status TEXT DEFAULT 'confirmed',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bridge_status (
  tx_hash TEXT PRIMARY KEY,
  user_address TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  nonce BIGINT NOT NULL,
  status TEXT NOT NULL,
  source_chain TEXT,
  destination_chain TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bridge_transfers (
  id SERIAL PRIMARY KEY,
  user_address TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  source_chain TEXT NOT NULL,
  destination_chain TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  nonce BIGINT,
  tx_hash TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);