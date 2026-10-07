# YABBAI Ω — Security Audit & Signer Boundary Protocol

## 1. Signer Security Boundaries

- **Zero Agent Private Keys**: Under no circumstances do autonomous agents have access to private keys or signing seeds. Agents construct `TransactionIntent` structures only.
- **Fail-Closed Execution**: If RPC is unverified, simulation fails, or policy boundaries are violated, execution stops immediately and fails closed.
- **Operator Autonomy**: Master wallet movements (withdrawals, high-value transfers) require Operator Phantom signature verification with explicit intent preview.

## 2. Dynamic Revenue Blocker Diagnostics

JARVIS continuously checks why revenue is not flowing through the system:
- `NO_CUSTOMER_ORDERS`: High traffic / low conversion or zero active buyers.
- `PAYMENT_UNVERIFIED`: In-flight transaction detected without final slot commitment.
- `RPC_UNAVAILABLE`: Network latency or cluster connectivity issue.
- `POLICY_BLOCKED`: Spend threshold or risk parameters exceeded.
- `CUSTOMER_FUNDS_PROTECTED`: Operational requests cannot access customer escrow partitions.
