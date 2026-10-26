import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  KeyRound, 
  AlertTriangle,
  Fingerprint,
  CheckCircle2,
  Send
} from 'lucide-react';

interface ApprovalModalProps {
  request: {
    id: string;
    agentId: string;
    action: string;
    payload: Record<string, any>;
    payloadHash: string;
    reason?: string;
  };
  onClose: () => void;
  onApprovalSuccess: (result: any) => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({ request, onClose, onApprovalSuccess }) => {
  const canonicalHash = request.payloadHash || 'Bound at boundary';

  // Dual-Signature Gate State
  const [financeSigned, setFinanceSigned] = useState<boolean>(false);
  const [secopsSigned, setSecopsSigned] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Signer 1: Finance Lead Sign-off
  const handleFinanceSign = () => {
    setFinanceSigned(true);
  };

  // Signer 2: SecOps Lead Sign-off
  const handleSecopsSign = () => {
    setSecopsSigned(true);
  };

  // Submit Dual-Signed Token to Backend
  const handleSubmitExecution = async () => {
    if (!financeSigned || !secopsSigned) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/approvals/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          requestId: request.id,
          reviewerId: 'sarah.finance@internal + marcus.secops@internal',
          decision: 'approved'
        }),
      });

      const data = await res.json();
      if (!res.ok || data.status === 'blocked') {
        throw new Error(data.error || data.reason || 'Approval submission rejected');
      }

      onApprovalSuccess(data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch approved tool');
    } finally {
      setSubmitting(false);
    }
  };

  const isFullySigned = financeSigned && secopsSigned;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-[#0F1623] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-950/80 border border-amber-800/60 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                Dual-Signature Human Gate
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-950 text-violet-400 border border-violet-800/60">
                  Separation of Duties
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Action: {request.action} (Target: High-Value Operation)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Payload & Invariant Alert Body */}
        <div className="p-5 space-y-4 text-xs font-mono">
          {/* Reason Alert */}
          {request.reason && (
            <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/50 text-amber-300 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Interception Reason:</span>
                <p className="mt-0.5 text-[11px] text-amber-200/90 leading-relaxed">
                  {request.reason}
                </p>
              </div>
            </div>
          )}

          {/* Canonical Payload Summary */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
              Canonical Payload to be Authorized
            </span>
            <pre className="text-emerald-300 text-[11px] whitespace-pre-wrap leading-relaxed">
              {JSON.stringify(request.payload, null, 2)}
            </pre>
            <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1 text-slate-500">
                <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
                Payload SHA-256 Digest:
              </span>
              <span className="text-cyan-400 font-bold truncate max-w-xs">{canonicalHash}</span>
            </div>
          </div>

          {/* Dual-Signature Reviewer Checklist */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
            <span className="text-[11px] uppercase font-bold text-slate-300 block tracking-wider">
              Required Multi-Party Authorizations
            </span>

            {/* Signer 1: Finance Lead */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800/60">
              <div className="flex items-center gap-2.5">
                <UserCheck className={`w-4 h-4 ${financeSigned ? 'text-emerald-400' : 'text-slate-500'}`} />
                <div>
                  <div className="font-semibold text-slate-200">1. Finance Lead Sign-off</div>
                  <div className="text-[10px] text-slate-500">Reviewer: sarah.finance@internal</div>
                </div>
              </div>

              {financeSigned ? (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-800/60">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  HMAC Signed
                </span>
              ) : (
                <button
                  onClick={handleFinanceSign}
                  className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-[11px] flex items-center gap-1 shadow-md shadow-cyan-600/20 transition-colors"
                >
                  <KeyRound className="w-3 h-3" />
                  Sign as Finance
                </button>
              )}
            </div>

            {/* Signer 2: SecOps Lead */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800/60">
              <div className="flex items-center gap-2.5">
                <Lock className={`w-4 h-4 ${secopsSigned ? 'text-emerald-400' : 'text-slate-500'}`} />
                <div>
                  <div className="font-semibold text-slate-200">2. SecOps Security Gate</div>
                  <div className="text-[10px] text-slate-500">Reviewer: marcus.secops@internal</div>
                </div>
              </div>

              {secopsSigned ? (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-800/60">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  HMAC Signed
                </span>
              ) : (
                <button
                  onClick={handleSecopsSign}
                  className="px-3 py-1 rounded bg-violet-600 hover:bg-violet-500 text-white font-semibold text-[11px] flex items-center gap-1 shadow-md shadow-violet-600/20 transition-colors"
                >
                  <KeyRound className="w-3 h-3" />
                  Sign as SecOps
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-xs">
              {error}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <p className="text-[11px] text-slate-500 font-mono">
            {isFullySigned ? 'Dual signatures verified. Ready for execution.' : 'Requires 2 of 2 signatures.'}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitExecution}
              disabled={!isFullySigned || submitting}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                isFullySigned && !submitting
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Dispatching...' : 'Dispatch Protected Tool'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
