export * from './omega.ts';

export type TruthClass = 
  | 'REAL' 
  | 'VERIFIED'
  | 'ESTIMATE' 
  | 'ESTIMATED'
  | 'SIMULATION' 
  | 'PENDING' 
  | 'BLOCKED' 
  | 'FAILED' 
  | 'NOT_CONFIGURED';

export type WalletClass = 
  | 'OPERATOR' 
  | 'TREASURY' 
  | 'EXECUTION' 
  | 'REVENUE' 
  | 'WATCH_ONLY';

export type NetworkMode = 'MAINNET' | 'DEVNET' | 'TESTNET' | 'SIMULATION';

export interface WalletVerificationDetail {
  wallet: string;
  network: NetworkMode;
  walletClass: WalletClass;
  ownerControlType: string;
  solBalance: number;
  lamports: number;
  tokens: Array<{
    mint: string;
    symbol?: string;
    name?: string;
    quantity: number;
    decimals: number;
    rawAmount: string;
    estimatedUsdValue?: number;
    valuationTimestamp?: number;
    valuationSource?: string;
  }>;
  lastBlockchainRefresh: number;
  rpcProviderUsed: string;
  providerHealth: boolean;
  confirmationStatus: string;
  blockHeight: number;
  latestBlockhash?: string;
  latestSignature?: string;
  status: 'VERIFIED' | 'BLOCKED' | 'NOT_CONFIGURED';
  reason?: string;
  source: 'live-rpc';
  explorerUrl: string;
}

export interface WalletAssetsReport {
  wallet: string;
  network: NetworkMode;
  solBalance: number;
  lamports: number;
  tokens: Array<{
    mint: string;
    symbol?: string;
    name?: string;
    quantity: number;
    decimals: number;
    rawAmount: string;
    estimatedUsdValue?: number;
    valuationTimestamp?: number;
    valuationSource?: string;
  }>;
  lastUpdated: number;
  source: 'live-rpc';
  status: 'VERIFIED' | 'BLOCKED';
  reason?: string;
  explorerUrl: string;
}

export interface OnChainTransactionDetail {
  signature: string;
  slot: number;
  blockTime: number;
  status: 'CONFIRMED' | 'FINALIZED' | 'FAILED';
  feeLamports: number;
  feeSol: number;
  sender: string;
  recipient: string;
  asset: string;
  amountSol: number;
  instructionProgram: string;
  confirmation: 'processed' | 'confirmed' | 'finalized';
  detectedEconomicEventId?: string;
  accountingClassification: 'REVENUE' | 'COST' | 'PROFIT_SWEEP' | 'INTERNAL_TRANSFER' | 'UNMATCHED_DEPOSIT' | 'OPERATING_EXPENSE';
  truthClass: TruthClass;
  explorerUrl: string;
}

export interface ProvenanceChain {
  eventId: string;
  transactionSignature: string;
  sourceAddress: string;
  destinationAddress: string;
  amountSol: number;
  network: NetworkMode;
  confirmationStatus: string;
  slot?: number;
  blockTime?: number;
  matchedOrderOrOpportunityId?: string;
  taskName?: string;
  revenueClassification: string;
  attributableCostSol: number;
  realizedProfitSol: number;
  accountingEntryId: string;
  truthClass: TruthClass;
  whyCountedAsProfit: string;
  explorerUrl: string;
  evidenceChain: Array<{
    step: string;
    label: string;
    value: string;
    verified: boolean;
    details?: string;
  }>;
}

export interface EconomicLedgerSummary {
  real: {
    grossRevenueSol: number;
    attributableCostSol: number;
    realizedProfitSol: number;
    eventCount: number;
  };
  pending: {
    expectedGrossSol: number;
    estimatedCostSol: number;
    pendingNetSol: number;
    eventCount: number;
  };
  estimate: {
    estimatedGrossSol: number;
    estimatedNetSol: number;
    eventCount: number;
  };
  simulation: {
    simulatedGrossSol: number;
    simulatedCostSol: number;
    simulatedProfitSol: number;
    eventCount: number;
  };
}

export interface RealizedProfitReport {
  grossRevenueSol: number;
  verifiedCostsSol: number;
  feesSol: number;
  realizedProfitSol: number;
  availableProfitSol: number;
  requiredReserveSol: number;
  status: 'VERIFIED' | 'BLOCKED' | 'NO_VERIFIED_REALIZED_REVENUE';
  reason?: string;
  evidenceCount: number;
  evidenceList: Array<{
    eventId: string;
    signature: string;
    source: string;
    grossSol: number;
    costSol: number;
    profitSol: number;
    timestamp: number;
    explorerUrl: string;
  }>;
  exclusionsNotice: string[];
  timestamp: number;
}

export interface ProfitDestinationConfig {
  address: string;
  network: NetworkMode;
  currentBalanceSol: number;
  availableToReceive: boolean;
  lastVerified: number;
  status: 'VERIFIED' | 'INVALID' | 'NOT_CONFIGURED';
  reason?: string;
  explorerUrl: string;
}

export interface ProfitSweepPreview {
  realizedProfitSol: number;
  requiredReserveSol: number;
  pendingLiabilitiesSol: number;
  unsettledCostsSol: number;
  availableProfitSol: number;
  proposedSweepSol: number;
  destinationAddress: string;
  destinationBalanceSol: number;
  network: NetworkMode;
  status: 'READY' | 'BELOW_THRESHOLD' | 'NO_PROFIT' | 'INVALID_DESTINATION' | 'EMERGENCY_STOPPED';
  reason: string;
  evaluatedAt: number;
}

export interface ProfitSweepReceipt {
  sweepId: string;
  sourceWallet: string;
  destinationWallet: string;
  amountSol: number;
  feeSol: number;
  transactionSignature: string;
  network: NetworkMode;
  confirmation: 'confirmed' | 'finalized';
  timestamp: number;
  accountingEntry: string;
  status: 'VERIFIED';
  explorerUrl: string;
}

export interface FundsReconciliationReport {
  status: 'RECONCILED' | 'MISMATCH';
  timestamp: number;
  onChainSol: number;
  ledgerSol: number;
  realizedProfitSol: number;
  pendingSol: number;
  reservedSol: number;
  unmatchedSol: number;
  differenceSol: number;
  reason: string;
  walletBreakdown: Array<{
    wallet: string;
    name: string;
    walletClass: WalletClass;
    onChainBalanceSol: number;
    ledgerAllocatedSol: number;
    status: 'VERIFIED' | 'BLOCKED' | 'PENDING';
    explorerUrl: string;
  }>;
}

export interface FundAlert {
  id: string;
  type: 'INCOMING_PAYMENT' | 'VERIFIED_REVENUE' | 'VERIFIED_PROFIT' | 'FAILED_PAYMENT' | 'UNMATCHED_DEPOSIT' | 'BALANCE_CHANGE' | 'TREASURY_MISMATCH' | 'SWEEP_COMPLETED' | 'SWEEP_FAILED' | 'RPC_FAILURE' | 'PROVIDER_DISAGREEMENT';
  severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
  message: string;
  timestamp: number;
  signature?: string;
  amountSol?: number;
  explorerUrl?: string;
}

export interface LedgerEvent {
  eventId: string;
  timestamp: number;
  source: string;
  counterparty: string;
  opportunityId?: string;
  orderId?: string;
  taskId?: string;
  asset: 'SOL' | 'USDC' | 'LAMPORT';
  grossAmount: number;
  attributableCost: number;
  netAmount: number;
  transactionSignature?: string;
  verificationStatus: 'VERIFIED_REAL' | 'PENDING_VERIFICATION' | 'UNVERIFIED' | 'FAILED_CHECK' | 'PENDING_ONCHAIN_SETTLEMENT' | 'MEMO_ANCHORED_ONCHAIN' | 'COMPLETED_OFFCHAIN';
  truthClass: TruthClass;
  network: NetworkMode;
  evidence: {
    transactionSignature?: string;
    rpcEndpointUsed?: string;
    slot?: number;
    blockTime?: number;
    confirmationStatus?: 'processed' | 'confirmed' | 'finalized';
    memo?: string;
    sha256Proof?: string;
    notes?: string;
    recipient?: string;
    sender?: string;
    destinationWallet?: string;
    settlementRoute?: string;
    confirmationCount?: number;
    confirmationStages?: string[];
    trustedWithdrawal?: boolean;
    signatures?: string[];
    stageSignatures?: {
      stage1?: string;
      stage2?: string;
      stage3?: string;
    };
  };
  idempotencyKey: string;
  accountingStatus: 'SETTLED' | 'PENDING' | 'RECONCILED' | 'DISPUTED' | 'REAL_ON_CHAIN_DEPOSIT' | 'REAL_ON_CHAIN_WITHDRAWAL';
}

export interface TreasuryState {
  balanceLamports: number;
  balanceSol: number;
  reservesSol: number;
  pendingSol: number;
  availableSol: number;
  realizedProfitSol: number;
  lifetimeRevenueSol: number;
  lifetimeCostSol: number;
  network: NetworkMode;
  treasuryAddress: string;
  executionWalletAddress: string;
  emergencyStopActive: boolean;
  lastUpdated: number;
}

export type AgentRole = 
  | 'DISCOVERY'
  | 'MARKET_RESEARCH'
  | 'OPPORTUNITY_SCORING'
  | 'PRICING'
  | 'EXECUTION'
  | 'DATA_TRANSFORMATION'
  | 'QUANT_RESEARCH'
  | 'CUSTOMER_SERVICE'
  | 'PRODUCT_DELIVERY'
  | 'PAYMENT_VERIFICATION'
  | 'ACCOUNTING_LEDGER'
  | 'RECONCILIATION'
  | 'TREASURY'
  | 'SECURITY_RISK'
  | 'RISK_GATEKEEPER'
  | 'QA_INSPECTOR'
  | 'CANARY_TESTING'
  | 'TELEMETRY_OBSERVER'
  | 'MARGIN_OPTIMIZER'
  | 'STRATEGY_COORDINATOR'
  | 'JARVIS_SELF_IMPROVEMENT';

export type AgentState = 
  | 'IDLE'
  | 'DISCOVERING'
  | 'EVALUATING'
  | 'EXECUTING'
  | 'VERIFYING'
  | 'WAITING_PAYMENT'
  | 'RECONCILING'
  | 'LEARNING'
  | 'BLOCKED'
  | 'FAILED'
  | 'STOPPED';

export interface AgentInfo {
  id: string;
  name: string;
  role: AgentRole;
  state: AgentState;
  capabilities: string[];
  permissions: string[];
  maxHourlyBudgetSol: number;
  rateLimitPerMinute: number;
  allowedConnectors: string[];
  currentTask?: string;
  tasksCompleted: number;
  tasksFailed: number;
  lastHeartbeat: number;
  uptimeSeconds: number;
  riskClass: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  provider: string;
  category: 'ZERO_CAPITAL' | 'M2M_PRODUCT' | 'DATA_BOUNTY' | 'ONCHAIN_TASK' | 'DEFI_AUDIT';
  capitalRequiredSol: number;
  capitalAvailableSol: number;
  capitalGapSol: number;
  upfrontCostSol: number;
  expectedRevenueSol: number;
  expectedNetSol: number;
  probabilityOfSuccess: number;
  expectedValueSol: number;
  worstCaseLossSol: number;
  confidenceScore: number;
  riskLevel: 'ZERO' | 'LOW' | 'MEDIUM' | 'HIGH';
  deadlineMs: number;
  truthClass: TruthClass;
  status: 'DISCOVERED' | 'EVALUATED' | 'ACCEPTED' | 'EXECUTING' | 'PROOF_SUBMITTED' | 'PAID' | 'RECONCILED' | 'REJECTED' | 'EXPIRED';
  assignedAgentId?: string;
  evidence?: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

export interface MachineProduct {
  productId: string;
  name: string;
  description: string;
  priceSol: number;
  currency: 'SOL' | 'USDC';
  slaSeconds: number;
  deliveryFormat: 'JSON' | 'MARKDOWN' | 'STREAM' | 'SIGNED_BLOB';
  schemaDefinition: Record<string, unknown>;
  isAvailable: boolean;
  totalOrders: number;
  verifiedRevenueSol: number;
  executionRequirements: string[];
}

export interface X402Challenge {
  challengeId: string;
  productId: string;
  requiredAmountSol: number;
  recipientAddress: string;
  asset: 'SOL' | 'USDC';
  network: NetworkMode;
  expiresAt: number;
  idempotencyKey: string;
  status: 'PENDING' | 'VERIFIED' | 'EXPIRED' | 'REPLAY_REJECTED';
  transactionSignature?: string;
  resultData?: unknown;
  receiptId?: string;
  timestamp: number;
}

export interface JarvisDiagnostic {
  cycleNumber: number;
  timestamp: number;
  observation: string;
  detectedProblem: string | null;
  diagnosis: string | null;
  proposedChange: string | null;
  testsRun: number;
  testsPassed: number;
  actionTaken: 'APPLIED_CANARY' | 'ROLLED_BACK' | 'NO_CHANGE_NEEDED' | 'REJECTED_POLICY';
  safetyAuditPassed: boolean;
  status: 'HEALTHY' | 'OPTIMIZING' | 'INVESTIGATING' | 'REPAIRED';
}

export interface RpcNodeStatus {
  name: string;
  endpoint: string;
  tier: 'PRIMARY' | 'SECONDARY' | 'PUBLIC_FALLBACK';
  network: NetworkMode;
  isHealthy: boolean;
  latencyMs: number;
  currentBlockHeight: number;
  lastChecked: number;
}

export interface AutopilotStatus {
  isRunning: boolean;
  mode: 'CONTINUOUS_LIVE' | 'PAUSED' | 'EMERGENCY_STOP';
  cyclesCompleted: number;
  lastCycleTimestamp: number;
  nextCycleScheduledInMs: number;
  activeOpportunitiesCount: number;
  executingTasksCount: number;
  lastActionSummary: string;
}

// ==========================================
// REAL TRANSACTION SIGNER & EXECUTION ENGINE TYPES
// ==========================================

export type SignerMode = 
  | 'PHANTOM' 
  | 'SERVER_SIGNER' 
  | 'HSM_KMS' 
  | 'MULTISIG' 
  | 'MANUAL' 
  | 'DISABLED';

export type ExecutionState = 
  | 'DISCOVERED'
  | 'VALIDATED'
  | 'PRICED'
  | 'APPROVED'
  | 'READY_TO_SIGN'
  | 'SIGNING'
  | 'SIGNED'
  | 'SUBMITTING'
  | 'SUBMITTED'
  | 'CONFIRMING'
  | 'CONFIRMED'
  | 'FINALIZED'
  | 'VERIFIED'
  | 'ACCOUNTED'
  | 'PROFIT_REALIZED'
  | 'FAILED'
  | 'EXPIRED'
  | 'BLOCKED'
  | 'REJECTED';

export interface SignerStatusReport {
  mode: SignerMode;
  publicKey: string;
  isReady: boolean;
  canSignAutonomous: boolean;
  requiresBrowserPrompt: boolean;
  network: NetworkMode;
  currentSlot: number;
  lastEstimatedFeeSol: number;
  statusDetails: string;
}

export interface SigningRequest {
  executionId: string; // e.g. EXE-20260918-000001
  transactionIntentId: string;
  batchId?: string;
  sequenceNumber?: number;
  agentId: string;
  opportunityId?: string;
  revenueEventId?: string;
  accountingEventId?: string;
  sourceWallet: string;
  destinationWallet: string;
  amountSol: number;
  baseFeeSol: number;
  priorityFeeLamports: number;
  totalMaxSpendSol: number;
  expectedRevenueSol: number;
  expectedCostSol: number;
  expectedProfitSol: number;
  state: ExecutionState;
  messageDigest: string; // SHA-256 of serialized message
  serializedTxBase64?: string;
  signature?: string;
  confirmation?: 'processed' | 'confirmed' | 'finalized';
  slot?: number;
  blockTime?: number;
  explorerUrl?: string;
  error?: string;
  truthClass: TruthClass;
  idempotencyKey: string;
  createdAt: number;
  updatedAt: number;
}

export interface SigningBatch {
  batchId: string; // e.g. BATCH-00047
  executionIds: string[];
  totalSpendSol: number;
  totalEstimatedFeesSol: number;
  expectedGrossRevenueSol: number;
  expectedNetProfitSol: number;
  walletSpendableSol: number;
  reserveAfterBatchSol: number;
  status: 'READY' | 'SIGNING' | 'SUBMITTED' | 'CONFIRMED' | 'FAILED' | 'REJECTED';
  truthClass: TruthClass;
  createdAt: number;
  updatedAt: number;
}

export interface WalletAffordabilityReport {
  walletAddress: string;
  confirmedBalanceSol: number;
  pendingOutflowsSol: number;
  requiredRentSol: number;
  minimumReserveSol: number;
  estimatedFeesSol: number;
  availableToSpendSol: number;
  isAffordable: boolean;
  affordableExecutionCount: number;
  status: 'AFFORDABLE' | 'BLOCKED_INSUFFICIENT_FUNDS';
  reason?: string;
}

export interface AgentWalletInfo {
  agentWalletId: string;
  publicAddress: string;
  agentId: string;
  agentName: string;
  status: 'ACTIVE' | 'PAUSED' | 'UNFUNDED' | 'SWEEP_READY';
  createdAt: number;
  fundedAt?: number;
  initialFundingSol: number;
  currentBalanceSol: number;
  reservedBalanceSol: number;
  eligibleProfitSol: number;
  lifetimeRevenueSol: number;
  lifetimeCostsSol: number;
  lastActivity: number;
  lastSweepTimestamp?: number;
  sweepEligible: boolean;
  pendingSweepSol: number;
  explorerUrl: string;
}

export interface AutoSignPolicy {
  enabled: boolean;
  signerMode: SignerMode;
  maxAutoTransactionSol: number;
  maxAutoBatchSol: number;
  maxDailyAutoSpendSol: number;
  maxAgentFundingSol: number;
  minRequiredReserveSol: number;
  maxPriorityFeeLamports: number;
  transactionsToday: number;
  solSpentToday: number;
  solReceivedToday: number;
  profitToday: number;
  remainingDailyLimitSol: number;
  agentSweepThresholdSol: number; // 1.0 SOL
  agentSweepRatio: number; // 0.65
  activationGuardPassed: boolean;
  guardChecks: Array<{
    name: string;
    passed: boolean;
    details: string;
  }>;
}

export interface MainWalletMetrics {
  mainTreasuryWallet: string;
  onChainBalanceSol: number;
  spendableSol: number;
  reservedSol: number;
  pendingOutflowsSol: number;
  pendingRevenueSol: number;
  verifiedRevenueSol: number;
  verifiedProfitSol: number;
  agentCapitalSol: number;
  agentProfitSol: number;
  lastUpdated: number;
  explorerUrl: string;
}

export interface FleetSwarmStatus {
  isSwarmTreasuryBacked: boolean;
  masterTreasuryWallet: string;
  totalAgents: number;
  fundedAgentsCount: number;
  unfundedAgentsCount: number;
  targetFundingPerAgentSol: number;
  totalTargetFundingSol: number;
  currentFleetFundingSol: number;
  swarmMode: 'TREASURY_BACKED_COLLECTIVE' | 'HYBRID_BOOTSTRAPPING' | 'DECENTRALIZED_AUTONOMOUS';
  delegationDescription: string;
  activePipelineSquads: Array<{
    squadName: string;
    description: string;
    agents: string[];
    role: string;
  }>;
}

export type FinancialAuditCategory = 
  | 'MONEY_IN' 
  | 'MONEY_OUT' 
  | 'FEE' 
  | 'PROFIT' 
  | 'VALUE_CHANGE' 
  | 'SWEEP' 
  | 'RPC_PROBE' 
  | 'SYSTEM';

export type FlowDirection = 'INFLOW' | 'OUTFLOW' | 'NEUTRAL';

export interface FinancialAuditEntry {
  id: string;
  timestamp: number;
  action: string;
  agentId: string;
  agentName?: string;
  category: FinancialAuditCategory;
  flowDirection: FlowDirection;
  grossSol: number;
  feeSol: number;
  netSol: number;
  isPositive: boolean;
  balanceBeforeSol: number;
  balanceAfterSol: number;
  rpcVerified: boolean;
  rpcEndpoint: string;
  transactionSignature: string;
  slot?: number;
  metadata?: Record<string, unknown>;
}

export interface ValueFreshnessMetrics {
  treasuryFreshness: {
    lastUpdated: number;
    ageSeconds: number;
    status: 'FRESH' | 'RECENT' | 'STALE';
  };
  reservesFreshness: {
    lastUpdated: number;
    ageSeconds: number;
    status: 'FRESH' | 'RECENT' | 'STALE';
  };
  pendingFreshness: {
    lastUpdated: number;
    ageSeconds: number;
    status: 'FRESH' | 'RECENT' | 'STALE';
  };
  realizedProfitFreshness: {
    lastUpdated: number;
    ageSeconds: number;
    status: 'FRESH' | 'RECENT' | 'STALE';
  };
  fleetFreshness: {
    lastUpdated: number;
    ageSeconds: number;
    status: 'FRESH' | 'RECENT' | 'STALE';
  };
  rpcMeshFreshness: {
    lastUpdated: number;
    ageSeconds: number;
    status: 'FRESH' | 'RECENT' | 'STALE';
  };
}

