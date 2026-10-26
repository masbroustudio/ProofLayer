import React from 'react';
import { ShieldCheck, Zap, Lock } from 'lucide-react';

interface TopBarProps {
  connected: boolean;
  policyCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({ connected, policyCount }) => {
  return (
    <header className="h-14 border-b border-slate-800/80 bg-[#0E1420]/90 backdrop-blur px-5 flex items-center justify-between z-20">
      {/* Brand & Tagline */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-emerald-400 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <div className="w-full h-full bg-[#0E1420] rounded-[7px] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-white text-base">ProofLayer</span>
            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
              Trust Compiler 2026
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            Don't trust what AI claims. Cryptographically verify what AI does.
          </p>
        </div>
      </div>

      {/* Telemetry Chips */}
      <div className="flex items-center gap-3">
        {/* Latency benchmark */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-400">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span>&lt;0.05ms</span>
          <span className="text-slate-500">($0 token cost)</span>
        </div>

        {/* Policies Enforced */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-medium text-slate-300">
          <Lock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{policyCount} Policies Enforced</span>
        </div>

        {/* SSE Connection Status */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
          <span className="text-slate-300 font-medium text-[11px]">
            {connected ? 'MCP Proxy Live' : 'Reconnecting...'}
          </span>
        </div>
      </div>
    </header>
  );
};
