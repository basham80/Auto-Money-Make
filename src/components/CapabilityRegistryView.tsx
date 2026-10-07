import React, { useState } from 'react';
import { 
  Boxes, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  ArrowRight, 
  Sparkles,
  ShieldAlert,
  Coins,
  Cpu
} from 'lucide-react';
import { CapabilityItem } from '../types/omega.ts';

interface CapabilityRegistryViewProps {
  capabilities: CapabilityItem[];
  onExecuteCapability?: (id: string) => void;
}

export const CapabilityRegistryView: React.FC<CapabilityRegistryViewProps> = ({ 
  capabilities,
  onExecuteCapability 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  const [compositionResult, setCompositionResult] = useState<any>(null);
  const [isComposing, setIsComposing] = useState(false);

  const categories = ['ALL', 'INTELLIGENCE', 'OPPORTUNITY', 'PRODUCT', 'ASSET', 'TREASURY', 'COMPOUNDING', 'CODE'];

  const filtered = selectedCategory === 'ALL'
    ? capabilities
    : capabilities.filter(c => c.category === selectedCategory);

  const toggleSelect = (id: string) => {
    setSelectedCapabilities(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCompose = async () => {
    if (selectedCapabilities.length === 0) return;
    setIsComposing(true);
    try {
      const res = await fetch('/api/capabilities/compose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ capabilityIds: selectedCapabilities })
      });
      if (res.ok) {
        const data = await res.json();
        setCompositionResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsComposing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Boxes className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold text-neutral-100">Emergent Capability Registry</h2>
              <span className="px-2 py-0.5 text-xs font-mono rounded bg-purple-950/80 text-purple-300 border border-purple-800/40">
                Extensible Architecture
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
              YABBAI Ω avoids hardcoded monolithic features. Specialist capabilities are isolated, permissioned, risk-scored, and composed dynamically into new autonomous revenue workflows.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-300">
              <span className="text-neutral-500">Registered:</span> <span className="text-purple-300 font-bold">{capabilities.length} Capabilities</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-300">
              <span className="text-emerald-500">Status:</span> <span className="font-bold">100% HEALTHY</span>
            </div>
          </div>
        </div>

        {/* Workflow Composition Drawer */}
        {selectedCapabilities.length > 0 && (
          <div className="mt-6 p-4 rounded-lg bg-neutral-950 border border-purple-900/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold text-neutral-200">
                  Composing Workflow: <span className="font-mono text-purple-300">{selectedCapabilities.length} Selected</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedCapabilities([])}
                  className="px-2.5 py-1 text-xs text-neutral-400 hover:text-neutral-200"
                >
                  Clear Selection
                </button>
                <button
                  onClick={handleCompose}
                  disabled={isComposing}
                  className="px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-all shadow-md shadow-purple-900/30 flex items-center gap-1.5"
                >
                  <Layers className="w-3.5 h-3.5" />
                  {isComposing ? 'Evaluating Composition...' : 'Validate Composition'}
                </button>
              </div>
            </div>

            {compositionResult && (
              <div className="mt-3 pt-3 border-t border-neutral-800 text-xs font-mono grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-2.5 rounded bg-neutral-900 border border-neutral-800">
                  <div className="text-neutral-500 text-[11px]">Composition Validity</div>
                  <div className={`font-bold mt-0.5 flex items-center gap-1 ${compositionResult.isValid ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {compositionResult.isValid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    {compositionResult.isValid ? 'Valid Emergent Workflow' : 'Missing Dependencies'}
                  </div>
                </div>
                <div className="p-2.5 rounded bg-neutral-900 border border-neutral-800">
                  <div className="text-neutral-500 text-[11px]">Composite Revenue Potential</div>
                  <div className="text-emerald-400 font-bold mt-0.5">
                    +{compositionResult.compositeRevenuePotentialSol} SOL / run
                  </div>
                </div>
                <div className="p-2.5 rounded bg-neutral-900 border border-neutral-800">
                  <div className="text-neutral-500 text-[11px]">Required Permissions</div>
                  <div className="text-neutral-300 text-[10px] mt-0.5 truncate">
                    {compositionResult.requiredPermissions?.join(', ') || 'READ_ONLY'}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedCategory === cat 
                ? 'bg-purple-900/60 border border-purple-700/60 text-purple-200 font-bold'
                : 'bg-neutral-900/80 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Capability Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(cap => {
          const isSelected = selectedCapabilities.includes(cap.id);
          return (
            <div 
              key={cap.id}
              className={`bg-neutral-900 border rounded-xl p-5 flex flex-col justify-between transition-all ${
                isSelected 
                  ? 'border-purple-500/80 ring-1 ring-purple-500/50 shadow-lg shadow-purple-950/40' 
                  : 'border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-neutral-950 border border-neutral-800 text-purple-400">
                    {cap.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-1.5 py-0.5 text-[9px] font-mono rounded ${
                      cap.risk === 'LOW' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                    }`}>
                      {cap.risk} RISK
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500">v{cap.version}</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-neutral-100 mt-2.5">{cap.name}</h3>
                <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                  {cap.description}
                </p>

                {/* Metrics */}
                <div className="mt-4 pt-3 border-t border-neutral-800/80 grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-neutral-500 text-[10px]">Cost:</span>
                    <div className="text-neutral-200 font-semibold">{cap.costSol} SOL</div>
                  </div>
                  <div>
                    <span className="text-neutral-500 text-[10px]">Rev Potential:</span>
                    <div className="text-emerald-400 font-semibold">+{cap.revenuePotentialSol} SOL</div>
                  </div>
                </div>

                {/* Dependencies & Permissions */}
                <div className="mt-3 space-y-1 text-[11px] font-mono text-neutral-400">
                  <div className="flex items-center gap-1 text-neutral-500">
                    <Layers className="w-3 h-3" />
                    <span>Executions: <strong className="text-neutral-300">{cap.executionCount}</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => toggleSelect(cap.id)}
                  className={`flex-1 py-1.5 px-3 rounded text-xs font-mono font-medium transition-all ${
                    isSelected
                      ? 'bg-purple-900/80 text-purple-200 border border-purple-700'
                      : 'bg-neutral-950 text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
                  }`}
                >
                  {isSelected ? '✓ Selected for Workflow' : '+ Add to Composition'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
