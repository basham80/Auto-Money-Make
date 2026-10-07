import React, { useState } from 'react';
import { 
  Users, 
  Activity, 
  ShieldCheck, 
  ShieldAlert, 
  Cpu, 
  Zap, 
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Wallet
} from 'lucide-react';
import { AgentInfo } from '../types/index.ts';

interface AgentFleetMatrixProps {
  agents: AgentInfo[];
}

export const AgentFleetMatrix: React.FC<AgentFleetMatrixProps> = ({ agents }) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  const filtered = agents.filter(a => {
    if (roleFilter !== 'ALL' && a.role !== roleFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q) || a.role.toLowerCase().includes(q);
    }
    return true;
  });

  const executingCount = agents.filter(a => a.state !== 'IDLE' && a.state !== 'STOPPED' && a.state !== 'BLOCKED' && a.state !== 'FAILED').length;

  const squads = [
    {
      name: 'Scout & Intelligence Squad',
      badge: 'MARKET INTEL',
      agents: ['DISCOVERY-01', 'MARKET-02', 'QUANT-07'],
      desc: 'Solana DEX liquidity monitoring, SPL honeypot detection, and zero-capital bounty discovery.'
    },
    {
      name: 'Scoring & Dynamic Pricing',
      badge: 'RISK / EV',
      agents: ['SCORER-03', 'PRICING-04', 'RISK-15', 'OPTIMIZER-19', 'STRATEGY-20'],
      desc: 'Mathematical EV ranking, downside loss bounding, and x402 machine product pricing.'
    },
    {
      name: 'Execution & Delivery Squad',
      badge: 'DELIVERY',
      agents: ['EXEC-05', 'DATA-06', 'SUPPORT-08', 'DELIVERY-09'],
      desc: 'Zero-capital cryptographic payload compilation, digital product delivery, and automated fulfillments.'
    },
    {
      name: 'Verification & Settlement Squad',
      badge: 'SETTLEMENT',
      agents: ['VERIFY-10', 'LEDGER-11', 'RECON-12', 'TREASURY-13', 'SECURITY-14'],
      desc: 'On-chain Solana slot verification directly routing revenue to Master Treasury (HTN1...V5i).'
    },
    {
      name: 'Infrastructure & Self-Improvement',
      badge: 'INVARIANTS',
      agents: ['QA-16', 'TESTING-17', 'OBSERVER-18', 'JARVIS-21'],
      desc: 'Multi-tier RPC cluster failovers, autonomous canary self-tests, and live JARVIS engine loops.'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-neutral-100">21-Agent Autonomous Fleet Command</h2>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Decentralized multi-agent orchestration with isolated capabilities, risk limits, and cryptographic audit trails.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800">
            <span className="text-neutral-500">Fleet Size:</span> <span className="text-neutral-100 font-bold">{agents.length} Agents</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-300">
            <span className="text-emerald-500">Active / Executing:</span> <span className="font-bold">{executingCount}/{agents.length} Active</span>
          </div>
        </div>
      </div>

      {/* SWARM COLLABORATION HERO BANNER */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 via-neutral-900 to-indigo-950/30 border border-purple-500/30 font-mono shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold flex items-center gap-1">
                <Zap className="w-3 h-3 text-purple-400" />
                TREASURY-BACKED SWARM MODE ACTIVE
              </span>
              <span className="text-[11px] text-neutral-400">Collaborative Revenue Generation</span>
            </div>
            <p className="text-xs text-neutral-300 font-sans">
              All 21 agents collaborate as a synchronized collective to generate revenue directly into the Master Treasury Wallet (<span className="text-purple-300 font-mono font-semibold">HTN1fvHwbzKiMwh9YXZEe3eooiMdoCAs3TweWdiSZV5i</span>) via Server Signer using operational custody capital.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-xs">
            <div className="px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800">
              <span className="text-neutral-500 block text-[10px]">Master Signer</span>
              <span className="text-emerald-400 font-bold">SERVER_SIGNER</span>
            </div>
            <div className="px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800">
              <span className="text-neutral-500 block text-[10px]">Profit Sweep Floor</span>
              <span className="text-purple-400 font-bold">65% to Treasury</span>
            </div>
          </div>
        </div>

        {/* Squad Pipeline Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 mt-4 pt-3.5 border-t border-purple-500/20 text-[11px]">
          {squads.map((sq, i) => (
            <div key={sq.name} className="p-2.5 rounded-lg bg-neutral-950/70 border border-neutral-800 flex flex-col justify-between space-y-1.5">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-neutral-400">{sq.badge}</span>
                  <span className="text-[9px] text-neutral-600 font-mono">Squad {i + 1}</span>
                </div>
                <div className="text-xs font-bold text-neutral-200 mt-0.5">{sq.name}</div>
                <div className="text-[10px] text-neutral-400 line-clamp-2 mt-1 font-sans">{sq.desc}</div>
              </div>
              <div className="flex flex-wrap gap-1 pt-1 border-t border-neutral-800/60">
                {sq.agents.map(a => (
                  <span key={a} className="px-1 py-0.2 bg-neutral-900 text-purple-300 rounded text-[9px]">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-neutral-900/60 p-3 rounded-lg border border-neutral-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
          <input
            id="agent-search-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Agent ID, Name, Role..."
            className="w-full bg-neutral-950 text-neutral-200 text-xs pl-9 pr-3 py-1.5 rounded border border-neutral-800 focus:border-purple-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs font-mono">
          <span className="text-neutral-500 text-[11px] shrink-0">Filter Role:</span>
          {['ALL', 'DISCOVERY', 'EXECUTION', 'PAYMENT_VERIFICATION', 'ACCOUNTING_LEDGER', 'JARVIS_SELF_IMPROVEMENT'].map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-2 py-1 rounded text-[10px] shrink-0 transition-colors ${
                roleFilter === r
                  ? 'bg-purple-950 text-purple-300 border border-purple-700 font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {r.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono">
        {filtered.map(agent => {
          const isBusy = agent.state !== 'IDLE' && agent.state !== 'STOPPED';

          return (
            <div 
              key={agent.id}
              className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-neutral-100">{agent.name}</span>
                      <span className="text-[10px] text-neutral-500">[{agent.id}]</span>
                    </div>
                    <div className="text-[11px] text-purple-400 font-semibold mt-0.5">
                      {agent.role}
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                    agent.riskClass === 'CRITICAL'
                      ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                      : agent.riskClass === 'HIGH'
                        ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                        : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                  }`}>
                    {agent.riskClass}
                  </span>
                </div>

                {/* State Badge */}
                <div className="mt-2.5 flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded flex items-center gap-1.5 ${
                    isBusy
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700 animate-pulse'
                      : 'bg-neutral-950 text-neutral-400 border border-neutral-800'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isBusy ? 'bg-emerald-400' : 'bg-neutral-500'}`} />
                    {agent.state}
                  </span>
                  {agent.currentTask && (
                    <span className="text-[10px] text-neutral-400 truncate max-w-[170px]" title={agent.currentTask}>
                      {agent.currentTask}
                    </span>
                  )}
                </div>

                {/* Capabilities list */}
                <div className="mt-3">
                  <span className="text-[10px] uppercase text-neutral-500 font-bold block mb-1">Capabilities:</span>
                  <div className="flex flex-wrap gap-1">
                    {agent.capabilities.map(cap => (
                      <span key={cap} className="px-1.5 py-0.5 bg-neutral-950 text-neutral-400 rounded text-[9px] border border-neutral-800/80">
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Stats */}
              <div className="pt-2.5 border-t border-neutral-800/80 grid grid-cols-3 gap-2 text-center text-[10px]">
                <div className="bg-neutral-950 p-1.5 rounded border border-neutral-800/40">
                  <span className="text-neutral-500 block">Done</span>
                  <span className="text-emerald-400 font-bold">{agent.tasksCompleted}</span>
                </div>
                <div className="bg-neutral-950 p-1.5 rounded border border-neutral-800/40">
                  <span className="text-neutral-500 block">Failed</span>
                  <span className="text-rose-400 font-bold">{agent.tasksFailed}</span>
                </div>
                <div className="bg-neutral-950 p-1.5 rounded border border-neutral-800/40">
                  <span className="text-neutral-500 block">Limit/min</span>
                  <span className="text-neutral-300 font-bold">{agent.rateLimitPerMinute}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
