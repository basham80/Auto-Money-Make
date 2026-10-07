import React, { useState, useEffect } from 'react';
import { 
  X, 
  Wallet, 
  ArrowUpRight, 
  Copy, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  Lock,
  ArrowRight
} from 'lucide-react';
import { TreasuryState, MainWalletMetrics } from '../types/index.ts';

interface WithdrawNetProfitModalProps {
  treasury?: TreasuryState;
  mainMetrics?: MainWalletMetrics;
  onClose: () => void;
  onSuccess: () => void;
  onOpenDeposit?: () => void;
}

export const WithdrawNetProfitModal: React.FC<WithdrawNetProfitModalProps> = ({
  treasury,
  mainMetrics,
  onClose,
  onSuccess,
  onOpenDeposit
}) => {
  const AUTHORIZED_USER_WALLET = 'HTN1fvHwbzKiMwh9YXZEe3eooiMdoCAs3TweWdiSZV5i';

  const [custodyWallet, setCustodyWallet] = useState<{
    address: string;
    balanceSol: number;
    balanceLamports: number;
    explorerUrl: string;
  }>({
    address: '7pS2JiAFcMn9dPGqdvGazmkTZuu8XQfdMnxDimpZRLns',
    balanceSol: 0,
    balanceLamports: 0,
    explorerUrl: 'https://solscan.io/account/7pS2JiAFcMn9dPGqdvGazmkTZuu8XQfdMnxDimpZRLns'
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [withdrawAmountSol, setWithdrawAmountSol] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [copiedUser, setCopiedUser] = useState(false);
  const [copiedCustody, setCopiedCustody] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [withdrawalResult, setWithdrawalResult] = useState<{
    signature: string;
    amountSol: number;
    destinationAddress: string;
    explorerUrl?: string;
  } | null>(null);

  const realizedProfitSol = treasury?.realizedProfitSol || mainMetrics?.verifiedProfitSol || 0;
  const availableSol = treasury?.availableSol || 0;
  const userWalletBalance = mainMetrics?.onChainBalanceSol || treasury?.balanceSol || 0;

  // Max spendable from custody wallet on Solana Mainnet
  const custodySpendableSol = Math.max(0, Number((custodyWallet.balanceSol - 0.000010).toFixed(6)));

  // Target withdraw amount defaults to custody spendable if available, else available profit
  const defaultTargetAmount = custodySpendableSol > 0 
    ? custodySpendableSol 
    : (availableSol > 0 ? Number(availableSol.toFixed(6)) : 0.001);

  const fetchCustodyInfo = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/funds/custody-wallet');
      if (res.ok) {
        const data = await res.json();
        setCustodyWallet({
          address: data.address || '7pS2JiAFcMn9dPGqdvGazmkTZuu8XQfdMnxDimpZRLns',
          balanceSol: data.balanceSol || 0,
          balanceLamports: data.balanceLamports || 0,
          explorerUrl: data.explorerUrl || `https://solscan.io/account/${data.address}`
        });
      }
    } catch (e) {
      console.warn('Failed to fetch custody wallet:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCustodyInfo();
  }, []);

  const handleCopy = (text: string, isUser: boolean) => {
    navigator.clipboard.writeText(text);
    if (isUser) {
      setCopiedUser(true);
      setTimeout(() => setCopiedUser(false), 2000);
    } else {
      setCopiedCustody(true);
      setTimeout(() => setCopiedCustody(false), 2000);
    }
  };

  const handleExecuteWithdrawal = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsExecuting(true);
    setErrorMessage(null);
    setStatusMessage(null);
    setWithdrawalResult(null);

    const amount = withdrawAmountSol && Number(withdrawAmountSol) > 0 
      ? Number(withdrawAmountSol) 
      : defaultTargetAmount;

    try {
      const res = await fetch('/api/treasury/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinationAddress: AUTHORIZED_USER_WALLET,
          amountSol: amount
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Withdrawal transaction failed');
        return;
      }

      const sig = data.signature || data.transactionSignature;
      setWithdrawalResult({
        signature: sig,
        amountSol: data.amountSol || amount,
        destinationAddress: AUTHORIZED_USER_WALLET,
        explorerUrl: data.explorerUrl || (sig ? `https://solscan.io/tx/${sig}` : undefined)
      });
      setStatusMessage(`Real on-chain withdrawal broadcasted to Solana Mainnet! Funds landed at ${AUTHORIZED_USER_WALLET}`);
      fetchCustodyInfo();
      onSuccess();
    } catch (err: unknown) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative text-slate-200 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Withdraw Net Profit</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  ONLY TO YOUR ADDRESS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real Solana Mainnet transaction transferring verified net profit to your sovereign wallet.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profit & Destination Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4 font-mono text-xs">
          
          {/* Realized Profit Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Verified Realized Profit
            </span>
            <div className="text-2xl font-black text-emerald-400">
              +{realizedProfitSol.toFixed(4)} <span className="text-xs text-emerald-500 font-normal">SOL</span>
            </div>
            <div className="text-[10px] text-slate-500">
              Available in treasury: <span className="text-cyan-300 font-bold">{availableSol.toFixed(4)} SOL</span>
            </div>
          </div>

          {/* User Destination Wallet Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-purple-900/40 space-y-1.5">
            <span className="text-[10px] text-purple-300 uppercase font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              Your Sovereign Address (Immutable Destination)
            </span>
            <div className="text-xs font-mono font-bold text-purple-200 truncate">
              {AUTHORIZED_USER_WALLET}
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
              <span>Current On-Chain Balance:</span>
              <span className="text-slate-200 font-bold">{userWalletBalance.toFixed(6)} SOL</span>
            </div>
          </div>

        </div>

        {/* Source Wallet (The Wallet With The Net Profit) */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>Source: Operational Custody Wallet (Holding Net Profit)</span>
            </span>
            <button
              onClick={fetchCustodyInfo}
              disabled={isRefreshing}
              className="text-slate-400 hover:text-slate-200 p-1 rounded"
              title="Refresh on-chain balance"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>

          <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800">
            <span className="text-emerald-300 text-xs font-bold truncate max-w-[280px] sm:max-w-[400px]">
              {custodyWallet.address}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleCopy(custodyWallet.address, false)}
                className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white text-[10px] flex items-center gap-1"
              >
                {copiedCustody ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCustody ? 'Copied' : 'Copy'}</span>
              </button>
              <a
                href={custodyWallet.explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1 text-slate-400 hover:text-white"
                title="View on Solscan"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-900">
            <div>
              <span className="text-slate-500">Live Mainnet Balance:</span>{' '}
              <span className="text-slate-200 font-bold">{custodyWallet.balanceSol.toFixed(6)} SOL</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500">Max Spendable:</span>{' '}
              <span className="text-emerald-400 font-bold">{custodySpendableSol.toFixed(6)} SOL</span>
            </div>
          </div>
        </div>

        {/* Withdrawal Form */}
        <form onSubmit={handleExecuteWithdrawal} className="mt-4 space-y-4">
          
          {/* Destination Enforced Notice */}
          <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <span className="text-purple-300 font-bold">Strict Security Lock: </span>
                <span className="text-slate-300">Withdrawals are cryptographically restricted to your authorized address only.</span>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 bg-purple-900 text-purple-200 rounded font-mono font-bold shrink-0 ml-2">
              ENFORCED
            </span>
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5 font-mono">
            <div className="flex items-center justify-between text-xs">
              <label className="text-slate-300 font-medium">Withdrawal Amount (SOL):</label>
              <div className="flex items-center gap-1.5">
                {custodySpendableSol > 0 && (
                  <button
                    type="button"
                    onClick={() => setWithdrawAmountSol(custodySpendableSol.toString())}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 font-bold"
                  >
                    MAX CUSTODY ({custodySpendableSol.toFixed(4)} SOL)
                  </button>
                )}
                {availableSol > 0 && (
                  <button
                    type="button"
                    onClick={() => setWithdrawAmountSol(availableSol.toFixed(6))}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800 font-bold"
                  >
                    NET PROFIT ({availableSol.toFixed(4)} SOL)
                  </button>
                )}
              </div>
            </div>

            <div className="relative">
              <input
                type="number"
                step="0.000001"
                min="0.000001"
                value={withdrawAmountSol}
                onChange={e => setWithdrawAmountSol(e.target.value)}
                placeholder={`Enter amount (e.g. ${defaultTargetAmount > 0 ? defaultTargetAmount : 0.01})`}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono outline-none"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-bold">SOL</span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Estimated Solana Network Fee:</span>
              <span className="text-slate-300 font-mono">~0.000010 SOL</span>
            </div>
          </div>

          {/* Messages & Results */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1.5 flex-1">
                <p className="font-semibold">{errorMessage}</p>
                {custodyWallet.balanceSol < 0.000010 && onOpenDeposit && (
                  <div className="pt-1 border-t border-rose-900/60">
                    <p className="text-[11px] text-slate-300">
                      The operational custody wallet requires seed SOL to pay Solana cluster gas fees when broadcasting the transfer instruction.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenDeposit();
                      }}
                      className="mt-2 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-[11px] flex items-center gap-1 shadow"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Deposit Gas to Custody Wallet</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {withdrawalResult && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-xs text-emerald-200 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>On-Chain Withdrawal Confirmed!</span>
              </div>
              <p>
                Transferred <span className="font-bold text-white">{withdrawalResult.amountSol} SOL</span> directly to your sovereign address <span className="font-mono text-purple-300">{withdrawalResult.destinationAddress}</span>.
              </p>
              <div className="bg-black/50 p-2 rounded-lg border border-emerald-900/60 font-mono text-[11px] break-all">
                Tx Signature: {withdrawalResult.signature}
              </div>
              {withdrawalResult.explorerUrl && (
                <a
                  href={withdrawalResult.explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-400 hover:underline font-bold text-[11px] pt-1"
                >
                  <span>View Confirmed Transaction on Solscan Explorer</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isExecuting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition disabled:opacity-50"
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Signing & Broadcasting on Solana...</span>
                </>
              ) : (
                <>
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Withdraw Net Profit to HTN1...SZV5i</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
