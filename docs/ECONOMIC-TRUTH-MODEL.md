# YABBAI Ω — Economic Truth Model & Invariant Rules

## 1. Immutable Economic Truth Classes

All financial, operational, and analytical data in YABBAI Ω carries an explicit, immutable classification:

- **`REAL` / `VERIFIED`**: Concrete economic value backed by independent on-chain cryptographic settlement or verified payment receipts.
- **`ESTIMATE`**: Algorithmic projections, expected value (EV) calculations, opportunity sizing, and pricing models.
- **`SIMULATION`**: Dry-run execution results and test-vector sandbox trials.
- **`UNVERIFIED`**: In-flight observations that have not reached final slot commitment or passed parser invariants.

## 2. The Absolute Invariants

1. **NO EXTERNAL ECONOMIC EVIDENCE = NO REAL REVENUE**
   - An internal database record cannot generate revenue.
   - An agent execution cycle cannot generate revenue.
   - A predicted yield cannot generate revenue.
   - An increase in token market valuation is `UNREALIZED_PNL` and NEVER `REALIZED_PROFIT`.

2. **REVENUE DOORWAY IS STRICTLY RESTRICTED**
   - Only a `VerifiedExternalEconomicEvent` emitted after on-chain parser verification can register gross revenue into the `REAL` ledger.

3. **REALIZED PROFIT FORMULA**
   $$\text{REALIZED\_PROFIT} = \text{VERIFIED\_REVENUE} - \text{VERIFIED\_ATTRIBUTABLE\_COSTS} - \text{ON\_CHAIN\_FEES} - \text{REFUNDS}$$

4. **UNATTRIBUTED INFLOW PROTECTION**
   - Direct deposits without a matching order or invoice ID are strictly classified as `UNATTRIBUTED_INFLOW` and cannot be recognized as profit or operating capital until attributed.

5. **CUSTOMER ESCROW ISOLATION**
   - Customer deposits are 100% segregated and protected from operational spending or risk-bearing liquidity positions.
