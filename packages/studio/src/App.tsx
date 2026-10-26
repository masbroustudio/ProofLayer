import React, { useState, useEffect } from 'react';
import { TopBar, type StudioTab } from './components/TopBar.js';
import { RedTeamBar } from './components/RedTeamBar.js';
import { LiveConsole, type InterceptedItem } from './components/LiveConsole.js';
import { EvidenceGraph } from './components/EvidenceGraph.js';
import { DualPaneDrawer } from './components/DualPaneDrawer.js';
import { ApprovalModal } from './components/ApprovalModal.js';
import { TrustReceiptModal } from './components/TrustReceiptModal.js';
import { PolicyPlayground } from './components/PolicyPlayground.js';
import { AuditLedger } from './components/AuditLedger.js';
import { CustomProposalModal } from './components/CustomProposalModal.js';
import { Network, Terminal, FileCheck2, UserCheck } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<StudioTab>('console');
  const [connected, setConnected] = useState<boolean>(false);
  const [policyCount, setPolicyCount] = useState<number>(4);
  const [items, setItems] = useState<InterceptedItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inspectedNode, setInspectedNode] = useState<any | null>(null);

  // Modal States
  const [showApprovalModal, setShowApprovalModal] = useState<boolean>(false);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);

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

  const handleApprovalSuccess = () => {
    if (!selectedId) return;
    setItems((prev) =>
      prev.map((item) =>
        item.id === selectedId
          ? { ...item, status: 'executed', reason: undefined }
          : item
      )
    );
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Top Bar with Brand, Tabs, and Telemetry */}
      <TopBar 
        connected={connected} 
        policyCount={policyCount} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {/* Red-Team Adversarial Sandbox Runner (Persistent Header across tabs) */}
      <RedTeamBar 
        onSimulationTriggered={() => {
          if (activeTab !== 'console') {
            setActiveTab('console');
          }
        }} 
        onOpenCustomModal={() => setShowCustomModal(true)}
      />

      {/* Tab 1: Live Threat Console View */}
      {activeTab === 'console' && (
        <div className="flex flex-1 overflow-hidden relative">
          {/* Left Column: Live Interceptor Stream (360px) */}
          <aside className="w-80 sm:w-96 flex-shrink-0 h-full">
            <LiveConsole items={items} selectedId={selectedId} onSelect={setSelectedId} />
          </aside>

          {/* Center / Right Panel: Studio Working Canvas & React Flow DAG */}
          <main className="flex-1 flex flex-col h-full bg-slate-50/50 relative overflow-hidden">
            {selectedItem ? (
              <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Request Banner & Action Bar */}
                <div className="h-12 px-6 border-b border-slate-200 flex items-center justify-between bg-white/80 z-10 shrink-0">
                  <div className="flex items-center gap-3">
                    <Network className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      {selectedItem.action}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      (ID: {selectedItem.id})
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      selectedItem.status === 'executed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : selectedItem.status === 'pending_approval'
                        ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {selectedItem.status.replace('_', ' ')}
                    </span>

                    {/* Dual-Signature Approval Trigger */}
                    {selectedItem.status === 'pending_approval' && (
                      <button
                        onClick={() => setShowApprovalModal(true)}
                        className="px-3 py-1 rounded-md bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer animate-pulse"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Review & Authorize (Dual-Signature)</span>
                      </button>
                    )}

                    {/* Trust Receipt Export Trigger */}
                    {selectedItem.status === 'executed' && (
                      <button
                        onClick={() => setShowReceiptModal(true)}
                        className="px-3 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>Export Trust Receipt (Art. 14)</span>
                      </button>
                    )}
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

                {/* Dual-Signature Approval Modal */}
                {showApprovalModal && (
                  <ApprovalModal
                    request={{
                      id: selectedItem.id,
                      agentId: selectedItem.agentId,
                      action: selectedItem.action,
                      payload: selectedItem.payload,
                      payloadHash: selectedItem.payloadHash,
                      reason: selectedItem.reason,
                    }}
                    onClose={() => setShowApprovalModal(false)}
                    onApprovalSuccess={handleApprovalSuccess}
                  />
                )}

                {/* Compliance Trust Receipt Modal */}
                {showReceiptModal && (
                  <TrustReceiptModal
                    requestId={selectedItem.id}
                    onClose={() => setShowReceiptModal(false)}
                  />
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs">
                <Terminal className="w-8 h-8 mb-2 opacity-40 text-indigo-500" />
                <p className="font-medium text-slate-600">Select an event from the interceptor stream</p>
              </div>
            )}
          </main>
        </div>
      )}

      {/* Tab 2: Policy Playground & AST Compiler View */}
      {activeTab === 'playground' && <PolicyPlayground />}

      {/* Tab 3: Cryptographic Audit & Compliance Ledger View */}
      {activeTab === 'ledger' && <AuditLedger />}

      {/* Custom Tool Call Proposal Dispatcher Modal */}
      {showCustomModal && (
        <CustomProposalModal
          onClose={() => setShowCustomModal(false)}
          onSuccess={(result) => {
            setActiveTab('console');
            if (result.request?.id) {
              setSelectedId(result.request.id);
            }
          }}
        />
      )}
    </div>
  );
};