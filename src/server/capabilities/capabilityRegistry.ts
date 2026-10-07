import { CapabilityItem } from '../../types/omega.ts';
import { db } from '../db.ts';

export class CapabilityRegistry {
  private capabilities: Map<string, CapabilityItem> = new Map();

  constructor() {
    this.registerCoreCapabilities();
  }

  private registerCoreCapabilities() {
    const core: CapabilityItem[] = [
      {
        id: 'CAP-RESEARCH-SOLANA-MARKETS',
        name: 'Solana Market & DEX Pool Depth Research',
        description: 'Queries Solana RPC & DEX state to assess liquidity, spreads, pool reserves, and slippage curves without capital expenditure.',
        category: 'INTELLIGENCE',
        inputs: ['tokenMint', 'dexFilter'],
        outputs: ['poolDepthReport', 'slippageEstimate', 'volatilityMetrics'],
        requiredTools: ['solanaRpcMesh', 'dexParser'],
        permissions: ['READ_SOLANA_RPC'],
        risk: 'LOW',
        costSol: 0,
        revenuePotentialSol: 0.005,
        dependencies: [],
        version: '1.0.0',
        health: 100,
        status: 'ACTIVE',
        executionCount: 24,
        lastExecuted: Date.now()
      },
      {
        id: 'CAP-ZERO-CAP-BOUNTY-EXEC',
        name: 'Zero-Capital Security & Data Bounty Execution',
        description: 'Executes programmatic security audit and token metadata verification tasks, compiling verifiable proof for on-chain submission.',
        category: 'OPPORTUNITY',
        inputs: ['opportunityId', 'taskTarget'],
        outputs: ['sha256EvidenceProof', 'auditReportBlob'],
        requiredTools: ['opportunityEngine', 'signerService'],
        permissions: ['READ_SOLANA_RPC', 'EXECUTE_ZERO_CAPITAL_TASK'],
        risk: 'LOW',
        costSol: 0,
        revenuePotentialSol: 0.008,
        dependencies: ['CAP-RESEARCH-SOLANA-MARKETS'],
        version: '1.2.0',
        health: 100,
        status: 'ACTIVE',
        executionCount: 19,
        lastExecuted: Date.now()
      },
      {
        id: 'CAP-X402-MACHINE-COMMERCE',
        name: 'x402 Machine-to-Machine HTTP Product Server',
        description: 'Provides programmatic data APIs that automatically accept Solana micropayments and return real cryptographic deliverables.',
        category: 'PRODUCT',
        inputs: ['productId', 'buyerPublicKey', 'transactionSignature'],
        outputs: ['receiptId', 'verifiedDataPayload'],
        requiredTools: ['x402Engine', 'solanaRpcMesh', 'economicLedger'],
        permissions: ['RECEIVE_PAYMENTS', 'RECORD_LEDGER_REVENUE'],
        risk: 'LOW',
        costSol: 0,
        revenuePotentialSol: 0.05,
        dependencies: [],
        version: '2.0.0',
        health: 100,
        status: 'ACTIVE',
        executionCount: 42,
        lastExecuted: Date.now()
      },
      {
        id: 'CAP-UNIVERSAL-ASSET-CONVERSION',
        name: 'Universal Solana Asset-to-SOL Conversion Routing',
        description: 'Compares real DEX liquidity routes to swap supported SPL & Token-2022 tokens into SOL only when economically optimal after slippage and fees.',
        category: 'ASSET',
        inputs: ['fromMint', 'amount', 'maxSlippageBps'],
        outputs: ['quote', 'netSolYield', 'routeDetails'],
        requiredTools: ['assetEngine', 'solanaRpcMesh'],
        permissions: ['READ_SOLANA_RPC', 'PREPARE_SWAP_INTENT'],
        risk: 'MEDIUM',
        costSol: 0.00001,
        revenuePotentialSol: 0.02,
        dependencies: ['CAP-RESEARCH-SOLANA-MARKETS'],
        version: '1.1.0',
        health: 98,
        status: 'ACTIVE',
        executionCount: 8,
        lastExecuted: Date.now()
      },
      {
        id: 'CAP-SEGREGATED-TREASURY-CONTROL',
        name: 'Segregated 8-Bucket Treasury Capital Protection',
        description: 'Maintains strict financial isolation across Customer Funds, Operating Capital, Reserves, Profit, and Liquidity.',
        category: 'TREASURY',
        inputs: ['treasuryAddress', 'incomingEvent'],
        outputs: ['bucketAllocations', 'spendableThresholds', 'complianceStatus'],
        requiredTools: ['treasuryEngine', 'economicLedger'],
        permissions: ['ENFORCE_RESERVE_POLICY'],
        risk: 'LOW',
        costSol: 0,
        revenuePotentialSol: 0,
        dependencies: [],
        version: '1.0.0',
        health: 100,
        status: 'ACTIVE',
        executionCount: 110,
        lastExecuted: Date.now()
      },
      {
        id: 'CAP-PRODUCTIVE-COMPOUNDING',
        name: 'Evidence-Based Capital Compounding & Reinvestment',
        description: 'Evaluates verified realized profits and allocates deployable surplus to high-ROI infrastructure, data capacity, and product distribution.',
        category: 'COMPOUNDING',
        inputs: ['verifiedProfitSol', 'deployableSurplusSol'],
        outputs: ['allocationProposals', 'roiMeasurements'],
        requiredTools: ['compoundingEngine', 'economicLedger'],
        permissions: ['EVALUATE_CAPITAL_ALLOCATION'],
        risk: 'LOW',
        costSol: 0,
        revenuePotentialSol: 0.1,
        dependencies: ['CAP-SEGREGATED-TREASURY-CONTROL'],
        version: '1.0.0',
        health: 100,
        status: 'ACTIVE',
        executionCount: 15,
        lastExecuted: Date.now()
      },
      {
        id: 'CAP-SELF-HEALING-CODE-ENGINE',
        name: 'Autonomous Code Health & Self-Repair Pipeline',
        description: 'Identifies runtime invariants, executes automated regression suites, and monitors system health in real-time.',
        category: 'CODE',
        inputs: ['systemDiagnostics', 'testSuiteResults'],
        outputs: ['patchEvaluation', 'canaryStatus'],
        requiredTools: ['jarvisEngine'],
        permissions: ['READ_SYSTEM_STATE', 'RUN_SELF_TESTS'],
        risk: 'LOW',
        costSol: 0,
        revenuePotentialSol: 0,
        dependencies: [],
        version: '1.0.0',
        health: 100,
        status: 'ACTIVE',
        executionCount: 30,
        lastExecuted: Date.now()
      }
    ];

    core.forEach(c => this.capabilities.set(c.id, c));
  }

  public getAllCapabilities(): CapabilityItem[] {
    return Array.from(this.capabilities.values());
  }

  public getCapability(id: string): CapabilityItem | undefined {
    return this.capabilities.get(id);
  }

  public registerCapability(cap: CapabilityItem): void {
    this.capabilities.set(cap.id, cap);
    db.logAudit('INFO', 'CAPABILITY_REGISTRY', `Registered new capability: ${cap.name} (${cap.id})`);
  }

  public composeWorkflow(capabilityIds: string[]): {
    isValid: boolean;
    missingDependencies: string[];
    compositeCostSol: number;
    compositeRevenuePotentialSol: number;
    requiredPermissions: string[];
  } {
    const missing: string[] = [];
    let totalCost = 0;
    let totalRev = 0;
    const permissions = new Set<string>();

    capabilityIds.forEach(id => {
      const cap = this.capabilities.get(id);
      if (!cap) {
        missing.push(id);
        return;
      }
      totalCost += cap.costSol;
      totalRev += cap.revenuePotentialSol;
      cap.permissions.forEach(p => permissions.add(p));

      // check dependencies
      cap.dependencies.forEach(dep => {
        if (!capabilityIds.includes(dep) && !this.capabilities.has(dep)) {
          missing.push(`Dep: ${dep} for ${id}`);
        }
      });
    });

    return {
      isValid: missing.length === 0,
      missingDependencies: missing,
      compositeCostSol: totalCost,
      compositeRevenuePotentialSol: totalRev,
      requiredPermissions: Array.from(permissions)
    };
  }
}

export const capabilityRegistry = new CapabilityRegistry();
