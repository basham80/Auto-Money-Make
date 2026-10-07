import React, { useState, useEffect } from 'react';
import { 
  Vault, 
  ShieldCheck, 
  Wallet, 
  ArrowRightLeft, 
  Settings, 
  Lock, 
  Coins, 
  AlertCircle, 
  ExternalLink, 
  CheckCircle2,
  ArrowDownLeft,
  RefreshCw,
  Copy,
  Check,
  Zap,
  Trash2
} from 'lucide-react';
import { TreasuryState } from '../types/index.ts';
import { RealFundsDepositModal } from './RealFundsDepositModal.tsx';

interface TreasuryWalletManagerProps {
  treasury: TreasuryState | null;
  config: {
    treasuryAddress: string;
    executionWalletAddress: string;
    reserveRatio: number;
    minimumSweepThresholdSol: number;
    network: string;
  } | null;
  sweepEvaluation: {
    eligible: boolean;
    availableSweepSol: number;
    realizedProfitSol: number;
    reservesRequiredSol: number;
    reason: string;
  } | null;
  onExecuteSweep: (destination?: string, amountSol?: number) => Promise<{ 
    success: boolean; 
    intentId?: string; 
    signature?: string; 
    transactionSignature?: string; 
    explorerUrl?: string; 
    error?: string; 
    sweepAmountSol?: number;
    amountSol?: number;
  }>;
  onUpdateConfig: (newConfig: {
    treasuryAddress?: string;
    executionWalletAddress?: string;
    reserveRatio?: number;
    minimumSweepThresholdSol?: number;
  }) => Promise<void>;
  onRefreshAll?: () => void;
}

const IMMUTABLE_MASTER_WALLET = 'HTN1fvHwbzKiMwh9YXZEe3eooiMdoCAs3TweWdiSZV5i';
const REAL_CUSTODY_WALLET = '7pS2JiAFcMn9dPGqdvGazmkTZuu8XQfdMnxDimpZRLns';

export const TreasuryWalletManager: React.FC<TreasuryWalletManagerProps> = ({
  treasury,
  config,
  sweepEvaluation,
  onExecuteSweep,
  onUpdateConfig,
  onRefreshAll
}) => {
  const [isSweeping, setIsSweeping] = useState(false);
  const [sweepResult, setSweepResult] = useState<{
    success: boolean;
    message: string;
    signature?: string;
    explorerUrl?: string;
  } | null>(null);

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [copiedMaster, setCopiedMaster] = useState(false);
  const [copiedCustody, setCopiedCustody] = useState(false);

  // Withdrawal form state
  const [withdrawDestinationMode, setWithdrawDestinationMode] = useState<'MASTER_TREASURY' | 'CUSTOM_WALLET'>('MASTER_TREASURY');
  const [customDestinationAddress, setCustomDestinationAddress] = useState('');
  const [withdrawAmountSol, setWithdrawAmountSol] = useState('');
  const [phantomAddress, setPhantomAddress] = useState('');

  // Live Custody Wallet Info
  const [custodyInfo, setCustodyInfo] = useState<{
    address: string;
    balanceSol: number;
    balanceLamports: number;
    explorerUrl: string;
  }>({
    address: REAL_CUSTODY_WALLET,
    balanceSol: 0,
    balanceLamports: 0,
    explorerUrl: `https://solscan.io/account/${REAL_CUSTODY_WALLET}`
  });

  // Settings form state
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [editReserveRatio, setEditReserveRatio] = useState(config?.reserveRatio || 0.15);
  const [purging, setPurging] = useState(false);

  const fetchCustodyWallet = async () => {
    try {
      const res = await fetch('/api/funds/custody-wallet');
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || REAL_CUSTODY_WALLET;
        setCustodyInfo({
          address: addr,
          balanceSol: data.balanceSol || 0,
          balanceLamports: data.balanceLamports || 0,
          explorerUrl: data.explorerUrl || `https://solscan.io/account/${addr}`
        });

        // If custody address matches master treasury, default destination to custom wallet
        if (addr === IMMUTABLE_MASTER_WALLET) {
          setWithdrawDestinationMode('CUSTOM_WALLET');
        }
      }
    } catch (e) {
      console.warn('Failed to fetch custody wallet:', e);
    }
  };

  useEffect(() => {
    fetchCustodyWallet();
    const solana = (window as any).solana;
    if (solana?.isPhantom && solana.publicKey) {
      const pAddr = solana.publicKey.toString();
      setPhantomAddress(pAddr);
    }
  }, []);

  const copyText = (text: string, type: 'master' | 'custody') => {
    navigator.clipboard.writeText(text);
    if (type === 'master') {
      setCopiedMaster(true);
      setTimeout(() => setCopiedMaster(false), 2000);
    } else {
      setCopiedCustody(true);
      setTimeout(() => setCopiedCustody(false), 2000);
    }
  };

  const connectOrFillPhantom = async () => {
    const solana = (window as any).solana;
    if (!solana?.isPhantom) {
      alert('Phantom wallet extension was not detected in this browser. You can manually paste any Solana address into the recipient field.');
      return;
    }
    try {
      const resp = await solana.connect();
      const addr = resp.publicKey.toString();
      setPhantomAddress(addr);
      setCustomDestinationAddress(addr);
      setWithdrawDestinationMode('CUSTOM_WALLET');
    } catch (err) {
      alert(`Could not connect Phantom: ${(err as Error).message}`);
    }
  };

  const maxWithdrawable = Math.max(0, Number((custodyInfo.balanceSol - 0.000010).toFixed(6)));

  const handleSweep = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSweeping(true);
    setSweepResult(null);

    try {
      const targetDestination = IMMUTABLE_MASTER_WALLET;

      let parsedAmount: number | undefined = undefined;
      if (withdrawAmountSol && Number(withdrawAmountSol) > 0) {
        parsedAmount = Number(withdrawAmountSol);
      }

      const res = await onExecuteSweep(targetDestination, parsedAmount);
      if (res.success) {
        const sig = res.signature || res.transactionSignature || res.intentId;
        const sentAmount = res.sweepAmountSol || res.amountSol || parsedAmount || maxWithdrawable;
        setSweepResult({
          success: true,
          message: `Real on-chain transfer broadcasted and confirmed on Solana Mainnet! ${sentAmount} SOL transferred to ${targetDestination.substring(0, 6)}...${targetDestination.slice(-4)}`,
          signature: sig,
          explorerUrl: res.explorerUrl || (sig ? `https://solscan.io/tx/${sig}` : undefined)
        });
        setWithdrawAmountSol('');
        await fetchCustodyWallet();
        if (onRefreshAll) onRefreshAll();
      } else {
        setSweepResult({
          success: false,
          message: res.error || 'Withdrawal transfer failed'
        });
      }
    } catch (err) {
      setSweepResult({
        success: false,
        message: `Error: ${(err as Error).message}`
      });
    } finally {
      setIsSweeping(false);
    }
  };

  const handlePurgeSimulated = async () => {
    if (!confirm('This will purge legacy simulated paper profits and lock the dashboard to 100% on-chain verified transactions. Continue?')) {
      return;
    }
    setPurging(true);
    try {
      const res = await fetch('/api/treasury/reset-simulated', { method: 'POST' });
      if (res.ok) {
        if (onRefreshAll) onRefreshAll();
        await fetchCustodyWallet();
        alert('Simulated paper profits purged! Financial ledger locked to 100% on-chain truth.');
      }
    } catch (e) {
      alert(`Purge failed: ${(e as Error).message}`);
    } finally {
      setPurging(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onUpdateConfig({
        treasuryAddress: IMMUTABLE_MASTER_WALLET,
        executionWalletAddress: REAL_CUSTODY_WALLET,
        reserveRatio: Number(editReserveRatio)
      });
      setIsEditingConfig(false);
    } catch (err) {
      alert(`Failed to save config: ${(err as Error).message}`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Vault className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-neutral-100">Treasury & On-Chain Financial Custody</h2>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Hold real operational funds, verify live on-chain balances, and execute real withdrawals to your Master Treasury.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setShowDepositModal(true)}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Deposit Real Funds</span>
          </button>

          <button
            onClick={handlePurgeSimulated}
            disabled={purging}
            className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-lg border border-neutral-700 flex items-center gap-1.5 transition text-[11px]"
            title="Purge legacy simulated paper profits"
          >
            <Trash2 className="w-3.5 h-3.5 text-neutral-400" />
            <span>Reset Simulated History</span>
          </button>

          <button
            onClick={() => setIsEditingConfig(!isEditingConfig)}
            className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 rounded-lg border border-neutral-700 flex items-center gap-1.5 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Policy</span>
          </button>
        </div>
      </div>

      {/* Real Financial Dual-Wallet Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Card 1: Master Treasury Wallet (User's Immutable Personal Wallet) */}
        <div className="p-4 rounded-xl bg-neutral-950 border border-purple-900/40 relative space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-purple-400 font-bold uppercase tracking-wider text-[11px]">
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              1. Master Withdrawal Treasury (Your Wallet)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
              IMMUTABLE
            </span>
          </div>

          <p className="text-[11px] text-neutral-400">
            Destination for all realized profits and withdrawals. Controlled solely by you via your private keys.
          </p>

          <div className="flex items-center justify-between bg-neutral-900 p-2.5 rounded-lg border border-neutral-800">
            <span className="truncate text-purple-300 pr-2">{IMMUTABLE_MASTER_WALLET}</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button 
                onClick={() => copyText(IMMUTABLE_MASTER_WALLET, 'master')}
                className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center gap-1 transition"
                title="Copy Address"
              >
                {copiedMaster ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <a 
                href={`https://solscan.io/account/${IMMUTABLE_MASTER_WALLET}`}
                target="_blank"
                rel="noreferrer"
                className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200"
                title="View on Solscan"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-neutral-900 text-xs">
            <span className="text-neutral-400">Live On-Chain Balance:</span>
            <span className="text-neutral-100 font-bold">
              {(treasury?.balanceSol || 0).toFixed(6)} SOL
            </span>
          </div>
        </div>

        {/* Card 2: App Operational Custody Wallet (Software Signer) */}
        <div className="p-4 rounded-xl bg-neutral-950 border border-emerald-900/40 relative space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              2. App Custody & Signer Wallet (Holds Real Funds)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
              SERVER SIGNER
            </span>
          </div>

          <p className="text-[11px] text-neutral-400">
            The software possesses this keypair in isolated memory. Funds deposited here execute on-chain operations and can be withdrawn back to your Master Treasury.
          </p>

          <div className="flex items-center justify-between bg-neutral-900 p-2.5 rounded-lg border border-neutral-800">
            <span className="truncate text-emerald-300 pr-2">{custodyInfo.address}</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button 
                onClick={() => copyText(custodyInfo.address, 'custody')}
                className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center gap-1 transition"
                title="Copy Address"
              >
                {copiedCustody ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <a 
                href={custodyInfo.explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200"
                title="View on Solscan"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-neutral-900 text-xs">
            <span className="text-neutral-400">Live Custody Balance:</span>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">
                {custodyInfo.balanceSol.toFixed(6)} SOL
              </span>
              <button
                onClick={() => setShowDepositModal(true)}
                className="text-[10px] px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition"
              >
                Deposit
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Treasury Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        
        <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-2">
          <span className="text-[10px] text-neutral-500 uppercase font-bold flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            Master Treasury Balance
          </span>
          <div className="text-2xl font-black text-neutral-100">
            {(treasury?.balanceSol || 0).toFixed(4)} <span className="text-xs text-neutral-400 font-normal">SOL</span>
          </div>
          <div className="text-[10px] text-neutral-500 truncate">
            {treasury?.balanceLamports || 0} Lamports on Solana Mainnet
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-2">
          <span className="text-[10px] text-neutral-500 uppercase font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            App Custody Balance
          </span>
          <div className="text-2xl font-black text-emerald-400">
            {custodyInfo.balanceSol.toFixed(4)} <span className="text-xs text-emerald-500 font-normal">SOL</span>
          </div>
          <div className="text-[10px] text-emerald-500/70">
            Possessed by software keypair
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-2">
          <span className="text-[10px] text-neutral-500 uppercase font-bold flex items-center gap-1">
            <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
            Available to Sweep
          </span>
          <div className="text-2xl font-black text-cyan-300">
            {Math.max(0, custodyInfo.balanceSol - 0.000005).toFixed(4)} <span className="text-xs text-cyan-500 font-normal">SOL</span>
          </div>
          <div className="text-[10px] text-cyan-500/70">
            Withdrawable to Master Treasury
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-2">
          <span className="text-[10px] text-neutral-500 uppercase font-bold">Realized Net Profit</span>
          <div className="text-2xl font-black text-emerald-400">
            {(treasury?.realizedProfitSol || 0).toFixed(4)} <span className="text-xs text-emerald-500 font-normal">SOL</span>
          </div>
          <div className="text-[10px] text-neutral-500">
            Verified on-chain net inflows
          </div>
        </div>

      </div>

      {/* Config Editor Modal/Form */}
      {isEditingConfig && (
        <form onSubmit={handleSaveConfig} className="p-5 rounded-xl bg-neutral-900 border border-neutral-700 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <h3 className="font-bold text-neutral-100 text-sm">Treasury Policy Configuration</h3>
            <button type="button" onClick={() => setIsEditingConfig(false)} className="text-neutral-500 hover:text-neutral-300">✕</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-400 mb-1">Treasury Destination Address (Immutable):</label>
              <div className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-1.5 text-purple-300 font-mono text-xs flex items-center justify-between">
                <span className="truncate">{IMMUTABLE_MASTER_WALLET}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 shrink-0 ml-2">LOCKED</span>
              </div>
            </div>
            <div>
              <label className="block text-neutral-400 mb-1">Execution Custody Keypair (Base58):</label>
              <div className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-1.5 text-emerald-300 font-mono text-xs flex items-center justify-between">
                <span className="truncate">{REAL_CUSTODY_WALLET}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 shrink-0 ml-2">ACTIVE</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditingConfig(false)}
              className="px-3 py-1.5 bg-neutral-800 text-neutral-300 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded font-bold"
            >
              Save Policy
            </button>
          </div>
        </form>
      )}

      {/* Real On-Chain Withdrawal & Sweep Card */}
      <div className="p-5 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-neutral-100 text-sm">Real On-Chain Withdrawal & Sweep Controller</h3>
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
            custodyInfo.balanceSol > 0.000010
              ? 'bg-emerald-950 text-emerald-300 border-emerald-800' 
              : 'bg-neutral-950 text-neutral-400 border-neutral-800'
          }`}>
            {custodyInfo.balanceSol > 0.000010 ? 'FUNDS AVAILABLE TO WITHDRAW' : 'CUSTODY EMPTY (DEPOSIT FIRST)'}
          </span>
        </div>

        <div className="p-3.5 bg-neutral-950 rounded-lg border border-neutral-800 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-neutral-400 gap-1">
            <div>
              <span className="text-neutral-500">Source (Custody Keypair):</span>{' '}
              <span className="text-emerald-400 font-bold select-all">{custodyInfo.address}</span>
            </div>
            <div className="text-neutral-300 font-semibold">
              Live Balance: <span className="text-emerald-400">{custodyInfo.balanceSol.toFixed(6)} SOL</span>
            </div>
          </div>
          <div className="text-neutral-400 flex items-center justify-between border-t border-neutral-900 pt-1.5">
            <div>
              <span className="text-neutral-500">Estimated Network Fee:</span>{' '}
              <span className="text-neutral-300">0.000010 SOL</span>
            </div>
            <div>
              <span className="text-neutral-500">Max Withdrawable:</span>{' '}
              <span className="text-emerald-400 font-bold">{maxWithdrawable.toFixed(6)} SOL</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSweep} className="space-y-4 pt-1">
          {/* Destination Display - Cryptographically Locked to User */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-neutral-300 font-bold">Withdrawal Destination (Strictly Enforced):</label>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                LOCKED TO YOUR WALLET
              </span>
            </div>
            <div className="p-3.5 rounded-lg bg-neutral-950 border border-purple-900/50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <Vault className="w-5 h-5 text-purple-400 shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-xs text-neutral-100 flex items-center gap-1.5">
                    <span>Your Sovereign Address</span>
                    <span className="text-[10px] text-emerald-400 font-normal">● Authorized Recipient</span>
                  </div>
                  <div className="text-xs text-purple-300 font-mono truncate select-all">{IMMUTABLE_MASTER_WALLET}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => copyText(IMMUTABLE_MASTER_WALLET, 'master')}
                className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[10px] font-bold shrink-0 transition"
              >
                {copiedMaster ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-[10px] text-neutral-500">
              Security constraint: Withdrawals can only go directly to your authorized address. All third-party overrides are prohibited.
            </p>
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] text-neutral-400">Withdrawal Amount (SOL):</label>
              <button
                type="button"
                onClick={() => setWithdrawAmountSol(maxWithdrawable.toString())}
                className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800"
              >
                MAX: {maxWithdrawable.toFixed(6)} SOL
              </button>
            </div>
            <div className="relative">
              <input
                type="number"
                step="0.000001"
                min="0.000001"
                max={maxWithdrawable}
                value={withdrawAmountSol}
                onChange={e => setWithdrawAmountSol(e.target.value)}
                placeholder={`Leave empty to withdraw max (${maxWithdrawable.toFixed(6)} SOL)`}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-neutral-100 font-mono outline-none"
              />
              <span className="absolute right-3 top-2 text-[10px] text-neutral-500 font-bold">SOL</span>
            </div>
          </div>

          <p className="text-[11px] text-neutral-400">
            The server signs a real Solana <code className="text-emerald-400">SystemProgram.transfer</code> transaction from its custody keypair and broadcasts it to Solana Mainnet, routing real SOL directly to the destination with live on-chain cluster confirmation.
          </p>

          {sweepResult && (
            <div className={`p-3 rounded-lg border text-xs ${
              sweepResult.success 
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                : 'bg-red-950/40 border-red-500/40 text-red-300'
            }`}>
              <div className="font-semibold mb-1 flex items-center gap-1.5">
                {sweepResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
                <span>{sweepResult.message}</span>
              </div>
              {sweepResult.signature && (
                <div className="font-mono text-[11px] truncate bg-black/40 p-1.5 rounded border border-emerald-900/60 mt-1 select-all">
                  On-Chain Signature: {sweepResult.signature}
                </div>
              )}
              {sweepResult.explorerUrl && (
                <a 
                  href={sweepResult.explorerUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-emerald-400 underline inline-flex items-center gap-1 mt-2 text-[11px] font-bold"
                >
                  Verify Transaction on Solscan <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowDepositModal(true)}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition"
            >
              <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
              <span>Deposit Real SOL</span>
            </button>

            <button
              type="submit"
              disabled={isSweeping || custodyInfo.balanceSol <= 0.000010}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              {isSweeping ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Signing & Broadcasting to Solana Mainnet...</span>
                </>
              ) : (
                <>
                  <Vault className="w-4 h-4" />
                  <span>Execute Real On-Chain Withdrawal</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <RealFundsDepositModal
          onClose={() => setShowDepositModal(false)}
          onSuccess={() => {
            fetchCustodyWallet();
            if (onRefreshAll) onRefreshAll();
          }}
        />
      )}

    </div>
  );
};
