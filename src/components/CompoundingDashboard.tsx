import React from 'react';
import { 
  Vault, 
  ShieldCheck, 
  TrendingUp, 
  Sparkles, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  BookOpen,
  PieChart
} from 'lucide-react';
import { TreasurySegregatedModel, CapitalAllocationProposal, AutonomousLearningRecord } from '../types/omega.ts';

interface CompoundingDashboardProps {
  segregatedTreasury: TreasurySegregatedModel | null;
  proposals: CapitalAllocationProposal[];
  learnings: AutonomousLearningRecord[];
}

export const CompoundingDashboard: React.FC<CompoundingDashboardProps> = ({ 
  segregatedTreasury, 
  proposals, 
  learnings 
}) => {
  const buckets = segregatedTreasury?.buckets ? Object.values(segregatedTreasury.buckets) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-neutral-100">Compounding Engine & Segregated Treasury</h2>
              <span className="px-2 py-0.5 text-xs font-mono rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/40">
                Phase 15-17 Capital Allocation
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
              REAL ECONOMIC VALUE → VERIFIED PROFIT → PRODUCTIVE REINVESTMENT → GREATER CAPABILITY. Every verified economic surplus is safely partitioned and reinvested into high-ROI capacity.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-300">
              <span className="text-neutral-500">Total Solvency:</span> <span className="text-emerald-400 font-bold">{segregatedTreasury?.totalOnChainSol || 0} SOL</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-300">
              <span className="text-emerald-500">Segregation:</span> <span className="font-bold">100% COMPLIANT</span>
            </div>
          </div>
        </div>
      </div>

      {/* 8-Bucket Segregated Treasury Overview */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
          <div className="flex items-center gap-2">
            <Vault className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-neutral-200">Segregated 8-Bucket Capital Partitioning</h3>
          </div>
          <span className="text-xs text-neutral-500 font-mono">Zero Customer Fund Commingling</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {buckets.map(b => (
            <div key={b.bucket} className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800/80 flex flex-col justify-between font-mono text-xs">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-neutral-500 uppercase">{b.bucket}</span>
                  {b.isProtected && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-400 text-[9px] border border-amber-800/40">
                      PROTECTED
                    </span>
                  )}
                </div>
                <div className="font-bold text-neutral-200 text-xs mt-1">{b.label}</div>
                <div className="text-neutral-500 text-[10px] mt-1 line-clamp-2 leading-relaxed">{b.notes}</div>
              </div>

              <div className="mt-3 pt-2 border-t border-neutral-900 flex justify-between items-baseline">
                <span className="text-[10px] text-neutral-500">Allocated:</span>
                <span className="text-neutral-100 font-bold text-sm">{b.balanceSol} SOL</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compounding Proposals + Autonomous Learning Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reinvestment Proposals */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-neutral-200">Evidence-Based Capital Proposals</h3>
            </div>
            <span className="text-xs text-emerald-400 font-mono">Policy Governed</span>
          </div>

          <div className="space-y-3">
            {proposals.map(p => (
              <div key={p.proposalId} className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 font-mono text-xs space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-neutral-900 text-purple-300 border border-neutral-800">
                      {p.targetCategory}
                    </span>
                    <h4 className="font-bold text-neutral-100 mt-1.5 text-sm">{p.title}</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400">
                    +{p.expectedMarginPct}% ROI
                  </span>
                </div>

                <p className="text-neutral-400 text-xs font-sans leading-relaxed">{p.description}</p>

                <div className="pt-2 border-t border-neutral-900 grid grid-cols-3 gap-2 text-[11px] text-neutral-400">
                  <div>Required: <strong className="text-neutral-200">{p.capitalRequiredSol} SOL</strong></div>
                  <div>Expected: <strong className="text-emerald-400">{p.expectedRevenueSol} SOL</strong></div>
                  <div>Horizon: <strong className="text-neutral-200">{p.timeHorizonDays}d</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning History */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-neutral-200">Autonomous Learning History</h3>
            </div>
            <span className="text-xs text-indigo-400 font-mono">Phase 20 & 35</span>
          </div>

          <div className="space-y-3">
            {learnings.map(l => (
              <div key={l.learningId} className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-neutral-500 text-[10px]">
                  <span>ID: {l.learningId}</span>
                  <span>{new Date(l.timestamp).toLocaleTimeString()}</span>
                </div>

                <div>
                  <span className="text-[10px] text-neutral-500 block">Lesson Learned:</span>
                  <p className="text-neutral-200 font-sans text-xs mt-0.5">{l.lessonLearned}</p>
                </div>

                <div className="p-2 rounded bg-neutral-900 border border-neutral-800 text-[11px] text-indigo-300">
                  <span className="text-neutral-500 text-[10px] block">Prescriptive Action:</span>
                  {l.nextPrescriptiveAction}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
