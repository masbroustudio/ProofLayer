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
  onSelectNode: (node: any) => void;
}

export const EvidenceGraph: React.FC<EvidenceGraphProps> = ({ requestId, onSelectNode }) => {
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
            position: { x: 50 + idx * 300, y: 150 },
            data: {
              ...n,
            },
          }));

          const mappedEdges: Edge[] = (dag.edges || []).map((e: any) => ({
            id: e.id,
            source: e.source,
            target: e.target,
            animated: true,
            style: { stroke: '#06B6D4', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#06B6D4',
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
  }, [requestId]);

  const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
    onSelectNode(node.data);
  };

  return (
    <div className="w-full h-full relative bg-[#0B0F17]">
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0B0F17]/80 z-10 text-cyan-400 text-xs">
          <RefreshCw className="w-5 h-5 animate-spin mr-2" />
          <span>Rendering cryptographic evidence DAG...</span>
        </div>
      ) : nodes.length === 0 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 text-xs text-center p-6">
          <Network className="w-10 h-10 mb-2 opacity-30 text-cyan-500" />
          <p>No evidence DAG recorded for this request yet.</p>
          <p className="text-[11px] text-slate-600 mt-1">Actions evaluated by ProofLayer produce immutable nodes here.</p>
        </div>
      ) : null}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        fitView
        className="bg-[#0B0F17]"
      >
        <Background color="#1E293B" gap={20} size={1} />
        <Controls className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg overflow-hidden shadow-lg" />
        <MiniMap 
          nodeColor="#06B6D4" 
          maskColor="rgba(11, 15, 23, 0.8)" 
          className="bg-slate-950 border border-slate-800 rounded-lg"
        />
      </ReactFlow>
    </div>
  );
};
