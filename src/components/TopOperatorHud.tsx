import React from 'react';
import { 
  Wallet, 
  Key, 
  Zap, 
  Activity, 
  ShieldCheck, 
  Flame, 
  Users, 
  RefreshCw,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { SignerStatusReport, AutoSignPolicy, MainWalletMetrics } from '../types/index.ts';

interface TopOperatorHudProps {
  signerStatus?: SignerStatusReport;
  autoSignPolicy?: AutoSignPolicy;
  mainMetrics?: MainWalletMetrics;
  pendingCount: number;
  agentWalletsCount: number;
  sweepsReadyCount: number;
  emergencyStop: boolean;
  onToggleAutoSign: () => void;
  onEmergencyStop: () => void;
  onStartFirstTest: () => void;
  onRefresh: () => void;
  onOpenDeposit?: () => void;
  onOpenWithdraw?: () => void;
}

export const TopOperatorHud: React.FC<TopOperatorHudProps> = ({
  signerStatus,
  autoSignPolicy,
  mainMetrics,
  pendingCount,
  agentWalletsCount,
  sweepsReadyCount,
  emergencyStop,
  onToggleAutoSign,
  onEmergencyStop,
  onStartFirstTest,
  onRefresh,
  onOpenDeposit,
  onOpenWithdraw
}) => {
  const mainWallet = mainMetrics?.mainTreasuryWallet || 'HTN1fvHwbzKiMwh9YXZEe3eooiMdoCAs3TweWdiSZV5i';
  const shortWallet = `${mainWallet.substring(0, 4)}...${mainWallet.substring(mainWallet.length - 4)}`;
  const balanceSol = mainMetrics?.onChainBalanceSol || 0;
  const verifiedProfitSol = mainMetrics?.verifiedProfitSol || 0;
  const isAutoSignOn = Boolean(autoSignPolicy?.enabled && !emergencyStop);

  return (
    <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40 px-4 py-2.5 text-xs text-slate-300">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: System & Wallet Identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/80">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold tracking-wider text-slate-200">YABBAI Ω</span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/60 px-1 py-0.2 rounded border border-emerald-800/50">PROD-EXEC</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors" title={mainWallet}>
            <Wallet className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400">MAIN:</span>
            <span className="font-mono text-slate-200 font-medium">{shortWallet}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">SIGNER:</span>
            <span className="font-mono text-amber-300 font-medium">{signerStatus?.mode || 'SERVER_SIGNER'}</span>
          </div>
        </div>

        {/* Middle: Key Financial & Execution Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">BALANCE:</span>
            <span className="font-mono font-bold text-slate-100">{balanceSol.toFixed(4)} SOL</span>
          </div>

          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">VERIFIED PROFIT:</span>
            <span className="font-mono font-bold text-emerald-400">+{verifiedProfitSol.toFixed(4)} SOL</span>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <div className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] flex items-center gap-1">
              <span className="text-slate-400">QUEUE:</span>
              <span className={pendingCount > 0 ? "text-amber-400 font-bold" : "text-slate-400"}>{pendingCount}</span>
            </div>

            {sweepsReadyCount > 0 && (
              <div className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/60 font-mono text-[11px] text-emerald-300 flex items-center gap-1 animate-pulse">
                <Flame className="w-3 h-3 text-emerald-400" />
                <span>{sweepsReadyCount} SWEEPS READY</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Deposit, Withdraw Net Profit, Auto-Sign Toggle, Real Money Test & Emergency Stop */}
        <div className="flex items-center gap-2">
          {onOpenWithdraw && (
            <button
              onClick={onOpenWithdraw}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-[11px] font-bold shadow-md shadow-emerald-950/40 transition ring-1 ring-emerald-400/40"
              title="Withdraw verified net profit to your sovereign wallet (HTN1...SZV5i)"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Withdraw Net Profit</span>
            </button>
          )}

          {onOpenDeposit && (
            <button
              onClick={onOpenDeposit}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-slate-700 transition"
              title="Deposit real funds to app custody"
            >
              <span>⚡ Deposit SOL</span>
            </button>
          )}

          {/* First Real Money Test Button */}
          <button
            onClick={onStartFirstTest}
            className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-200 text-[11px] font-medium transition-colors"
          >
            <ShieldCheck className="w-3 h-3 text-indigo-400" />
            <span>Test Workflow</span>
          </button>

          {/* Auto-Sign Mode Toggle */}
          <button
            onClick={onToggleAutoSign}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold tracking-wide transition-all border ${
              isAutoSignOn
                ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-600/30'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <Zap className={`w-3 h-3 ${isAutoSignOn ? 'text-emerald-400 fill-emerald-400' : 'text-slate-500'}`} />
            <span>{isAutoSignOn ? 'AUTO SIGN ON' : 'AUTO SIGN OFF'}</span>
          </button>

          {/* Emergency Stop Switch */}
          <button
            onClick={onEmergencyStop}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold border transition-colors ${
              emergencyStop
                ? 'bg-red-600 text-white border-red-500 animate-bounce'
                : 'bg-red-950/40 text-red-400 border-red-800/40 hover:bg-red-900/60 hover:text-red-200'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>{emergencyStop ? 'STOPPED' : 'KILL SWITCH'}</span>
          </button>

          <button
            onClick={onRefresh}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors"
            title="Refresh on-chain cluster state"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
