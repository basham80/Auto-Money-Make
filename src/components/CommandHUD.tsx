import React, { useState } from 'react';
import { 
  Terminal, 
  ShieldAlert, 
  Play, 
  Pause, 
  RotateCw, 
  Activity, 
  TrendingUp, 
  Cpu, 
  Send
} from 'lucide-react';
import { AutopilotStatus, TreasuryState } from '../types/index.ts';

interface CommandHUDProps {
  autopilot: AutopilotStatus | null;
  treasury: TreasuryState | null;
  emergencyStop: boolean;
  network: string;
  onToggleAutopilot: (running: boolean) => void;
  onEmergencyStop: (active: boolean) => void;
  onForceCycle: () => void;
  onExecuteCommand: (cmd: string) => Promise<string>;
  onOpenWithdraw?: () => void;
}

export const CommandHUD: React.FC<CommandHUDProps> = ({
  autopilot,
  treasury,
  emergencyStop,
  network,
  onToggleAutopilot,
  onEmergencyStop,
  onForceCycle,
  onExecuteCommand,
  onOpenWithdraw
}) => {
  const [commandInput, setCommandInput] = useState('');
  const [commandOutput, setCommandOutput] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim() || isExecuting) return;

    setIsExecuting(true);
    try {
      const output = await onExecuteCommand(commandInput);
      setCommandOutput(output);
      setCommandInput('');
    } catch (err) {
      setCommandOutput(`Error executing command: ${(err as Error).message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <header className="border-b border-neutral-800/80 bg-neutral-900/60 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5">
          
          {/* Logo & System Brand */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-sm">
                <span className="font-mono font-black text-xl tracking-tighter">Ω</span>
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${emergencyStop ? 'bg-rose-400' : 'bg-emerald-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${emergencyStop ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-neutral-100 tracking-tight">YABBAI Ω</h1>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/50">
                    V16.0 PROD
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                    {network}
                  </span>
                </div>
                <p className="text-xs text-neutral-400">Autonomous Machine Economy Operating System</p>
              </div>
            </div>

            {/* Mobile Emergency Stop */}
            <div className="lg:hidden">
              <button
                id="mobile-emergency-stop-btn"
                onClick={() => onEmergencyStop(!emergencyStop)}
                className={`px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors ${
                  emergencyStop 
                    ? 'bg-rose-600 text-white hover:bg-rose-700' 
                    : 'bg-neutral-800 text-rose-400 border border-rose-900/50 hover:bg-rose-950/40'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                {emergencyStop ? 'RESUME' : 'E-STOP'}
              </button>
            </div>
          </div>

          {/* Real-time Economic Ticker Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-neutral-950/60 p-2 rounded-lg border border-neutral-800/60">
            <div className="px-2.5 py-1 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-neutral-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  Realized Profit
                </span>
                <p className="text-sm font-bold font-mono text-emerald-400">
                  {(treasury?.realizedProfitSol || 0).toFixed(4)} <span className="text-xs text-emerald-500/80">SOL</span>
                </p>
              </div>
              {onOpenWithdraw && (
                <button
                  onClick={onOpenWithdraw}
                  className="ml-2 px-2 py-0.5 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 font-mono text-[10px] font-bold transition shrink-0"
                  title="Withdraw net profit to your sovereign address HTN1...SZV5i"
                >
                  Withdraw
                </button>
              )}
            </div>

            <div className="px-2.5 py-1 border-l border-neutral-800/60">
              <span className="text-[10px] uppercase font-mono text-neutral-400 flex items-center gap-1">
                <Activity className="w-3 h-3 text-cyan-400" />
                Available Treasury
              </span>
              <p className="text-sm font-bold font-mono text-cyan-300">
                {(treasury?.availableSol || 0).toFixed(4)} <span className="text-xs text-cyan-500/80">SOL</span>
              </p>
            </div>

            <div className="px-2.5 py-1 border-l border-neutral-800/60">
              <span className="text-[10px] uppercase font-mono text-neutral-400 flex items-center gap-1">
                <Cpu className="w-3 h-3 text-amber-400" />
                Autopilot Mode
              </span>
              <p className="text-xs font-semibold text-neutral-200 mt-0.5 truncate">
                {emergencyStop ? 'HALTED' : (autopilot?.mode || 'LIVE')}
              </p>
            </div>

            <div className="px-2.5 py-1 border-l border-neutral-800/60">
              <span className="text-[10px] uppercase font-mono text-neutral-400">Cycle Count</span>
              <p className="text-sm font-mono font-semibold text-neutral-300">
                #{autopilot?.cyclesCompleted || 0}
              </p>
            </div>
          </div>

          {/* Autopilot Controls & Emergency Stop */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              id="force-cycle-btn"
              onClick={onForceCycle}
              title="Force execute one autopilot cycle immediately"
              className="px-2.5 py-1.5 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded border border-neutral-700 flex items-center gap-1.5 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Step Cycle</span>
            </button>

            <button
              id="toggle-autopilot-btn"
              onClick={() => onToggleAutopilot(!autopilot?.isRunning)}
              disabled={emergencyStop}
              className={`px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors ${
                emergencyStop 
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700' 
                  : autopilot?.isRunning
                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20'
                    : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm'
              }`}
            >
              {autopilot?.isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{autopilot?.isRunning ? 'Pause Loop' : 'Start Autopilot'}</span>
            </button>

            <button
              id="emergency-stop-btn"
              onClick={() => onEmergencyStop(!emergencyStop)}
              className={`px-3 py-1.5 text-xs font-bold rounded flex items-center gap-1.5 transition-colors ${
                emergencyStop
                  ? 'bg-rose-600 text-white hover:bg-rose-500 shadow-sm animate-pulse'
                  : 'bg-neutral-900 text-rose-400 border border-rose-800/60 hover:bg-rose-950/40'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{emergencyStop ? 'LIFT E-STOP' : 'EMERGENCY STOP'}</span>
            </button>
          </div>
        </div>

        {/* Interactive JARVIS Command Line Bar */}
        <div className="mt-3">
          <form onSubmit={handleCommandSubmit} className="relative flex items-center">
            <div className="absolute left-3 text-emerald-400 flex items-center pointer-events-none">
              <Terminal className="w-4 h-4 mr-1.5" />
              <span className="font-mono text-xs font-bold">JARVIS&gt;</span>
            </div>
            <input
              id="jarvis-command-input"
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="Execute command (e.g. status, opportunities, revenue, profit, treasury, agents, payments, diagnose, test, stop, start)..."
              className="w-full bg-neutral-950 text-neutral-100 placeholder-neutral-500 font-mono text-xs pl-24 pr-10 py-2 rounded border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={isExecuting || !commandInput.trim()}
              className="absolute right-2 p-1 text-neutral-400 hover:text-emerald-400 disabled:opacity-40 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {commandOutput && (
            <div className="mt-2 p-2.5 rounded bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-300 flex items-start justify-between">
              <span className="break-all">{commandOutput}</span>
              <button 
                onClick={() => setCommandOutput(null)}
                className="ml-2 text-neutral-500 hover:text-neutral-300 text-[10px]"
              >
                [Dismiss]
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
