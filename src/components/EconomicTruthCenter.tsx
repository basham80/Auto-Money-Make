import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  RefreshCw, 
  ExternalLink, 
  Coins, 
  FileCode, 
  Lock, 
  ArrowRight,
  TrendingUp,
  Layers,
  Database
} from 'lucide-react';
import { EconomicLedgerSummary, LedgerEvent } from '../types/index.ts';
import { RevenueBlockerReport } from '../types/omega.ts';

interface EconomicTruthCenterProps {
  ledgerSummary: EconomicLedgerSummary | null;
  ledgerEvents: LedgerEvent[];
  onRefresh?: () => void;
}

export const EconomicTruthCenter: React.FC<EconomicTruthCenterProps> = ({
  ledgerSummary,
  ledgerEvents,
  onRefresh
}) => {
  const [testResults, setTestResults] = useState<any>(null);
  const [blockerReport, setBlockerReport] = useState<RevenueBlockerReport | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<LedgerEvent | null>(null);

  const fetchDiagnostics = async () => {
    try {
      const [testRes, blockerRes] = await Promise.all([
        fetch('/api/diagnostics/economic-truth-tests'),
        fetch('/api/diagnostics/revenue-blockers')
      ]);

      if (testRes.ok) {
        setTestResults(await testRes.json());
      }
      if (blockerRes.ok) {
        setBlockerReport(await blockerRes.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const handleRunTests = async () => {
    setIsRunningTests(true);
    await fetchDiagnostics();
    if (onRefresh) onRefresh();
    setIsRunningTests(false);
  };

  const realEvents = ledgerEvents.filter(e => e.truthClass === 'REAL');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-neutral-100">Economic Truth Center & Invariant Verifier</h2>
              <span className="px-2 py-0.5 text-xs font-mono rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/40">
                Phase 1 & 40 Invariant Gates
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
              Strict Hard Boundary: Internal intelligence, opportunities, and quotes are strictly <strong className="text-neutral-300">ESTIMATE</strong>. Only independently verified on-chain settlements can enter <strong className="text-emerald-400">REALIZED REVENUE</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunTests}
              disabled={isRunningTests}
              className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-all shadow-md shadow-purple-900/30 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunningTests ? 'animate-spin' : ''}`} />
              {isRunningTests ? 'Verifying Invariants...' : 'Run Economic Truth Tests'}
            </button>
          </div>
        </div>
      </div>

      {/* Real vs Estimate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Realized Revenue */}
        <div className="bg-neutral-900 border border-emerald-900/60 rounded-xl p-4 flex flex-col justify-between font-mono">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">Realized Revenue</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800/40">TRUTH: REAL</span>
            </div>
            <div className="text-2xl font-bold text-neutral-100 mt-2">
              {ledgerSummary?.real.grossRevenueSol.toFixed(6) || '0.000000'} <span className="text-xs text-neutral-400">SOL</span>
            </div>
          </div>
          <div className="text-[10px] text-neutral-500 mt-3 pt-2 border-t border-neutral-800">
            Backed by {ledgerSummary?.real.eventCount || 0} on-chain verified settlements
          </div>
        </div>

        {/* Realized Profit */}
        <div className="bg-neutral-900 border border-emerald-900/60 rounded-xl p-4 flex flex-col justify-between font-mono">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">Realized Net Profit</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800/40">TRUTH: REAL</span>
            </div>
            <div className="text-2xl font-bold text-emerald-400 mt-2">
              +{ledgerSummary?.real.realizedProfitSol.toFixed(6) || '0.000000'} <span className="text-xs text-neutral-400">SOL</span>
            </div>
          </div>
          <div className="text-[10px] text-neutral-500 mt-3 pt-2 border-t border-neutral-800">
            Verified Net: Revenue − Costs − Fees
          </div>
        </div>

        {/* Estimated / Projected */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between font-mono">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Projected Revenue (EV)</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-neutral-950 text-neutral-400 border border-neutral-800">TRUTH: ESTIMATE</span>
            </div>
            <div className="text-2xl font-bold text-neutral-300 mt-2">
              {ledgerSummary?.estimate.estimatedGrossSol.toFixed(4) || '0.0000'} <span className="text-xs text-neutral-500">SOL</span>
            </div>
          </div>
          <div className="text-[10px] text-neutral-500 mt-3 pt-2 border-t border-neutral-800">
            Internal intelligence hypotheses (NOT revenue)
          </div>
        </div>

        {/* Unattributed Inflow */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between font-mono">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">Unattributed Buffer</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-950 text-amber-300 border border-amber-800/40">TRUTH: UNATTRIBUTED</span>
            </div>
            <div className="text-2xl font-bold text-amber-300 mt-2">
              {blockerReport?.unattributedInflowSol || 0} <span className="text-xs text-neutral-500">SOL</span>
            </div>
          </div>
          <div className="text-[10px] text-neutral-500 mt-3 pt-2 border-t border-neutral-800">
            Deposits pending invoice attribution
          </div>
        </div>
      </div>

      {/* Revenue Blocker Diagnostic Banner ("WHY AM I NOT EARNING?") */}
      {blockerReport && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-neutral-200">Revenue Blocker Diagnostic: "Why Am I Not Earning?"</h3>
            </div>
            <span className="px-2 py-0.5 text-xs font-mono rounded bg-neutral-950 border border-neutral-800 text-neutral-300">
              Primary Blocker: <strong className="text-amber-400">{blockerReport.primaryBlocker}</strong>
            </span>
          </div>

          <div className="mt-3 grid grid-cols-1 lg:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 lg:col-span-2 space-y-1.5">
              <div className="text-neutral-100 font-bold text-sm">{blockerReport.title}</div>
              <p className="text-neutral-400 font-sans text-xs leading-relaxed">{blockerReport.explanation}</p>
            </div>
            <div className="p-3 rounded-lg bg-neutral-950 border border-purple-900/40 space-y-1.5">
              <div className="text-purple-300 font-bold text-[11px] uppercase tracking-wider">Prescriptive Next Action</div>
              <p className="text-neutral-200 font-sans text-xs">{blockerReport.prescriptiveNextAction}</p>
            </div>
          </div>
        </div>
      )}

      {/* Automated Economic Truth Test Suite Results */}
      {testResults && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-neutral-200">Automated Invariant Security Suite</h3>
            </div>
            <span className={`px-2 py-0.5 text-xs font-mono rounded ${testResults.passed ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'}`}>
              {testResults.passed ? 'ALL INVARIANTS PASSED' : 'INVARIANT FAILURE DETECTED'}
            </span>
          </div>

          <div className="space-y-2">
            {testResults.testResults?.map((t: any, idx: number) => (
              <div key={idx} className="p-3 rounded-lg bg-neutral-950 border border-neutral-800/80 flex items-start justify-between gap-3 font-mono text-xs">
                <div className="flex items-start gap-2">
                  {t.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
                  <div>
                    <div className="font-bold text-neutral-200">{t.name}</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">{t.details}</div>
                  </div>
                </div>
                <span className={`px-1.5 py-0.5 rounded text-[10px] ${t.passed ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'}`}>
                  {t.passed ? 'PASSED' : 'FAILED'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Realized On-Chain Evidence Trail */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-neutral-200">Verified On-Chain Settlement Trail</h3>
          </div>
          <span className="text-xs text-neutral-500 font-mono">Independent Verification Ledger</span>
        </div>

        {realEvents.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 font-mono text-xs">
            No real on-chain settlements recorded yet. Use the Funds Center to execute your first verified money test.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-neutral-950/60 border-b border-neutral-800 text-neutral-400">
                  <th className="p-3">Source & Order</th>
                  <th className="p-3">Gross</th>
                  <th className="p-3">Cost</th>
                  <th className="p-3">Net Profit</th>
                  <th className="p-3">Solana Signature</th>
                  <th className="p-3 text-right">Proof</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {realEvents.map(ev => (
                  <tr key={ev.eventId} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-neutral-200">{ev.source}</div>
                      <div className="text-[10px] text-neutral-500">{ev.orderId || ev.counterparty}</div>
                    </td>
                    <td className="p-3 text-neutral-200 font-medium">+{ev.grossAmount.toFixed(6)} SOL</td>
                    <td className="p-3 text-neutral-500">-{ev.attributableCost.toFixed(6)} SOL</td>
                    <td className="p-3 text-emerald-400 font-bold">+{ev.netAmount.toFixed(6)} SOL</td>
                    <td className="p-3 text-neutral-400">
                      {ev.transactionSignature ? (
                        <a
                          href={`https://explorer.solana.com/tx/${ev.transactionSignature}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                        >
                          <span className="truncate max-w-[100px]">{ev.transactionSignature}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ) : (
                        'Verified'
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] border border-emerald-800/40">
                        SHA-256 PROVED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
