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
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Console Header */}
      <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-600" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Interceptor Live Stream
          </h2>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700 font-medium">
          {items.length} events
        </span>
      </div>

      {/* Stream Items List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-xs text-center p-4">
            <Clock className="w-6 h-6 mb-2 opacity-50 animate-spin text-indigo-500" />
            <p className="font-medium text-slate-600">Listening for agent tool calls...</p>
            <p className="text-[11px] text-slate-400 mt-1">Trigger a simulation above to test interception.</p>
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
                className={`p-3.5 cursor-pointer transition-all hover:bg-slate-50 ${
                  isSelected 
                    ? 'bg-indigo-50/70 border-l-3 border-indigo-600 shadow-2xs' 
                    : 'border-l-3 border-transparent'
                }`}
              >
                {/* Header row: Status badge + Timestamp */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {isExecuted && (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Executed
                      </span>
                    )}
                    {isPending && (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
                        <AlertTriangle className="w-3 h-3" />
                        Held for Review
                      </span>
                    )}
                    {isBlocked && (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="w-3 h-3" />
                        Blocked
                      </span>
                    )}
                    <span className="text-[11px] font-mono text-slate-900 font-bold">
                      {item.action}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(item.createdAt).toLocaleTimeString()}
                  </span>
                </div>

                {/* Subagent & Provenance origin */}
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mb-1">
                  <span className="font-mono text-slate-700 font-medium truncate max-w-[170px]">
                    {item.agentId}
                  </span>
                  {item.provenanceChain && item.provenanceChain.length > 1 && (
                    <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200 font-mono">
                      <Layers className="w-2.5 h-2.5" />
                      +{item.provenanceChain.length - 1} hops
                    </span>
                  )}
                </div>

                {/* Payload snippet preview */}
                <div className="text-[10px] font-mono bg-slate-50 px-2 py-1 rounded border border-slate-200/80 text-slate-700 truncate mb-1">
                  {JSON.stringify(item.payload)}
                </div>

                {/* Footer: SHA-256 Digest & Reason */}
                {item.reason ? (
                  <div className="text-[10px] text-rose-600 font-medium truncate mt-1">
                    ⚠ {item.reason}
                  </div>
                ) : (
                  <div className="text-[10px] font-mono text-slate-400 truncate">
                    sha256: {item.payloadHash ? item.payloadHash.slice(0, 14) : 'calculating...'}...
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};