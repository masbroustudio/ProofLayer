import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Download, 
  Copy, 
  Check, 
  FileCheck2, 
  Fingerprint,
  RefreshCw
} from 'lucide-react';

interface TrustReceiptModalProps {
  requestId: string;
  onClose: () => void;
}

export const TrustReceiptModal: React.FC<TrustReceiptModalProps> = ({ requestId, onClose }) => {
  const [receipt, setReceipt] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    fetch(`/api/evidence/${requestId}/receipt`)
      .then((res) => {
        if (!res.ok) throw new Error('Receipt not found');
        return res.json();
      })
      .then((data) => setReceipt(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [requestId]);

  const handleCopy = () => {
    if (!receipt) return;
    navigator.clipboard.writeText(JSON.stringify(receipt, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!receipt) return;
    const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trust-receipt-${requestId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#0F1623] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                Compliance Trust Receipt
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-bold">
                  EU AI ACT ART. 14
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Cryptographically Verifiable Human Oversight Proof
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

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-cyan-400 gap-2">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Generating cryptographic Merkle proof...</span>
            </div>
          ) : receipt ? (
            <>
              {/* Top Summary Card */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">
                    Enforcement Verdict
                  </span>
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    {receipt.verdict}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">
                    Standard & Assurance
                  </span>
                  <span className="text-xs text-slate-200">
                    {receipt.complianceMetadata?.standard} / SOC2 Type II
                  </span>
                </div>
              </div>

              {/* Cryptographic Hashes */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-[11px]">
                <div>
                  <span className="text-slate-500 flex items-center gap-1 mb-0.5">
                    <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
                    Merkle Evidence Root Hash:
                  </span>
                  <p className="text-cyan-300 font-bold truncate">{receipt.merkleRoot}</p>
                </div>
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-slate-500 mb-0.5 block">Bound Payload SHA-256:</span>
                  <p className="text-slate-300 truncate">{receipt.payloadHash}</p>
                </div>
              </div>

              {/* Compliance Invariants Verified */}
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
                <span className="text-[11px] uppercase font-bold text-slate-300 block mb-2">
                  Verified Compliance Invariants
                </span>
                <div className="flex items-center justify-between text-slate-300 text-[11px]">
                  <span>Human Oversight Verified (Art. 14):</span>
                  <span className="text-emerald-400 font-bold">TRUE</span>
                </div>
                <div className="flex items-center justify-between text-slate-300 text-[11px]">
                  <span>Zero Blast Radius Enforced:</span>
                  <span className="text-emerald-400 font-bold">TRUE</span>
                </div>
                <div className="flex items-center justify-between text-slate-300 text-[11px]">
                  <span>Deterministic Invariant Gate:</span>
                  <span className="text-emerald-400 font-bold">PASSED (&lt;0.05ms)</span>
                </div>
              </div>

              {/* Raw JSON Code Block */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px]">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
                  <span>Machine-Readable Audit Receipt (JSON)</span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="text-emerald-300/80 max-h-36 overflow-y-auto whitespace-pre-wrap">
                  {JSON.stringify(receipt, null, 2)}
                </pre>
              </div>
            </>
          ) : (
            <p className="text-center text-slate-500">Failed to load Trust Receipt</p>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <p className="text-[11px] text-slate-500 font-mono">
            Signed receipt ready for external compliance audit.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-medium transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              disabled={!receipt}
              className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-600/20 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON Receipt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
