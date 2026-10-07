import React, { useState } from 'react';
import { 
  Cpu, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Play, 
  ShieldCheck, 
  RotateCw, 
  Layers, 
  AlertTriangle,
  History
} from 'lucide-react';
import { JarvisDiagnostic } from '../types/index.ts';

interface JarvisEvolutionLoopProps {
  diagnostics: JarvisDiagnostic[];
  onRunTestSuite: () => Promise<{ totalTests: number; passed: number; results: Array<{ suiteName: string; passed: boolean; durationMs: number; details: string }> }>;
  onTriggerSelfImprovement: () => Promise<JarvisDiagnostic>;
}

export const JarvisEvolutionLoop: React.FC<JarvisEvolutionLoopProps> = ({
  diagnostics,
  onRunTestSuite,
  onTriggerSelfImprovement
}) => {
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [testResults, setTestResults] = useState<Array<{ suiteName: string; passed: boolean; durationMs: number; details: string }> | null>(null);

  const handleRunTests = async () => {
    setIsRunningTests(true);
    try {
      const res = await onRunTestSuite();
      setTestResults(res.results);
    } catch (err) {
      alert(`Test suite execution failed: ${(err as Error).message}`);
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleImprove = async () => {
    setIsImproving(true);
    try {
      await onTriggerSelfImprovement();
    } catch (err) {
      alert(`Self-improvement cycle failed: ${(err as Error).message}`);
    } finally {
      setIsImproving(false);
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-neutral-100 font-sans">JARVIS Autonomous Engineering Loop</h2>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5 font-sans">
            Continuous self-observation, hypothesis generation, automated regression testing, and rollback-safe optimization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="run-tests-btn"
            onClick={handleRunTests}
            disabled={isRunningTests}
            className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 rounded-lg border border-neutral-700 flex items-center gap-1.5 transition-colors"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRunningTests ? 'animate-spin' : ''}`} />
            <span>{isRunningTests ? 'Executing Tests...' : 'Run Integrity Tests'}</span>
          </button>

          <button
            id="trigger-improve-btn"
            onClick={handleImprove}
            disabled={isImproving}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isImproving ? 'animate-spin' : ''}`} />
            <span>{isImproving ? 'Diagnosing System...' : 'Trigger JARVIS Loop'}</span>
          </button>
        </div>
      </div>

      {/* Safety Policy Guarantee */}
      <div className="p-4 rounded-xl bg-neutral-900/90 border border-emerald-900/60 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-neutral-100">Immutable Security & Accounting Boundaries</div>
          <p className="text-neutral-400 text-[11px] font-sans">
            JARVIS is strictly prohibited from autonomously modifying authentication, double-entry ledger invariants, payment verification checks, treasury reserve minimums, or the global Emergency Stop mechanism.
          </p>
        </div>
      </div>

      {/* Test Suite Results Display */}
      {testResults && (
        <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="font-bold text-neutral-200">
              System Invariant Verification Results ({testResults.filter(t => t.passed).length}/{testResults.length} Passed)
            </span>
            <button onClick={() => setTestResults(null)} className="text-neutral-500 hover:text-neutral-300 text-[11px]">
              Dismiss
            </button>
          </div>

          <div className="space-y-2">
            {testResults.map((t, idx) => (
              <div 
                key={`${t.suiteName}-${idx}`}
                className="p-2.5 rounded bg-neutral-950 border border-neutral-800 flex items-start justify-between gap-2"
              >
                <div className="flex items-start gap-2">
                  {t.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold text-neutral-200">{t.suiteName}</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">{t.details}</div>
                  </div>
                </div>

                <span className="text-[10px] text-neutral-500 shrink-0">{t.durationMs}ms</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History of Diagnostics & Autonomous Cycles */}
      <div className="bg-neutral-900/60 rounded-xl border border-neutral-800 p-4 space-y-3">
        <h3 className="text-xs uppercase text-neutral-400 font-bold flex items-center gap-1.5">
          <History className="w-4 h-4 text-emerald-400" />
          Autonomous Diagnostic Cycles ({diagnostics.length})
        </h3>

        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {diagnostics.length === 0 ? (
            <div className="p-6 text-center text-neutral-500 text-xs">
              No self-improvement cycles recorded yet. Click "Trigger JARVIS Loop" to execute cycle #1.
            </div>
          ) : (
            diagnostics.map((diag, idx) => (
              <div 
                key={`${diag.cycleNumber}-${diag.timestamp || Date.now()}-${idx}`}
                className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800/80 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400">Cycle #{diag.cycleNumber}</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      diag.status === 'HEALTHY' 
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800' 
                        : diag.status === 'REPAIRED'
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                          : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}>
                      {diag.status}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      {new Date(diag.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <div className="text-neutral-300 text-xs">
                  <span className="text-neutral-500">Observation:</span> {diag.observation}
                </div>

                {diag.detectedProblem && (
                  <div className="text-amber-300/90 text-xs">
                    <span className="text-neutral-500">Problem Detected:</span> {diag.detectedProblem}
                  </div>
                )}

                {diag.proposedChange && (
                  <div className="text-cyan-300/90 text-xs">
                    <span className="text-neutral-500">Proposed Change:</span> {diag.proposedChange}
                  </div>
                )}

                <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[10px] text-neutral-400">
                  <span>Action: <strong className="text-neutral-200">{diag.actionTaken}</strong></span>
                  <span>Integrity Tests: <strong className="text-emerald-400">{diag.testsPassed}/{diag.testsRun} Passed</strong></span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
