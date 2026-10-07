# YABBAI Ω — System Architecture & Hard Boundary Model

## 1. Executive Summary

YABBAI Ω is an Autonomous Machine Economy Operating System built on Solana. Its defining architectural invariant is the **Strict Separation between Internal Intelligence and External Economic Truth**:

```
                INTERNAL WORLD (Intelligence, Analytics & Planning)
─────────────────────────────────────────────────────────────────────────────────
JARVIS Orchestrator  •  Agent Fleet (21 Specialists)  •  Opportunity Engine
Predictions & Forecasts  •  Transaction Intents  •  Quotes & Simulations
                                        │
                                        ▼
                                 [NO MONEY YET]
                                        │
                EXTERNAL WORLD (Economic Settlement & Proof)
─────────────────────────────────────────────────────────────────────────────────
Customer / Machine Client  •  DEX Pool  •  Protocol Bounty
                                        │
                                        ▼
                            Solana Blockchain Settlement
                                        │
                                        ▼
                         RPC Observation & Transaction Parser
                                        │
                                        ▼
                         Independent Verifier (Evidence Hash)
                                        │
                                        ▼
                            VERIFIED EXTERNAL EVENT
                                        │
                                        ▼
                       Double-Entry Accounting Ledger
                                        │
                                        ▼
            REALIZED REVENUE  ─  REALIZED COSTS  =  REALIZED PROFIT
```

## 2. Core Engines & Data Flow

1. **Intelligence & Opportunities (`opportunities/engine.ts`)**: Generates hypotheses, DEX depth scans, and potential bounty vectors. Truth Class: `ESTIMATE`.
2. **x402 Machine Commerce (`products/x402Engine.ts`)**: Issues HTTP 402 Payment Challenges with real deliverables (Live RPC Wallet Forensics, Token Honeypot Audits). Settlement is confirmed exclusively via on-chain RPC parsing.
3. **Execution & Signing Queue (`execution/signingQueue.ts`)**: Submits transactions signed by operator Phantom or isolated signer. Moves through strictly enforced states: `CREATED` → `POLICY_CHECK` → `PREPARED` → `AWAITING_SIGNATURE` → `SIGNED` → `SUBMITTED` → `PROCESSED` → `CONFIRMED` → `FINALIZED` → `VERIFIED` → `ACCOUNTED`.
4. **Independent Ledger (`ledger.ts`)**: Only consumes `VerifiedExternalEconomicEvent` entries. Prevents internal activities or wallet appreciation from polluting realized profit.
5. **Segregated 8-Bucket Treasury (`treasury/compoundingEngine.ts`)**: Strictly isolates `CUSTOMER_FUNDS`, `OPERATING_CAPITAL`, `RESERVES`, `PROFIT`, `LIQUIDITY`, `PRODUCT_CAPITAL`, `OPERATOR_DISTRIBUTION`, and `UNATTRIBUTED`. Zero customer fund commingling.
