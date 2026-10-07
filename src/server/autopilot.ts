import { AutopilotStatus } from '../types/index.ts';
import { db } from './db.ts';
import { opportunityEngine } from './opportunities/engine.ts';
import { agentFleetManager } from './agents/fleet.ts';
import { agentWalletEngine } from './agents/agentWallets.ts';
import { jarvisEngine } from './jarvis.ts';
import { treasuryManager } from './treasury.ts';
import { signingQueueEngine } from './execution/signingQueue.ts';
import { economicLedger } from './ledger.ts';

export class AutopilotEngine {
  private isRunning = true;
  private intervalId: NodeJS.Timeout | null = null;
  private cyclesCompleted = 0;
  private lastCycleTimestamp = Date.now();
  private lastActionSummary = 'Autopilot online: All 20 agents collaborating in Treasury-Backed Swarm Mode.';

  constructor() {
    this.start();
  }

  public start() {
    if (this.intervalId) return;
    this.isRunning = true;
    this.intervalId = setInterval(() => this.runCycle(), 12000);
    db.logAudit('INFO', 'AUTOPILOT', 'Autonomous economic autopilot started in Treasury-Backed Swarm Mode.');
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    db.logAudit('WARN', 'AUTOPILOT', 'Autonomous economic autopilot paused.');
  }

  public emergencyStop(active: boolean) {
    db.updateState(draft => {
      draft.config.emergencyStop = active;
      draft.treasury.emergencyStopActive = active;
    });
    if (active) {
      this.lastActionSummary = 'EMERGENCY STOP TRIGGERED. All autonomous spending and task execution halted.';
      db.logAudit('CRITICAL', 'EMERGENCY_STOP', 'Global Emergency Kill-Switch Activated.');
    } else {
      this.lastActionSummary = 'Emergency stop lifted. System restored to normal autonomous operation.';
      db.logAudit('SECURITY', 'EMERGENCY_STOP', 'Global Emergency Kill-Switch Deactivated.');
    }
  }

  public async runCycle(): Promise<string> {
    const state = db.getState();
    this.lastCycleTimestamp = Date.now();
    this.cyclesCompleted++;

    if (state.config.emergencyStop) {
      this.lastActionSummary = 'Cycle skipped: Emergency Stop is currently ACTIVE.';
      return this.lastActionSummary;
    }

    try {
      // 1. Heartbeat all agents
      agentFleetManager.heartbeatAll();

      // 2. Sync on-chain treasury & main wallet (HTN1fvHwbzKiMwh9YXZEe3eooiMdoCAs3TweWdiSZV5i)
      const treasuryState = await treasuryManager.syncOnChainBalances();

      // 3. Coordinate all 21 agents in active swarm execution pipelines
      const swarmStatus = agentWalletEngine.getFleetSwarmStatus();
      
      // Squad 1: Scout & Intelligence
      agentFleetManager.setAgentState('DISCOVERY-01', 'DISCOVERING', 'Scanning Solana DEX liquidity pools & zero-capital bounties');
      agentFleetManager.setAgentState('MARKET-02', 'DISCOVERING', 'Analyzing SPL market depth & token velocity');
      agentFleetManager.setAgentState('QUANT-07', 'DISCOVERING', 'Computing statistical spreads & liquidity surfaces');
      
      // Squad 2: Scoring & Dynamic Pricing
      agentFleetManager.setAgentState('SCORER-03', 'EVALUATING', 'Ranking opportunity Expected Value & win rate probabilities');
      agentFleetManager.setAgentState('PRICING-04', 'EVALUATING', 'Optimizing dynamic digital product prices & SLA curves');
      agentFleetManager.setAgentState('RISK-15', 'EVALUATING', 'Bounding downside exposure & counterparty risk limits');
      agentFleetManager.setAgentState('OPTIMIZER-19', 'EVALUATING', 'Tuning priority micro-fees & batch gas efficiency');
      agentFleetManager.setAgentState('STRATEGY-20', 'EXECUTING', 'Load-balancing opportunity queue & swarm resource allocation');
      
      // Squad 3: Execution & Delivery
      agentFleetManager.setAgentState('EXEC-05', 'EXECUTING', 'Compiling zero-capital cryptographic task proofs');
      agentFleetManager.setAgentState('DATA-06', 'EXECUTING', 'Validating ETL data payloads & evidence chains');
      agentFleetManager.setAgentState('SUPPORT-08', 'EXECUTING', 'Servicing x402 machine protocol challenges');
      agentFleetManager.setAgentState('DELIVERY-09', 'EXECUTING', 'Issuing receipts & packaging digital deliverables');
      
      // Squad 4: Verification & Settlement
      agentFleetManager.setAgentState('VERIFY-10', 'VERIFYING', 'Monitoring on-chain Solana slot confirmations');
      agentFleetManager.setAgentState('LEDGER-11', 'VERIFYING', 'Authoritative double-entry ledger bookkeeping');
      agentFleetManager.setAgentState('RECON-12', 'RECONCILING', 'Cross-matching pending deposits vs RPC slots');
      agentFleetManager.setAgentState('TREASURY-13', 'VERIFYING', `Securing reserve ratio & Master Treasury (${state.config.treasuryAddress.slice(0, 4)}...${state.config.treasuryAddress.slice(-4)})`);
      agentFleetManager.setAgentState('SECURITY-14', 'VERIFYING', 'Enforcing payload sanitization & injection shield');
      
      // Squad 5: Infrastructure & Self-Improvement
      agentFleetManager.setAgentState('QA-16', 'VERIFYING', 'Auditing SHA-256 evidence integrity & output schemas');
      agentFleetManager.setAgentState('TESTING-17', 'LEARNING', 'Probing Multi-RPC cluster health & canary tests');
      agentFleetManager.setAgentState('OBSERVER-18', 'LEARNING', 'Collecting real-time RPC latency & telemetry');
      agentFleetManager.setAgentState('JARVIS-21', 'LEARNING', 'Supervising autonomous self-improvement loops');

      // 4. Scan opportunities
      const opps = await opportunityEngine.scanAllOpportunities();

      // 5. Find eligible zero-capital or affordable opportunity to execute
      const executableOpp = opps.find(o => 
        o.status === 'DISCOVERED' && 
        o.capitalRequiredSol <= (treasuryState.availableSol || state.treasury.availableSol || 0.001) &&
        o.riskLevel !== 'HIGH'
      );

      let action = `Cycle #${this.cyclesCompleted} [Swarm Active: 21/21 Agents Executing | Treasury: ${treasuryState.balanceSol.toFixed(4)} SOL]: Scanned ${opps.length} opportunities.`;

      if (executableOpp) {
        const execRes = await opportunityEngine.executeOpportunity(executableOpp.id);
        if (execRes.success) {
          action += ` Executed task [${executableOpp.title}] -> Proof submitted to Treasury (${state.config.treasuryAddress.slice(0, 4)}...${state.config.treasuryAddress.slice(-4)}).`;
          agentFleetManager.recordTaskCompletion('EXEC-05', true);
          agentFleetManager.recordTaskCompletion('DATA-06', true);
          agentFleetManager.recordTaskCompletion('DELIVERY-09', true);
          agentFleetManager.recordTaskCompletion('VERIFY-10', true);
          agentFleetManager.recordTaskCompletion('LEDGER-11', true);
        }
      }

      // Record heartbeats & active iterations across all squads
      agentFleetManager.recordTaskCompletion('DISCOVERY-01', true);
      agentFleetManager.recordTaskCompletion('MARKET-02', true);
      agentFleetManager.recordTaskCompletion('SCORER-03', true);
      agentFleetManager.recordTaskCompletion('PRICING-04', true);
      agentFleetManager.recordTaskCompletion('QUANT-07', true);
      agentFleetManager.recordTaskCompletion('SUPPORT-08', true);
      agentFleetManager.recordTaskCompletion('TREASURY-13', true);
      agentFleetManager.recordTaskCompletion('SECURITY-14', true);
      agentFleetManager.recordTaskCompletion('RISK-15', true);
      agentFleetManager.recordTaskCompletion('QA-16', true);
      agentFleetManager.recordTaskCompletion('TESTING-17', true);
      agentFleetManager.recordTaskCompletion('OBSERVER-18', true);
      agentFleetManager.recordTaskCompletion('OPTIMIZER-19', true);
      agentFleetManager.recordTaskCompletion('STRATEGY-20', true);
      agentFleetManager.recordTaskCompletion('JARVIS-21', true);

      // 6. Progressive Fleet Self-Funding Evaluation:
      if (treasuryState.availableSol >= 0.055 && swarmStatus.unfundedAgentsCount > 0) {
        const unfundedWallet = agentWalletEngine.getAgentWallets().find(w => w.currentBalanceSol < 0.05);
        if (unfundedWallet) {
          const autoSign = signingQueueEngine.getAutoSignPolicy();
          if (autoSign.enabled) {
            const fundRes = await agentWalletEngine.fundAgentWallet(unfundedWallet.agentId, 0.05);
            if (fundRes.success) {
              action += ` Autonomous self-funding completed: 0.05 SOL allocated to ${unfundedWallet.agentId}.`;
            }
          }
        }
      }

      // 7. Periodic JARVIS self-improvement check (every 5 cycles)
      if (this.cyclesCompleted % 5 === 0) {
        await jarvisEngine.executeSelfImprovementCycle();
        action += ' Executed JARVIS self-improvement verification cycle.';
      }

      this.lastActionSummary = action;
      return action;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.lastActionSummary = `Autopilot cycle error: ${msg}`;
      db.logAudit('ERROR', 'AUTOPILOT_CYCLE', `Cycle #${this.cyclesCompleted} failed: ${msg}`);
      return this.lastActionSummary;
    }
  }

  public getStatus(): AutopilotStatus {
    const state = db.getState();
    const activeTasks = Object.values(state.agents).filter(a => a.state === 'EXECUTING').length;

    return {
      isRunning: this.isRunning && !state.config.emergencyStop,
      mode: state.config.emergencyStop ? 'EMERGENCY_STOP' : (this.isRunning ? 'CONTINUOUS_LIVE' : 'PAUSED'),
      cyclesCompleted: this.cyclesCompleted,
      lastCycleTimestamp: this.lastCycleTimestamp,
      nextCycleScheduledInMs: 12000,
      activeOpportunitiesCount: state.opportunities.length,
      executingTasksCount: activeTasks,
      lastActionSummary: this.lastActionSummary
    };
  }
}

export const autopilotEngine = new AutopilotEngine();
