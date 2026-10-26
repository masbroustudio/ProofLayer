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
    <header className="h-14 border-b border-slate-800 bg-[#0c1322] px-4 sm:px-6 flex items-center justify-between z-20 shrink-0 shadow-xs text-white">
      {/* Brand & Tagline matching Senior Mockup */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 flex items-center justify-center shadow-sm">
          <div className="w-full h-full bg-[#0c1322] rounded-[6px] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-white text-base">ProofLayer</span>
            <span className="text-[11px] text-slate-400 font-medium hidden md:inline border-l border-slate-700 pl-2">
              The Trust Compiler for AI Agents
            </span>
          </div>
        </div>
      </div>

      {/* Center Tagline with Cyan Emphasis */}
      <div className="hidden xl:block text-xs font-medium text-slate-300">
        Don't trust what AI claims. <span className="text-cyan-400 font-semibold">Verify what AI does.</span>
      </div>

      {/* Navigation Tabs (Centered / High Visibility) */}
      <nav className="flex items-center bg-[#11192e] p-1 rounded-lg border border-slate-800">
        <button
          onClick={() => onTabChange('overview')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => onTabChange('console')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'console'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Threat Console</span>
        </button>

        <button
          onClick={() => onTabChange('playground')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'playground'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Policy Playground</span>
        </button>

        <button
          onClick={() => onTabChange('ledger')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'ledger'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-white'
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
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-500/30 text-[11px] font-mono text-emerald-300 font-semibold"
        >
          <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
          <span>&lt;0.05ms</span>
          <span className="text-emerald-400/80 font-sans">($0 token cost)</span>
        </div>

        {/* Policies Active */}
        <div 
          title="Active Policy AST Rules in Gateway"
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#141e33] border border-slate-700 text-[11px] font-medium text-slate-300"
        >
          <Lock className="w-3.5 h-3.5 text-indigo-400" />
          <span>{policyCount} Policies</span>
        </div>

        {/* Connection Status */}
        <div 
          title={connected ? "Connected to Real-Time SSE Gateway" : "Reconnecting to Gateway"}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#141e33] border border-slate-700 text-[11px] font-medium text-slate-300"
        >
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
          <span>{connected ? 'MCP Proxy Live' : 'Reconnecting...'}</span>
        </div>

        {/* Demo Project Pill Badge (from Senior Mockup) */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#141e33] border border-slate-700 text-[11px] font-medium text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Demo Project</span>
        </div>

        {/* User Avatar Circle (from Senior Mockup) */}
        <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[11px] font-bold text-slate-200">
          JD
        </div>
      </div>
    </header>
  );
};