import React, { useState } from 'react';
import { 
  Compass, 
  RefreshCw, 
  Play, 
  AlertCircle, 
  CheckCircle, 
  Layers, 
  Coins, 
  ShieldAlert,
  Percent,
  CheckSquare
} from 'lucide-react';
import { Opportunity } from '../types/index.ts';

interface OpportunityEngineProps {
  opportunities: Opportunity[];
  providers: Array<{ id: string; name: string; category: string; isEnabled: boolean }>;
  availableSol: number;
  emergencyStop: boolean;
  onScan: () => Promise<void>;
  onExecute: (id: string) => Promise<void>;
  onToggleProvider: (id: string, enabled: boolean) => Promise<void>;
}

export const OpportunityEngine: React.FC<OpportunityEngineProps> = ({
  opportunities,
  providers,
  availableSol,
  emergencyStop,
  onScan,
  onExecute,
  onToggleProvider
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [zeroCapOnly, setZeroCapOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const handleScan = async () => {
    setIsScanning(true);
    try {
      await onScan();
    } finally {
      setIsScanning(false);
    }
  };

  const handleExecute = async (id: string) => {
    setExecutingId(id);
    try {
      await onExecute(id);
    } catch (err) {
      alert(`Execution failed: ${(err as Error).message}`);
    } finally {
      setExecutingId(null);
    }
  };

  const filtered = opportunities.filter(opp => {
    if (zeroCapOnly && opp.capitalRequiredSol > 0) return false;
    if (selectedCategory !== 'ALL' && opp.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-neutral-100">Opportunity Discovery & Connector Engine</h2>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Continuous scanning, EV calculation, zero-capital routing, and autonomous task execution.
          </p>
        </div>

        <button
          id="scan-opportunities-btn"
          onClick={handleScan}
          disabled={isScanning || emergencyStop}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Scanning Cluster...' : 'Scan Opportunities'}</span>
        </button>
      </div>

      {/* Active Connectors Grid */}
      <div className="bg-neutral-900/60 p-4 rounded-xl border border-neutral-800">
        <h3 className="text-xs font-mono uppercase text-neutral-400 font-bold mb-3 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-cyan-400" />
          Active Opportunity Connectors ({providers.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {providers.map(p => (
            <div 
              key={p.id}
              className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between font-mono text-xs"
            >
              <div>
                <div className="font-semibold text-neutral-200">{p.name}</div>
                <div className="text-[10px] text-cyan-400/80">{p.category}</div>
              </div>
              <button
                onClick={() => onToggleProvider(p.id, !p.isEnabled)}
                className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                  p.isEnabled 
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60 hover:bg-emerald-900' 
                    : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700'
                }`}
              >
                {p.isEnabled ? 'ACTIVE' : 'DISABLED'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Filters & Zero-Capital Guard */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-900/40 p-3 rounded-lg border border-neutral-800">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-mono text-emerald-300 cursor-pointer select-none bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-800/40">
            <input
              id="zero-capital-checkbox"
              type="checkbox"
              checked={zeroCapOnly}
              onChange={(e) => setZeroCapOnly(e.target.checked)}
              className="rounded bg-neutral-950 border-emerald-700 text-emerald-500 focus:ring-emerald-500 w-3.5 h-3.5"
            />
            <span className="font-bold">Zero-Capital Mode Only (0 SOL Required)</span>
          </label>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span className="text-neutral-400">Category:</span>
          {['ALL', 'ZERO_CAPITAL', 'DEFI_AUDIT', 'M2M_PRODUCT'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                selectedCategory === cat
                  ? 'bg-neutral-800 text-neutral-100 border border-neutral-700 font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Opportunity Cards List */}
      <div className="space-y-3 font-mono">
        {filtered.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-neutral-900/40 border border-neutral-800 text-neutral-500 text-xs">
            No live opportunities found matching current filters. Click "Scan Opportunities" to discover new work.
          </div>
        ) : (
          filtered.map((opp, idx) => {
            const hasCapital = opp.capitalRequiredSol <= availableSol;
            const isExecutable = opp.status === 'DISCOVERED' && hasCapital && !emergencyStop;

            return (
              <div 
                key={`${opp.id}-${idx}`}
                className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-neutral-100">{opp.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-cyan-300 border border-neutral-700">
                        {opp.category}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${
                        opp.riskLevel === 'ZERO' 
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800' 
                          : opp.riskLevel === 'LOW'
                            ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                            : 'bg-amber-950 text-amber-300 border-amber-800'
                      }`}>
                        RISK: {opp.riskLevel}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        opp.status === 'PROOF_SUBMITTED' || opp.status === 'PAID'
                          ? 'bg-emerald-950/80 text-emerald-300'
                          : opp.status === 'EXECUTING'
                            ? 'bg-amber-950/80 text-amber-300 animate-pulse'
                            : 'bg-neutral-800 text-neutral-400'
                      }`}>
                        STATUS: {opp.status}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 font-sans mt-1">
                      {opp.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleExecute(opp.id)}
                      disabled={!isExecutable || executingId === opp.id}
                      className="px-3 py-1.5 text-xs font-bold rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Play className="w-3 h-3" />
                      <span>{executingId === opp.id ? 'Executing...' : 'Execute Task'}</span>
                    </button>
                  </div>
                </div>

                {/* Financial & EV Metrics Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-neutral-800/80 text-xs">
                  <div className="bg-neutral-950/60 p-2 rounded border border-neutral-800/40">
                    <span className="text-[10px] text-neutral-500 uppercase flex items-center gap-1">
                      <Coins className="w-3 h-3 text-emerald-400" />
                      Expected Gross
                    </span>
                    <p className="font-bold text-emerald-400 mt-0.5">
                      {opp.expectedRevenueSol.toFixed(4)} SOL
                    </p>
                  </div>

                  <div className="bg-neutral-950/60 p-2 rounded border border-neutral-800/40">
                    <span className="text-[10px] text-neutral-500 uppercase flex items-center gap-1">
                      <Percent className="w-3 h-3 text-cyan-400" />
                      Success Prob.
                    </span>
                    <p className="font-bold text-cyan-300 mt-0.5">
                      {(opp.probabilityOfSuccess * 100).toFixed(0)}%
                    </p>
                  </div>

                  <div className="bg-neutral-950/60 p-2 rounded border border-neutral-800/40">
                    <span className="text-[10px] text-neutral-500 uppercase">Expected Value (EV)</span>
                    <p className="font-bold text-neutral-200 mt-0.5">
                      {opp.expectedValueSol.toFixed(4)} SOL
                    </p>
                  </div>

                  <div className="bg-neutral-950/60 p-2 rounded border border-neutral-800/40">
                    <span className="text-[10px] text-neutral-500 uppercase">Capital Required</span>
                    <p className={`font-bold mt-0.5 ${opp.capitalRequiredSol === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {opp.capitalRequiredSol.toFixed(4)} SOL
                    </p>
                  </div>

                  <div className="bg-neutral-950/60 p-2 rounded border border-neutral-800/40">
                    <span className="text-[10px] text-neutral-500 uppercase">Provider</span>
                    <p className="font-medium text-neutral-300 mt-0.5 truncate text-[11px]">
                      {opp.provider}
                    </p>
                  </div>
                </div>

                {/* Evidence snippet if proof was submitted */}
                {opp.evidence && (
                  <div className="p-2.5 bg-neutral-950 rounded border border-emerald-900/50 text-[11px] text-emerald-300">
                    <div className="font-bold flex items-center gap-1 mb-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      Execution Proof Collected:
                    </div>
                    <pre className="text-[10px] text-neutral-400 overflow-x-auto">
                      {JSON.stringify(opp.evidence, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
