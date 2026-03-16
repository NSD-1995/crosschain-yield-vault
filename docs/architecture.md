                           ┌─────────────────────────┐
                           │        User Browser     │
                           │  (MetaMask / Wallet)   │
                           └─────────────┬──────────┘
                                         │
                                         │ HTTP / Web3
                                         ▼
                         ┌────────────────────────────────┐
                         │         Frontend (Next.js)     │
                         │  - Dashboard UI                │
                         │  - Deposit / Withdraw          │
                         │  - Bridge Interface            │
                         │  - Admin Panel                 │
                         │  - Transaction Tracker         │
                         └─────────────┬──────────────────┘
                                       │
                    REST API           │            Web3 RPC
                                       │
                                       ▼
                       ┌────────────────────────────────┐
                       │         Backend API (Node.js)  │
                       │                                │
                       │  - Transaction Indexer         │
                       │  - Bridge Initiation API       │
                       │  - Admin Controls              │
                       │  - Suspicious Tx Monitoring    │
                       │  - Event Listener              │
                       │  - JWT Admin Auth              │
                       └─────────────┬──────────────────┘
                                     │
                                     │ SQL
                                     ▼
                         ┌─────────────────────────┐
                         │       PostgreSQL DB     │
                         │                         │
                         │ - user_transactions     │
                         │ - bridge_records        │
                         │ - event_logs            │
                         │ - suspicious_activity   │
                         └─────────────┬──────────┘
                                       │
                                       │ Blockchain Events
                                       ▼
                     ┌──────────────────────────────────────┐
                     │          Smart Contracts             │
                     │                                      │
                     │  ERC4626 Yield Vault                 │
                     │  - deposit()                         │
                     │  - withdraw()                        │
                     │  - simulateYield()                   │
                     │  - pause/unpause                     │
                     │                                      │
                     │  Bridge Contracts                    │
                     │  - lock / burn                       │
                     │  - mint / unlock                     │
                     │  - nonce replay protection           │
                     │                                      │
                     └─────────────┬────────────────────────┘
                                   │
                                   │ Cross-chain relay
                                   ▼
                       ┌─────────────────────────────┐
                       │         Relayer Service     │
                       │                             │
                       │ - Verifies signatures       │
                       │ - Submits bridge tx        │
                       │ - Prevents replay          │
                       │ - Handles expiry           │
                       └─────────────┬──────────────┘
                                     │
                                     ▼
                       ┌─────────────────────────────┐
                       │   Destination Chain Vault   │
                       │  (Bridge Receiver Contract) │
                       └─────────────────────────────┘
