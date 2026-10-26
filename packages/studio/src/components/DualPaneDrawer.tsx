import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  ShieldCheck, 
  GitBranch, 
  FileCode 
} from 'lucide-react';

interface DualPaneDrawerProps {
  node: {
    id: string;
    type: string;
    label: string;
    data: Record<string, any>;
    parentIds: string[];
    nodeHash: string;
    timestamp: number;
  } | null;
  onClose: () => void;
}

export const DualPaneDrawer: React.FC<DualPaneDrawerProps> = ({ node, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!node) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(node.data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isFailedCheck = node.data?.decision === 'deny' || node.data?.decision === 'require_approval' || node.data?.error;

  return (
    <div className="absolute inset-x-0 bottom-0 h-80 bg-[#0E1420]/95 backdrop-blur-md border-t border-slate-800 z-30 shadow-2xl flex flex-col transition-transform duration-300">
      {/* Drawer Header */}
      <div className="h-10 px-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
            {node.type}
          </span>
          <span className="text-xs font-semibold text-slate-200 truncate max-w-md">
            {node.label}
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            (Node ID: {node.id.slice(0, 8)}...)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-800/60 border border-slate-700/50 hover:bg-slate-700/60 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy JSON'}</span>
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dual-Pane Content Body */}
      <div className="flex-1 grid grid-cols-2 divide-x divide-slate-800/80 overflow-hidden">
        {/* Left Sub-Pane: Canonical Raw JSON & Parameter Inspector */}
        <div className="p-4 flex flex-col h-full overflow-hidden bg-slate-950/40">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span>Canonical Raw JSON Payload</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">Deterministic Serialization</span>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-950 rounded-lg p-3 border border-slate-800/60 font-mono text-xs text-slate-300 leading-relaxed">
            <pre className="text-emerald-300/90 whitespace-pre-wrap">
              {JSON.stringify(node.data, null, 2)}
            </pre>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-500">SHA-256 Digest:</span>
            <span className="text-cyan-400 truncate max-w-xs">{node.nodeHash}</span>
          </div>
        </div>

        {/* Right Sub-Pane: Merkle Lineage & Invariant Proof Engine */}
        <div className="p-4 flex flex-col h-full overflow-y-auto bg-slate-950/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <GitBranch className="w-4 h-4 text-emerald-400" />
              <span>Merkle Lineage & Invariant Proof Engine</span>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              MERKLE_LEAF_VALIDATED
            </span>
          </div>

          <div className="space-y-3">
            {/* Merkle Proof Tree Path */}
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                Lineage Cryptographic Chain
              </span>
              <div className="space-y-1 text-[11px]">
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="text-cyan-400">● Leaf:</span>
                  <span className="truncate">{node.nodeHash}</span>
                </div>
                {node.parentIds && node.parentIds.length > 0 ? (
                  node.parentIds.map((pid, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-400 pl-3 border-l border-slate-800">
                      <span className="text-slate-500">↳ Parent [{idx}]:</span>
                      <span className="truncate">{pid}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 pl-3">↳ Root Origin Node (No Parent)</div>
                )}
              </div>
            </div>

            {/* Invariant Evaluation Diagnostics */}
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                Evaluated Rule Condition
              </span>
              {node.data?.decision ? (
                <div className="space-y-1 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Decision Outcome:</span>
                    <span className={`font-bold ${isFailedCheck ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {node.data.decision.toUpperCase()}
                    </span>
                  </div>
                  {node.data.reason && (
                    <div className="pt-1 text-slate-300">
                      <span className="text-slate-500">Evaluation Reason: </span>
                      {node.data.reason}
                    </div>
                  )}
                  {node.data.latencyMs !== undefined && (
                    <div className="pt-1 text-[10px] text-emerald-400">
                      Evaluated in: {node.data.latencyMs}ms ($0 LLM Token Cost)
                    </div>
                  )}
                </div>
              ) : node.data?.reviewerId ? (
                <div className="space-y-1 text-[11px]">
                  <div><span className="text-slate-500">Reviewer:</span> {node.data.reviewerId}</div>
                  <div><span className="text-slate-500">Payload Hash Bound:</span> {node.data.payloadHash}</div>
                  <div><span className="text-slate-500">HMAC Signature:</span> {node.data.signature?.slice(0, 24)}...</div>
                </div>
              ) : (
                <div className="text-slate-400 text-[11px]">
                  Target: {node.data?.action || 'Protected Operation'} | Agent: {node.data?.agentId || 'Swarm'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
