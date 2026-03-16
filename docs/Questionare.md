# Security & Architecture Considerations

## Security Assumptions

The system operates under the following assumptions:

- Admin private keys are securely stored and controlled.
- Backend JWT secret is protected and not exposed publicly.
- Relayer signer used for bridge operations is trusted.
- RPC providers used for blockchain interaction are reliable and available.

---

# Potential Attack Vectors

The system considers the following possible threats:

### 1. Bridge Replay Attack

An attacker attempts to reuse a previously valid bridge message to mint tokens again.

**Mitigation**

- Nonce protection
- Bridge transaction tracking
- Signature verification

---

### 2. Share Inflation / Rounding Exploit

Attackers attempt to manipulate share calculations to gain more vault shares.

**Mitigation**

- Safe math handling
- ERC-4626 share accounting checks
- Precision-aware calculations

---

### 3. Admin Privilege Abuse

An admin could attempt unauthorized actions such as manipulating caps or pausing the vault maliciously.

**Mitigation**

- Role based access control
- Admin action logging
- Potential multi-sig governance (future improvement)

---

# Scaling Bottlenecks

Potential system bottlenecks include:

### Blockchain Event Indexing Throughput

Large volumes of on-chain events could overwhelm the backend indexer.

### PostgreSQL Write Performance

Frequent event logging and transaction updates may create database write pressure.

---

# Mainnet Improvements

For production deployments the following improvements are recommended:

- **Multisig Admin Governance**  
  Replace single admin keys with multi-signature control.

- **Event Streaming Instead of Polling**  
  Use event subscriptions or message queues.

- **Distributed Indexer**  
  Horizontally scalable indexing services.

- **Relayer Decentralization**  
  Multiple relayers to prevent single point of failure.

---

# Monitoring Strategy

Production monitoring should include:

- RPC latency monitoring
- Backend service health
- Failed transaction rate
- Suspicious transaction alerts
- Bridge queue monitoring
- Database error tracking

### Recommended Monitoring Tools

- **Prometheus** – metrics collection
- **Grafana** – monitoring dashboards
- **Sentry** – error tracking
- **Cloud Logging** – centralized logging

---

# Tradeoffs: On-Chain vs Off-Chain Logic

| On-Chain            | Off-Chain              |
| ------------------- | ---------------------- |
| Trustless           | Flexible               |
| Highly secure       | Faster execution       |
| Expensive gas costs | Cheap computation      |
| Limited complexity  | Complex business logic |

The system keeps **asset custody and critical logic on-chain**, while **monitoring, indexing, and analytics are handled off-chain**.

---

# Project Structure
