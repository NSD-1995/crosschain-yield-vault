# Cross-Chain Yield Vault Platform

A **production-style DeFi platform** implementing an **ERC-4626 Yield Vault with Cross-Chain Bridge Simulation**, backend indexing infrastructure, and a full-stack Web3 dashboard.

The system enables users to:

- Deposit tokens into a vault
- Earn simulated yield
- Withdraw funds
- Bridge assets across chains
- Monitor transaction activity
- Use admin tools for protocol control

---

# Project Overview

This project demonstrates how a **modern Web3 application** is architected using multiple layers of infrastructure.

### Core Technologies Used

- Smart Contracts (Solidity)
- Backend Indexing Services
- Web3 Frontend Dashboard
- Database Monitoring
- DevOps Infrastructure

The architecture separates **on-chain asset custody** from **off-chain monitoring and analytics**, mirroring real production DeFi systems.

---

# System Architecture

The platform is structured into **four primary layers**:

1. Frontend Layer
2. Backend API Layer
3. Smart Contract Layer
4. Database Layer

### Architecture Flow

# Cross-Chain Yield Vault Platform

A **production-style DeFi platform** implementing an **ERC-4626 Yield Vault with Cross-Chain Bridge Simulation**, backend indexing infrastructure, and a full-stack Web3 dashboard.

The system enables users to:

- Deposit tokens into a vault
- Earn simulated yield
- Withdraw funds
- Bridge assets across chains
- Monitor transaction activity
- Use admin tools for protocol control

---

# Project Overview

This project demonstrates how a **modern Web3 application** is architected using multiple layers of infrastructure.

### Core Technologies Used

- Smart Contracts (Solidity)
- Backend Indexing Services
- Web3 Frontend Dashboard
- Database Monitoring
- DevOps Infrastructure

The architecture separates **on-chain asset custody** from **off-chain monitoring and analytics**, mirroring real production DeFi systems.

---

# System Architecture

The platform is structured into **four primary layers**:

1. Frontend Layer
2. Backend API Layer
3. Smart Contract Layer
4. Database Layer

### Architecture Flow

User Wallet
│
▼
Frontend (Next.js Dashboard)
│
▼
Backend API (Node.js + Express)
│
▼
PostgreSQL Database
│
▼
Smart Contracts (ERC-4626 Vault + Bridge)

---

# Data Flow

## Deposit Flow

User Wallet
│
▼
Frontend UI
│
▼
Smart Contract (Deposit)
│
▼
Blockchain Event
│
▼
Backend Indexer
│
▼
PostgreSQL Database
│
▼
Frontend Dashboard Update

---

## Bridge Flow

User Bridge Request
│
▼
Frontend UI
│
▼
Backend API
│
▼
Source Chain Bridge Contract
│
▼
Relayer Verifies Event
│
▼
Destination Chain Contract (Mint / Unlock)
│
▼
Backend Database Update
│
▼
Frontend Bridge Status Tracker

---

# Key Components

## Frontend

Built using **Next.js + React**.

### Features

- Wallet connection (MetaMask)
- Deposit / Withdraw interface
- Cross-chain bridge interface
- Transaction lifecycle tracking
- Admin monitoring dashboard
- Vault statistics display
- Backend health monitoring

### Frontend Structure

frontend/
├── dashboard
├── admin-panel
├── wallet-integration
├── vault-actions
└── bridge-ui

---

## Backend

Built using **Node.js + Express**.

### Responsibilities

- Blockchain event indexing
- Bridge transaction APIs
- Admin control APIs
- Transaction lifecycle tracking
- Suspicious transaction detection
- JWT-based admin authentication

### Backend Structure

backend/
├── api-routes
├── blockchain-indexer
├── bridge-service
├── admin-controllers
└── monitoring-services

---

## Database

**PostgreSQL** is used for persistent storage.

### Stored Data

- Transaction lifecycle records
- Bridge transaction records
- Blockchain event logs
- Suspicious activity alerts

### Example Tables

transactions
bridge_records
event_logs
suspicious_activity

---

# Blockchain Layer

## ERC-4626 Yield Vault

The vault implements the **ERC-4626 tokenized vault standard**.

### Features

- `deposit()`
- `withdraw()`
- Share minting
- Simulated yield accrual
- Deposit caps
- Emergency pause mechanism
- Role-based access control
- UUPS upgradeable smart contracts

---

## Cross-Chain Bridge Contracts

Bridge logic simulates asset transfers between chains.

### Bridge Mechanism

- Lock or burn tokens on source chain
- Mint or unlock tokens on destination chain
- Nonce-based replay protection
- Relayer signature validation
- Expiry-based bridge signatures

---

# Project Structure

crosschain-yield-vault
│
├── contracts
├── backend
├── frontend
├── docker-compose.yml
├── docs
└── README.md
