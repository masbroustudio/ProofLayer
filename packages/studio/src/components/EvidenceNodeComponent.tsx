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
  let borderClass = 'border-slate-200 shadow-xs hover:border-indigo-300';
  let badgeBg = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  let Icon = Bot;

  if (nodeType === 'INTENT') {
    Icon = Bot;
    borderClass = 'border-slate-200 shadow-xs hover:border-indigo-300';
    badgeBg = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  } else if (nodeType === 'POLICY_CHECK') {
    if (isBlocked) {
      Icon = ShieldAlert;
      borderClass = 'border-rose-300 shadow-rose-100/50 shadow-md';
      badgeBg = 'bg-rose-50 text-rose-700 border-rose-200';
    } else if (isHeld) {
      Icon = ShieldAlert;
      borderClass = 'border-amber-300 shadow-amber-100/50 shadow-md';
      badgeBg = 'bg-amber-50 text-amber-800 border-amber-200';
    } else {
      Icon = ShieldCheck;
      borderClass = 'border-emerald-300 shadow-emerald-100/50 shadow-md';
      badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  } else if (nodeType === 'APPROVAL') {
    Icon = UserCheck;
    borderClass = 'border-purple-300 shadow-purple-100/50 shadow-md';
    badgeBg = 'bg-purple-50 text-purple-700 border-purple-200';
  } else if (nodeType === 'EXECUTION') {
    Icon = Wrench;
    borderClass = 'border-emerald-300 shadow-emerald-100/50 shadow-md';
    badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }

  return (
    <div
      className={`w-60 rounded-xl bg-white border p-3.5 shadow-xs transition-all cursor-pointer ${borderClass} ${
        selected ? 'ring-2 ring-indigo-600 ring-offset-2 ring-offset-white' : ''
      }`}
    >
      {/* React Flow Handles for Horizontal Pipeline (Left -> Right) */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-2.5 h-2.5 bg-indigo-600 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-2.5 h-2.5 bg-indigo-600 border-2 border-white"
      />

      {/* Header: Node Type Badge & Icon */}
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1 ${badgeBg}`}>
          <Icon className="w-2.5 h-2.5" />
          {nodeType.replace('_', ' ')}
        </span>
        <span className="text-[10px] font-mono text-slate-400">
          {new Date(data.timestamp || Date.now()).toLocaleTimeString()}
        </span>
      </div>

      {/* Label / Description */}
      <p className="text-xs font-bold text-slate-900 line-clamp-2 mb-2 leading-tight">
        {data.label}
      </p>

      {/* Cryptographic SHA-256 Digest Footprint */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <div className="flex items-center gap-1">
          <Fingerprint className="w-3 h-3 text-indigo-500" />
          <span>sha256:</span>
        </div>
        <span className="text-slate-400 truncate max-w-[110px]">
          {data.nodeHash ? `${data.nodeHash.slice(0, 10)}...` : 'pending'}
        </span>
      </div>
    </div>
  );
};