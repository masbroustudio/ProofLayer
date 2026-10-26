import React, { useState } from 'react';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  FileText, 
  User, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowRight, 
  Code2, 
  Network, 
  FileCheck2, 
  Settings, 
  Check, 
  ChevronRight,
  Home,
  Compass,
  Cpu
} from 'lucide-react';
import type { StudioTab } from './TopBar.js';
import type { InterceptedItem } from './LiveConsole.js';

interface ExecutiveOverviewProps {
  onNavigateTab: (tab: StudioTab) => void;
  recentItems?: InterceptedItem[];
}

export const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({ 
  onNavigateTab,
  recentItems = [] 
}) => {
  const [selectedStep, setSelectedStep] = useState<number>(2); // Default to Step 2: Blocked

  // Sample policy AST matching senior mockup
  const samplePolicyJson = `{
  "id": "payment-approval-v1",
  "action": "payment.execute",
  "conditions": {
    "amount_gt": 500,
    "currency": "USD"
  },
  "requirements": {
    "authorized_human_approval",
    "approval_matches_transaction"
  },
  "on_missing_evidence": "deny"
}`;

  return (
    <div className="flex-1 flex overflow-hidden bg-[#090e1c] text-slate-100 font-sans">
      
      {/* 1. Left Sidebar Navigation (Matching Senior's Mockup) */}
      <aside className="w-56 lg:w-64 shrink-0 bg-[#0c1322] border-r border-slate-800/80 flex flex-col justify-between p-4 z-10">
        <div className="space-y-6">
          
          {/* Sidebar Menu */}
          <nav className="space-y-1">
            <button
              onClick={() => onNavigateTab('overview')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold bg-blue-600 text-white shadow-md shadow-blue-900/30 transition-all cursor-pointer"
            >
              <Home className="w-4 h-4 text-white" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => onNavigateTab('playground')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all cursor-pointer"
            >
              <Shield className="w-4 h-4 text-slate-400" />
              <span>Policies</span>
            </button>

            <button
              onClick={() => onNavigateTab('console')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all cursor-pointer"
            >
              <Cpu className="w-4 h-4 text-slate-400" />
              <span>Agent Runtime</span>
            </button>

            <button
              onClick={() => onNavigateTab('console')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all cursor-pointer"
            >
              <Network className="w-4 h-4 text-slate-400" />
              <span>Evidence Graph</span>
            </button>

            <button
              onClick={() => onNavigateTab('ledger')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4 text-slate-400" />
              <span>Audit Log</span>
            </button>

            <div className="pt-2">
              <button
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 transition-all cursor-pointer"
              >
                <Settings className="w-4 h-4 text-slate-500" />
                <span>Settings</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Bottom Hackathon Card */}
        <div className="p-3.5 rounded-xl bg-[#11192e] border border-slate-800/80 shadow-md">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-1.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-tight">Build With AI: Basics</div>
              <div className="text-[10px] text-slate-400 font-mono">AI Engineering Hackathon · 2026</div>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 leading-tight">
            Cryptographic zero-trust verification rail for autonomous agents.
          </div>
        </div>
      </aside>

      {/* 2. Main Central Area (Scrollable) */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-6 space-y-6">
        
        {/* Top Hero Card: AI Agent Payment Flow (4-Step Horizontal Stepper) */}
        <div className="rounded-xl bg-[#0f172a]/90 border border-slate-800/90 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>AI Agent Payment Flow</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Real-time policy enforcement and traceable evidence
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => onNavigateTab('console')}
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-800/60 px-3 py-1.5 rounded-lg"
              >
                <span>Live Adversarial Sandbox</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* The 4 Stepper Cards Connected Horizontally */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 lg:gap-4 relative">
            
            {/* Step 1: AI Agent */}
            <div 
              onClick={() => setSelectedStep(1)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                selectedStep === 1 
                  ? 'bg-slate-800/80 border-blue-500/70 shadow-lg shadow-blue-950/30 ring-1 ring-blue-500/50' 
                  : 'bg-[#141e33]/70 border-slate-800 hover:border-slate-700 hover:bg-[#18233c]'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 text-[11px] font-mono font-bold flex items-center justify-center">
                  1
                </span>
              </div>
              <div className="flex flex-col items-center text-center py-1">
                <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-2.5">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-sm mb-1">AI Agent</h3>
                <p className="text-xs text-slate-300 leading-snug">
                  Request to process payment for $1,200
                </p>
              </div>
            </div>

            {/* Step 2: Blocked */}
            <div 
              onClick={() => setSelectedStep(2)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                selectedStep === 2 
                  ? 'bg-rose-950/30 border-rose-500/80 shadow-lg shadow-rose-950/40 ring-1 ring-rose-500/50' 
                  : 'bg-[#141e33]/70 border-rose-900/40 hover:border-rose-700/60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="w-5 h-5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[11px] font-mono font-bold flex items-center justify-center">
                  2
                </span>
              </div>
              <div className="flex flex-col items-center text-center py-1">
                <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-2.5">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-rose-200 text-sm mb-1">Blocked</h3>
                <p className="text-xs text-rose-200/90 leading-snug mb-2.5">
                  Missing human approval <br />
                  <span className="text-rose-400 text-[11px]">(for amounts &gt; $500)</span>
                </p>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                  Policy violation
                </span>
              </div>
            </div>

            {/* Step 3: Human Approval */}
            <div 
              onClick={() => setSelectedStep(3)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                selectedStep === 3 
                  ? 'bg-blue-950/30 border-blue-500/80 shadow-lg shadow-blue-950/40 ring-1 ring-blue-500/50' 
                  : 'bg-[#141e33]/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 text-[11px] font-mono font-bold flex items-center justify-center">
                  3
                </span>
              </div>
              <div className="flex flex-col items-center text-center py-1">
                <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-2.5">
                  <User className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-sm mb-1">Human Approval</h3>
                <p className="text-xs text-slate-300 leading-snug mb-2.5">
                  Authorized reviewer approves transaction
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Pending → Approved
                </span>
              </div>
            </div>

            {/* Step 4: Payment Executed */}
            <div 
              onClick={() => setSelectedStep(4)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                selectedStep === 4 
                  ? 'bg-emerald-950/30 border-emerald-500/80 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/50' 
                  : 'bg-[#141e33]/70 border-emerald-900/30 hover:border-emerald-700/60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[11px] font-mono font-bold flex items-center justify-center">
                  4
                </span>
              </div>
              <div className="flex flex-col items-center text-center py-1">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-2.5">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-emerald-200 text-sm mb-1">Payment Executed</h3>
                <p className="text-xs text-emerald-200/90 leading-snug mb-2.5">
                  $1,200 payment processed and verified
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Policy compliant
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Middle Row: Evidence Graph (Left) & Audit Timeline (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card: Evidence Graph */}
          <div className="rounded-xl bg-[#0f172a]/90 border border-slate-800/90 p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Network className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white tracking-tight">Evidence Graph</h3>
                </div>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                See how policies, decisions and events connect
              </p>

              {/* Visual Node Diagram (SVG & Styled Flow) */}
              <div className="bg-[#090e1c] p-4 rounded-xl border border-slate-800 font-mono text-[11px] space-y-3">
                
                {/* Policy -> Evaluation */}
                <div className="flex items-center gap-2">
                  <div className="px-2.5 py-1.5 rounded-lg bg-blue-950/80 border border-blue-500/50 text-blue-300 flex items-center gap-2 shadow-xs">
                    <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-blue-400/80">Policy</div>
                      <div className="font-bold">payment-approval-v1</div>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />

                  <div className="px-2.5 py-1.5 rounded-lg bg-rose-950/80 border border-rose-500/60 text-rose-200 flex items-center gap-2 shadow-xs">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-rose-400/80">Evaluation</div>
                      <div className="font-bold text-rose-300">Blocked</div>
                    </div>
                  </div>
                </div>

                {/* Branches */}
                <div className="pl-6 border-l-2 border-slate-800 space-y-2 py-1">
                  
                  <div className="flex items-center justify-between bg-slate-900/90 px-2.5 py-1.5 rounded-md border border-slate-800">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Amount Check</span>
                    </div>
                    <span className="text-emerald-400 font-bold">$1,200 &gt; $500</span>
                  </div>

                  <div className="flex items-center justify-between bg-rose-950/40 px-2.5 py-1.5 rounded-md border border-rose-900/50">
                    <div className="flex items-center gap-1.5 text-rose-300">
                      <XCircle className="w-3 h-3 text-rose-400" />
                      <span>Approval Check</span>
                    </div>
                    <span className="text-rose-400 font-bold">Missing</span>
                  </div>

                  <div className="flex items-center justify-between bg-slate-900/50 px-2.5 py-1.5 rounded-md border border-slate-800 text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>Tool Call</span>
                    </div>
                    <span>Not Executed</span>
                  </div>
                </div>

                {/* Human Approval -> Payment Tool */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                  <div className="px-2.5 py-1.5 rounded-lg bg-blue-950/60 border border-blue-500/40 text-blue-300 flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <div>
                      <div className="text-[9px] uppercase text-blue-400/80">Human Approval</div>
                      <div className="font-medium text-slate-300">Approved by: j.doe</div>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-emerald-500 shrink-0" />

                  <div className="px-2.5 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-[9px] uppercase text-emerald-400/80">Payment Tool</div>
                      <div className="font-bold text-emerald-300">Executed</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Interactive React Flow</span>
              <button 
                onClick={() => onNavigateTab('console')}
                className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Open Full Interactive DAG</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card: Audit Timeline */}
          <div className="rounded-xl bg-[#0f172a]/90 border border-slate-800/90 p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white tracking-tight">Audit Timeline</h3>
                </div>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Complete record of events and decisions
              </p>

              {/* Vertical Timeline */}
              <div className="space-y-3.5 font-mono text-[11px] relative before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-0.5 before:bg-slate-800">
                
                {/* Event 1 */}
                <div className="flex items-start gap-3 relative">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 flex items-center justify-center shrink-0 z-10">
                    <Check className="w-3 h-3" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">10:24:15</span>
                    </div>
                    <div className="text-slate-200 font-bold">Policy evaluated</div>
                    <div className="text-[10px] text-slate-400">payment-approval-v1</div>
                  </div>
                </div>

                {/* Event 2 */}
                <div className="flex items-start gap-3 relative">
                  <div className="w-6 h-6 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-400 flex items-center justify-center shrink-0 z-10">
                    <XCircle className="w-3 h-3" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">10:24:15</span>
                    </div>
                    <div className="text-rose-200 font-bold">Action blocked</div>
                    <div className="text-[10px] text-slate-400">Missing human approval</div>
                  </div>
                </div>

                {/* Event 3 */}
                <div className="flex items-start gap-3 relative">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/50 text-blue-400 flex items-center justify-center shrink-0 z-10">
                    <User className="w-3 h-3" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">10:27:03</span>
                    </div>
                    <div className="text-blue-200 font-bold">Approval granted</div>
                    <div className="text-[10px] text-slate-400">j.doe (Finance Team)</div>
                  </div>
                </div>

                {/* Event 4 */}
                <div className="flex items-start gap-3 relative">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 flex items-center justify-center shrink-0 z-10">
                    <Check className="w-3 h-3" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">10:29:42</span>
                    </div>
                    <div className="text-slate-200 font-bold">Policy re-evaluated</div>
                    <div className="text-[10px] text-slate-400">All requirements satisfied</div>
                  </div>
                </div>

                {/* Event 5 */}
                <div className="flex items-start gap-3 relative">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 flex items-center justify-center shrink-0 z-10">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">10:29:45</span>
                    </div>
                    <div className="text-emerald-200 font-bold">Payment executed</div>
                    <div className="text-[10px] text-slate-400">$1,200 · txn_7f3a2e</div>
                  </div>
                </div>

              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Cryptographic Invariants</span>
              <button 
                onClick={() => onNavigateTab('ledger')}
                className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Audit Ledger</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Card: Recent Policy Events Table */}
        <div className="rounded-xl bg-[#0f172a]/90 border border-slate-800/90 p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">Recent Policy Events</h3>
            </div>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Latest enforcement activity
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
                  <th className="pb-2.5 font-semibold">Time</th>
                  <th className="pb-2.5 font-semibold">Policy</th>
                  <th className="pb-2.5 font-semibold">Action</th>
                  <th className="pb-2.5 font-semibold">Result</th>
                  <th className="pb-2.5 font-semibold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {recentItems.length > 0 ? (
                  recentItems.slice(0, 4).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 text-slate-400">{new Date(item.createdAt).toLocaleTimeString()}</td>
                      <td className="py-2.5 text-white font-medium">
                        {item.action === 'payment.execute' ? 'High Value Payment Approval' : 'Safety Policy Guard'}
                      </td>
                      <td className="py-2.5 text-cyan-400">{item.action}</td>
                      <td className="py-2.5">
                        {item.status === 'executed' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Allowed
                          </span>
                        ) : item.status === 'blocked' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Blocked
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Held
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-right text-slate-400 truncate max-w-[200px]">
                        {item.reason || JSON.stringify(item.payload)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <>
                    <tr className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 text-slate-400">10:29:45</td>
                      <td className="py-2.5 text-white font-medium">High Value Payment Approval</td>
                      <td className="py-2.5 text-cyan-400">payment.execute</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Allowed
                        </span>
                      </td>
                      <td className="py-2.5 text-right text-slate-300">$1,200 · txn_7f3a2e</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 text-slate-400">10:24:15</td>
                      <td className="py-2.5 text-white font-medium">High Value Payment Approval</td>
                      <td className="py-2.5 text-cyan-400">payment.execute</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          Blocked
                        </span>
                      </td>
                      <td className="py-2.5 text-right text-rose-300/80">Missing approval</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 text-slate-400">09:12:37</td>
                      <td className="py-2.5 text-white font-medium">File Access Policy</td>
                      <td className="py-2.5 text-cyan-400">file.read</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Allowed
                        </span>
                      </td>
                      <td className="py-2.5 text-right text-slate-400">/reports/q3.pdf</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* 3. Right Sidebar: Policy Editor & Policy Overview (Matching Senior's Mockup) */}
      <aside className="w-72 lg:w-80 shrink-0 bg-[#0c1322] border-l border-slate-800/80 p-4 lg:p-5 space-y-6 overflow-y-auto">
        
        {/* Policy Editor Card */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">Policy Editor</h3>
            </div>
            <button
              onClick={() => onNavigateTab('playground')}
              className="px-2.5 py-1 text-xs font-semibold rounded-md border border-blue-500/60 text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer"
            >
              Edit Policy
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-bold text-white">High Value Payment Approval</h4>
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Active
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Any payment exceeding $500 requires authorized human approval before execution.
            </p>
          </div>

          {/* JSON Code View */}
          <div className="bg-[#080d1a] rounded-lg p-3.5 border border-slate-800/90 font-mono text-[11px] leading-relaxed overflow-x-auto text-slate-300">
            <pre className="text-cyan-300/90 whitespace-pre">
              {samplePolicyJson}
            </pre>
          </div>
        </div>

        {/* Policy Overview Timeline */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">Policy Overview</h3>
            </div>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Complete record of events and decisions
          </p>

          <div className="space-y-3 font-mono text-[10px] relative before:absolute before:top-2 before:bottom-2 before:left-[9px] before:w-0.5 before:bg-slate-800">
            
            <div className="flex items-start gap-2.5 relative">
              <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center shrink-0 z-10">
                <ChevronRight className="w-3 h-3" />
              </div>
              <div>
                <span className="text-slate-400">10:24:15</span>
                <div className="text-slate-200 font-bold">High Value Payment</div>
                <div className="text-slate-500">payment-approval-v1</div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 relative">
              <div className="w-5 h-5 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-400 flex items-center justify-center shrink-0 z-10">
                <FileText className="w-3 h-3" />
              </div>
              <div>
                <span className="text-slate-400">10:24:15</span>
                <div className="text-rose-200 font-bold">Action blocked</div>
                <div className="text-slate-500">Missing human approval</div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 relative">
              <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/50 text-blue-400 flex items-center justify-center shrink-0 z-10">
                <User className="w-3 h-3" />
              </div>
              <div>
                <span className="text-slate-400">10:27:03</span>
                <div className="text-blue-200 font-bold">Approval granted</div>
                <div className="text-slate-500">j.doe (Finance Team)</div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 relative">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 flex items-center justify-center shrink-0 z-10">
                <Check className="w-3 h-3" />
              </div>
              <div>
                <span className="text-slate-400">10:29:42</span>
                <div className="text-slate-200 font-bold">Policy re-evaluated</div>
                <div className="text-slate-500">All requirements satisfied</div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 relative">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 flex items-center justify-center shrink-0 z-10">
                <CheckCircle2 className="w-3 h-3" />
              </div>
              <div>
                <span className="text-slate-400">10:29:45</span>
                <div className="text-emerald-200 font-bold">Payment executed</div>
                <div className="text-slate-500">$1,200 · txn_7f3a2e</div>
              </div>
            </div>

          </div>
        </div>

      </aside>

    </div>
  );
};
