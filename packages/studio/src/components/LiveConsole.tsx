import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Terminal,
  Layers 
} from 'lucide-react';

export interface InterceptedItem {
  id: string;
  agentId: string;
  action: string;
  payload: Record<string, any>;
  payloadHash: string;
  provenanceChain?: Array<{ agentId: string; tier: string; delegatedBy?: string }>;
  status: 'executed' | 'pending_approval' | 'blocked';
  error?: string;
  reason?: string;
  createdAt: number;
}

interface LiveConsoleProps {
  items: InterceptedItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const LiveConsole: React.FC<LiveConsoleProps> = ({ items, selectedId, onSelect }) => {
  return (
    <div className="flex flex-col h-full bg-[#0E1420] border-r border-slate-800/80">
      {/* Console Header */}
      <div className="p-3 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/40">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Interceptor Live Stream
          </h2>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
          {items.length} events
        </span>
      </div>

      {/* Stream Items List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-xs text-center p-4">
            <Clock className="w-6 h-6 mb-2 opacity-40 animate-spin" />
            <p>Listening for agent tool calls...</p>
            <p className="text-[11px] text-slate-600 mt-1">Trigger a simulation above to test interception.</p>
          </div>
        ) : (
          items.map((item) => {
            const isSelected = item.id === selectedId;
            const isExecuted = item.status === 'executed';
            const isPending = item.status === 'pending_approval';
            const isBlocked = item.status === 'blocked';

            return (
              <div
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`p-3 cursor-pointer transition-all hover:bg-slate-800/40 ${
                  isSelected 
                    ? 'bg-slate-800/70 border-l-2 border-cyan-400' 
                    : 'border-l-2 border-transparent'
                }`}
              >
                {/* Header row: Status badge + Timestamp */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {isExecuted && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                        <CheckCircle2 className="w-3 h-3" />
                        Executed
                      </span>
                    )}
                    {isPending && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-400 border border-amber-800/60 animate-pulse">
                        <AlertTriangle className="w-3 h-3" />
                        Held for Review
                      </span>
                    )}
                    {isBlocked && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-400 border border-rose-800/60">
                        <XCircle className="w-3 h-3" />
                        Blocked
                      </span>
                    )}
                    <span className="text-[11px] font-mono text-cyan-300 font-medium">
                      {item.action}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(item.createdAt).toLocaleTimeString()}
                  </span>
                </div>

                {/* Agent & Parameter Details */}
                <div className="text-xs text-slate-300 font-mono flex items-center justify-between">
                  <div className="truncate max-w-[200px]">
                    <span className="text-slate-500">agent:</span> {item.agentId}
                  </div>
                  {item.payload.amount !== undefined && (
                    <span className="text-slate-200 font-semibold">
                      ${item.payload.amount.toLocaleString()} {item.payload.currency || 'USD'}
                    </span>
                  )}
                </div>

                {/* Subagent Provenance preview if multi-agent */}
                {item.provenanceChain && item.provenanceChain.length > 1 && (
                  <div className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-400 font-mono bg-slate-950/60 p-1 rounded border border-slate-800/40">
                    <Layers className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span className="truncate">
                      {item.provenanceChain.map((p) => p.agentId).join(' → ')}
                    </span>
                  </div>
                )}

                {/* Rejection / Block Reason Callout */}
                {item.reason && (
                  <p className="mt-1.5 text-[11px] text-rose-300/90 leading-tight bg-rose-950/30 p-1 rounded border border-rose-900/40">
                    {item.reason}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
