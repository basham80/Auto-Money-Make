import React from 'react';
import { ShieldAlert, AlertTriangle, Play } from 'lucide-react';

interface EmergencyStopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmStop: () => void;
  onLiftStop: () => void;
  isCurrentlyStopped: boolean;
}

export const EmergencyStopModal: React.FC<EmergencyStopModalProps> = ({
  isOpen,
  onClose,
  onConfirmStop,
  onLiftStop,
  isCurrentlyStopped
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-rose-600/70 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl font-mono">
        <div className="flex items-center gap-3 border-b border-neutral-800 pb-3">
          <div className="p-2.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-100 font-sans">
              {isCurrentlyStopped ? 'Global Emergency Stop is ACTIVE' : 'Trigger Global Emergency Stop'}
            </h3>
            <p className="text-xs text-rose-400 font-semibold">Immediate System Execution Circuit Breaker</p>
          </div>
        </div>

        <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2 text-xs text-neutral-300">
          <p className="font-sans">
            Engaging Emergency Stop immediately halts:
          </p>
          <ul className="list-disc list-inside space-y-1 text-neutral-400 text-[11px]">
            <li>All 20+ agent autonomous execution and task scheduling</li>
            <li>All outbound Solana transaction signing and treasury sweeps</li>
            <li>All external HTTP 402 challenge fulfillments</li>
            <li>All JARVIS code changes and autonomous deployments</li>
          </ul>
          <p className="text-[11px] text-emerald-400 pt-1">
            ✓ Read-only observation, Solana RPC cluster telemetry, and audit logging remain active.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-semibold transition-colors"
          >
            Cancel
          </button>

          {isCurrentlyStopped ? (
            <button
              onClick={() => {
                onLiftStop();
                onClose();
              }}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>Lift Stop & Resume System</span>
            </button>
          ) : (
            <button
              onClick={() => {
                onConfirmStop();
                onClose();
              }}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-lg shadow-rose-900/30 transition-colors"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>ENGAGE KILL-SWITCH</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
