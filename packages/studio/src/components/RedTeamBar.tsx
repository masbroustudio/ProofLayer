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
    <div className="h-11 border-b border-slate-200 bg-white px-4 sm:px-6 flex items-center justify-between text-xs font-mono z-10 shrink-0 overflow-x-auto shadow-2xs">
      {/* Title */}
      <div className="flex items-center gap-2 shrink-0 mr-3">
        <Crosshair className="w-3.5 h-3.5 text-rose-500" />
        <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
          Red-Team Sandbox
        </span>
        <span className="text-[10px] text-slate-400 font-sans hidden xl:inline">
          — One-click adversarial scenarios for video demo
        </span>
      </div>

      {/* Trigger Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Scenario 0: 5-Step Continuous Pipeline */}
        <button
          onClick={() => handleSimulate('CONTINUOUS_PIPELINE')}
          disabled={loadingScenario !== null}
          title="Run complete 5-step agentic workflow: Invoice -> DB Query -> Pay -> Attack Intercept -> Exfil Block"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-[11px] transition-all cursor-pointer hover:scale-[1.01] shadow-2xs"
        >
          {loadingScenario === 'CONTINUOUS_PIPELINE' ? (
            <RefreshCw className="w-3 h-3 animate-spin text-indigo-600" />
          ) : (
            <Layers className="w-3 h-3 text-indigo-600" />
          )}
          <span>5-Step Pipeline</span>
        </button>

        {/* Scenario 1: Swarm Attack */}
        <button
          onClick={() => handleSimulate('SWARM_ATTACK')}
          disabled={loadingScenario !== null}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] transition-all cursor-pointer hover:scale-[1.01] shadow-2xs"
        >
          {loadingScenario === 'SWARM_ATTACK' ? (
            <RefreshCw className="w-3 h-3 animate-spin text-rose-600" />
          ) : (
            <Flame className="w-3 h-3 text-rose-600" />
          )}
          <span>Swarm Attack ($1,200)</span>
        </button>

        {/* Scenario 2: SQL Production Drop Guard */}
        <button
          onClick={() => handleSimulate('SQL_DROP_GUARD')}
          disabled={loadingScenario !== null}
          title="Simulate compromised SRE agent attempting DROP TABLE customers_prod CASCADE"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 font-bold text-[11px] transition-all cursor-pointer hover:scale-[1.01] shadow-2xs"
        >
          {loadingScenario === 'SQL_DROP_GUARD' ? (
            <RefreshCw className="w-3 h-3 animate-spin text-orange-600" />
          ) : (
            <Database className="w-3 h-3 text-orange-600" />
          )}
          <span>SQL Drop Guard</span>
        </button>

        {/* Scenario 3: Secret & PII Exfiltration Guard */}
        <button
          onClick={() => handleSimulate('DATA_EXFILTRATION')}
          disabled={loadingScenario !== null}
          title="Simulate untrusted agent leaking customer SSN and OpenAI API key"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-[11px] transition-all cursor-pointer hover:scale-[1.01] shadow-2xs"
        >
          {loadingScenario === 'DATA_EXFILTRATION' ? (
            <RefreshCw className="w-3 h-3 animate-spin text-purple-600" />
          ) : (
            <Shield className="w-3 h-3 text-purple-600" />
          )}
          <span>Exfiltration Blocker</span>
        </button>

        {/* Scenario 4: TOCTOU Drift Tamper */}
        <button
          onClick={() => handleSimulate('TOCTOU_TAMPER')}
          disabled={loadingScenario !== null}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-[11px] transition-all cursor-pointer hover:scale-[1.01] shadow-2xs"
        >
          {loadingScenario === 'TOCTOU_TAMPER' ? (
            <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
          ) : (
            <AlertTriangle className="w-3 h-3 text-amber-600" />
          )}
          <span>TOCTOU Tamper</span>
        </button>

        {/* Scenario 5: Routine $50 Payment */}
        <button
          onClick={() => handleSimulate('CLEAN_PAYMENT')}
          disabled={loadingScenario !== null}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-[11px] transition-all cursor-pointer hover:scale-[1.01] shadow-2xs"
        >
          {loadingScenario === 'CLEAN_PAYMENT' ? (
            <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" />
          ) : (
            <Zap className="w-3 h-3 text-emerald-600" />
          )}
          <span>Routine Pay ($50)</span>
        </button>
      </div>
    </div>
  );
};