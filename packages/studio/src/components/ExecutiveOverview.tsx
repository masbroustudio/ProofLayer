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
    <div className="flex-1 flex overflow-hidden bg-slate-50 text-slate-900 font-sans">
      
      {/* 1. Left Sidebar Navigation (Stripe / Apple Developer Light Theme) */}
      <aside className="w-56 lg:w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col justify-between p-4 z-10 shadow-xs">
        <div className="space-y-6">
          
          {/* Sidebar Menu */}
          <nav className="space-y-1">
            <button
              onClick={() => onNavigateTab('overview')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs transition-all cursor-pointer"
            >
              <Home className="w-4 h-4 text-indigo-600" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => onNavigateTab('playground')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all cursor-pointer"
            >
              <Shield className="w-4 h-4 text-slate-500" />
              <span>Policies</span>
            </button>

            <button
              onClick={() => onNavigateTab('console')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all cursor-pointer"
            >
              <Cpu className="w-4 h-4 text-slate-500" />
              <span>Agent Runtime</span>
            </button>

            <button
              onClick={() => onNavigateTab('console')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all cursor-pointer"
            >
              <Network className="w-4 h-4 text-slate-500" />
              <span>Evidence Graph</span>
            </button>

            <button
              onClick={() => onNavigateTab('ledger')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4 text-slate-500" />
              <span>Audit Log</span>
            </button>

            <div className="pt-2">
              <button
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Settings</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Bottom Hackathon Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-1.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-600">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 tracking-tight">Build With AI: Basics</div>
              <div className="text-[10px] text-slate-500 font-mono">AI Engineering Hackathon · 2026</div>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 leading-tight">
            Cryptographic zero-trust verification rail for autonomous agents.
          </div>
        </div>
      </aside>

      {/* 2. Main Central Area (Scrollable Light Canvas) */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-6 space-y-6">
        
        {/* Top Hero Card: AI Agent Payment Flow (4-Step Horizontal Stepper) */}
        <div className="rounded-xl bg-white border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>AI Agent Payment Flow</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Real-time policy enforcement and traceable evidence
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => onNavigateTab('console')}
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg"
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
                  ? 'bg-indigo-50/50 border-indigo-400 ring-2 ring-indigo-500/20 shadow-xs' 
                  : 'bg-slate-50/50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-mono font-bold flex items-center justify-center">
                  1
                </span>
              </div>
              <div className="flex flex-col items-center text-center py-1">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-2.5 shadow-2xs">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">AI Agent</h3>
                <p className="text-xs text-slate-600 leading-snug">
                  Request to process payment for $1,200
                </p>
              </div>
            </div>

            {/* Step 2: Blocked */}
            <div 
              onClick={() => setSelectedStep(2)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                selectedStep === 2 
                  ? 'bg-rose-50/70 border-rose-400 ring-2 ring-rose-500/20 shadow-xs' 
                  : 'bg-rose-50/30 border-rose-200 hover:border-rose-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 text-[11px] font-mono font-bold flex items-center justify-center">
                  2
                </span>
              </div>
              <div className="flex flex-col items-center text-center py-1">
                <div className="w-12 h-12 rounded-xl bg-rose-100/80 border border-rose-300 flex items-center justify-center text-rose-600 mb-2.5 shadow-2xs">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-rose-900 text-sm mb-1">Blocked</h3>
                <p className="text-xs text-rose-700 leading-snug mb-2.5">
                  Missing human approval <br />
                  <span className="text-rose-600 font-medium text-[11px]">(for amounts &gt; $500)</span>
                </p>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  Policy violation
                </span>
              </div>
            </div>

            {/* Step 3: Human Approval */}
            <div 
              onClick={() => setSelectedStep(3)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                selectedStep === 3 
                  ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-500/20 shadow-xs' 
                  : 'bg-blue-50/20 border-blue-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-mono font-bold flex items-center justify-center">
                  3
                </span>
              </div>
              <div className="flex flex-col items-center text-center py-1">
                <div className="w-12 h-12 rounded-xl bg-blue-100/80 border border-blue-300 flex items-center justify-center text-blue-600 mb-2.5 shadow-2xs">
                  <User className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">Human Approval</h3>
                <p className="text-xs text-slate-600 leading-snug mb-2.5">
                  Authorized reviewer approves transaction
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                  Pending → Approved
                </span>
              </div>
            </div>

            {/* Step 4: Payment Executed */}
            <div 
              onClick={() => setSelectedStep(4)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                selectedStep === 4 
                  ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs' 
                  : 'bg-emerald-50/30 border-emerald-200 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-mono font-bold flex items-center justify-center">
                  4
                </span>
              </div>
              <div className="flex flex-col items-center text-center py-1">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 mb-2.5 shadow-2xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-emerald-950 text-sm mb-1">Payment Executed</h3>
                <p className="text-xs text-emerald-800 leading-snug mb-2.5">
                  $1,200 payment processed and verified
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Policy compliant
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Middle Row: Evidence Graph (Left) & Audit Timeline (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card: Evidence Graph */}
          <div className="rounded-xl bg-white border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Network className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">Evidence Graph</h3>
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                See how policies, decisions and events connect
              </p>

              {/* Visual Node Diagram (Light Mode Palette) */}
              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 font-mono text-[11px] space-y-3">
                
                {/* Policy -> Evaluation */}
                <div className="flex items-center gap-2">
                  <div className="px-2.5 py-1.5 rounded-lg bg-white border border-blue-200 text-blue-900 flex items-center gap-2 shadow-2xs">
                    <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-blue-500 font-bold">Policy</div>
                      <div className="font-bold">payment-approval-v1</div>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

                  <div className="px-2.5 py-1.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-900 flex items-center gap-2 shadow-2xs">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-rose-500 font-bold">Evaluation</div>
                      <div className="font-bold text-rose-800">Blocked</div>
                    </div>
                  </div>
                </div>

                {/* Branches */}
                <div className="pl-6 border-l-2 border-slate-200 space-y-2 py-1">
                  
                  <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-md border border-slate-200 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Amount Check</span>
                    </div>
                    <span className="text-emerald-700 font-bold">$1,200 &gt; $500</span>
                  </div>

                  <div className="flex items-center justify-between bg-rose-50 px-2.5 py-1.5 rounded-md border border-rose-200 text-rose-900">
                    <div className="flex items-center gap-1.5 text-rose-800 font-medium">
                      <XCircle className="w-3 h-3 text-rose-600" />
                      <span>Approval Check</span>
                    </div>
                    <span className="text-rose-700 font-bold">Missing</span>
                  </div>

                  <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-md border border-slate-200 text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Tool Call</span>
                    </div>
                    <span>Not Executed</span>
                  </div>
                </div>

                {/* Human Approval -> Payment Tool */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                  <div className="px-2.5 py-1.5 rounded-lg bg-white border border-blue-200 text-blue-900 flex items-center gap-2 shadow-2xs">
                    <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <div>
                      <div className="text-[9px] uppercase text-blue-500 font-bold">Human Approval</div>
                      <div className="font-medium text-slate-700">Approved by: j.doe</div>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-emerald-600 shrink-0" />

                  <div className="px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-2 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-[9px] uppercase text-emerald-600 font-bold">Payment Tool</div>
                      <div className="font-bold text-emerald-800">Executed</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Interactive React Flow</span>
              <button 
                onClick={() => onNavigateTab('console')}
                className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Open Full Interactive DAG</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card: Audit Timeline */}
          <div className="rounded-xl bg-white border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">Audit Timeline</h3>
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Complete record of events and decisions
              </p>

              {/* Vertical Timeline */}
              <div className="space-y-3.5 font-mono text-[11px] relative before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-0.5 before:bg-slate-200">
                
                {/* Event 1 */}
                <div className="flex items-start gap-3 relative">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0 z-10">
                    <Check className="w-3 h-3" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">10:24:15</span>
                    </div>
                    <div className="text-slate-800 font-bold">Policy evaluated</div>
                    <div className="text-[10px] text-slate-500">payment-approval-v1</div>
                  </div>
                </div>

                {/* Event 2 */}
                <div className="flex items-start gap-3 relative">
                  <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center shrink-0 z-10">
                    <XCircle className="w-3 h-3" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">10:24:15</span>
                    </div>
                    <div className="text-rose-900 font-bold">Action blocked</div>
                    <div className="text-[10px] text-rose-600 font-medium">Missing human approval</div>
                  </div>
                </div>

                {/* Event 3 */}
                <div className="flex items-start gap-3 relative">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0 z-10">
                    <User className="w-3 h-3" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">10:27:03</span>
                    </div>
                    <div className="text-slate-800 font-bold">Approval granted</div>
                    <div className="text-[10px] text-slate-500">j.doe (Finance Team)</div>
                  </div>
                </div>

                {/* Event 4 */}
                <div className="flex items-start gap-3 relative">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0 z-10">
                    <Check className="w-3 h-3" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">10:29:42</span>
                    </div>
                    <div className="text-slate-800 font-bold">Policy re-evaluated</div>
                    <div className="text-[10px] text-slate-500">All requirements satisfied</div>
                  </div>
                </div>

                {/* Event 5 */}
                <div className="flex items-start gap-3 relative">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0 z-10">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">10:29:45</span>
                    </div>
                    <div className="text-emerald-950 font-bold">Payment executed</div>
                    <div className="text-[10px] text-emerald-700 font-medium">$1,200 · txn_7f3a2e</div>
                  </div>
                </div>

              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Cryptographic Invariants</span>
              <button 
                onClick={() => onNavigateTab('ledger')}
                className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Audit Ledger</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Card: Recent Policy Events Table */}
        <div className="rounded-xl bg-white border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Recent Policy Events</h3>
            </div>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Latest enforcement activity
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] text-slate-500 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-2 px-3 font-semibold">Time</th>
                  <th className="py-2 px-3 font-semibold">Policy</th>
                  <th className="py-2 px-3 font-semibold">Action</th>
                  <th className="py-2 px-3 font-semibold">Result</th>
                  <th className="py-2 px-3 font-semibold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentItems.length > 0 ? (
                  recentItems.slice(0, 4).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 text-slate-500">{new Date(item.createdAt).toLocaleTimeString()}</td>
                      <td className="py-2.5 px-3 text-slate-900 font-medium">
                        {item.action === 'payment.execute' ? 'High Value Payment Approval' : 'Safety Policy Guard'}
                      </td>
                      <td className="py-2.5 px-3 text-indigo-600 font-semibold">{item.action}</td>
                      <td className="py-2.5 px-3">
                        {item.status === 'executed' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Allowed
                          </span>
                        ) : item.status === 'blocked' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Blocked
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Held
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-600 truncate max-w-[200px]">
                        {item.reason || JSON.stringify(item.payload)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <>
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 text-slate-500">10:29:45</td>
                      <td className="py-2.5 px-3 text-slate-900 font-medium">High Value Payment Approval</td>
                      <td className="py-2.5 px-3 text-indigo-600 font-semibold">payment.execute</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Allowed
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700">$1,200 · txn_7f3a2e</td>
                    </tr>
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 text-slate-500">10:24:15</td>
                      <td className="py-2.5 px-3 text-slate-900 font-medium">High Value Payment Approval</td>
                      <td className="py-2.5 px-3 text-indigo-600 font-semibold">payment.execute</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Blocked
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-rose-600 font-medium">Missing approval</td>
                    </tr>
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 text-slate-500">09:12:37</td>
                      <td className="py-2.5 px-3 text-slate-900 font-medium">File Access Policy</td>
                      <td className="py-2.5 px-3 text-indigo-600 font-semibold">file.read</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Allowed
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-500">/reports/q3.pdf</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* 3. Right Sidebar: Policy Editor & Policy Overview (Clean Light Theme with Dark Syntax Editor) */}
      <aside className="w-72 lg:w-80 shrink-0 bg-white border-l border-slate-200 p-4 lg:p-5 space-y-6 overflow-y-auto shadow-xs">
        
        {/* Policy Editor Card */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Policy Editor</h3>
            </div>
            <button
              onClick={() => onNavigateTab('playground')}
              className="px-2.5 py-1 text-xs font-semibold rounded-md border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              Edit Policy
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-bold text-slate-900">High Value Payment Approval</h4>
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              Any payment exceeding $500 requires authorized human approval before execution.
            </p>
          </div>

          {/* High-Contrast Dark Syntax Box (Stripe/Apple docs style for clear readability) */}
          <div className="bg-slate-900 rounded-lg p-3.5 border border-slate-800 font-mono text-[11px] leading-relaxed overflow-x-auto text-slate-200 shadow-inner">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] text-slate-400">
              <span>compiled_ast.json</span>
              <span className="text-cyan-400 font-semibold">&lt;0.05ms deterministic</span>
            </div>
            <pre className="text-cyan-300/95 whitespace-pre">
              {samplePolicyJson}
            </pre>
          </div>
        </div>

        {/* Policy Overview Timeline */}
        <div className="pt-4 border-t border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Policy Overview</h3>
            </div>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Complete record of events and decisions
          </p>

          <div className="space-y-3 font-mono text-[10px] relative before:absolute before:top-2 before:bottom-2 before:left-[9px] before:w-0.5 before:bg-slate-200">
            
            <div className="flex items-start gap-2.5 relative">
              <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-300 text-slate-600 flex items-center justify-center shrink-0 z-10">
                <ChevronRight className="w-3 h-3" />
              </div>
              <div>
                <span className="text-slate-400">10:24:15</span>
                <div className="text-slate-800 font-bold">High Value Payment</div>
                <div className="text-slate-500">payment-approval-v1</div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 relative">
              <div className="w-5 h-5 rounded-full bg-rose-100 border border-rose-300 text-rose-700 flex items-center justify-center shrink-0 z-10">
                <FileText className="w-3 h-3" />
              </div>
              <div>
                <span className="text-slate-400">10:24:15</span>
                <div className="text-rose-900 font-bold">Action blocked</div>
                <div className="text-rose-600">Missing human approval</div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 relative">
              <div className="w-5 h-5 rounded-full bg-blue-100 border border-blue-300 text-blue-700 flex items-center justify-center shrink-0 z-10">
                <User className="w-3 h-3" />
              </div>
              <div>
                <span className="text-slate-400">10:27:03</span>
                <div className="text-slate-800 font-bold">Approval granted</div>
                <div className="text-slate-500">j.doe (Finance Team)</div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 relative">
              <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center shrink-0 z-10">
                <Check className="w-3 h-3" />
              </div>
              <div>
                <span className="text-slate-400">10:29:42</span>
                <div className="text-slate-800 font-bold">Policy re-evaluated</div>
                <div className="text-slate-500">All requirements satisfied</div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 relative">
              <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center shrink-0 z-10">
                <CheckCircle2 className="w-3 h-3" />
              </div>
              <div>
                <span className="text-slate-400">10:29:45</span>
                <div className="text-emerald-950 font-bold">Payment executed</div>
                <div className="text-emerald-700 font-medium">$1,200 · txn_7f3a2e</div>
              </div>
            </div>

          </div>
        </div>

      </aside>

    </div>
  );
};
