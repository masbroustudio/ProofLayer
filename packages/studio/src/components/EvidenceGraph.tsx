import React, { useEffect, useState, useMemo } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  type Node, 
  type Edge,
  MarkerType 
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { EvidenceNodeComponent } from './EvidenceNodeComponent.js';
import { Network, RefreshCw } from 'lucide-react';

interface EvidenceGraphProps {
  requestId: string | null;
  status?: string;
  onSelectNode: (node: any) => void;
}

export const EvidenceGraph: React.FC<EvidenceGraphProps> = ({ requestId, status, onSelectNode }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const nodeTypes: any = useMemo(() => ({ evidenceNode: EvidenceNodeComponent }), []);

  useEffect(() => {
    if (!requestId) {
      setNodes([]);
      setEdges([]);
      return;
    }

    setLoading(true);
    fetch(`/api/evidence/${requestId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((dag) => {
        if (dag && Array.isArray(dag.nodes)) {
          // Horizontal left-to-right positioning: [Agent Intent] -> [Policy Check] -> [Approval Gate] -> [Tool Execution]
          const mappedNodes: Node[] = dag.nodes.map((n: any, idx: number) => ({
            id: n.id,
            type: 'evidenceNode',
            position: { x: 50 + idx * 360, y: 150 },
            data: {
              ...n,
            },
          }));

          const mappedEdges: Edge[] = (dag.edges || []).map((e: any) => ({
            id: e.id,
            source: e.source,
            target: e.target,
            animated: true,
            style: { stroke: '#4F46E5', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#4F46E5',
            },
          }));

          setNodes(mappedNodes);
          setEdges(mappedEdges);
        }
      })
      .catch(() => {
        setNodes([]);
        setEdges([]);
      })
      .finally(() => setLoading(false));
  }, [requestId, status]);

  const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
    onSelectNode(node.data);
  };

  return (
    <div className="w-full h-full relative bg-slate-50/60">
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-xs z-10 text-indigo-600 text-xs">
          <RefreshCw className="w-5 h-5 animate-spin mr-2" />
          <span className="font-semibold">Rendering cryptographic evidence DAG...</span>
        </div>
      ) : nodes.length === 0 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 text-xs text-center p-6">
          <Network className="w-10 h-10 mb-2 opacity-40 text-indigo-500" />
          <p className="font-medium text-slate-600">No evidence DAG recorded for this request yet.</p>
          <p className="text-[11px] text-slate-400 mt-1">Actions evaluated by ProofLayer produce immutable nodes here.</p>
        </div>
      ) : null}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        fitView
        className="bg-slate-50/60"
      >
        <Background gap={18} size={1} color="#CBD5E1" />
        <Controls className="bg-white border border-slate-200 rounded-lg shadow-xs" />
        <MiniMap
          nodeStrokeColor="#4F46E5"
          nodeColor="#FFFFFF"
          className="bg-white border border-slate-200 rounded-lg shadow-xs"
        />
      </ReactFlow>
    </div>
  );
};