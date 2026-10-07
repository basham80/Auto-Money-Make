import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Wallet, 
  Coins, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Lock, 
  Search, 
  TrendingUp, 
  FileText, 
  Layers, 
  Sparkles, 
  Sliders, 
  ArrowRight,
  Send,
  HelpCircle,
  Copy,
  Check,
  Zap,
  Activity,
  Key,
  Flame,
  Cpu,
  Hash,
  FileCode,
  DollarSign,
  PieChart,
  ShieldAlert,
  FileCheck
} from 'lucide-react';
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
  FundAlert, 
  SigningRequest,
  SigningBatch,
  AgentWalletInfo,
  SignerStatusReport,
  AutoSignPolicy,
  MainWalletMetrics
} from '../types/index.ts';
import { SigningModal } from './SigningModal.tsx';
import { FirstRealMoneyTestModal } from './FirstRealMoneyTestModal.tsx';
import { AgentFundingModal } from './AgentFundingModal.tsx';
import { WithdrawNetProfitModal } from './WithdrawNetProfitModal.tsx';

interface FundsVerificationCenterProps {
  network: NetworkMode;
  treasuryAddress: string;
  executionWalletAddress: string;
  onRefreshAll?: () => void;
}

export const FundsVerificationCenter: React.FC<FundsVerificationCenterProps> = ({
  network,
  treasuryAddress,
  executionWalletAddress,
  onRefreshAll
}) => {
  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'SIGNING_QUEUE' | 'AGENT_WALLETS' | 'TRANSACTIONS' | 'PROVENANCE' | 'SWEEPS' | 'RECONCILIATION'
  >('OVERVIEW');
  
  // State variables
  const [mainMetrics, setMainMetrics] = useState<MainWalletMetrics | null>(null);
  const [signerStatus, setSignerStatus] = useState<SignerStatusReport | null>(null);
  const [autoSignPolicy, setAutoSignPolicy] = useState<AutoSignPolicy | null>(null);
  const [signingRequests, setSigningRequests] = useState<SigningRequest[]>([]);
  const [signingBatches, setSigningBatches] = useState<SigningBatch[]>([]);
  const [agentWallets, setAgentWallets] = useState<AgentWalletInfo[]>([]);
  
  const [selectedWalletAddress, setSelectedWalletAddress] = useState<string>(treasuryAddress);
  const [walletDetail, setWalletDetail] = useState<WalletVerificationDetail | null>(null);
  const [assetsReport, setAssetsReport] = useState<WalletAssetsReport | null>(null);
  const [transactions, setTransactions] = useState<OnChainTransactionDetail[]>([]);
  const [provenanceList, setProvenanceList] = useState<ProvenanceChain[]>([]);
  const [profitReport, setProfitReport] = useState<RealizedProfitReport | null>(null);
  const [destinationConfig, setDestinationConfig] = useState<ProfitDestinationConfig | null>(null);
  const [sweepPreview, setSweepPreview] = useState<ProfitSweepPreview | null>(null);
  const [reconciliation, setReconciliation] = useState<FundsReconciliationReport | null>(null);
  const [alerts, setAlerts] = useState<FundAlert[]>([]);
  
  // Modals & Active Selectors
  const [signingModalRequest, setSigningModalRequest] = useState<SigningRequest | null>(null);
  const [signingModalBatch, setSigningModalBatch] = useState<SigningBatch | null>(null);
  const [fundingModalWallet, setFundingModalWallet] = useState<AgentWalletInfo | null>(null);
  const [testWorkflowOpen, setTestWorkflowOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [selectedProofRequest, setSelectedProofRequest] = useState<SigningRequest | null>(null);

  // Status & Notifications
  const [isLoading, setIsLoading] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Copier
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Main Data Polling & Hydration
  const refreshAllData = async () => {
    setIsLoading(true);
    try {
      // 1. Main Treasury Details
      const mainRes = await fetch('/api/funds/main');
      if (mainRes.ok) {
        const data = await mainRes.json();
        setMainMetrics(data);
      }

      // 2. Signer Status
      const signerRes = await fetch('/api/signing/status');
      if (signerRes.ok) {
        const data = await signerRes.json();
        setSignerStatus(data);
      }

      // 3. Executions & Signing Queue
      const execRes = await fetch('/api/executions');
      if (execRes.ok) {
        const data = await execRes.json();
        setSigningRequests(data.requests || []);
        setSigningBatches(data.batches || []);
      }

      // 4. Agent Wallets
      const walletsRes = await fetch('/api/agents/wallets');
      if (walletsRes.ok) {
        const data = await walletsRes.json();
        setAgentWallets(data.wallets || []);
      }

      // 5. Profit & Provenance
      const profitRes = await fetch('/api/profit');
      if (profitRes.ok) {
        const data = await profitRes.json();
        setProfitReport(data);
      }

      const provRes = await fetch('/api/profit/provenance');
      if (provRes.ok) {
        const data = await provRes.json();
        setProvenanceList(data.provenance || []);
      }

      // 6. Reconciliation & Transactions
      const reconRes = await fetch('/api/funds/reconcile');
      if (reconRes.ok) {
        const data = await reconRes.json();
        setReconciliation(data);
      }

      const txRes = await fetch(`/api/funds/wallet/${encodeURIComponent(treasuryAddress)}/transactions?limit=25`);
      if (txRes.ok) {
        const data = await txRes.json();
        setTransactions(data.transactions || []);
      }

      const alertsRes = await fetch('/api/funds/alerts');
      if (alertsRes.ok) {
        const data = await alertsRes.json();
        setAlerts(data.alerts || []);
      }

      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      console.warn('Refresh notice:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
    const interval = setInterval(refreshAllData, 8000);
    return () => clearInterval(interval);
  }, [treasuryAddress]);

  // Handle Auto-Sign Toggle
  const handleToggleAutoSign = async () => {
    const isCurrentlyEnabled = autoSignPolicy?.enabled;
    try {
      const endpoint = isCurrentlyEnabled ? '/api/autosign/disable' : '/api/autosign/enable';
      const res = await fetch(endpoint, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setActionMessage({
          type: 'success',
          text: isCurrentlyEnabled ? 'Auto-Sign disabled. Operator manual approval now required.' : 'Auto-Sign enabled with strict reserve threshold safeguards.'
        });
        refreshAllData();
      } else {
        setActionMessage({ type: 'error', text: data.error || 'Failed to update Auto-Sign policy.' });
      }
    } catch (err: unknown) {
      setActionMessage({ type: 'error', text: (err as Error).message });
    }
  };

  // Handle Batch Execution Trigger
  const handlePrepareAndSignBatch = async (count = 10) => {
    try {
      const res = await fetch('/api/signing/batch/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetCount: count })
      });
      const data = await res.json();
      if (data.success && data.batch) {
        setSigningModalBatch(data.batch);
      } else {
        setActionMessage({ type: 'error', text: data.error || 'No executions ready for batching.' });
      }
    } catch (err: unknown) {
      setActionMessage({ type: 'error', text: (err as Error).message });
    }
  };

  // Handle 65% Sweep Execution for an Agent
  const handleSweepAgent = async (agentId: string) => {
    try {
      const res = await fetch(`/api/agents/wallets/${agentId}/sweep`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setActionMessage({
          type: 'success',
          text: `65% Profit Sweep complete! ${data.sweepAmountSol} SOL swept to Main Treasury. Tx: ${data.receipt?.transactionSignature?.substring(0, 16)}...`
        });
        refreshAllData();
      } else {
        setActionMessage({ type: 'error', text: data.error || 'Sweep execution failed.' });
      }
    } catch (err: unknown) {
      setActionMessage({ type: 'error', text: (err as Error).message });
    }
  };

  const readyToSignList = signingRequests.filter(r => r.state === 'READY_TO_SIGN');
  const readySweepsCount = agentWallets.filter(w => w.sweepEligible).length;

  return (
    <div className="space-y-6 text-slate-100">
      {/* Toast Notification */}
      {actionMessage && (
        <div className={`p-4 rounded-xl border flex items-center justify-between shadow-lg text-xs font-medium animate-in fade-in duration-200 ${
          actionMessage.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200' :
          actionMessage.type === 'error' ? 'bg-red-950/90 border-red-500/50 text-red-200' :
          'bg-slate-800 border-slate-700 text-slate-200'
        }`}>
          <div className="flex items-center gap-2">
            {actionMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-white">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* HERO: SOVEREIGN MAIN WALLET COMMAND & PROVENANCE SUMMARY  */}
      {/* ========================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white tracking-tight">Main Sovereign Profit Wallet</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 border border-emerald-700/60 text-emerald-400">
                    ON-CHAIN SOURCE OF TRUTH
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Direct RPC Mesh verification. Internal database serves strictly as an immutable accounting index.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setWithdrawModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 transition ring-1 ring-emerald-400/40"
              title="Withdraw verified net profit to your sovereign address HTN1...SZV5i"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Withdraw Net Profit</span>
            </button>

            <button
              onClick={() => setTestWorkflowOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-200 text-xs font-semibold shadow-sm transition-all"
            >
              <Zap className="w-4 h-4 text-indigo-400" />
              <span>1-Click Test Workflow</span>
            </button>

            <button
              onClick={handleToggleAutoSign}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                autoSignPolicy?.enabled
                  ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-600/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              <Key className="w-4 h-4" />
              <span>{autoSignPolicy?.enabled ? 'AUTO-SIGN ACTIVE' : 'ENABLE AUTO-SIGN'}</span>
            </button>

            <button
              onClick={refreshAllData}
              disabled={isLoading}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Force Cluster Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Financial Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-6">
          {/* 1. On-Chain SOL Balance */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-medium block">ON-CHAIN BALANCE</span>
            <span className="text-xl font-mono font-bold text-white block">
              {(mainMetrics?.onChainBalanceSol || 0).toFixed(4)} <span className="text-xs text-slate-500 font-normal">SOL</span>
            </span>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
              <CheckCircle2 className="w-3 h-3" />
              <span>Confirmed RPC</span>
            </div>
          </div>

          {/* 2. Spendable Balance */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-medium block">SPENDABLE CAPITAL</span>
            <span className="text-xl font-mono font-bold text-indigo-300 block">
              {(mainMetrics?.spendableSol || 0).toFixed(4)} <span className="text-xs text-slate-500 font-normal">SOL</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono block">Exceeds 30% reserve</span>
          </div>

          {/* 3. Protected Reserve */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-medium block">SAFETY RESERVES</span>
            <span className="text-xl font-mono font-bold text-amber-300 block">
              {(mainMetrics?.reservedSol || 0).toFixed(4)} <span className="text-xs text-slate-500 font-normal">SOL</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono block">Locked safety floor</span>
          </div>

          {/* 4. Verified Realized Profit */}
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-1">
            <span className="text-[11px] text-emerald-400 font-semibold block">VERIFIED REAL PROFIT</span>
            <span className="text-xl font-mono font-bold text-emerald-400 block">
              +{(mainMetrics?.verifiedProfitSol || 0).toFixed(4)} <span className="text-xs text-emerald-600 font-normal">SOL</span>
            </span>
            <span className="text-[10px] text-emerald-500/80 font-mono block">Net realized on-chain</span>
          </div>

          {/* 5. Agent Capital Deployed */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-medium block">AGENT FLEET CAPITAL</span>
            <span className="text-xl font-mono font-bold text-slate-200 block">
              {(mainMetrics?.agentCapitalSol || 0).toFixed(4)} <span className="text-xs text-slate-500 font-normal">SOL</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono block">{agentWallets.length} active agent wallets</span>
          </div>

          {/* 6. Pending Signatures */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-medium block">QUEUE / SWEEPS</span>
            <div className="flex items-center gap-2">
              <span className={`text-xl font-mono font-bold ${readyToSignList.length > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                {readyToSignList.length}
              </span>
              <span className="text-xs text-slate-500">/</span>
              <span className={`text-xl font-mono font-bold ${readySweepsCount > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                {readySweepsCount}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono block">Pending / Ready Sweeps</span>
          </div>
        </div>

        {/* Main Wallet Address Bar */}
        <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-slate-400 font-medium">TREASURY ADDRESS:</span>
            <span className="font-mono text-slate-200 font-medium break-all">{treasuryAddress}</span>
            <button
              onClick={() => copyToClipboard(treasuryAddress, 'treasury')}
              className="p-1 rounded text-slate-400 hover:text-white"
              title="Copy address"
            >
              {copiedText === 'treasury' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://explorer.solana.com/address/${treasuryAddress}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
            >
              <span>View On-Chain Explorer</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* NAVIGATION TABS                                           */}
      {/* ========================================================= */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'OVERVIEW', label: 'EXECUTION ARCHITECTURE', icon: Sparkles },
          { id: 'SIGNING_QUEUE', label: `SIGNING QUEUE (${readyToSignList.length})`, icon: Key },
          { id: 'AGENT_WALLETS', label: `AGENT WALLETS (${agentWallets.length})`, icon: Cpu },
          { id: 'SWEEPS', label: `65% PROFIT SWEEPS (${readySweepsCount})`, icon: Flame },
          { id: 'TRANSACTIONS', label: 'ON-CHAIN TRANSACTIONS', icon: Layers },
          { id: 'PROVENANCE', label: 'PROVENANCE CHAINS', icon: FileCheck },
          { id: 'RECONCILIATION', label: 'RECONCILIATION AUDIT', icon: Activity },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: OVERVIEW & FLOW ARCHITECTURE                       */}
      {/* ========================================================= */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Sovereign Money Flow Diagram */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Sovereign Money Flow & Profit Architecture</span>
            </h3>
            <p className="text-xs text-slate-400">
              End-to-end mathematical lifecycle of every lamport in YABBAI Ω.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-2 pt-2 text-center text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 font-bold block">STAGE 1</span>
                <span className="font-semibold text-slate-200 block">MAIN TREASURY</span>
                <span className="text-[11px] text-slate-400 block font-mono">{(mainMetrics?.onChainBalanceSol || 0).toFixed(2)} SOL</span>
              </div>
              <div className="flex items-center justify-center text-slate-600">
                <ArrowRight className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 font-bold block">STAGE 2</span>
                <span className="font-semibold text-indigo-300 block">AGENT FUNDING</span>
                <span className="text-[11px] text-slate-400 block font-mono">Direct Transfers</span>
              </div>
              <div className="flex items-center justify-center text-slate-600">
                <ArrowRight className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 font-bold block">STAGE 3</span>
                <span className="font-semibold text-amber-300 block">EXECUTION</span>
                <span className="text-[11px] text-slate-400 block font-mono">Micro Execution</span>
              </div>
              <div className="flex items-center justify-center text-slate-600">
                <ArrowRight className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 space-y-1">
                <span className="text-[10px] text-emerald-400 font-bold block">STAGE 4</span>
                <span className="font-semibold text-emerald-300 block">65% PROFIT SWEEP</span>
                <span className="text-[11px] text-emerald-400 block font-mono">Back to Main</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                <h4 className="font-bold text-sm text-white">Execution Authorization</h4>
              </div>
              <p className="text-xs text-slate-400">
                {readyToSignList.length} transactions pending authorization in the execution queue.
              </p>
              <button
                onClick={() => setActiveTab('SIGNING_QUEUE')}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                Inspect Signing Queue
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-emerald-400" />
                <h4 className="font-bold text-sm text-white">1.0 SOL Sweep Engine</h4>
              </div>
              <p className="text-xs text-slate-400">
                {readySweepsCount} agent wallets reached the 1.0 SOL threshold and are ready for 65% sweep.
              </p>
              <button
                onClick={() => setActiveTab('SWEEPS')}
                className="w-full py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-xs font-semibold transition-colors"
              >
                Review Sweep Opportunities
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-400" />
                <h4 className="font-bold text-sm text-white">Real-Time Reconciliation</h4>
              </div>
              <p className="text-xs text-slate-400">
                Cluster audit comparing on-chain state against internal ledger records.
              </p>
              <button
                onClick={() => setActiveTab('RECONCILIATION')}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                View Discrepancy Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: SIGNING & EXECUTION QUEUE                          */}
      {/* ========================================================= */}
      {activeTab === 'SIGNING_QUEUE' && (
        <div className="space-y-6">
          {/* Bulk Controls Header */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                <span>Execution Signing Queue</span>
              </h3>
              <p className="text-xs text-slate-400">
                Review, freeze, and authorize execution transactions individually or in atomic batches.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePrepareAndSignBatch(10)}
                disabled={readyToSignList.length === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all"
              >
                <span>SIGN ALL READY ({readyToSignList.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Queue Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">EXECUTION ID</th>
                    <th className="p-3.5">AGENT</th>
                    <th className="p-3.5">SPEND (CAP)</th>
                    <th className="p-3.5">EST. FEES</th>
                    <th className="p-3.5">EXPECTED PROFIT</th>
                    <th className="p-3.5">STATE</th>
                    <th className="p-3.5 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {signingRequests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500 font-sans">
                        No transactions currently in queue. Autopilot and agents generate opportunities dynamically.
                      </td>
                    </tr>
                  ) : (
                    signingRequests.map(req => (
                      <tr key={req.executionId} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 text-slate-200 font-bold">{req.executionId}</td>
                        <td className="p-3.5 text-indigo-300 font-sans">{req.agentId}</td>
                        <td className="p-3.5 text-white font-bold">{req.amountSol.toFixed(4)} SOL</td>
                        <td className="p-3.5 text-slate-400">{req.baseFeeSol.toFixed(6)} SOL</td>
                        <td className="p-3.5 text-emerald-400 font-bold">+{req.expectedProfitSol.toFixed(4)} SOL</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            req.state === 'READY_TO_SIGN' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                            req.state === 'PROFIT_REALIZED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                            req.state === 'SUBMITTED' ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' :
                            'bg-slate-800 text-slate-300'
                          }`}>
                            {req.state}
                          </span>
                        </td>
                        <td className="p-3.5 text-right font-sans">
                          {req.state === 'READY_TO_SIGN' ? (
                            <button
                              onClick={() => setSigningModalRequest(req)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                            >
                              SIGN NOW
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedProofRequest(req)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                            >
                              View Proof
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: AGENT WALLETS MATRIX                               */}
      {/* ========================================================= */}
      {activeTab === 'AGENT_WALLETS' && (
        <div className="space-y-6">
          {/* Swarm Mode Delegation Notice */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/30 border border-purple-500/30 font-mono shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold flex items-center gap-1">
                    <Zap className="w-3 h-3 text-purple-400" />
                    COORDINATED SWARM EXECUTION ACTIVE
                  </span>
                  <span className="text-[11px] text-slate-400 font-sans font-semibold">
                    {agentWallets.filter(w => w.currentBalanceSol >= 0.05).length} / {agentWallets.length} Wallets Funded
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-sans">
                  All 20 agents operate collaboratively through <span className="text-purple-300 font-mono font-semibold">SERVER_SIGNER</span> and the Master Treasury Wallet (<span className="text-emerald-400 font-mono font-semibold">{treasuryAddress.slice(0, 6)}...{treasuryAddress.slice(-4)}</span>) to build income until individual agent wallets receive real Mainnet SOL.
                </p>
              </div>

              <div className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs shrink-0">
                <span className="text-slate-500 block text-[10px]">Master Signing Anchor</span>
                <span className="text-emerald-400 font-bold font-mono">HTN1...V5i</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-400" />
                <span>Agent Fleet Wallets</span>
              </h3>
              <p className="text-xs text-slate-400">
                Individual agent execution wallets with sovereign on-chain balances and automated capital management.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agentWallets.map(wallet => (
              <div key={wallet.agentWalletId} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="font-bold text-sm text-white">{wallet.agentName}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    wallet.sweepEligible ? 'bg-emerald-950 text-emerald-400 border border-emerald-700' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {wallet.status}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Address:</span>
                    <a
                      href={wallet.explorerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 truncate max-w-[140px]"
                    >
                      {wallet.publicAddress.substring(0, 6)}...{wallet.publicAddress.substring(wallet.publicAddress.length - 4)}
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">On-Chain Balance:</span>
                    <span className="font-bold text-white">{wallet.currentBalanceSol.toFixed(4)} SOL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Eligible Real Profit:</span>
                    <span className="font-bold text-emerald-400">+{wallet.eligibleProfitSol.toFixed(4)} SOL</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setFundingModalWallet(wallet)}
                    className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                  >
                    Fund Capital
                  </button>
                  {wallet.sweepEligible && (
                    <button
                      onClick={() => handleSweepAgent(wallet.agentId)}
                      className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                    >
                      Sweep 65% ({wallet.pendingSweepSol} SOL)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: 65% PROFIT SWEEPS                                  */}
      {/* ========================================================= */}
      {activeTab === 'SWEEPS' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-emerald-400" />
              <span>1.0 SOL Sweep Engine (65% Sweep / 35% Retained)</span>
            </h3>
            <p className="text-xs text-slate-400">
              When an agent wallet hits the 1.0 SOL threshold with verified realized profit, 65% is swept back to the Main Treasury while 35% is retained for ongoing machine operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agentWallets.filter(w => w.sweepEligible).length === 0 ? (
              <div className="col-span-2 p-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
                No agent wallets currently meet the 1.0 SOL sweep threshold. As agents execute opportunities, eligible profits accumulate automatically.
              </div>
            ) : (
              agentWallets.filter(w => w.sweepEligible).map((wallet, idx) => (
                <div key={`${wallet.agentId}-${idx}`} className="p-5 rounded-2xl bg-slate-900 border border-emerald-800/40 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-white">{wallet.agentName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                      SWEEP READY
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Current Balance:</span>
                      <span className="text-white font-bold">{wallet.currentBalanceSol.toFixed(4)} SOL</span>
                    </div>
                    <div className="flex justify-between text-emerald-400">
                      <span>65% Sweep to Main Treasury:</span>
                      <span className="font-bold">+{wallet.pendingSweepSol.toFixed(4)} SOL</span>
                    </div>
                    <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                      <span>35% Retained Operating Capital:</span>
                      <span>{(wallet.currentBalanceSol - wallet.pendingSweepSol).toFixed(4)} SOL</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSweepAgent(wallet.agentId)}
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Flame className="w-4 h-4" />
                    <span>EXECUTE 65% SWEEP TO MAIN TREASURY</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: ON-CHAIN TRANSACTIONS                              */}
      {/* ========================================================= */}
      {activeTab === 'TRANSACTIONS' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white">Direct RPC Mesh Transaction History</h3>
              <p className="text-xs text-slate-400">Immutable transactions retrieved directly from Solana cluster nodes.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">SIGNATURE</th>
                    <th className="p-3.5">SLOT / TIME</th>
                    <th className="p-3.5">TYPE</th>
                    <th className="p-3.5">AMOUNT</th>
                    <th className="p-3.5">STATUS</th>
                    <th className="p-3.5 text-right">EXPLORER</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {transactions.map((tx, idx) => (
                    <tr key={`${tx.signature || 'tx'}-${idx}`} className="hover:bg-slate-800/40">
                      <td className="p-3.5 text-slate-200 font-bold truncate max-w-[180px]">{tx.signature}</td>
                      <td className="p-3.5 text-slate-400 font-sans">
                        <div>Slot #{tx.slot}</div>
                        <div className="text-[10px] text-slate-500">{new Date(tx.blockTime * 1000).toLocaleTimeString()}</div>
                      </td>
                      <td className="p-3.5 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.accountingClassification === 'REVENUE' || tx.accountingClassification === 'PROFIT_SWEEP' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                        }`}>
                          {tx.accountingClassification}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-white">
                        {tx.accountingClassification === 'REVENUE' ? '+' : ''}{tx.amountSol.toFixed(4)} SOL
                      </td>
                      <td className="p-3.5 text-emerald-400">{tx.confirmation}</td>
                      <td className="p-3.5 text-right font-sans">
                        <a
                          href={tx.explorerUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
                        >
                          <span>Explorer</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: PROVENANCE CHAINS                                  */}
      {/* ========================================================= */}
      {activeTab === 'PROVENANCE' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="font-bold text-sm text-white">9-Step Economic Provenance Verification</h3>
            <p className="text-xs text-slate-400">Zero-assumption cryptographic chain connecting customer demand to verified realized profit.</p>
          </div>

          <div className="space-y-3">
            {provenanceList.map((item, itemIdx) => (
              <div key={`${item.eventId}-${itemIdx}`} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-white">{item.revenueClassification || item.whyCountedAsProfit}</span>
                  <span className="text-emerald-400 font-mono font-bold">+{item.amountSol.toFixed(4)} SOL</span>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-9 gap-1.5 text-center text-[10px]">
                  {item.evidenceChain.map((step: any, idx: number) => (
                    <div key={`${step.step || 'step'}-${idx}`} className={`p-2 rounded border ${step.verified ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                      <div className="font-bold">{step.step}. {step.label}</div>
                      <div className="truncate text-[9px] text-slate-400">{step.value || step.details}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 7: RECONCILIATION AUDIT                               */}
      {/* ========================================================= */}
      {activeTab === 'RECONCILIATION' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <span>Cluster State Reconciliation</span>
              </h3>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                reconciliation?.status === 'RECONCILED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-amber-950 text-amber-300 border border-amber-700'
              }`}>
                {reconciliation?.status === 'RECONCILED' ? 'STATE RECONCILED: 0 DISCREPANCY' : 'DISCREPANCIES DETECTED'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Continuously guarantees that the database accounting layer reflects 100% of real on-chain assets.
            </p>
          </div>

          {reconciliation && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-1">
                <span className="text-slate-500 text-[10px] block">RPC CONFIRMED SOL</span>
                <span className="text-lg font-bold text-white">{(reconciliation.onChainSol || 0).toFixed(4)} SOL</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-1">
                <span className="text-slate-500 text-[10px] block">DATABASE RECORDED SOL</span>
                <span className="text-lg font-bold text-white">{(reconciliation.ledgerSol || 0).toFixed(4)} SOL</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-1">
                <span className="text-slate-500 text-[10px] block">DELTA / DISCREPANCY</span>
                <span className="text-lg font-bold text-emerald-400">{(reconciliation.differenceSol || 0).toFixed(6)} SOL</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODALS                                                    */}
      {/* ========================================================= */}
      {(signingModalRequest || signingModalBatch) && (
        <SigningModal
          request={signingModalRequest}
          batch={signingModalBatch}
          signerStatus={signerStatus || undefined}
          onClose={() => {
            setSigningModalRequest(null);
            setSigningModalBatch(null);
          }}
          onSuccess={() => {
            setSigningModalRequest(null);
            setSigningModalBatch(null);
            refreshAllData();
          }}
        />
      )}

      {testWorkflowOpen && (
        <FirstRealMoneyTestModal
          mainMetrics={mainMetrics || undefined}
          signerStatus={signerStatus || undefined}
          onClose={() => setTestWorkflowOpen(false)}
          onSuccess={() => {
            setTestWorkflowOpen(false);
            refreshAllData();
          }}
        />
      )}

      {fundingModalWallet && (
        <AgentFundingModal
          wallet={fundingModalWallet}
          mainMetrics={mainMetrics || undefined}
          onClose={() => setFundingModalWallet(null)}
          onSuccess={() => {
            setFundingModalWallet(null);
            refreshAllData();
          }}
        />
      )}

      {/* Execution Proof Inspector Modal */}
      {selectedProofRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-slate-200 space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Execution Provenance Proof</h3>
              <button onClick={() => setSelectedProofRequest(null)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Execution ID:</span>
                <span className="text-white font-bold">{selectedProofRequest.executionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Signature:</span>
                <span className="text-emerald-400 break-all max-w-[240px] truncate">{selectedProofRequest.signature || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">SHA-256 Digest:</span>
                <span className="text-slate-400 text-[10px] break-all max-w-[240px] truncate">{selectedProofRequest.messageDigest}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-800">
                <span className="text-slate-500">Net Realized Profit:</span>
                <span className="text-emerald-400 font-bold">+{selectedProofRequest.expectedProfitSol.toFixed(4)} SOL</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedProofRequest(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real On-Chain Net Profit Withdrawal Modal */}
      {withdrawModalOpen && (
        <WithdrawNetProfitModal
          mainMetrics={mainMetrics || undefined}
          onClose={() => setWithdrawModalOpen(false)}
          onSuccess={() => {
            refreshAllData();
          }}
        />
      )}
    </div>
  );
};
