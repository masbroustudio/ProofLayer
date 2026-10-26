import React, { useState } from 'react';
import { 
  Flame, 
  AlertTriangle, 
  RefreshCw, 
  Zap, 
  Crosshair 
} from 'lucide-react';

interface RedTeamBarProps {
  onSimulationTriggered: (scenario: string) => void;
}

export const RedTeamBar: React.FC<RedTeamBarProps> = ({ onSimulationTriggered }) => {
  const [loadingScenario, setLoadingScenario] = useState<string | null>(null);

  const handleSimulate = async (scenario: 'SWARM_ATTACK' | 'TOCTOU_TAMPER' | 'CLEAN_PAYMENT') => {
    setLoadingScenario(scenario);
    try {
      const res = await fetch('/api/sandbox/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario }),
      });
      await res.json();
      onSimulationTriggered(scenario);
    } catch (err) {
      console.error('Failed to trigger simulation:', err);
    } finally {
      setLoadingScenario(null);
    }
  };

  return (
    <div className="h-11 border-b border-slate-800 bg-[#0A0E17] px-5 flex items-center justify-between text-xs font-mono z-10 shrink-0">
      {/* Title */}
      <div className="flex items-center gap-2">
        <Crosshair className="w-4 h-4 text-rose-400" />
        <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
          Red-Team Sandbox
        </span>
        <span className="text-[10px] text-slate-500 font-sans hidden lg:inline">
          — One-click adversarial scenarios for 3-minute video pitch
        </span>
      </div>

      {/* Trigger Buttons */}
      <div className="flex items-center gap-2.5">
        {/* Scenario 1: Swarm Attack */}
        <button
          onClick={() => handleSimulate('SWARM_ATTACK')}
          disabled={loadingScenario !== null}
          className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-rose-950/80 hover:bg-rose-900/90 text-rose-300 border border-rose-800/80 font-bold text-[11px] transition-all hover:scale-[1.02] shadow-sm shadow-rose-950"
        >
          {loadingScenario === 'SWARM_ATTACK' ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-400" />
          ) : (
            <Flame className="w-3.5 h-3.5 text-rose-400" />
          )}
          <span>Simulate Swarm Attack ($1,200)</span>
        </button>

        {/* Scenario 2: TOCTOU Drift Tamper */}
        <button
          onClick={() => handleSimulate('TOCTOU_TAMPER')}
          disabled={loadingScenario !== null}
          className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-950/80 hover:bg-amber-900/90 text-amber-300 border border-amber-800/80 font-bold text-[11px] transition-all hover:scale-[1.02] shadow-sm shadow-amber-950"
        >
          {loadingScenario === 'TOCTOU_TAMPER' ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span>Simulate TOCTOU Tamper</span>
        </button>

        {/* Scenario 3: Routine $50 Payment */}
        <button
          onClick={() => handleSimulate('CLEAN_PAYMENT')}
          disabled={loadingScenario !== null}
          className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-800/80 font-bold text-[11px] transition-all hover:scale-[1.02] shadow-sm shadow-emerald-950"
        >
          {loadingScenario === 'CLEAN_PAYMENT' ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
          ) : (
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span>Routine Payment ($50)</span>
        </button>
      </div>
    </div>
  );
};
