import { AgentInfo, AgentRole, AgentState } from '../../types/index.ts';
import { db } from '../db.ts';

const FLEET_DEFINITIONS: Array<{
  id: string;
  name: string;
  role: AgentRole;
  capabilities: string[];
  permissions: string[];
  maxHourlyBudgetSol: number;
  rateLimitPerMinute: number;
  allowedConnectors: string[];
  riskClass: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}> = [
  {
    id: 'DISCOVERY-01',
    name: 'Apollo Opportunity Scout',
    role: 'DISCOVERY',
    capabilities: ['PUBLIC_API_SCAN', 'BOUNTY_CRAWL', 'ECOSYSTEM_TELEMETRY', 'ZERO_CAP_FILTER'],
    permissions: ['READ_EXTERNAL_APIS', 'EMIT_OPPORTUNITIES'],
    maxHourlyBudgetSol: 0,
    rateLimitPerMinute: 60,
    allowedConnectors: ['ALL_READONLY'],
    riskClass: 'LOW'
  },
  {
    id: 'MARKET-02',
    name: 'Hermes Market Intelligence',
    role: 'MARKET_RESEARCH',
    capabilities: ['DEX_VOLUME_ANALYSIS', 'POOL_DEPTH_SCAN', 'TOKEN_VELOCITY'],
    permissions: ['READ_SOLANA_RPC', 'CACHE_MARKET_DATA'],
    maxHourlyBudgetSol: 0.001,
    rateLimitPerMinute: 45,
    allowedConnectors: ['DEX_APIS', 'SOLANA_RPC'],
    riskClass: 'LOW'
  },
  {
    id: 'SCORER-03',
    name: 'Minerva EV & Risk Evaluator',
    role: 'OPPORTUNITY_SCORING',
    capabilities: ['EXPECTED_VALUE_CALC', 'DOWNSIDE_ESTIMATE', 'CONFIDENCE_SCORING'],
    permissions: ['SCORE_OPPORTUNITIES', 'APPLY_FILTER_POLICIES'],
    maxHourlyBudgetSol: 0,
    rateLimitPerMinute: 120,
    allowedConnectors: ['INTERNAL'],
    riskClass: 'LOW'
  },
  {
    id: 'PRICING-04',
    name: 'Janus Adaptive Pricing Engine',
    role: 'PRICING',
    capabilities: ['DYNAMIC_MARGIN_ADJUST', 'SLA_PRICING', 'DEMAND_CURVE_CALC'],
    permissions: ['UPDATE_PRODUCT_CATALOG_PRICE'],
    maxHourlyBudgetSol: 0,
    rateLimitPerMinute: 30,
    allowedConnectors: ['INTERNAL'],
    riskClass: 'MEDIUM'
  },
  {
    id: 'EXEC-05',
    name: 'Vulcan Zero-Capital Executor',
    role: 'EXECUTION',
    capabilities: ['DATA_TRANSFORM_EXEC', 'CODE_TASK_EXEC', 'API_PAYLOAD_GEN'],
    permissions: ['EXECUTE_ZERO_CAP_TASKS', 'GENERATE_TASK_PROOFS'],
    maxHourlyBudgetSol: 0.005,
    rateLimitPerMinute: 30,
    allowedConnectors: ['PUBLIC_BOUNTY_CONNECTOR', 'M2M_GATEWAY'],
    riskClass: 'MEDIUM'
  },
  {
    id: 'DATA-06',
    name: 'Chronos Data Transformation Unit',
    role: 'DATA_TRANSFORMATION',
    capabilities: ['JSON_AGGREGATION', 'SIGNATURE_NORMALIZATION', 'ETL_CLEANSE'],
    permissions: ['PROCESS_PAYLOADS', 'WRITE_CACHE'],
    maxHourlyBudgetSol: 0,
    rateLimitPerMinute: 90,
    allowedConnectors: ['INTERNAL'],
    riskClass: 'LOW'
  },
  {
    id: 'QUANT-07',
    name: 'Archimedes Quantitative Researcher',
    role: 'QUANT_RESEARCH',
    capabilities: ['VOLATILITY_SURFACE', 'STAT_ARBITRAGE_MATH', 'ALPHA_INDEXING'],
    permissions: ['COMPILE_ALPHA_REPORTS'],
    maxHourlyBudgetSol: 0,
    rateLimitPerMinute: 20,
    allowedConnectors: ['SOLANA_RPC'],
    riskClass: 'LOW'
  },
  {
    id: 'SUPPORT-08',
    name: 'Mercury M2M Protocol Gateway',
    role: 'CUSTOMER_SERVICE',
    capabilities: ['X402_CHALLENGE_ISSUANCE', 'AGENT_HANDSHAKE', 'ERROR_TRANSLATION'],
    permissions: ['ACCEPT_INCOMING_M2M', 'EMIT_X402_CHALLENGES'],
    maxHourlyBudgetSol: 0,
    rateLimitPerMinute: 150,
    allowedConnectors: ['HTTP_GATEWAY'],
    riskClass: 'LOW'
  },
  {
    id: 'DELIVERY-09',
    name: 'Argus Digital Product Delivery',
    role: 'PRODUCT_DELIVERY',
    capabilities: ['PAYLOAD_PACKAGING', 'CRYPTOGRAPHIC_RECEIPT_SIGN', 'SLA_TIMER'],
    permissions: ['DELIVER_PAID_PRODUCTS', 'EMIT_RECEIPTS'],
    maxHourlyBudgetSol: 0,
    rateLimitPerMinute: 60,
    allowedConnectors: ['INTERNAL_QUEUE'],
    riskClass: 'LOW'
  },
  {
    id: 'VERIFY-10',
    name: 'Aegis Solana Payment Verifier',
    role: 'PAYMENT_VERIFICATION',
    capabilities: ['ONCHAIN_SIGNATURE_LOOKUP', 'INSTRUCTION_DECODING', 'BALANCE_DELTA_CHECK'],
    permissions: ['CALL_SOLANA_RPC_PARSED_TX', 'VERIFY_SETTLEMENT'],
    maxHourlyBudgetSol: 0.002,
    rateLimitPerMinute: 100,
    allowedConnectors: ['SOLANA_RPC_MESH'],
    riskClass: 'CRITICAL'
  },
  {
    id: 'LEDGER-11',
    name: 'Justitia Authoritative Bookkeeper',
    role: 'ACCOUNTING_LEDGER',
    capabilities: ['DOUBLE_ENTRY_CHECK', 'IDEMPOTENCY_ENFORCEMENT', 'TRUTH_CLASS_GATE'],
    permissions: ['WRITE_IMMUTABLE_LEDGER', 'UPDATE_REALIZED_PROFIT'],
    maxHourlyBudgetSol: 0,
    rateLimitPerMinute: 200,
    allowedConnectors: ['TRANSACTIONAL_DB'],
    riskClass: 'CRITICAL'
  },
  {
    id: 'RECON-12',
    name: 'Concordia Settlement Reconciler',
    role: 'RECONCILIATION',
    capabilities: ['CROSS_MATCH_PENDING_TX', 'TIMEOUT_RESOLUTION', 'DISPUTE_FLAGGING'],
    permissions: ['SETTLE_PENDING_LEDGER_EVENTS'],
    maxHourlyBudgetSol: 0,
    rateLimitPerMinute: 40,
    allowedConnectors: ['SOLANA_RPC', 'TRANSACTIONAL_DB'],
    riskClass: 'HIGH'
  },
  {
    id: 'TREASURY-13',
    name: 'Plutus Capital & Reserve Guard',
    role: 'TREASURY',
    capabilities: ['RESERVE_CALCULATION', 'SWEEP_POLICY_ENFORCEMENT', 'CAPITAL_ALLOCATION'],
    permissions: ['CHECK_TREASURY_POLICY', 'PROPOSE_SWEEP_INTENTS'],
    maxHourlyBudgetSol: 0,
    rateLimitPerMinute: 20,
    allowedConnectors: ['TREASURY_SUBSYSTEM'],
    riskClass: 'CRITICAL'
  },
  {
    id: 'SECURITY-14',
    name: 'Cerberus Threat & Injection Shield',
    role: 'SECURITY_RISK',
    capabilities: ['PROMPT_INJECTION_DEFENSE', 'PAYLOAD_SANITIZATION', 'RATE_LIMIT_POLICING'],
    permissions: ['REJECT_HOSTILE_INPUTS', 'TRIGGER_CIRCUIT_BREAKER'],
    maxHourlyBudgetSol: 0,
    rateLimitPerMinute: 300,
    allowedConnectors: ['GLOBAL_FILTER'],
    riskClass: 'CRITICAL'
  },
  {
    id: 'RISK-15',
    name: 'Titan Downside Exposure Sentry',
    role: 'RISK_GATEKEEPER',
    capabilities: ['WORST_CASE_LOSS_ESTIMATE', 'COUNTERPARTY_BLACKLIST_CHECK', 'EXPOSURE_CAP'],
    permissions: ['VETO_OPPORTUNITY_EXECUTION'],
    maxHourlyBudgetSol: 0,
    rateLimitPerMinute: 100,
    allowedConnectors: ['INTERNAL'],
    riskClass: 'HIGH'
  },
  {
    id: 'QA-16',
    name: 'Vesta Evidence Inspector',
    role: 'QA_INSPECTOR',
    capabilities: ['OUTPUT_SCHEMA_VALIDATION', 'EVIDENCE_SHA256_HASH', 'TRUTH_AUDIT'],
    permissions: ['APPROVE_TASK_DELIVERY', 'REJECT_INVALID_PROOFS'],
    maxHourlyBudgetSol: 0,
    rateLimitPerMinute: 80,
    allowedConnectors: ['INTERNAL'],
    riskClass: 'MEDIUM'
  },
  {
    id: 'TESTING-17',
    name: 'Hephaestus Synthetic Health Canary',
    role: 'CANARY_TESTING',
    capabilities: ['RPC_CANARY_PROBE', 'MOCK_PURCHASE_VERIFY', 'IDEMPOTENCY_TEST_SUITE'],
    permissions: ['RUN_SYSTEM_TESTS', 'EMIT_HEALTH_METRICS'],
    maxHourlyBudgetSol: 0,
    rateLimitPerMinute: 30,
    allowedConnectors: ['TEST_HARNESS'],
    riskClass: 'LOW'
  },
  {
    id: 'OBSERVER-18',
    name: 'Panoptes Telemetry & Latency Sentry',
    role: 'TELEMETRY_OBSERVER',
    capabilities: ['RPC_LATENCY_TRACKING', 'TASK_THROUGHPUT_METRICS', 'ERROR_CLUSTER_DETECT'],
    permissions: ['COLLECT_SYSTEM_TELEMETRY'],
    maxHourlyBudgetSol: 0,
    rateLimitPerMinute: 120,
    allowedConnectors: ['TELEMETRY_BUS'],
    riskClass: 'LOW'
  },
  {
    id: 'OPTIMIZER-19',
    name: 'Daedalus Margin & Gas Optimizer',
    role: 'MARGIN_OPTIMIZER',
    capabilities: ['PRIORITY_FEE_ESTIMATOR', 'RPC_COST_REDUCTION', 'BATCH_COMPRESSION'],
    permissions: ['TUNE_EXECUTION_PARAMS'],
    maxHourlyBudgetSol: 0,
    rateLimitPerMinute: 20,
    allowedConnectors: ['INTERNAL'],
    riskClass: 'LOW'
  },
  {
    id: 'STRATEGY-20',
    name: 'Athena Autonomous Fleet Commander',
    role: 'STRATEGY_COORDINATOR',
    capabilities: ['AGENT_LOAD_BALANCING', 'QUEUE_PRIORITIZATION', 'RESOURCE_SCHEDULING'],
    permissions: ['DISPATCH_TASKS_TO_AGENTS', 'PROMOTE_OPPORTUNITY_QUEUE'],
    maxHourlyBudgetSol: 0,
    rateLimitPerMinute: 150,
    allowedConnectors: ['INTERNAL'],
    riskClass: 'HIGH'
  },
  {
    id: 'JARVIS-21',
    name: 'JARVIS Self-Improvement Supervisor',
    role: 'JARVIS_SELF_IMPROVEMENT',
    capabilities: ['AUTONOMOUS_DIAGNOSIS', 'HYPOTHESIS_FORMATION', 'CANARY_TEST_SUPERVISION', 'SAFE_ROLLBACK_GUARD'],
    permissions: ['PROPOSE_SYSTEM_OPTIMIZATIONS', 'RUN_SELF_TESTS'],
    maxHourlyBudgetSol: 0,
    rateLimitPerMinute: 10,
    allowedConnectors: ['INTERNAL_CODE_AUDITOR'],
    riskClass: 'CRITICAL'
  }
];

export class AgentFleetManager {
  constructor() {
    this.initializeFleet();
  }

  private initializeFleet() {
    const state = db.getState();
    const existingAgents = state.agents || {};

    FLEET_DEFINITIONS.forEach(def => {
      const current = existingAgents[def.id];
      existingAgents[def.id] = {
        id: def.id,
        name: def.name,
        role: def.role,
        state: current?.state && current.state !== 'IDLE' ? current.state : 'EXECUTING',
        capabilities: def.capabilities,
        permissions: def.permissions,
        maxHourlyBudgetSol: def.maxHourlyBudgetSol,
        rateLimitPerMinute: def.rateLimitPerMinute,
        allowedConnectors: def.allowedConnectors,
        currentTask: current?.currentTask || `Active in Swarm Mode - ${def.role.replace(/_/g, ' ')}`,
        tasksCompleted: current?.tasksCompleted || 0,
        tasksFailed: current?.tasksFailed || 0,
        lastHeartbeat: Date.now(),
        uptimeSeconds: current?.uptimeSeconds || 0,
        riskClass: def.riskClass
      };
    });

    db.updateState(draft => {
      draft.agents = existingAgents;
    });
  }

  public getAgents(): AgentInfo[] {
    const state = db.getState();
    return Object.values(state.agents);
  }

  public setAgentState(agentId: string, state: AgentState, currentTask?: string) {
    db.updateState(draft => {
      if (draft.agents[agentId]) {
        draft.agents[agentId].state = state;
        draft.agents[agentId].currentTask = currentTask;
        draft.agents[agentId].lastHeartbeat = Date.now();
      }
    });
  }

  public recordTaskCompletion(agentId: string, success: boolean) {
    db.updateState(draft => {
      if (draft.agents[agentId]) {
        if (success) {
          draft.agents[agentId].tasksCompleted++;
        } else {
          draft.agents[agentId].tasksFailed++;
        }
        draft.agents[agentId].lastHeartbeat = Date.now();
      }
    });
  }

  public heartbeatAll() {
    db.updateState(draft => {
      const now = Date.now();
      Object.values(draft.agents).forEach(ag => {
        ag.lastHeartbeat = now;
        ag.uptimeSeconds = (ag.uptimeSeconds || 0) + 5;
      });
    });
  }
}

export const agentFleetManager = new AgentFleetManager();
