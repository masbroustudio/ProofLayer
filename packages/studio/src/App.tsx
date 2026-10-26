import React, { useState, useEffect } from 'react';
import { TopBar } from './components/TopBar.js';
import { LiveConsole, type InterceptedItem } from './components/LiveConsole.js';
import { Network, Terminal } from 'lucide-react';

export const App: React.FC = () => {
  const [connected, setConnected] = useState<boolean>(false);
  const [policyCount, setPolicyCount] = useState<number>(2);
  const [items, setItems] = useState<InterceptedItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 1. Initial Load: Policies & Recent Requests
  useEffect(() => {
    fetch('/api/policies')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPolicyCount(data.length);
      })
      .catch(() => {});

    fetch('/api/requests')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setItems(data);
          setSelectedId(data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  // 2. Connect to Server-Sent Events (SSE) Stream
  useEffect(() => {
    const eventSource = new EventSource('/api/events');

    eventSource.onopen = () => {
      setConnected(true);
    };

    eventSource.onerror = () => {
      setConnected(false);
    };

    const handleTelemetryEvent = (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        const newItem: InterceptedItem = {
          id: payload.data.requestId || payload.id,
          agentId: payload.data.agentId || 'agent-unknown',
          action: payload.data.action || 'tool.call',
          payload: payload.data.payload || {},
          payloadHash: payload.data.payloadHash || '',
          provenanceChain: payload.data.provenanceChain,
          status: payload.data.status || (payload.type === 'EXECUTED' ? 'executed' : payload.type === 'BLOCKED' ? 'blocked' : 'pending_approval'),
          error: payload.data.error,
          reason: payload.data.reason,
          createdAt: payload.timestamp || Date.now(),
        };

        setItems((prev) => [newItem, ...prev.filter((i) => i.id !== newItem.id)]);
        setSelectedId((prev) => prev || newItem.id);
      } catch (err) {
        console.error('Failed to parse SSE telemetry event:', err);
      }
    };

    eventSource.addEventListener('INTERCEPT', handleTelemetryEvent);
    eventSource.addEventListener('APPROVAL_REQUIRED', handleTelemetryEvent);
    eventSource.addEventListener('EXECUTED', handleTelemetryEvent);
    eventSource.addEventListener('BLOCKED', handleTelemetryEvent);

    return () => {
      eventSource.close();
    };
  }, []);

  const selectedItem = items.find((i) => i.id === selectedId);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0B0F17] text-slate-100 overflow-hidden">
      {/* Top Bar */}
      <TopBar connected={connected} policyCount={policyCount} />

      {/* Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Column: Live Interceptor Stream (360px) */}
        <aside className="w-96 flex-shrink-0 h-full">
          <LiveConsole items={items} selectedId={selectedId} onSelect={setSelectedId} />
        </aside>

        {/* Center / Right Panel: Studio Working Canvas */}
        <main className="flex-1 flex flex-col h-full bg-[#0B0F17] relative">
          {selectedItem ? (
            <div className="flex-1 flex flex-col p-6 overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/40">
                    <Network className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h1 className="text-sm font-semibold text-white font-mono">
                      {selectedItem.action}
                    </h1>
                    <p className="text-xs text-slate-400 font-mono">
                      Request ID: {selectedItem.id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold uppercase px-2.5 py-1 rounded-full border ${
                    selectedItem.status === 'executed'
                      ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60'
                      : selectedItem.status === 'pending_approval'
                      ? 'bg-amber-950/80 text-amber-400 border-amber-800/60'
                      : 'bg-rose-950/80 text-rose-400 border-rose-800/60'
                  }`}>
                    {selectedItem.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Selected Payload Diagnostics Preview */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
                  <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">
                    Canonical Payload
                  </h3>
                  <pre className="text-xs font-mono text-cyan-300 bg-slate-950 p-3 rounded border border-slate-800/60 overflow-x-auto">
                    {JSON.stringify(selectedItem.payload, null, 2)}
                  </pre>
                </div>

                <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
                  <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">
                    Security Invariants & Provenance
                  </h3>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="p-2 rounded bg-slate-950 border border-slate-800/60">
                      <span className="text-slate-500">Payload SHA-256:</span>
                      <p className="text-slate-300 truncate">{selectedItem.payloadHash || 'Calculated at boundary'}</p>
                    </div>
                    {selectedItem.reason && (
                      <div className="p-2 rounded bg-rose-950/30 border border-rose-900/40 text-rose-300">
                        <span className="font-semibold">Violation:</span> {selectedItem.reason}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Placeholder banner for Slice 3 Evidence DAG */}
              <div className="mt-6 flex-1 min-h-[300px] border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500">
                <Network className="w-10 h-10 mb-2 text-cyan-500/40" />
                <p className="text-xs font-medium text-slate-400">Interactive Evidence DAG Canvas</p>
                <p className="text-[11px] text-slate-600">Ready for Slice 3 React Flow integration</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs">
              <Terminal className="w-8 h-8 mb-2 opacity-30" />
              <p>Select an event from the interceptor stream</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
