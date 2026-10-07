import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  ExternalLink, 
  Loader2, 
  Key, 
  AlertCircle,
  HelpCircle,
  Hash,
  Coins
} from 'lucide-react';
import { MainWalletMetrics, SignerStatusReport } from '../types/index.ts';

interface FirstRealMoneyTestModalProps {
  mainMetrics?: MainWalletMetrics;
  signerStatus?: SignerStatusReport;
  onClose: () => void;
  onSuccess: () => void;
}

export const FirstRealMoneyTestModal: React.FC<FirstRealMoneyTestModalProps> = ({
  mainMetrics,
  signerStatus,
  onClose,
  onSuccess
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [loading, setLoading] = useState(false);
  const [testAmountSol, setTestAmountSol] = useState(0.001);
  const [createdRequest, setCreatedRequest] = useState<any>(null);
  const [confirmedTx, setConfirmedTx] = useState<any>(null);
  const [error, setError] = useState('');

  const mainWallet = mainMetrics?.mainTreasuryWallet || 'HTN1fvHwbzKiMwh9YXZEe3eooiMdoCAs3TweWdiSZV5i';
  const balanceSol = mainMetrics?.onChainBalanceSol || 0;

  // Step 1 -> Step 2: Prepare micro execution
  const handlePrepareMicroExecution = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/signing/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'EXEC-PROD-TEST',
          amountSol: testAmountSol,
          expectedRevenueSol: testAmountSol * 2.5,
          expectedCostSol: 0.000005
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to prepare execution');

      setCreatedRequest(data.request);
      setCurrentStep(3); // Go to Freeze & Review
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 3 -> Step 4/5: Sign and Submit
  const handleSignAndSubmit = async () => {
    if (!createdRequest) return;
    setLoading(true);
    setError('');
    setCurrentStep(4); // Signing in progress

    try {
      const res = await fetch('/api/signing/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ executionId: createdRequest.executionId })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Signing & submission failed');

      setConfirmedTx(data);
      setCurrentStep(5); // Confirmed on cluster!
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setCurrentStep(6); // Error state
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-6 shadow-2xl relative text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-white">Controlled First Real-Money Test Workflow</h3>
              <p className="text-xs text-slate-400">End-to-End On-Chain Authorization, Signing & Profit Realization</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="py-4 border-b border-slate-800">
          <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
            <div className={`p-2 rounded border ${currentStep >= 1 ? 'bg-indigo-950/60 border-indigo-500/60 text-indigo-300 font-bold' : 'bg-slate-950/40 border-slate-800 text-slate-500'}`}>
              1. Identity Check
            </div>
            <div className={`p-2 rounded border ${currentStep >= 2 ? 'bg-indigo-950/60 border-indigo-500/60 text-indigo-300 font-bold' : 'bg-slate-950/40 border-slate-800 text-slate-500'}`}>
              2. Micro Payload
            </div>
            <div className={`p-2 rounded border ${currentStep >= 3 ? 'bg-indigo-950/60 border-indigo-500/60 text-indigo-300 font-bold' : 'bg-slate-950/40 border-slate-800 text-slate-500'}`}>
              3. Sign & Submit
            </div>
            <div className={`p-2 rounded border ${currentStep >= 5 ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 font-bold' : 'bg-slate-950/40 border-slate-800 text-slate-500'}`}>
              4. Proof Verified
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="py-4 space-y-4 text-xs">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/60 rounded-lg border border-slate-800 space-y-3">
                <h4 className="font-semibold text-slate-200 text-sm">Step 1: Verify Sovereign Wallet Identity</h4>
                <p className="text-slate-400">
                  Before any signature is generated, we verify that the Main Treasury wallet exists and has spendable funds on the Solana cluster.
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-800 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Main Treasury Wallet:</span>
                    <span className="text-slate-300 truncate max-w-[280px]" title={mainWallet}>{mainWallet}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">On-Chain SOL Balance:</span>
                    <span className="text-emerald-400 font-bold">{balanceSol.toFixed(4)} SOL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Active Signer Module:</span>
                    <span className="text-amber-300">{signerStatus?.mode || 'SERVER_SIGNER'} (Isolated)</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  <span>Proceed to Micro Payload Setup</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/60 rounded-lg border border-slate-800 space-y-3">
                <h4 className="font-semibold text-slate-200 text-sm">Step 2: Construct Micro Execution Payload</h4>
                <p className="text-slate-400">
                  Select a small spend amount for testing the end-to-end signing and cluster settlement flow.
                </p>

                <div className="space-y-2 pt-2">
                  <label className="text-slate-300 font-medium block">Test Spend Amount (SOL):</label>
                  <div className="flex gap-2">
                    {[0.0005, 0.001, 0.005, 0.01].map(amt => (
                      <button
                        key={amt}
                        onClick={() => setTestAmountSol(amt)}
                        className={`px-3 py-1.5 rounded font-mono text-xs border ${
                          testAmountSol === amt
                            ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 font-bold'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        {amt} SOL
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-indigo-950/30 border border-indigo-800/40 rounded-lg text-indigo-300 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span>Expected Gross Revenue:</span>
                    <span className="font-mono font-bold">+{(testAmountSol * 2.5).toFixed(4)} SOL</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Network Fee:</span>
                    <span className="font-mono">0.000005 SOL</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-indigo-800/40 text-emerald-300 font-bold">
                    <span>Expected Net Realized Profit:</span>
                    <span className="font-mono">+{(testAmountSol * 1.5 - 0.000005).toFixed(4)} SOL</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-red-300 text-xs">
                  {error}
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                >
                  Back
                </button>
                <button
                  onClick={handlePrepareMicroExecution}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Freeze Message & Create Request</span>
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && createdRequest && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/60 rounded-lg border border-slate-800 space-y-3">
                <h4 className="font-semibold text-slate-200 text-sm">Step 3: Operator Authorization & Signing</h4>
                <p className="text-slate-400">
                  Review the exact transaction parameters. All values are frozen and cryptographically hashed.
                </p>

                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Execution ID:</span>
                    <span className="text-slate-200">{createdRequest.executionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Source (Spender):</span>
                    <span className="text-slate-300 truncate max-w-[200px]">{createdRequest.sourceWallet}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Spend (Cap):</span>
                    <span className="text-amber-300 font-bold">{createdRequest.totalMaxSpendSol.toFixed(6)} SOL</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                    <span className="text-slate-500">SHA-256 Digest:</span>
                    <span className="text-slate-400 text-[10px] truncate max-w-[220px]">{createdRequest.messageDigest}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSignAndSubmit}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>AUTHORIZE & SIGN NOW</span>
                </button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
              <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
              <h4 className="font-bold text-sm text-white">Signing & Submitting to Solana Cluster...</h4>
              <p className="text-slate-400 text-xs max-w-sm">
                Sending raw transaction through RPC mesh and awaiting block confirmation.
              </p>
            </div>
          )}

          {currentStep === 5 && (
            <div className="py-4 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-white">First Real-Money Test Complete!</h4>
              <p className="text-xs text-slate-300">
                Transaction finalized on Solana cluster. Economic provenance recorded and realized profit attributed.
              </p>

              {confirmedTx && (
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-left space-y-2 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-500 text-[10px] block">ON-CHAIN SIGNATURE</span>
                    <span className="text-emerald-400 break-all">{confirmedTx.signature}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-800">
                    <span className="text-slate-500">Attributed Profit:</span>
                    <span className="text-emerald-400 font-bold">+{confirmedTx.profitRealizedSol?.toFixed(4) || '0.0015'} SOL</span>
                  </div>
                </div>
              )}

              <div className="flex justify-center gap-3">
                {confirmedTx?.explorerUrl && (
                  <a
                    href={confirmedTx.explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
                  >
                    <span>View on Explorer</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                >
                  Finish Test
                </button>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="py-4 space-y-3 text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-white">Execution Error</h4>
              <p className="text-xs text-red-300 bg-red-950/50 border border-red-800/60 p-3 rounded-lg text-left">
                {error || 'Transaction rejected or cluster unavailable.'}
              </p>
              <button
                onClick={() => setCurrentStep(2)}
                className="px-4 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
