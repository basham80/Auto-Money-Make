import { db } from '../db.ts';
import { solanaRpcMesh } from '../solanaRpc.ts';
import { economicLedger } from '../ledger.ts';
import { agentWalletEngine } from '../agents/agentWallets.ts';
import { signingQueueEngine } from './signingQueue.ts';

export class TransactionWatcher {
  private isWatching = false;
  private timer: NodeJS.Timeout | null = null;

  public start(intervalMs = 30000) {
    if (this.isWatching) return;
    this.isWatching = true;
    this.timer = setInterval(() => {
      this.pollCycle().catch(() => {});
    }, intervalMs);
    console.log('[Watcher] Solana Cluster Continuous Watcher active (30s interval).');
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isWatching = false;
  }

  private async pollCycle() {
    const state = db.getState();
    const mainWallet = state.config.treasuryAddress;

    // 1. Live Balance Sync for Main Treasury
    const balInfo = await solanaRpcMesh.getWalletBalance(mainWallet);
    const balanceSol = balInfo.balanceSol;
    const balanceLamports = balInfo.balanceLamports;

    // Update treasury state with real on-chain balance
    const summary = economicLedger.getEconomicSummary();
    const reservedSol = Math.max(0.01, balanceSol * state.config.reserveRatio);
    const availableSol = Math.max(0, balanceSol - reservedSol);

    db.updateState(draft => {
      draft.treasury.balanceSol = balanceSol;
      draft.treasury.balanceLamports = balanceLamports;
      draft.treasury.reservesSol = reservedSol;
      draft.treasury.availableSol = availableSol;
      draft.treasury.realizedProfitSol = summary.real.realizedProfitSol;
      draft.treasury.lifetimeRevenueSol = summary.real.grossRevenueSol;
      draft.treasury.lifetimeCostSol = summary.real.attributableCostSol;
      draft.treasury.lastUpdated = Date.now();
    });

    // 2. Fetch Latest Transactions on cluster
    const txs = await solanaRpcMesh.getWalletTransactions(mainWallet, 10);
    const knownSignatures = new Set(state.ledger.map(l => l.transactionSignature).filter(Boolean));

    for (const tx of txs) {
      if (!knownSignatures.has(tx.signature) && tx.amountSol > 0) {
        // Classify incoming transaction
        let classification: 'CUSTOMER_REVENUE' | 'AGENT_PROFIT_SWEEP' | 'OWNER_FUNDING' | 'INTERNAL_TRANSFER' | 'UNKNOWN_INBOUND' = 'UNKNOWN_INBOUND';
        
        // Check if from known agent wallet
        const agentWallets = agentWalletEngine.getAgentWallets();
        const matchedAgent = agentWallets.find(w => w.publicAddress === tx.sender);

        if (matchedAgent) {
          classification = 'AGENT_PROFIT_SWEEP';
        }

        // Record in ledger
        economicLedger.recordEvent({
          network: state.config.network || 'MAINNET',
          source: tx.sender,
          counterparty: tx.recipient,
          asset: 'SOL',
          grossAmount: tx.amountSol,
          attributableCost: tx.feeSol,
          transactionSignature: tx.signature,
          verificationStatus: 'VERIFIED_REAL',
          truthClass: 'REAL',
          evidence: {
            slot: tx.slot,
            blockTime: tx.blockTime,
            confirmationStatus: tx.confirmation,
            notes: `Watcher auto-classified: ${classification}`
          },
          idempotencyKey: `WATCHER-${tx.signature}`
        });

        db.logAudit('INFO', 'TRANSACTION_WATCHER', `Discovered & classified incoming tx: ${tx.signature} (${classification}, ${tx.amountSol} SOL)`);
      }
    }
  }
}

export const transactionWatcher = new TransactionWatcher();
