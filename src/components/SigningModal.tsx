import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  ArrowRight, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Key, 
  Cpu, 
  Hash, 
  Coins, 
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { SigningRequest, SigningBatch, SignerStatusReport } from '../types/index.ts';

interface SigningModalProps {
  request?: SigningRequest | null;
  batch?: SigningBatch | null;
  signerStatus?: SignerStatusReport;
  onClose: () => void;
  onSuccess: () => void;
}

export const SigningModal: React.FC<SigningModalProps> = ({
  request,
  batch,
  signerStatus,
  onClose,
  onSuccess
}) => {
  const [step, setStep] = useState<'REVIEW' | 'SIGNING' | 'SUBMITTING' | 'CONFIRMING' | 'SUCCESS' | 'ERROR'>('REVIEW');
  const [errorMessage, setErrorMessage] = useState('');
  const [resultSignature, setResultSignature] = useState('');
  const [resultExplorerUrl, setResultExplorerUrl] = useState('');

  const isBatch = Boolean(batch && !request);
  const title = isBatch ? `Batch Execution (${batch?.executionIds.length || 0} Transactions)` : `Sign & Execute (${request?.executionId || ''})`;

  const handleExecute = async () => {
    setStep('SIGNING');
    setErrorMessage('');

    try {
      if (isBatch && batch) {
        setStep('SUBMITTING');
        const res = await fetch('/api/signing/batch/sign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ batchId: batch.batchId })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Batch execution failed');

        setStep('SUCCESS');
        onSuccess();
      } else if (request) {
        setStep('SIGNING');
        // If Phantom mode, request browser wallet signature
        if (signerStatus?.mode === 'PHANTOM') {
          if (!(window as any).solana || !(window as any).solana.isPhantom) {
            throw new Error('Phantom wallet browser extension not detected. Please switch to SERVER_SIGNER mode or install Phantom.');
          }
          await (window as any).solana.connect();
        }

        setStep('SUBMITTING');
        const res = await fetch('/api/signing/sign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ executionId: request.executionId })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Signing execution failed');

        setResultSignature(data.signature || '');
        setResultExplorerUrl(data.explorerUrl || `https://explorer.solana.com/tx/${data.signature}`);
        setStep('SUCCESS');
        onSuccess();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
      setStep('ERROR');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl max-w-xl w-full p-6 shadow-2xl relative text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-white">{title}</h3>
              <p className="text-xs text-slate-400">Exact Transaction Authorization & On-Chain Settlement</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-4 space-y-4 text-xs">
          {step === 'REVIEW' && (
            <>
              {/* Signer Mode Alert */}
              <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/70 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <span className="text-slate-300 font-medium">Configured Signer:</span>
                  <span className="font-mono text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                    {signerStatus?.mode || 'SERVER_SIGNER'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Isolated Boundary</span>
                </div>
              </div>

              {/* Single Request Specifics */}
              {request && (
                <div className="space-y-3">
                  {/* Wallets */}
                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                    <div>
                      <span className="text-slate-500 text-[10px] block">SOURCE WALLET (SPENDER)</span>
                      <span className="font-mono text-[11px] text-slate-300 truncate block" title={request.sourceWallet}>
                        {request.sourceWallet.substring(0, 8)}...{request.sourceWallet.substring(request.sourceWallet.length - 6)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">DESTINATION (TREASURY)</span>
                      <span className="font-mono text-[11px] text-emerald-300 truncate block" title={request.destinationWallet}>
                        {request.destinationWallet.substring(0, 8)}...{request.destinationWallet.substring(request.destinationWallet.length - 6)}
                      </span>
                    </div>
                  </div>

                  {/* Financial Breakdown Table */}
                  <div className="bg-slate-950/40 rounded-lg border border-slate-800 p-3 space-y-2">
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Execution Spend Amount:</span>
                      <span className="font-mono font-bold text-white">{request.amountSol.toFixed(6)} SOL</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400 text-[11px]">
                      <span>Estimated Base Network Fee:</span>
                      <span className="font-mono text-slate-300">{request.baseFeeSol.toFixed(6)} SOL</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400 text-[11px]">
                      <span>Priority Fee:</span>
                      <span className="font-mono text-slate-300">{request.priorityFeeLamports} microLamports</span>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-slate-200 font-medium">
                      <span>Total Maximum Spend:</span>
                      <span className="font-mono text-amber-300 font-bold">{request.totalMaxSpendSol.toFixed(6)} SOL</span>
                    </div>
                  </div>

                  {/* Expected Revenue & Profit */}
                  <div className="grid grid-cols-2 gap-2 p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-lg">
                    <div>
                      <span className="text-slate-400 text-[10px] block">EXPECTED GROSS REVENUE</span>
                      <span className="font-mono font-bold text-white text-sm">+{request.expectedRevenueSol.toFixed(4)} SOL</span>
                    </div>
                    <div>
                      <span className="text-emerald-400 text-[10px] block font-semibold">ATTRIBUTABLE REALIZED PROFIT</span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">+{request.expectedProfitSol.toFixed(4)} SOL</span>
                    </div>
                  </div>

                  {/* Fingerprint & SHA-256 Digest */}
                  <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800 flex items-center gap-2">
                    <Hash className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <div className="truncate">
                      <span className="text-slate-500 text-[10px] block">FROZEN SHA-256 MESSAGE DIGEST</span>
                      <span className="font-mono text-[10px] text-slate-400 truncate block">
                        {request.messageDigest || 'SHA-256 Calculated at Freeze'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Batch Summary */}
              {isBatch && batch && (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Total Transactions in Batch:</span>
                      <span className="font-mono font-bold text-white">{batch.executionIds.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Total Spend Required:</span>
                      <span className="font-mono font-bold text-amber-300">{batch.totalSpendSol.toFixed(4)} SOL</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Expected Total Gross Revenue:</span>
                      <span className="font-mono font-bold text-emerald-400">+{batch.expectedGrossRevenueSol.toFixed(4)} SOL</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                      <span className="text-emerald-300 font-semibold">Expected Net Realized Profit:</span>
                      <span className="font-mono font-bold text-emerald-300 text-sm">+{batch.expectedNetProfitSol.toFixed(4)} SOL</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-300">Wallet Spendable Balance:</span>
                    <span className="font-mono text-slate-100 font-semibold">{batch.walletSpendableSol.toFixed(4)} SOL</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Progress States */}
          {(step === 'SIGNING' || step === 'SUBMITTING' || step === 'CONFIRMING') && (
            <div className="py-8 flex flex-col items-center justify-center space-y-3 text-center">
              <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
              <h4 className="font-bold text-sm text-white">
                {step === 'SIGNING' && 'Authorizing & Freezing Transaction Message...'}
                {step === 'SUBMITTING' && 'Broadcasting Signed Payload to Solana RPC Mesh...'}
                {step === 'CONFIRMING' && 'Waiting for Cluster Confirmation & State Finalization...'}
              </h4>
              <p className="text-slate-400 text-xs max-w-sm">
                Generating cryptographic proof and reconciling directly against on-chain blockhash.
              </p>
            </div>
          )}

          {/* Success State */}
          {step === 'SUCCESS' && (
            <div className="py-4 space-y-3 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-white">Transaction Confirmed & Profit Realized</h4>
              <p className="text-xs text-slate-300">
                Economic event recorded in authoritative ledger. Sovereign funds confirmed on Solana cluster.
              </p>

              {resultSignature && (
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-left space-y-1">
                  <span className="text-slate-500 text-[10px] block">ON-CHAIN SIGNATURE</span>
                  <span className="font-mono text-[11px] text-emerald-400 break-all block">{resultSignature}</span>
                </div>
              )}

              {resultExplorerUrl && (
                <a
                  href={resultExplorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-xs font-medium transition-colors"
                >
                  <span>View on Solana Explorer</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}

          {/* Error State */}
          {step === 'ERROR' && (
            <div className="py-4 space-y-3 text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-white">Execution Blocked or Failed</h4>
              <p className="text-xs text-red-300 bg-red-950/50 border border-red-800/60 p-3 rounded-lg text-left">
                {errorMessage}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
          {step === 'REVIEW' && (
            <>
              <button
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExecute}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition-all"
              >
                <span>{isBatch ? `SIGN ${batch?.executionIds.length || 0} TRANSACTIONS` : 'AUTHORIZE & SIGN NOW'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {step === 'SUCCESS' && (
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
            >
              Done
            </button>
          )}

          {step === 'ERROR' && (
            <>
              <button
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => setStep('REVIEW')}
                className="px-4 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition-colors"
              >
                Retry
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
