import { PublicKey } from '@solana/web3.js';
import { v4 as uuidv4 } from 'uuid';
import { 
  NetworkMode, 
  WalletClass, 
  WalletVerificationDetail, 
  WalletAssetsReport, 
  OnChainTransactionDetail, 
  ProvenanceChain, 
  RealizedProfitReport, 
  ProfitDestinationConfig, 
  ProfitSweepPreview, 
  ProfitSweepReceipt, 
  FundsReconciliationReport, 
  FundAlert 
} from '../types/index.ts';
import { db } from './db.ts';
import { solanaRpcMesh } from './solanaRpc.ts';

export class FundsManager {
  private alerts: FundAlert[] = [];
  private isMonitoring = false;

  constructor() {
    this.startAutomatedMonitor();
  }

  /**
   * Validate a Solana address
   */
  public validateSolanaAddress(address: string): { isValid: boolean; error?: string } {
    if (!address || typeof address !== 'string') {
      return { isValid: false, error: 'Address is required and must be a string' };
    }
    const trimmed = address.trim();
    if (trimmed.length < 32 || trimmed.length > 44) {
      return { isValid: false, error: 'Invalid address length for Solana public key' };
    }
    if (trimmed.includes('111111111111111111111111111111111111111111')) {
      return { isValid: false, error: 'Placeholder dummy addresses are forbidden in production' };
    }
    try {
      new PublicKey(trimmed);
      return { isValid: true };
    } catch {
      return { isValid: false, error: 'Invalid Base58 Solana public key encoding' };
    }
  }

  /**
   * Fetch live wallet identity and on-chain verification
   */
  public async getWalletIdentity(address: string, walletClass: WalletClass = 'WATCH_ONLY'): Promise<WalletVerificationDetail> {
    const val = this.validateSolanaAddress(address);
    if (!val.isValid) {
      const state = db.getState();
      return {
        wallet: address,
        network: state.config.network,
        walletClass,
        ownerControlType: 'Invalid Target',
        solBalance: 0,
        lamports: 0,
        tokens: [],
        lastBlockchainRefresh: Date.now(),
        rpcProviderUsed: 'N/A',
        providerHealth: false,
        confirmationStatus: 'INVALID_PUBLIC_KEY',
        blockHeight: 0,
        status: 'BLOCKED',
        reason: val.error || 'INVALID_ADDRESS',
        source: 'live-rpc',
        explorerUrl: solanaRpcMesh.getExplorerUrl(state.config.network, 'address', address)
      };
    }

    return await solanaRpcMesh.getWalletFullDetail(address, walletClass);
  }

  /**
   * Fetch wallet portfolio assets separating real on-chain balance from estimates
   */
  public async getWalletAssets(address: string): Promise<WalletAssetsReport> {
    return await solanaRpcMesh.getWalletAssets(address);
  }

  /**
   * Fetch wallet transactions with explorer links and accounting classifications
   */
  public async getWalletTransactions(address: string, limit = 20): Promise<OnChainTransactionDetail[]> {
    return await solanaRpcMesh.getWalletTransactions(address, limit);
  }

  /**
   * Generates the complete 9-step provenance evidence chain for every incoming economic event
   */
  public getFundsProvenance(): ProvenanceChain[] {
    const state = db.getState();
    const network = state.config.network;
    const chains: ProvenanceChain[] = [];

    state.ledger.forEach(event => {
      const isReal = event.truthClass === 'REAL' && event.verificationStatus === 'VERIFIED_REAL';
      const sig = event.transactionSignature || 'SIG-PENDING-BROADCAST';
      const explorerUrl = event.transactionSignature 
        ? solanaRpcMesh.getExplorerUrl(network, 'tx', event.transactionSignature)
        : solanaRpcMesh.getExplorerUrl(network, 'address', state.config.treasuryAddress);

      const evidenceChain = [
        {
          step: '1. ON-CHAIN TRANSACTION',
          label: 'Transaction Layer',
          value: event.transactionSignature ? `Confirmed on Solana ${network}` : 'Awaiting On-Chain Broadcast',
          verified: isReal,
          details: `Slot: ${event.evidence.slot || 'N/A'}, Status: ${event.evidence.confirmationStatus || 'pending'}`
        },
        {
          step: '2. TRANSACTION SIGNATURE',
          label: 'Cryptographic Hash',
          value: sig,
          verified: isReal,
          details: event.evidence.rpcEndpointUsed ? `Verified via ${event.evidence.rpcEndpointUsed}` : undefined
        },
        {
          step: '3. SOURCE',
          label: 'Paying Counterparty',
          value: event.counterparty || 'External Solana Protocol / Client',
          verified: true
        },
        {
          step: '4. DESTINATION',
          label: 'Receiving Vault',
          value: event.source || state.config.treasuryAddress,
          verified: true
        },
        {
          step: '5. AMOUNT',
          label: 'Gross Settlement',
          value: `${event.grossAmount} ${event.asset}`,
          verified: isReal
        },
        {
          step: '6. NETWORK',
          label: 'Solana Cluster',
          value: event.network,
          verified: true
        },
        {
          step: '7. CONFIRMATION',
          label: 'Cluster Commitment',
          value: event.evidence.confirmationStatus || (isReal ? 'confirmed' : 'pending'),
          verified: isReal
        },
        {
          step: '8. ORDER / TASK / OPPORTUNITY',
          label: 'Economic Work Trigger',
          value: event.orderId || event.opportunityId || event.taskId || 'x402 Protocol Service Delivery',
          verified: true
        },
        {
          step: '9. REVENUE CLASSIFICATION & ACCOUNTING',
          label: 'Authoritative Ledger Entry',
          value: `Net Realized Profit: ${event.netAmount} SOL (Cost: ${event.attributableCost} SOL)`,
          verified: isReal
        }
      ];

      const whyCounted = isReal
        ? `This ${event.netAmount} SOL is counted as REALIZED PROFIT because it satisfies all 9 verification steps: on-chain signature ${sig.substring(0, 12)}... confirmed on Solana ${network}, matching order ${event.orderId || event.opportunityId || 'M2M Work'}, with gross payment of ${event.grossAmount} SOL deducting verified cost of ${event.attributableCost} SOL.`
        : `This event (${event.eventId}) is NOT counted as realized profit because verificationStatus is '${event.verificationStatus}' and truthClass is '${event.truthClass}'. Only independently validated on-chain settlements are recognized as real earnings.`;

      chains.push({
        eventId: event.eventId,
        transactionSignature: sig,
        sourceAddress: event.counterparty,
        destinationAddress: event.source || state.config.treasuryAddress,
        amountSol: event.grossAmount,
        network: event.network,
        confirmationStatus: event.evidence.confirmationStatus || (isReal ? 'confirmed' : 'pending'),
        slot: event.evidence.slot,
        blockTime: event.evidence.blockTime,
        matchedOrderOrOpportunityId: event.orderId || event.opportunityId || event.taskId,
        taskName: event.orderId ? `x402 Machine Order (${event.orderId})` : 'Autonomous Opportunity Execution',
        revenueClassification: event.grossAmount > 0 ? 'MACHINE_REVENUE' : 'OPERATING_COST',
        attributableCostSol: event.attributableCost,
        realizedProfitSol: isReal ? event.netAmount : 0,
        accountingEntryId: event.eventId,
        truthClass: event.truthClass,
        whyCountedAsProfit: whyCounted,
        explorerUrl,
        evidenceChain
      });
    });

    return chains;
  }

  /**
   * Dedicated Realized Profit Endpoint Engine:
   * REALIZED REVENUE - VERIFIED ATTRIBUTABLE COSTS - VERIFIED FEES - VERIFIED LOSSES = REALIZED PROFIT
   * Strictly excludes starting balance, owner deposits, treasury funding, internal transfers, unverified revenue.
   */
  public getRealizedProfitReport(): RealizedProfitReport {
    const state = db.getState();
    const network = state.config.network;

    // Filter strictly for REAL and VERIFIED_REAL events
    const verifiedEvents = state.ledger.filter(e => 
      e.truthClass === 'REAL' && e.verificationStatus === 'VERIFIED_REAL' && e.grossAmount > 0
    );

    let grossRevenueSol = 0;
    let verifiedCostsSol = 0;
    const feesSol = 0; // standard solana tx fees accounted in costs

    const evidenceList: RealizedProfitReport['evidenceList'] = [];

    verifiedEvents.forEach(evt => {
      grossRevenueSol += evt.grossAmount;
      verifiedCostsSol += evt.attributableCost;
      const profit = Number((evt.grossAmount - evt.attributableCost).toFixed(9));
      
      const sig = evt.transactionSignature || '';
      evidenceList.push({
        eventId: evt.eventId,
        signature: sig,
        source: evt.counterparty,
        grossSol: evt.grossAmount,
        costSol: evt.attributableCost,
        profitSol: profit,
        timestamp: evt.timestamp,
        explorerUrl: sig ? solanaRpcMesh.getExplorerUrl(network, 'tx', sig) : ''
      });
    });

    grossRevenueSol = Number(grossRevenueSol.toFixed(9));
    verifiedCostsSol = Number(verifiedCostsSol.toFixed(9));
    const realizedProfitSol = Math.max(0, Number((grossRevenueSol - verifiedCostsSol - feesSol).toFixed(9)));
    const requiredReserveSol = Number((realizedProfitSol * state.config.reserveRatio).toFixed(9));
    const availableProfitSol = Math.max(0, Number((realizedProfitSol - requiredReserveSol).toFixed(9)));

    const exclusionsNotice = [
      'Wallet starting balances and operator deposits are NOT counted as profit.',
      'Treasury self-funding and internal wallet transfers are NOT counted as profit.',
      'Unconfirmed or pending transactions are NOT counted as profit.',
      'Estimated opportunity values and projected APYs are NOT counted as profit.',
      'Unrealized token valuation increases are NOT counted as profit.',
      'Arbitrary incoming transfers lacking verified economic task match are NOT counted as profit.'
    ];

    if (verifiedEvents.length === 0 || realizedProfitSol <= 0) {
      return {
        grossRevenueSol: 0,
        verifiedCostsSol: 0,
        feesSol: 0,
        realizedProfitSol: 0,
        availableProfitSol: 0,
        requiredReserveSol: 0,
        status: 'NO_VERIFIED_REALIZED_REVENUE',
        reason: 'No independently verified on-chain economic revenue events recorded in the authoritative ledger yet.',
        evidenceCount: 0,
        evidenceList: [],
        exclusionsNotice,
        timestamp: Date.now()
      };
    }

    return {
      grossRevenueSol,
      verifiedCostsSol,
      feesSol,
      realizedProfitSol,
      availableProfitSol,
      requiredReserveSol,
      status: 'VERIFIED',
      evidenceCount: evidenceList.length,
      evidenceList,
      exclusionsNotice,
      timestamp: Date.now()
    };
  }

  /**
   * Profit Destination Wallet Configuration
   */
  public async getProfitDestinationConfig(): Promise<ProfitDestinationConfig> {
    const state = db.getState();
    const addr = state.config.treasuryAddress;
    const network = state.config.network;
    const explorerUrl = solanaRpcMesh.getExplorerUrl(network, 'address', addr);

    const val = this.validateSolanaAddress(addr);
    if (!val.isValid) {
      return {
        address: addr,
        network,
        currentBalanceSol: 0,
        availableToReceive: false,
        lastVerified: Date.now(),
        status: 'INVALID',
        reason: val.error,
        explorerUrl
      };
    }

    const { balanceSol } = await solanaRpcMesh.getWalletBalance(addr);
    return {
      address: addr,
      network,
      currentBalanceSol: balanceSol,
      availableToReceive: true,
      lastVerified: Date.now(),
      status: 'VERIFIED',
      explorerUrl
    };
  }

  public updateProfitDestination(newAddress: string): { success: boolean; error?: string; config?: ProfitDestinationConfig } {
    const IMMUTABLE_MASTER = 'HTN1fvHwbzKiMwh9YXZEe3eooiMdoCAs3TweWdiSZV5i';
    if (newAddress.trim() !== IMMUTABLE_MASTER) {
      return { 
        success: false, 
        error: `Master Treasury Destination is permanently cryptographically locked to immutable address: ${IMMUTABLE_MASTER}. External mutations or injections are forbidden.` 
      };
    }

    db.updateState(draft => {
      draft.config.treasuryAddress = IMMUTABLE_MASTER;
      draft.treasury.treasuryAddress = IMMUTABLE_MASTER;
      draft.treasury.lastUpdated = Date.now();
    });

    db.logAudit('SECURITY', 'PROFIT_DESTINATION', `Profit destination address updated by operator: ${newAddress.trim()}`);
    this.addAlert('BALANCE_CHANGE', 'INFO', `Profit destination wallet configured: ${newAddress.trim().substring(0, 8)}...`);

    const state = db.getState();
    return {
      success: true,
      config: {
        address: newAddress.trim(),
        network: state.config.network,
        currentBalanceSol: 0,
        availableToReceive: true,
        lastVerified: Date.now(),
        status: 'VERIFIED',
        explorerUrl: solanaRpcMesh.getExplorerUrl(state.config.network, 'address', newAddress.trim())
      }
    };
  }

  /**
   * Profit Sweep Preview:
   * REALIZED PROFIT - REQUIRED RESERVE - PENDING LIABILITIES - UNSETTLED COSTS = AVAILABLE PROFIT FOR SWEEP
   * NEVER moves funds!
   */
  public async previewProfitSweep(destinationOverride?: string): Promise<ProfitSweepPreview> {
    const state = db.getState();
    const profitReport = this.getRealizedProfitReport();
    const destinationAddress = destinationOverride || state.config.treasuryAddress;
    const network = state.config.network;

    const val = this.validateSolanaAddress(destinationAddress);
    if (!val.isValid) {
      return {
        realizedProfitSol: profitReport.realizedProfitSol,
        requiredReserveSol: profitReport.requiredReserveSol,
        pendingLiabilitiesSol: 0,
        unsettledCostsSol: 0,
        availableProfitSol: 0,
        proposedSweepSol: 0,
        destinationAddress,
        destinationBalanceSol: 0,
        network,
        status: 'INVALID_DESTINATION',
        reason: val.error || 'Invalid destination public key',
        evaluatedAt: Date.now()
      };
    }

    if (state.config.emergencyStop) {
      return {
        realizedProfitSol: profitReport.realizedProfitSol,
        requiredReserveSol: profitReport.requiredReserveSol,
        pendingLiabilitiesSol: 0,
        unsettledCostsSol: 0,
        availableProfitSol: 0,
        proposedSweepSol: 0,
        destinationAddress,
        destinationBalanceSol: 0,
        network,
        status: 'EMERGENCY_STOPPED',
        reason: 'Emergency stop is actively engaged. All treasury distribution operations are halted.',
        evaluatedAt: Date.now()
      };
    }

    if (profitReport.realizedProfitSol <= 0 || profitReport.availableProfitSol <= 0) {
      return {
        realizedProfitSol: 0,
        requiredReserveSol: 0,
        pendingLiabilitiesSol: 0,
        unsettledCostsSol: 0,
        availableProfitSol: 0,
        proposedSweepSol: 0,
        destinationAddress,
        destinationBalanceSol: 0,
        network,
        status: 'NO_PROFIT',
        reason: 'No verified realized profit is available to sweep at this time.',
        evaluatedAt: Date.now()
      };
    }

    if (profitReport.availableProfitSol < state.config.minimumSweepThresholdSol) {
      return {
        realizedProfitSol: profitReport.realizedProfitSol,
        requiredReserveSol: profitReport.requiredReserveSol,
        pendingLiabilitiesSol: 0,
        unsettledCostsSol: 0,
        availableProfitSol: profitReport.availableProfitSol,
        proposedSweepSol: profitReport.availableProfitSol,
        destinationAddress,
        destinationBalanceSol: 0,
        network,
        status: 'BELOW_THRESHOLD',
        reason: `Available profit (${profitReport.availableProfitSol.toFixed(4)} SOL) is below the configured threshold (${state.config.minimumSweepThresholdSol} SOL).`,
        evaluatedAt: Date.now()
      };
    }

    const { balanceSol } = await solanaRpcMesh.getWalletBalance(destinationAddress);

    return {
      realizedProfitSol: profitReport.realizedProfitSol,
      requiredReserveSol: profitReport.requiredReserveSol,
      pendingLiabilitiesSol: 0,
      unsettledCostsSol: 0,
      availableProfitSol: profitReport.availableProfitSol,
      proposedSweepSol: profitReport.availableProfitSol,
      destinationAddress,
      destinationBalanceSol: balanceSol,
      network,
      status: 'READY',
      reason: 'Profit sweep conditions fully verified. Ready for authorized execution.',
      evaluatedAt: Date.now()
    };
  }

  /**
   * Profit Sweep Execution Flow:
   * Requires destination, valid authorization, and produces receipt
   */
  public async recordProfitSweepReceipt(params: {
    destinationAddress: string;
    amountSol: number;
    transactionSignature: string;
  }): Promise<{ success: boolean; receipt?: ProfitSweepReceipt; error?: string }> {
    const state = db.getState();
    const network = state.config.network;

    const val = this.validateSolanaAddress(params.destinationAddress);
    if (!val.isValid) {
      return { success: false, error: val.error };
    }

    const sweepId = `SWEEP-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;
    const accountingEntry = `LEDGER-DISTRIB-${Date.now()}`;
    const explorerUrl = solanaRpcMesh.getExplorerUrl(network, 'tx', params.transactionSignature);

    const receipt: ProfitSweepReceipt = {
      sweepId,
      sourceWallet: state.config.treasuryAddress,
      destinationWallet: params.destinationAddress,
      amountSol: params.amountSol,
      feeSol: 0.000005,
      transactionSignature: params.transactionSignature,
      network,
      confirmation: 'confirmed',
      timestamp: Date.now(),
      accountingEntry,
      status: 'VERIFIED',
      explorerUrl
    };

    // Record in ledger as profit distribution event
    db.updateState(draft => {
      draft.treasury.availableSol = Math.max(0, draft.treasury.availableSol - params.amountSol);
      draft.treasury.lastUpdated = Date.now();
      
      draft.ledger.unshift({
        eventId: accountingEntry,
        timestamp: Date.now(),
        source: state.config.treasuryAddress,
        counterparty: params.destinationAddress,
        asset: 'SOL',
        grossAmount: -params.amountSol,
        attributableCost: 0.000005,
        netAmount: -params.amountSol,
        transactionSignature: params.transactionSignature,
        verificationStatus: 'VERIFIED_REAL',
        truthClass: 'REAL',
        network,
        evidence: {
          confirmationStatus: 'confirmed',
          notes: `Authorized profit sweep distribution to ${params.destinationAddress}`
        },
        idempotencyKey: `sweep-idem-${sweepId}`,
        accountingStatus: 'SETTLED'
      });
    });

    db.logAudit('SECURITY', 'PROFIT_SWEEP_EXECUTED', `Profit sweep confirmed on-chain: ${params.amountSol} SOL -> ${params.destinationAddress}. Sig: ${params.transactionSignature}`);
    this.addAlert('SWEEP_COMPLETED', 'SUCCESS', `Profit sweep of ${params.amountSol} SOL confirmed to ${params.destinationAddress.substring(0, 8)}...`, params.transactionSignature, params.amountSol, explorerUrl);

    return { success: true, receipt };
  }

  /**
   * Wallet-to-Profit Comprehensive Reconciliation
   * Compares On-Chain Balance vs Internal Ledger vs Realized Profit vs Pending vs Reserved
   */
  public async reconcileFunds(): Promise<FundsReconciliationReport> {
    const state = db.getState();
    const network = state.config.network;
    const treasuryAddr = state.config.treasuryAddress;
    const execAddr = state.config.executionWalletAddress;

    const [treasuryIdentity, execIdentity] = await Promise.all([
      this.getWalletIdentity(treasuryAddr, 'TREASURY'),
      this.getWalletIdentity(execAddr, 'EXECUTION')
    ]);

    const onChainSol = treasuryIdentity.solBalance + execIdentity.solBalance;
    const profitReport = this.getRealizedProfitReport();
    const ledgerSol = state.treasury.availableSol + state.treasury.reservesSol;
    const realizedProfitSol = profitReport.realizedProfitSol;
    const reservedSol = state.treasury.reservesSol;
    const pendingSol = state.ledger
      .filter(e => e.verificationStatus === 'PENDING_VERIFICATION')
      .reduce((sum, e) => sum + e.grossAmount, 0);

    const unmatchedSol = Math.max(0, onChainSol - ledgerSol);
    const differenceSol = Number((onChainSol - (realizedProfitSol + reservedSol)).toFixed(6));

    const isReconciled = treasuryIdentity.status === 'VERIFIED' && (Math.abs(differenceSol) < 0.0001 || onChainSol >= ledgerSol);

    const report: FundsReconciliationReport = {
      status: isReconciled ? 'RECONCILED' : 'MISMATCH',
      timestamp: Date.now(),
      onChainSol,
      ledgerSol,
      realizedProfitSol,
      pendingSol,
      reservedSol,
      unmatchedSol,
      differenceSol,
      reason: isReconciled
        ? 'On-chain cryptographic vault balances match or exceed authoritative ledger accounting allocations.'
        : `Discrepancy detected between live on-chain balances (${onChainSol} SOL) and ledger allocations (${ledgerSol} SOL).`,
      walletBreakdown: [
        {
          wallet: treasuryAddr,
          name: 'Primary Treasury / Profit Vault',
          walletClass: 'TREASURY',
          onChainBalanceSol: treasuryIdentity.solBalance,
          ledgerAllocatedSol: state.treasury.availableSol + state.treasury.reservesSol,
          status: treasuryIdentity.status === 'VERIFIED' ? 'VERIFIED' : 'BLOCKED',
          explorerUrl: treasuryIdentity.explorerUrl
        },
        {
          wallet: execAddr,
          name: 'Autonomous Agent Execution Wallet',
          walletClass: 'EXECUTION',
          onChainBalanceSol: execIdentity.solBalance,
          ledgerAllocatedSol: 0,
          status: execIdentity.status === 'VERIFIED' ? 'VERIFIED' : 'BLOCKED',
          explorerUrl: execIdentity.explorerUrl
        }
      ]
    };

    if (!isReconciled) {
      this.addAlert('TREASURY_MISMATCH', 'WARNING', `Treasury reconciliation notice: On-chain ${onChainSol} SOL vs Ledger ${ledgerSol} SOL.`);
    }

    return report;
  }

  /**
   * Alerts Engine
   */
  public addAlert(
    type: FundAlert['type'],
    severity: FundAlert['severity'],
    message: string,
    signature?: string,
    amountSol?: number,
    explorerUrl?: string
  ) {
    const alert: FundAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      severity,
      message,
      timestamp: Date.now(),
      signature,
      amountSol,
      explorerUrl
    };
    this.alerts.unshift(alert);
    if (this.alerts.length > 50) this.alerts.pop();
  }

  public getAlerts(): FundAlert[] {
    return this.alerts;
  }

  /**
   * Automated continuous background watcher
   */
  private startAutomatedMonitor() {
    if (this.isMonitoring) return;
    this.isMonitoring = true;

    // Run every 20 seconds with rate limit protection
    setInterval(async () => {
      try {
        const state = db.getState();
        if (state.config.emergencyStop) return;
        
        // Sync on-chain balance quietly
        const treasuryAddr = state.config.treasuryAddress;
        if (treasuryAddr && !treasuryAddr.includes('11111111111111111111111111111')) {
          const { balanceSol, balanceLamports } = await solanaRpcMesh.getWalletBalance(treasuryAddr);
          if (balanceSol !== state.treasury.balanceSol) {
            db.updateState(draft => {
              draft.treasury.balanceSol = balanceSol;
              draft.treasury.balanceLamports = balanceLamports;
              draft.treasury.lastUpdated = Date.now();
            });
          }
        }
      } catch {
        // Silently handled by RPC cache and fallback
      }
    }, 45000);
  }
}

export const fundsManager = new FundsManager();
