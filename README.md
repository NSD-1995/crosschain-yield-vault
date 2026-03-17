# Cross-Chain Yield Vault Platform

A production-style DeFi platform implementing an ERC-4626 Yield Vault
with Cross-Chain Bridge Simulation, backend indexing infrastructure, and
a full-stack Web3 dashboard.

The system allows users to deposit tokens, earn simulated yield,
withdraw funds, and bridge assets across chains while providing
monitoring tools and admin controls.

---

# Project Overview

This project demonstrates how a modern Web3 application is structured
using:

- Smart contracts
- Backend indexing services
- A Web3 frontend dashboard
- Database monitoring
- DevOps infrastructure

The architecture separates on-chain asset custody from off-chain
monitoring and analytics.

---

# System Architecture

The platform consists of four primary layers:

1.  Frontend (Next.js Dashboard)
2.  Backend API (Node.js + Express)
3.  Smart Contracts (Solidity)
4.  Database (PostgreSQL)

User Wallet → Frontend → Backend API → PostgreSQL → Smart Contracts

---

# Data Flow

## Deposit Flow

User Wallet → Frontend UI → Smart Contract (deposit) → Blockchain Event
→ Backend Indexer → PostgreSQL → Frontend Dashboard Update

## Bridge Flow

User Bridge Request → Frontend UI → Backend API → Source Chain Bridge
Contract → Relayer Verification → Destination Chain Mint/Unlock →
Backend DB Update → Frontend Bridge Status Tracker

---

# Key Components

## Frontend

Built using Next.js + React.

Features: - Wallet connection (MetaMask) - Deposit / Withdraw UI -
Cross-chain bridge interface - Transaction lifecycle tracker - Admin
dashboard - Vault statistics

## Backend

Built using Node.js + Express.

Responsibilities: - Blockchain event indexing - Bridge transaction
APIs - Admin control APIs - Suspicious transaction detection - JWT-based
admin authentication

## Database

PostgreSQL is used for persistent storage.

Stores: - transactions - bridge_records - event_logs -
suspicious_activity

## Blockchain

ERC-4626 Yield Vault with: - deposit() - withdraw() - share minting -
simulated yield - emergency pause - role-based access

Bridge contracts support: - lock/burn on source chain - mint/unlock on
destination chain - nonce replay protection - signature validation

---

# Local Development Setup

## 1. Start Hardhat Node

cd contracts npx hardhat clean npx hardhat node

## 2. Deploy Contracts

Open another terminal:

cd contracts npm run deploy:local

## 3. Start Backend

cd backend npm install npm run dev

Backend runs on: http://localhost:5000

## 4. Start Frontend

cd frontend npm install npm run dev

Open: http://localhost:3000

---

# Demo Credentials

## User Account

Email: user@test.com\
Password: user123

Capabilities: - Deposit - Withdraw - Bridge - View vault stats

## Admin Account

Email: admin@test.com\
Password: admin123

Capabilities: - Pause / Unpause vault - Update deposit cap - Simulate
yield - View suspicious transactions

---

# Project Structure

crosschain-yield-vault │ ├── contracts ├── backend ├── frontend ├──
docker-compose.yml ├── docs └── README.md

---

# License

MIT License
