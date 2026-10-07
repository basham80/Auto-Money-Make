import { TruthClass, NetworkMode } from './index.ts';

export type CapabilityRisk = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type CapabilityStatus = 'ACTIVE' | 'DEGRADED' | 'DISABLED' | 'EXPERIMENTAL';

export interface CapabilityItem {
  id: string;
  name: string;
  description: string;
  category: 'INTELLIGENCE' | 'OPPORTUNITY' | 'PRODUCT' | 'SOLANA' | 'ASSET' | 'ROUTING' | 'LIQUIDITY' | 'TREASURY' | 'ACCOUNTING' | 'COMPOUNDING' | 'SECURITY' | 'CODE' | 'GROWTH';
  inputs: string[];
  outputs: string[];
  requiredTools: string[];
  permissions: string[];
  risk: CapabilityRisk;
  costSol: number;
  revenuePotentialSol: number;
  dependencies: string[];
  version: string;
  health: number; // 0 - 100
  status: CapabilityStatus;
  executionCount: number;
  lastExecuted?: number;
}

export type TreasuryBucketType = 
  | 'CUSTOMER_FUNDS'
  | 'OPERATING_CAPITAL'
  | 'RESERVES'
  | 'PROFIT'
  | 'LIQUIDITY'
  | 'PRODUCT_CAPITAL'
  | 'OPERATOR_DISTRIBUTION'
  | 'UNATTRIBUTED';

export interface TreasuryBucketAllocation {
  bucket: TreasuryBucketType;
  label: string;
  balanceSol: number;
  targetRatio: number;
  isProtected: boolean;
  notes: string;
  lastReconciled: number;
}

export interface TreasurySegregatedModel {
  totalOnChainSol: number;
  lastUpdated: number;
  buckets: Record<TreasuryBucketType, TreasuryBucketAllocation>;
  totalReconciledSol: number;
  unattributedSol: number;
  isCompliant: boolean;
}

export interface SolanaAssetInfo {
  mint: string;
  name: string;
  symbol: string;
  decimals: number;
  programId: string;
  tokenStandard: 'SPL_TOKEN' | 'TOKEN_2022' | 'NATIVE_SOL';
  extensions?: string[];
  balanceRaw: string;
  balanceFormatted: number;
  priceInSol: number;
  totalValueSol: number;
  liquidityDepthSol: number;
  isSupportedForConversion: boolean;
  riskScore: number; // 0 - 100 (100 is safest)
  authorities: {
    mintAuthority: string | null;
    freezeAuthority: string | null;
  };
  lastPriceUpdate: number;
  explorerUrl: string;
}

export interface AssetConversionQuote {
  quoteId: string;
  fromMint: string;
  fromSymbol: string;
  fromAmount: number;
  toMint: string;
  toSymbol: string;
  expectedSolOutput: number;
  minSolOutput: number;
  priceImpactPct: number;
  routeType: 'RAYDIUM_AMM' | 'ORCA_WHIRLPOOL' | 'JUPITER_DIRECT' | 'DIRECT_SWAP';
  estimatedNetworkFeeSol: number;
  netYieldSol: number;
  isEconomicallyOptimal: boolean;
  rejectionReason?: string;
  validUntil: number;
}

export interface LiquidityPosition {
  poolId: string;
  dex: 'RAYDIUM' | 'ORCA' | 'METEORA';
  pair: string;
  tokenAMint: string;
  tokenBMint: string;
  tokenASymbol: string;
  tokenBSymbol: string;
  depositedTokenA: number;
  depositedTokenB: number;
  totalValueSol: number;
  feeAprPct: number;
  earnedFeesSol: number;
  ilExposurePct: number;
  rangeStatus: 'IN_RANGE' | 'OUT_OF_RANGE' | 'UNBOUNDED';
  isAuthorized: boolean;
  lastHarvestTimestamp?: number;
}

export interface CustomerAccount {
  customerId: string;
  publicKey?: string;
  email?: string;
  tier: 'FREE_TRIAL' | 'STARTER' | 'PRO_MACHINE' | 'ENTERPRISE';
  signupTimestamp: number;
  lastActiveTimestamp: number;
  lifetimeSpendSol: number;
  activeSubscriptions: Array<{
    productId: string;
    productName: string;
    billingCycle: 'MONTHLY' | 'USAGE_PER_CALL';
    priceSol: number;
    renewsAt: number;
  }>;
  totalApiCalls: number;
  status: 'ACTIVE' | 'CHURNED' | 'TRIAL_EXPIRED';
}

export interface CapitalAllocationProposal {
  proposalId: string;
  targetCategory: 'INFRASTRUCTURE' | 'PRODUCT' | 'CUSTOMERS' | 'AUTOMATION' | 'DATA' | 'AGENTS' | 'LIQUIDITY' | 'RESEARCH';
  title: string;
  description: string;
  capitalRequiredSol: number;
  expectedRevenueSol: number;
  expectedCostsSol: number;
  expectedMarginPct: number;
  timeHorizonDays: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  confidenceScore: number; // 0-1
  isReversible: boolean;
  dependencies: string[];
  status: 'PROPOSED' | 'APPROVED' | 'EXECUTED' | 'REJECTED' | 'EVALUATING';
  proposedAt: number;
  executedAt?: number;
  measuredRoiSol?: number;
}

export interface AutonomousLearningRecord {
  learningId: string;
  timestamp: number;
  actionType: string;
  expectedOutcome: string;
  actualOutcome: string;
  varianceSol: number;
  rootCause: string;
  lessonLearned: string;
  nextPrescriptiveAction: string;
  confidenceIncrement: number;
}

export interface SystemEventPayload {
  eventId: string;
  type: 
    | 'PAYMENT_DETECTED'
    | 'PAYMENT_VERIFIED'
    | 'REVENUE_RECORDED'
    | 'PROFIT_RECALCULATED'
    | 'OPPORTUNITY_FOUND'
    | 'PRODUCT_CREATED'
    | 'AGENT_STARTED'
    | 'AGENT_COMPLETED'
    | 'TRANSACTION_SUBMITTED'
    | 'TRANSACTION_VERIFIED'
    | 'LP_UPDATED'
    | 'TOKEN_CREATED'
    | 'CODE_PATCHED'
    | 'TEST_PASSED'
    | 'DEPLOYMENT_COMPLETE'
    | 'ROLLBACK'
    | 'SECURITY_ALERT'
    | 'CAPITAL_REINVESTED';
  timestamp: number;
  source: string;
  truthClass: TruthClass;
  summary: string;
  metadata?: Record<string, unknown>;
}

export interface PhantomSession {
  publicKey: string;
  sessionToken: string;
  nonce: string;
  authenticatedAt: number;
  expiresAt: number;
  role: 'OPERATOR' | 'ADMIN' | 'READ_ONLY';
}

export interface VerifiedExternalEconomicEvent {
  eventId: string;
  sourceType: 
    | 'CUSTOMER_PAYMENT'
    | 'SERVICE_PAYMENT'
    | 'SUBSCRIPTION_PAYMENT'
    | 'API_PAYMENT'
    | 'AUTHORIZED_PROTOCOL_REVENUE'
    | 'AUTHORIZED_SERVICE_FEE'
    | 'VERIFIED_TRADE_SETTLEMENT'
    | 'OFF_RAMP_SETTLEMENT'
    | 'OTHER_VERIFIED_EXTERNAL_EVENT';
  network: NetworkMode;
  signature: string;
  slot: number;
  blockTime: number;
  sender: string;
  recipient: string;
  asset: string;
  mint?: string;
  grossAmount: number;
  fee: number;
  netAmount: number;
  instructions?: string[];
  programIds?: string[];
  orderId?: string;
  customerId?: string;
  productId?: string;
  verificationStatus: 'VERIFIED' | 'FAILED' | 'PENDING';
  commitment: 'confirmed' | 'finalized';
  verifiedAt: number;
  evidenceHash: string;
  provenance: string;
}

export interface RevenueBlockerReport {
  timestamp: number;
  primaryBlocker: 
    | 'NO_CUSTOMER_ORDERS'
    | 'NO_PAYMENT_METHOD'
    | 'PAYMENT_UNVERIFIED'
    | 'FULFILLMENT_FAILURE'
    | 'HIGH_COST_LOW_MARGIN'
    | 'RPC_FAILURE'
    | 'SIGNER_FAILURE'
    | 'POLICY_BLOCK'
    | 'INSUFFICIENT_CAPITAL'
    | 'CUSTOMER_FUNDS_PROTECTED'
    | 'RECONCILIATION_FAILURE'
    | 'EARNING_HEALTHY';
  title: string;
  explanation: string;
  prescriptiveNextAction: string;
  activePayingCustomers: number;
  unattributedInflowSol: number;
  verifiedRealizedProfitSol: number;
  rpcHealthPercent: number;
}

export type AutonomyLevel = 
  | 'OBSERVE'
  | 'ANALYZE'
  | 'PROPOSE'
  | 'BUILD'
  | 'TEST'
  | 'LOW_RISK_EXECUTE'
  | 'CONTINUOUS_OPERATION';

