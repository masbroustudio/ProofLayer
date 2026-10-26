import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
  Bot, 
  ShieldCheck, 
  ShieldAlert, 
  UserCheck, 
  Wrench, 
  Fingerprint 
} from 'lucide-react';

export interface EvidenceNodeData {
  label: string;
  type: 'INTENT' | 'POLICY_CHECK' | 'APPROVAL' | 'EXECUTION' | 'TRUST_RECEIPT';
  data: Record<string, any>;
  nodeHash: string;
  timestamp: number;
}

export const EvidenceNodeComponent: React.FC<any> = ({ data, selected }) => {
  const nodeType = data.type;
  const isBlocked = data.data?.decision === 'deny' || data.data?.error || data.label?.includes('Block');
  const isHeld = data.data?.decision === 'require_approval' || data.label?.includes('Approval');

  // Border & Glow styling
  let borderClass = 'border-cyan-500/60 shadow-cyan-500/10';
  let badgeBg = 'bg-cyan-950/80 text-cyan-400 border-cyan-800/60';
  let Icon = Bot;

  if (nodeType === 'INTENT') {
    Icon = Bot;
    borderClass = 'border-cyan-500/60 shadow-cyan-500/10';
    badgeBg = 'bg-cyan-950/80 text-cyan-400 border-cyan-800/60';
  } else if (nodeType === 'POLICY_CHECK') {
    if (isBlocked) {
      Icon = ShieldAlert;
      borderClass = 'border-rose-500/80 shadow-rose-500/20';
      badgeBg = 'bg-rose-950/80 text-rose-400 border-rose-800/60';
    } else if (isHeld) {
      Icon = ShieldAlert;
      borderClass = 'border-amber-500/80 shadow-amber-500/20';
      badgeBg = 'bg-amber-950/80 text-amber-400 border-amber-800/60';
    } else {
      Icon = ShieldCheck;
      borderClass = 'border-emerald-500/80 shadow-emerald-500/20';
      badgeBg = 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60';
    }
  } else if (nodeType === 'APPROVAL') {
    Icon = UserCheck;
    borderClass = 'border-violet-500/80 shadow-violet-500/20';
    badgeBg = 'bg-violet-950/80 text-violet-400 border-violet-800/60';
  } else if (nodeType === 'EXECUTION') {
    Icon = Wrench;
    borderClass = 'border-emerald-500/80 shadow-emerald-500/20';
    badgeBg = 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60';
  }

  return (
    <div
      className={`w-60 rounded-xl bg-[#0F1623] border p-3.5 shadow-xl transition-all cursor-pointer ${borderClass} ${
        selected ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#0B0F17]' : ''
      }`}
    >
      {/* React Flow Handles for Horizontal Pipeline (Left -> Right) */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-2.5 h-2.5 bg-cyan-400 border-2 border-[#0B0F17]"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-2.5 h-2.5 bg-cyan-400 border-2 border-[#0B0F17]"
      />

      {/* Header: Node Type Badge & Icon */}
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1 ${badgeBg}`}>
          <Icon className="w-2.5 h-2.5" />
          {nodeType.replace('_', ' ')}
        </span>
        <span className="text-[10px] font-mono text-slate-500">
          {new Date(data.timestamp || Date.now()).toLocaleTimeString()}
        </span>
      </div>

      {/* Label / Description */}
      <p className="text-xs font-semibold text-slate-200 line-clamp-2 mb-2 leading-tight">
        {data.label}
      </p>

      {/* Cryptographic SHA-256 Digest Footprint */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-1">
          <Fingerprint className="w-3 h-3 text-cyan-400/80" />
          <span>sha256:</span>
        </div>
        <span className="text-slate-500 truncate max-w-[110px]">
          {data.nodeHash ? `${data.nodeHash.slice(0, 10)}...` : 'pending'}
        </span>
      </div>
    </div>
  );
};
