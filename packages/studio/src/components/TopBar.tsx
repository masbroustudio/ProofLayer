import React from 'react';
import { 
  ShieldCheck, 
  Zap, 
  Lock, 
  Activity, 
  Sliders, 
  FileCheck2 
} from 'lucide-react';

export type StudioTab = 'console' | 'playground' | 'ledger';

interface TopBarProps {
  connected: boolean;
  policyCount: number;
  activeTab: StudioTab;
  onTabChange: (tab: StudioTab) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ 
  connected, 
  policyCount, 
  activeTab, 
  onTabChange 
}) => {
  return (
    <header className="h-14 border-b border-slate-200 bg-white/95 backdrop-blur px-4 sm:px-6 flex items-center justify-between z-20 shrink-0 shadow-xs">
      {/* Brand & Tagline */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 p-0.5 flex items-center justify-center shadow-sm">
          <div className="w-full h-full bg-white rounded-[6px] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-slate-900 text-base">ProofLayer</span>
            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              Trust Compiler 2026
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium hidden md:block">
            Don't trust what AI claims. Cryptographically verify what AI does.
          </p>
        </div>
      </div>

      {/* Navigation Tabs (Centered / High Visibility) */}
      <nav className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200/80">
        <button
          onClick={() => onTabChange('console')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'console'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Threat Console</span>
        </button>

        <button
          onClick={() => onTabChange('playground')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'playground'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Policy Playground</span>
        </button>

        <button
          onClick={() => onTabChange('ledger')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'ledger'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>Audit Ledger</span>
        </button>
      </nav>

      {/* Telemetry Chips */}
      <div className="hidden lg:flex items-center gap-2.5">
        {/* Latency benchmark */}
        <div 
          title="Compiled Invariant Runtime Latency vs 800ms+ LLM Guardrails"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-[11px] font-mono text-emerald-800 font-semibold shadow-2xs"
        >
          <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500" />
          <span>&lt;0.05ms</span>
          <span className="text-emerald-600/80 font-sans">($0 token cost)</span>
        </div>

        {/* Policies Enforced */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-700">
          <Lock className="w-3.5 h-3.5 text-indigo-600" />
          <span>{policyCount} Policies Active</span>
        </div>

        {/* SSE Connection Status */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span className="text-slate-700 font-medium text-[11px]">
            {connected ? 'MCP Proxy Live' : 'Reconnecting...'}
          </span>
        </div>
      </div>
    </header>
  );
};