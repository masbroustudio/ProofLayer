import React, { useState, useEffect } from 'react';
import { TopBar } from './components/TopBar.js';
import { LiveConsole, type InterceptedItem } from './components/LiveConsole.js';
import { EvidenceGraph } from './components/EvidenceGraph.js';
import { DualPaneDrawer } from './components/DualPaneDrawer.js';
import { Network, Terminal } from 'lucide-react';

export const App: React.FC = () => {
  const [connected, setConnected] = useState<boolean>(false);
  const [policyCount, setPolicyCount] = useState<number>(2);
  const [items, setItems] = useState<InterceptedItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inspectedNode, setInspectedNode] = useState<any | null>(null);

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
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Column: Live Interceptor Stream (360px) */}
        <aside className="w-96 flex-shrink-0 h-full">
          <LiveConsole items={items} selectedId={selectedId} onSelect={setSelectedId} />
        </aside>

        {/* Center / Right Panel: Studio Working Canvas & React Flow DAG */}
        <main className="flex-1 flex flex-col h-full bg-[#0B0F17] relative overflow-hidden">
          {selectedItem ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
              {/* Request Banner */}
              <div className="h-12 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/40 z-10 shrink-0">
                <div className="flex items-center gap-3">
                  <Network className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-semibold text-white font-mono">
                    {selectedItem.action}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    (ID: {selectedItem.id})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    selectedItem.status === 'executed'
                      ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60'
                      : selectedItem.status === 'pending_approval'
                      ? 'bg-amber-950/80 text-amber-400 border-amber-800/60 animate-pulse'
                      : 'bg-rose-950/80 text-rose-400 border-rose-800/60'
                  }`}>
                    {selectedItem.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* React Flow Evidence Graph Canvas */}
              <div className="flex-1 w-full h-full relative">
                <EvidenceGraph 
                  requestId={selectedItem.id} 
                  onSelectNode={setInspectedNode} 
                />
              </div>

              {/* Dual-Pane Drawer (Floats over canvas when node is clicked) */}
              <DualPaneDrawer
                node={inspectedNode}
                onClose={() => setInspectedNode(null)}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs">
              <Terminal className="w-8 h-8 mb-2 opacity-30 text-cyan-500" />
              <p>Select an event from the interceptor stream</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
