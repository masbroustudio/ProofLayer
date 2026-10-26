import React, { useState } from 'react';
import { 
  Flame, 
  AlertTriangle, 
  RefreshCw, 
  Zap, 
  Crosshair,
  Database,
  Shield,
  Layers
} from 'lucide-react';

interface RedTeamBarProps {
  onSimulationTriggered: (scenario: string) => void;
}

export type SimulationScenario = 
  | 'SWARM_ATTACK' 
  | 'TOCTOU_TAMPER' 
  | 'CLEAN_PAYMENT' 
  | 'SQL_DROP_GUARD' 
  | 'DATA_EXFILTRATION' 
  | 'CONTINUOUS_PIPELINE';

export const RedTeamBar: React.FC<RedTeamBarProps> = ({ onSimulationTriggered }) => {
  const [loadingScenario, setLoadingScenario] = useState<string | null>(null);

  const handleSimulate = async (scenario: SimulationScenario) => {
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
    <div className="h-11 border-b border-slate-800 bg-[#0A0E17] px-4 flex items-center justify-between text-xs font-mono z-10 shrink-0 overflow-x-auto">
      {/* Title */}
      <div className="flex items-center gap-2 shrink-0 mr-3">
        <Crosshair className="w-4 h-4 text-rose-400" />
        <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
          Red-Team Sandbox
        </span>
        <span className="text-[10px] text-slate-500 font-sans hidden xl:inline">
          — One-click adversarial scenarios for 3-minute video pitch
        </span>
      </div>

      {/* Trigger Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Scenario 0: 5-Step Continuous Pipeline */}
        <button
          onClick={() => handleSimulate('CONTINUOUS_PIPELINE')}
          disabled={loadingScenario !== null}
          title="Run complete 5-step agentic workflow: Invoice -> DB Query -> Pay -> Attack Intercept -> Exfil Block"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-950/80 hover:bg-cyan-900/90 text-cyan-300 border border-cyan-800/80 font-bold text-[11px] transition-all hover:scale-[1.02] shadow-sm shadow-cyan-950"
        >
          {loadingScenario === 'CONTINUOUS_PIPELINE' ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
          ) : (
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
          )}
          <span>5-Step Pipeline</span>
        </button>

        {/* Scenario 1: Swarm Attack */}
        <button
          onClick={() => handleSimulate('SWARM_ATTACK')}
          disabled={loadingScenario !== null}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-950/80 hover:bg-rose-900/90 text-rose-300 border border-rose-800/80 font-bold text-[11px] transition-all hover:scale-[1.02] shadow-sm shadow-rose-950"
        >
          {loadingScenario === 'SWARM_ATTACK' ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-400" />
          ) : (
            <Flame className="w-3.5 h-3.5 text-rose-400" />
          )}
          <span>Swarm Attack ($1,200)</span>
        </button>

        {/* Scenario 2: SQL Production Drop Guard */}
        <button
          onClick={() => handleSimulate('SQL_DROP_GUARD')}
          disabled={loadingScenario !== null}
          title="Simulate compromised SRE agent attempting DROP TABLE customers_prod CASCADE"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-950/80 hover:bg-orange-900/90 text-orange-300 border border-orange-800/80 font-bold text-[11px] transition-all hover:scale-[1.02] shadow-sm shadow-orange-950"
        >
          {loadingScenario === 'SQL_DROP_GUARD' ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-400" />
          ) : (
            <Database className="w-3.5 h-3.5 text-orange-400" />
          )}
          <span>SQL Drop Guard</span>
        </button>

        {/* Scenario 3: Secret & PII Exfiltration Guard */}
        <button
          onClick={() => handleSimulate('DATA_EXFILTRATION')}
          disabled={loadingScenario !== null}
          title="Simulate untrusted agent leaking customer SSN and OpenAI API key"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-950/80 hover:bg-purple-900/90 text-purple-300 border border-purple-800/80 font-bold text-[11px] transition-all hover:scale-[1.02] shadow-sm shadow-purple-950"
        >
          {loadingScenario === 'DATA_EXFILTRATION' ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
          ) : (
            <Shield className="w-3.5 h-3.5 text-purple-400" />
          )}
          <span>Exfiltration Blocker</span>
        </button>

        {/* Scenario 4: TOCTOU Drift Tamper */}
        <button
          onClick={() => handleSimulate('TOCTOU_TAMPER')}
          disabled={loadingScenario !== null}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-950/80 hover:bg-amber-900/90 text-amber-300 border border-amber-800/80 font-bold text-[11px] transition-all hover:scale-[1.02] shadow-sm shadow-amber-950"
        >
          {loadingScenario === 'TOCTOU_TAMPER' ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span>TOCTOU Tamper</span>
        </button>

        {/* Scenario 5: Routine $50 Payment */}
        <button
          onClick={() => handleSimulate('CLEAN_PAYMENT')}
          disabled={loadingScenario !== null}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-800/80 font-bold text-[11px] transition-all hover:scale-[1.02] shadow-sm shadow-emerald-950"
        >
          {loadingScenario === 'CLEAN_PAYMENT' ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
          ) : (
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span>Routine Pay ($50)</span>
        </button>
      </div>
    </div>
  );
};
