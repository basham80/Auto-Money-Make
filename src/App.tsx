import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, 
  Terminal, 
  Compass, 
  Users, 
  ShoppingBag, 
  Vault, 
  Cpu, 
  Activity,
  AlertTriangle,
  Play,
  RotateCw
} from 'lucide-react';
import { 
  AutopilotStatus, 
  TreasuryState, 
  LedgerEvent, 
  AgentInfo, 
  Opportunity, 
  MachineProduct, 
  JarvisDiagnostic, 
  RpcNodeStatus,
  X402Challenge,
  SignerStatusReport,
  AutoSignPolicy,
  MainWalletMetrics,
  SigningRequest,
  AgentWalletInfo,
  FinancialAuditEntry
} from './types/index.ts';

import { TopOperatorHud } from './components/TopOperatorHud.tsx';
import { CommandHUD } from './components/CommandHUD.tsx';
import { EconomicLedger } from './components/EconomicLedger.tsx';
import { OpportunityEngine } from './components/OpportunityEngine.tsx';
import { AgentFleetMatrix } from './components/AgentFleetMatrix.tsx';
import { X402ProductsMarket } from './components/X402ProductsMarket.tsx';
import { TreasuryWalletManager } from './components/TreasuryWalletManager.tsx';
import { JarvisEvolutionLoop } from './components/JarvisEvolutionLoop.tsx';
import { SystemAuditLogs } from './components/SystemAuditLogs.tsx';
import { EmergencyStopModal } from './components/EmergencyStopModal.tsx';
import { FundsVerificationCenter } from './components/FundsVerificationCenter.tsx';
import { FirstRealMoneyTestModal } from './components/FirstRealMoneyTestModal.tsx';
import { CapabilityRegistryView } from './components/CapabilityRegistryView.tsx';
import { SolanaAssetHub } from './components/SolanaAssetHub.tsx';
import { CompoundingDashboard } from './components/CompoundingDashboard.tsx';
import { EconomicTruthCenter } from './components/EconomicTruthCenter.tsx';
import { RealFundsDepositModal } from './components/RealFundsDepositModal.tsx';
import { WithdrawNetProfitModal } from './components/WithdrawNetProfitModal.tsx';
import { Boxes, Coins, TrendingUp, ShieldAlert } from 'lucide-react';
import { CapabilityItem, SolanaAssetInfo, LiquidityPosition, TreasurySegregatedModel, CapitalAllocationProposal, AutonomousLearningRecord, CustomerAccount } from './types/omega.ts';

type TabType = 'COMMAND' | 'TRUTH' | 'CAPABILITIES' | 'ASSETS' | 'COMPOUNDING' | 'FUNDS' | 'LEDGER' | 'OPPORTUNITIES' | 'FLEET' | 'X402' | 'TREASURY' | 'JARVIS' | 'OBSERVABILITY';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('COMMAND');
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  // Core Data States
  const [autopilot, setAutopilot] = useState<AutopilotStatus | null>(null);
  const [treasury, setTreasury] = useState<TreasuryState | null>(null);
  const [treasuryConfig, setTreasuryConfig] = useState<any>(null);
  const [sweepEvaluation, setSweepEvaluation] = useState<any>(null);
  const [economicSummary, setEconomicSummary] = useState<any>(null);
  const [ledgerEvents, setLedgerEvents] = useState<LedgerEvent[]>([]);
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [agentWallets, setAgentWallets] = useState<AgentWalletInfo[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [products, setProducts] = useState<MachineProduct[]>([]);
  const [diagnostics, setDiagnostics] = useState<JarvisDiagnostic[]>([]);
  const [rpcMesh, setRpcMesh] = useState<RpcNodeStatus[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [network, setNetwork] = useState<string>('MAINNET');
  const [emergencyStopActive, setEmergencyStopActive] = useState<boolean>(false);

  // Signer & Execution States
  const [signerStatus, setSignerStatus] = useState<SignerStatusReport | null>(null);
  const [autoSignPolicy, setAutoSignPolicy] = useState<AutoSignPolicy | null>(null);
  const [signingRequests, setSigningRequests] = useState<SigningRequest[]>([]);
  const [mainMetrics, setMainMetrics] = useState<MainWalletMetrics | null>(null);

  // YABBAI Omega States
  const [capabilities, setCapabilities] = useState<CapabilityItem[]>([]);
  const [assets, setAssets] = useState<SolanaAssetInfo[]>([]);
  const [lpPositions, setLpPositions] = useState<LiquidityPosition[]>([]);
  const [segregatedTreasury, setSegregatedTreasury] = useState<TreasurySegregatedModel | null>(null);
  const [capitalProposals, setCapitalProposals] = useState<CapitalAllocationProposal[]>([]);
  const [learningHistory, setLearningHistory] = useState<AutonomousLearningRecord[]>([]);
  const [customers, setCustomers] = useState<CustomerAccount[]>([]);
  const [financialAuditTrail, setFinancialAuditTrail] = useState<FinancialAuditEntry[]>([]);

  // Data Fetchers
  const fetchAllData = useCallback(async () => {
    try {
      const res = await fetch('/api/state');
      if (!res.ok) return;
      const data = await res.json();
      
      if (data) {
        // IMMUTABLE SECURITY INVARIANT:
        // HTN1fvHwbzKiMwh9YXZEe3eooiMdoCAs3TweWdiSZV5i is the ONLY withdrawable and destination address.
        const CANONICAL_TREASURY = 'HTN1fvHwbzKiMwh9YXZEe3eooiMdoCAs3TweWdiSZV5i';
        if (data.treasuryConfig && data.treasuryConfig.treasuryAddress !== CANONICAL_TREASURY) {
          console.warn('[SECURITY VIOLATION DETECTED] Discrepancy detected in treasury address. Auto-healing immediately.');
          data.treasuryConfig.treasuryAddress = CANONICAL_TREASURY;
        }
        if (data.treasury && data.treasury.treasuryAddress !== CANONICAL_TREASURY) {
          data.treasury.treasuryAddress = CANONICAL_TREASURY;
        }

        setAutopilot(data.autopilot);
        setTreasury(data.treasury);
        setTreasuryConfig(data.treasuryConfig);
        setSweepEvaluation(data.sweepEvaluation);
        setNetwork(data.network || 'MAINNET');
        setEmergencyStopActive(Boolean(data.emergencyStop));
        setEconomicSummary(data.economicSummary);
        setLedgerEvents(data.ledgerEvents || []);
        setAgents(data.agents || []);
        setAgentWallets(data.agentWallets || []);
        setOpportunities(data.opportunities || []);
        setProviders(data.providers || []);
        setProducts(data.products || []);
        setDiagnostics(data.diagnostics || []);
        setAuditLogs(data.auditLogs || []);
        setSignerStatus(data.signerStatus || null);
        setAutoSignPolicy(data.autoSignPolicy || null);
        setSigningRequests(data.signingRequests || []);
        setCapabilities(data.capabilities || []);
        setAssets(data.assets || []);
        setLpPositions(data.lpPositions || []);
        setSegregatedTreasury(data.segregatedTreasury || null);
        setCapitalProposals(data.capitalProposals || []);
        setLearningHistory(data.learningHistory || []);
        setCustomers(data.customers || []);
        setFinancialAuditTrail(data.financialAuditTrail || []);
      }

      // Fetch Main Metrics
      const mainRes = await fetch('/api/funds/main');
      if (mainRes.ok) {
        const mData = await mainRes.json();
        setMainMetrics(mData);
      }
    } catch {
      // Graceful fallback for dev server restarts
    }
  }, []);

  const fetchRpcMesh = useCallback(async () => {
    try {
      const res = await fetch('/api/rpc/mesh');
      if (res.ok) {
        const data = await res.json();
        setRpcMesh(data.mesh || []);
      }
    } catch {
      // Gracefully handle RPC probe timeouts
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    fetchRpcMesh();
    const interval = setInterval(fetchAllData, 3500);
    const rpcInterval = setInterval(fetchRpcMesh, 15000);
    return () => {
      clearInterval(interval);
      clearInterval(rpcInterval);
    };
  }, [fetchAllData, fetchRpcMesh]);

  // Actions
  const handleToggleAutoSign = async () => {
    const isCurrentlyEnabled = autoSignPolicy?.enabled;
    const endpoint = isCurrentlyEnabled ? '/api/autosign/disable' : '/api/autosign/enable';
    await fetch(endpoint, { method: 'POST' });
    fetchAllData();
  };

  const handleToggleAutopilot = async (running: boolean) => {
    await fetch('/api/autopilot/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ running })
    });
    fetchAllData();
  };

  const handleEmergencyStop = async (active: boolean) => {
    if (active) {
      setIsEmergencyModalOpen(true);
    } else {
      await fetch('/api/security/start', { method: 'POST' });
      fetchAllData();
    }
  };

  const confirmEmergencyStop = async () => {
    await fetch('/api/security/stop', { method: 'POST' });
    fetchAllData();
  };

  const handleForceCycle = async () => {
    await fetch('/api/autopilot/cycle', { method: 'POST' });
    fetchAllData();
  };

  const handleExecuteCommand = async (command: string): Promise<string> => {
    const res = await fetch('/api/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command })
    });
    const data = await res.json();
    fetchAllData();
    return data.output || 'Command executed.';
  };

  const safeApiPost = async (url: string, body: any, maxRetries = 3) => {
    let lastError: any = null;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
        const res = await fetch(url, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(body),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        const text = await res.text();
        let data: any = {};
        try {
          data = JSON.parse(text);
        } catch {
          if (!res.ok) {
            throw new Error(`Server returned HTTP ${res.status}`);
          }
          return { success: true };
        }
        if (!res.ok) {
          throw new Error(data.error || `HTTP ${res.status}`);
        }
        return data;
      } catch (err: any) {
        lastError = err;
        // If aborted or network dropped, wait with exponential backoff and retry
        if (attempt < maxRetries - 1) {
          await new Promise(r => setTimeout(r, 400 * Math.pow(2, attempt)));
        }
      }
    }
    throw lastError || new Error('Network request failed after retries');
  };

  const handleReconcileEvent = async (
    eventId: string, 
    transactionSignature: string, 
    destinationWallet = 'HTN1fvHwbzKiMwh9YXZEe3eooiMdoCAs3TweWdiSZV5i',
    extra?: { 
      signatures?: string[]; 
      stageSignatures?: { stage1?: string; stage2?: string; stage3?: string }; 
      trustedWithdrawal?: boolean;
    }
  ) => {
    try {
      await safeApiPost('/api/ledger/reconcile', {
        eventId, 
        transactionSignature,
        destinationWallet,
        ...extra
      });
      fetchAllData();
    } catch (err: unknown) {
      console.warn(`[Ledger] Reconciliation network notice for ${eventId}:`, (err as Error).message);
    }
  };

  const handleReconcileBatch = async (
    items: Array<{
      eventId: string;
      transactionSignature: string;
      destinationWallet?: string;
      signatures?: string[];
      stageSignatures?: { stage1?: string; stage2?: string; stage3?: string };
      trustedWithdrawal?: boolean;
    }>
  ) => {
    try {
      // Process in chunks of 50 to optimize network transport and prevent payload drops
      const chunkSize = 50;
      for (let i = 0; i < items.length; i += chunkSize) {
        const chunk = items.slice(i, i + chunkSize);
        await safeApiPost('/api/ledger/reconcile-batch', { events: chunk });
      }
    } catch (err: unknown) {
      // Automatic transparent fallback to individual reconciliations if batch endpoint fails
      console.warn('Batch endpoint failed, falling back to sequential reconciliation:', err);
      for (const item of items) {
        try {
          await safeApiPost('/api/ledger/reconcile', {
            eventId: item.eventId,
            transactionSignature: item.transactionSignature,
            destinationWallet: item.destinationWallet,
            signatures: item.signatures,
            stageSignatures: item.stageSignatures,
            trustedWithdrawal: item.trustedWithdrawal
          });
        } catch (singleErr) {
          console.error(`Reconcile failed for item ${item.eventId}:`, singleErr);
        }
      }
    }
    fetchAllData();
  };

  const handlePurgeTestArtifacts = async () => {
    const res = await fetch('/api/ledger/purge-test-artifacts', { method: 'POST' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to purge test artifacts');
    }
    fetchAllData();
  };

  const handleClearUnverified = async (preserveVerifiedOnly = true) => {
    const res = await fetch('/api/ledger/clear-unverified', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preserveVerifiedOnly })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to clear unverified records');
    }
    fetchAllData();
  };

  const handleDismissEvent = async (eventId: string) => {
    const res = await fetch(`/api/ledger/event/${encodeURIComponent(eventId)}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to dismiss event');
    }
    fetchAllData();
  };

  const handleScanOpportunities = async () => {
    await fetch('/api/opportunities/scan', { method: 'POST' });
    fetchAllData();
  };

  const handleExecuteOpportunity = async (opportunityId: string) => {
    const res = await fetch('/api/opportunities/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ opportunityId })
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Execution failed');
    }
    fetchAllData();
  };

  const handleToggleProvider = async (providerId: string, isEnabled: boolean) => {
    await fetch('/api/opportunities/toggle-provider', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providerId, isEnabled })
    });
    fetchAllData();
  };

  const handleRequestChallenge = async (productId: string): Promise<X402Challenge> => {
    const res = await fetch('/api/x402/challenge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId })
    });
    const data = await res.json();
    return data.challenge;
  };

  const handleVerifyPayment = async (challengeId: string, transactionSignature: string, payload?: Record<string, unknown>) => {
    const res = await fetch('/api/x402/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId, transactionSignature, requestPayload: payload })
    });
    const data = await res.json();
    fetchAllData();
    return data;
  };

  const handleExecuteSweep = async (destinationAddress?: string, amountSol?: number) => {
    const res = await fetch('/api/treasury/sweep', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        destinationAddress: destinationAddress?.trim() || 'HTN1fvHwbzKiMwh9YXZEe3eooiMdoCAs3TweWdiSZV5i',
        amountSol
      })
    });
    const data = await res.json();
    fetchAllData();
    return data;
  };

  const handleUpdateTreasuryConfig = async (newConfig: any) => {
    await fetch('/api/treasury/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newConfig,
        treasuryAddress: 'HTN1fvHwbzKiMwh9YXZEe3eooiMdoCAs3TweWdiSZV5i'
      })
    });
    fetchAllData();
  };

  const handleRunTestSuite = async () => {
    const res = await fetch('/api/jarvis/test', { method: 'POST' });
    const data = await res.json();
    fetchAllData();
    return data;
  };

  const handleTriggerSelfImprovement = async () => {
    const res = await fetch('/api/jarvis/improve', { method: 'POST' });
    const data = await res.json();
    fetchAllData();
    return data.diagnostic;
  };

  const readyToSignCount = signingRequests.filter(r => r.state === 'READY_TO_SIGN').length;
  const sweepsReadyCount = agentWallets.filter(w => w.sweepEligible).length;

  const tabs: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
    { id: 'COMMAND', label: 'Command & Autopilot', icon: <Terminal className="w-4 h-4" /> },
    { id: 'TRUTH', label: 'Economic Truth & Blocker', icon: <ShieldCheck className="w-4 h-4 text-emerald-400" /> },
    { id: 'CAPABILITIES', label: 'Capability Registry', icon: <Boxes className="w-4 h-4 text-purple-400" /> },
    { id: 'ASSETS', label: 'Solana Asset Hub', icon: <Coins className="w-4 h-4 text-amber-400" /> },
    { id: 'COMPOUNDING', label: 'Compounding & Treasury', icon: <TrendingUp className="w-4 h-4 text-emerald-400" /> },
    { id: 'FUNDS', label: 'Funds & Real Verification', icon: <ShieldCheck className="w-4 h-4 text-emerald-400" /> },
    { id: 'LEDGER', label: 'Economic Ledger', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'OPPORTUNITIES', label: 'Opportunities', icon: <Compass className="w-4 h-4" /> },
    { id: 'FLEET', label: '21 Agent Fleet', icon: <Users className="w-4 h-4" /> },
    { id: 'X402', label: 'x402 Products', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'TREASURY', label: 'Treasury & Reserves', icon: <Vault className="w-4 h-4" /> },
    { id: 'JARVIS', label: 'JARVIS Self-Loop', icon: <Cpu className="w-4 h-4" /> },
    { id: 'OBSERVABILITY', label: 'Mesh & Audit', icon: <Activity className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Top Persistent Operator HUD */}
      <TopOperatorHud
        signerStatus={signerStatus || undefined}
        autoSignPolicy={autoSignPolicy || undefined}
        mainMetrics={mainMetrics || undefined}
        pendingCount={readyToSignCount}
        agentWalletsCount={agentWallets.length}
        sweepsReadyCount={sweepsReadyCount}
        emergencyStop={emergencyStopActive}
        onToggleAutoSign={handleToggleAutoSign}
        onEmergencyStop={() => handleEmergencyStop(true)}
        onStartFirstTest={() => setIsTestModalOpen(true)}
        onOpenDeposit={() => setIsDepositModalOpen(true)}
        onOpenWithdraw={() => setIsWithdrawModalOpen(true)}
        onRefresh={fetchAllData}
      />

      {/* Top Command HUD */}
      <CommandHUD
        autopilot={autopilot}
        treasury={treasury}
        emergencyStop={emergencyStopActive}
        network={network}
        onToggleAutopilot={handleToggleAutopilot}
        onEmergencyStop={handleEmergencyStop}
        onForceCycle={handleForceCycle}
        onExecuteCommand={handleExecuteCommand}
        onOpenWithdraw={() => setIsWithdrawModalOpen(true)}
      />

      {/* Emergency Stop Active Alert Banner */}
      {emergencyStopActive && (
        <div className="bg-rose-950/90 border-b border-rose-800/80 px-4 py-2.5 text-center text-xs font-mono text-rose-200 flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
          <span className="font-bold uppercase tracking-wider">
            GLOBAL EMERGENCY STOP ACTIVE — All autonomous spending & signing halted.
          </span>
          <button
            onClick={() => handleEmergencyStop(false)}
            className="ml-3 px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-bold"
          >
            LIFT STOP
          </button>
        </div>
      )}

      {/* Navigation Tabs Bar */}
      <div className="border-b border-neutral-800/80 bg-neutral-900/40 sticky top-[41px] z-30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none font-mono text-xs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id.toLowerCase()}`}
                onClick={() => setCurrentTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition-all shrink-0 font-medium ${
                  currentTab === tab.id
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/40 shadow-sm font-bold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Workspace Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* TAB: COMMAND & AUTOPILOT */}
        {currentTab === 'COMMAND' && (
          <div className="space-y-6">
            
            {/* Autonomous Autopilot Status Hero */}
            <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 relative overflow-hidden shadow-lg">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase text-emerald-400 font-bold tracking-wider">
                      Autonomous Autopilot Engine
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-full ${
                      emergencyStopActive 
                        ? 'bg-rose-950 text-rose-300 border border-rose-800' 
                        : autopilot?.isRunning
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 animate-pulse'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {emergencyStopActive ? 'HALTED' : (autopilot?.isRunning ? 'LIVE AUTONOMOUS' : 'PAUSED')}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-neutral-100 font-sans tracking-tight">
                    Machine Economy Continuous Execution Loop
                  </h2>
                  <p className="text-xs text-neutral-300 font-mono">
                    {autopilot?.lastActionSummary || 'Autopilot observing cluster...'}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
                  <button
                    onClick={handleForceCycle}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 rounded-lg border border-neutral-700 flex items-center gap-2 transition-colors"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Run Single Step</span>
                  </button>

                  <button
                    onClick={() => handleToggleAutopilot(!autopilot?.isRunning)}
                    disabled={emergencyStopActive}
                    className={`px-5 py-2 font-bold rounded-lg flex items-center gap-2 transition-colors shadow-sm ${
                      autopilot?.isRunning
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/40 hover:bg-amber-500/20'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{autopilot?.isRunning ? 'Pause Autopilot' : 'Start Autopilot'}</span>
                  </button>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-neutral-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase">Cycles Executed</span>
                  <p className="text-lg font-bold text-neutral-100">#{autopilot?.cyclesCompleted || 0}</p>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase">Active Opportunities</span>
                  <p className="text-lg font-bold text-cyan-300">{opportunities.length}</p>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase">Executing Agents</span>
                  <p className="text-lg font-bold text-purple-300">
                    {agents.filter(a => a.state === 'EXECUTING').length} / {agents.length}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase">Verified Realized Profit</span>
                  <p className="text-lg font-bold text-emerald-400">
                    {(mainMetrics?.verifiedProfitSol || treasury?.realizedProfitSol || 0).toFixed(4)} SOL
                  </p>
                </div>
              </div>
            </div>

            {/* Quick-Access View of Economic Ledger & Opportunities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Ledger Preview */}
              <div className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-neutral-100">Authoritative Ledger Snapshot</h3>
                  </div>
                  <button 
                    onClick={() => setCurrentTab('LEDGER')}
                    className="text-xs text-emerald-400 hover:underline font-mono"
                  >
                    View Full Ledger &rarr;
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs font-mono text-center">
                  <div className="p-2.5 rounded bg-neutral-950 border border-emerald-900/40">
                    <span className="text-[10px] text-neutral-500 block">REAL PROFIT</span>
                    <span className="text-emerald-400 font-bold">{(economicSummary?.real.realizedProfitSol || 0).toFixed(4)} SOL</span>
                  </div>
                  <div className="p-2.5 rounded bg-neutral-950 border border-amber-900/40">
                    <span className="text-[10px] text-neutral-500 block">PENDING</span>
                    <span className="text-amber-400 font-bold">{(economicSummary?.pending.pendingNetSol || 0).toFixed(4)} SOL</span>
                  </div>
                  <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800">
                    <span className="text-[10px] text-neutral-500 block">EVENTS</span>
                    <span className="text-neutral-200 font-bold">{ledgerEvents.length} Recorded</span>
                  </div>
                </div>

                <div className="space-y-1.5 font-mono text-[11px] max-h-44 overflow-y-auto">
                  {ledgerEvents.slice(0, 4).map((evt, idx) => (
                    <div key={`${evt.eventId}-${idx}`} className="p-2 bg-neutral-950 rounded border border-neutral-900 flex items-center justify-between">
                      <div className="truncate max-w-[200px]">
                        <span className="text-neutral-300 font-semibold">{evt.eventId}</span>
                        <div className="text-[10px] text-neutral-500 truncate">{evt.source}</div>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        evt.truthClass === 'REAL' ? 'text-emerald-400 bg-emerald-950' : 'text-amber-400 bg-amber-950'
                      }`}>
                        {evt.grossAmount.toFixed(4)} SOL
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Opportunities Preview */}
              <div className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-bold text-neutral-100">Top Ranked Opportunities</h3>
                  </div>
                  <button 
                    onClick={() => setCurrentTab('OPPORTUNITIES')}
                    className="text-xs text-cyan-400 hover:underline font-mono"
                  >
                    View All Opportunities &rarr;
                  </button>
                </div>

                <div className="space-y-2 font-mono text-xs max-h-60 overflow-y-auto">
                  {opportunities.slice(0, 3).map((opp, idx) => (
                    <div key={`${opp.id}-${idx}`} className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-neutral-200 text-[11px] truncate max-w-[240px]">{opp.title}</span>
                        <span className="text-emerald-400 font-bold">EV: {opp.expectedValueSol.toFixed(4)} SOL</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-neutral-400">
                        <span>Risk: <strong className="text-cyan-400">{opp.riskLevel}</strong></span>
                        <span>Capital: <strong className="text-neutral-200">{opp.capitalRequiredSol} SOL</strong></span>
                        <span className="text-amber-400 font-semibold">[{opp.status}]</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB: ECONOMIC TRUTH & BLOCKER DIAGNOSTICS */}
        {currentTab === 'TRUTH' && (
          <EconomicTruthCenter
            ledgerSummary={economicSummary}
            ledgerEvents={ledgerEvents}
            onRefresh={fetchAllData}
          />
        )}

        {/* TAB: CAPABILITY REGISTRY */}
        {currentTab === 'CAPABILITIES' && (
          <CapabilityRegistryView
            capabilities={capabilities}
          />
        )}

        {/* TAB: SOLANA ASSET HUB & LIQUIDITY */}
        {currentTab === 'ASSETS' && (
          <SolanaAssetHub
            assets={assets}
            lpPositions={lpPositions}
            onRefresh={fetchAllData}
          />
        )}

        {/* TAB: COMPOUNDING & SEGREGATED TREASURY */}
        {currentTab === 'COMPOUNDING' && (
          <CompoundingDashboard
            segregatedTreasury={segregatedTreasury}
            proposals={capitalProposals}
            learnings={learningHistory}
          />
        )}

        {/* TAB: FUNDS & REAL VERIFICATION */}
        {currentTab === 'FUNDS' && (
          <FundsVerificationCenter
            network={network as any}
            treasuryAddress={treasuryConfig?.treasuryAddress || 'HTN1fvHwbzKiMwh9YXZEe3eooiMdoCAs3TweWdiSZV5i'}
            executionWalletAddress={treasuryConfig?.executionWalletAddress || 'YABBAIExec111111111111111111111111111111111'}
            onRefreshAll={fetchAllData}
          />
        )}

        {/* TAB: ECONOMIC LEDGER */}
        {currentTab === 'LEDGER' && (
          <EconomicLedger
            summary={economicSummary}
            events={ledgerEvents}
            onReconcile={handleReconcileEvent}
            onReconcileBatch={handleReconcileBatch}
            onPurgeTestArtifacts={handlePurgeTestArtifacts}
            onClearUnverified={handleClearUnverified}
            onDismissEvent={handleDismissEvent}
            onRefresh={fetchAllData}
          />
        )}

        {/* TAB: OPPORTUNITY ENGINE */}
        {currentTab === 'OPPORTUNITIES' && (
          <OpportunityEngine
            opportunities={opportunities}
            providers={providers}
            availableSol={treasury?.availableSol || 0}
            emergencyStop={emergencyStopActive}
            onScan={handleScanOpportunities}
            onExecute={handleExecuteOpportunity}
            onToggleProvider={handleToggleProvider}
          />
        )}

        {/* TAB: 20+ AGENT FLEET */}
        {currentTab === 'FLEET' && (
          <AgentFleetMatrix agents={agents} />
        )}

        {/* TAB: x402 MACHINE PRODUCTS */}
        {currentTab === 'X402' && (
          <X402ProductsMarket
            products={products}
            treasuryAddress={treasuryConfig?.treasuryAddress || 'HTN1fvHwbzKiMwh9YXZEe3eooiMdoCAs3TweWdiSZV5i'}
            onRequestChallenge={handleRequestChallenge}
            onVerifyPayment={handleVerifyPayment}
          />
        )}

        {/* TAB: TREASURY */}
        {currentTab === 'TREASURY' && (
          <TreasuryWalletManager
            treasury={treasury}
            config={treasuryConfig}
            sweepEvaluation={sweepEvaluation}
            onExecuteSweep={handleExecuteSweep}
            onUpdateConfig={handleUpdateTreasuryConfig}
            onRefreshAll={fetchAllData}
          />
        )}

        {/* TAB: JARVIS SELF-LOOP */}
        {currentTab === 'JARVIS' && (
          <JarvisEvolutionLoop
            diagnostics={diagnostics}
            onRunTestSuite={handleRunTestSuite}
            onTriggerSelfImprovement={handleTriggerSelfImprovement}
          />
        )}

        {/* TAB: OBSERVABILITY & AUDIT */}
        {currentTab === 'OBSERVABILITY' && (
          <SystemAuditLogs
            logs={auditLogs}
            financialAuditTrail={financialAuditTrail}
            economicSummary={economicSummary}
            treasury={treasury}
            agentWallets={agentWallets}
            agents={agents}
            rpcMesh={rpcMesh}
            onRefreshRpc={fetchRpcMesh}
            onForceResync={fetchAllData}
          />
        )}

      </main>

      {/* Emergency Stop Modal Dialog */}
      <EmergencyStopModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        onConfirmStop={confirmEmergencyStop}
        onLiftStop={() => handleEmergencyStop(false)}
        isCurrentlyStopped={emergencyStopActive}
      />

      {/* Controlled First Real Money Test Modal */}
      {isTestModalOpen && (
        <FirstRealMoneyTestModal
          mainMetrics={mainMetrics || undefined}
          signerStatus={signerStatus || undefined}
          onClose={() => setIsTestModalOpen(false)}
          onSuccess={() => {
            setIsTestModalOpen(false);
            fetchAllData();
          }}
        />
      )}

      {/* Real Funds Deposit Modal */}
      {isDepositModalOpen && (
        <RealFundsDepositModal
          onClose={() => setIsDepositModalOpen(false)}
          onSuccess={() => {
            setIsDepositModalOpen(false);
            fetchAllData();
          }}
        />
      )}

      {/* Real On-Chain Net Profit Withdrawal Modal */}
      {isWithdrawModalOpen && (
        <WithdrawNetProfitModal
          treasury={treasury || undefined}
          mainMetrics={mainMetrics || undefined}
          onClose={() => setIsWithdrawModalOpen(false)}
          onSuccess={() => {
            fetchAllData();
          }}
          onOpenDeposit={() => {
            setIsWithdrawModalOpen(false);
            setIsDepositModalOpen(true);
          }}
        />
      )}

    </div>
  );
}
