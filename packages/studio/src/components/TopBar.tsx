import React from 'react';
import { 
  ShieldCheck, 
  Zap, 
  Lock, 
  Activity, 
  Sliders, 
  FileCheck2,
  LayoutDashboard
} from 'lucide-react';

export type StudioTab = 'overview' | 'console' | 'playground' | 'ledger';

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
    <header className="h-14 border-b border-slate-200 bg-white/95 backdrop-blur px-4 sm:px-6 flex items-center justify-between z-20 shrink-0 shadow-xs text-slate-900">
      {/* Brand & Tagline matching Senior Mockup */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 p-0.5 flex items-center justify-center shadow-xs">
          <div className="w-full h-full bg-white rounded-[6px] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-slate-900 text-base">ProofLayer</span>
            <span className="text-[11px] text-slate-500 font-medium hidden md:inline border-l border-slate-200 pl-2">
              The Trust Compiler for AI Agents
            </span>
          </div>
        </div>
      </div>

      {/* Center Tagline with Cyan / Indigo Emphasis */}
      <div className="hidden xl:block text-xs font-medium text-slate-600">
        Don't trust what AI claims. <span className="text-indigo-600 font-semibold">Verify what AI does.</span>
      </div>

      {/* Navigation Tabs (Centered / High Visibility) */}
      <nav className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200/80">
        <button
          onClick={() => onTabChange('overview')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Overview</span>
        </button>

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

      {/* Telemetry Chips & Senior Mockup Badges */}
      <div className="flex items-center gap-2.5">
        {/* Latency benchmark */}
        <div 
          title="Compiled Invariant Runtime Latency vs 800ms+ LLM Guardrails"
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-[11px] font-mono text-emerald-800 font-semibold shadow-2xs"
        >
          <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500" />
          <span>&lt;0.05ms</span>
          <span className="text-emerald-600/80 font-sans">($0 token cost)</span>
        </div>

        {/* Policies Active */}
        <div 
          title="Active Policy AST Rules in Gateway"
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-700"
        >
          <Lock className="w-3.5 h-3.5 text-indigo-600" />
          <span>{policyCount} Policies</span>
        </div>

        {/* Connection Status */}
        <div 
          title={connected ? "Connected to Real-Time SSE Gateway" : "Reconnecting to Gateway"}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-700"
        >
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span>{connected ? 'MCP Proxy Live' : 'Reconnecting...'}</span>
        </div>

        {/* Demo Project Pill Badge (from Senior Mockup) */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Demo Project</span>
        </div>

        {/* User Avatar Circle (from Senior Mockup) */}
        <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-[11px] font-bold text-indigo-700">
          JD
        </div>
      </div>
    </header>
  );
};