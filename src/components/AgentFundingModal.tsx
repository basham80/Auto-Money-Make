import React, { useState } from 'react';
import { 
  X, 
  ArrowRight, 
  Wallet, 
  ShieldCheck, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { AgentWalletInfo, MainWalletMetrics } from '../types/index.ts';

interface AgentFundingModalProps {
  wallet: AgentWalletInfo;
  mainMetrics?: MainWalletMetrics;
  onClose: () => void;
  onSuccess: () => void;
}

export const AgentFundingModal: React.FC<AgentFundingModalProps> = ({
  wallet,
  mainMetrics,
  onClose,
  onSuccess
}) => {
  const [amountSol, setAmountSol] = useState(0.1);
  const [loading, setLoading] = useState(false);
  const [resultSignature, setResultSignature] = useState('');
  const [error, setError] = useState('');

  const mainBalance = mainMetrics?.onChainBalanceSol || 0;
  const spendable = mainMetrics?.spendableSol || 0;

  const handleFund = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/agents/wallets/fund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: wallet.agentId,
          amountSol
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Funding transfer failed');

      setResultSignature(data.signature || '');
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl relative text-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-white">Fund Agent Wallet</h3>
              <p className="text-xs text-slate-400">Transfer Capital from Main Treasury</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4 text-xs">
          {!resultSignature ? (
            <>
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 space-y-2 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Agent:</span>
                  <span className="text-slate-200 font-bold">{wallet.agentName} ({wallet.agentId})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Address:</span>
                  <span className="text-indigo-300 truncate max-w-[200px]" title={wallet.publicAddress}>{wallet.publicAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Balance:</span>
                  <span className="text-slate-200">{wallet.currentBalanceSol.toFixed(4)} SOL</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800">
                  <span className="text-slate-500">Main Spendable:</span>
                  <span className="text-emerald-400 font-bold">{spendable.toFixed(4)} SOL</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-slate-300 font-medium block">Funding Amount (SOL):</label>
                <div className="flex gap-2">
                  {[0.05, 0.1, 0.25, 0.5, 1.0].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setAmountSol(amt)}
                      className={`px-2.5 py-1.5 rounded font-mono text-xs border ${
                        amountSol === amt
                          ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 font-bold'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {amt} SOL
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-red-300 text-xs">
                  {error}
                </div>
              )}
            </>
          ) : (
            <div className="py-4 space-y-3 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-white">Agent Wallet Funded</h4>
              <p className="text-xs text-slate-300">
                {amountSol} SOL transferred from Main Treasury to {wallet.agentName}.
              </p>
              <div className="p-2 bg-slate-950 rounded border border-slate-800 font-mono text-[10px] text-emerald-400 break-all">
                {resultSignature}
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
          {!resultSignature ? (
            <>
              <button onClick={onClose} className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs">
                Cancel
              </button>
              <button
                onClick={handleFund}
                disabled={loading || amountSol > spendable}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>TRANSFER & FUND</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <button onClick={onClose} className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs">
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
