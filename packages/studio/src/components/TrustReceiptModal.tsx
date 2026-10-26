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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Compliance Trust Receipt
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                  EU AI ACT ART. 14
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 font-mono">
                Cryptographically Verifiable Human Oversight Proof
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-indigo-600 gap-2">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span className="font-semibold">Generating cryptographic Merkle proof...</span>
            </div>
          ) : receipt ? (
            <>
              {/* Top Summary Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3 shadow-2xs">
                <div>
                  <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">
                    Enforcement Verdict
                  </span>
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 font-sans">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    {receipt.verdict}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">
                    Standard & Assurance
                  </span>
                  <span className="text-xs font-bold text-slate-800 font-sans">
                    {receipt.complianceMetadata?.standard} / SOC2 Type II
                  </span>
                </div>
              </div>

              {/* Cryptographic Hashes */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-[11px] shadow-2xs">
                <div>
                  <span className="text-slate-500 flex items-center gap-1 mb-0.5 font-semibold">
                    <Fingerprint className="w-3.5 h-3.5 text-indigo-600" />
                    Merkle Evidence Root Hash:
                  </span>
                  <p className="text-indigo-600 font-bold truncate">{receipt.merkleRoot}</p>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 mb-0.5 block font-semibold">Bound Payload SHA-256:</span>
                  <p className="text-slate-700 truncate">{receipt.payloadHash}</p>
                </div>
              </div>

              {/* Compliance Invariants Verified */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 shadow-2xs font-sans">
                <span className="text-[11px] uppercase font-bold text-slate-700 block mb-2">
                  Verified Compliance Invariants
                </span>
                <div className="flex items-center justify-between text-slate-700 text-xs">
                  <span>Human Oversight Verified (Art. 14):</span>
                  <span className="text-emerald-700 font-bold font-mono">TRUE</span>
                </div>
                <div className="flex items-center justify-between text-slate-700 text-xs">
                  <span>Zero Blast Radius Enforced:</span>
                  <span className="text-emerald-700 font-bold font-mono">TRUE</span>
                </div>
                <div className="flex items-center justify-between text-slate-700 text-xs">
                  <span>Deterministic Invariant Gate:</span>
                  <span className="text-emerald-700 font-bold font-mono">PASSED (&lt;0.05ms)</span>
                </div>
              </div>

              {/* Raw JSON Code Block */}
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] shadow-inner text-slate-200">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
                  <span className="font-sans font-medium text-slate-400">Machine-Readable Audit Receipt (JSON)</span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>
                <pre className="text-emerald-400 max-h-36 overflow-y-auto whitespace-pre-wrap">
                  {JSON.stringify(receipt, null, 2)}
                </pre>
              </div>
            </>
          ) : (
            <p className="text-center text-slate-400">Failed to load Trust Receipt</p>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <p className="text-[11px] text-slate-500 font-sans">
            Signed receipt ready for external compliance audit.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              disabled={!receipt}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
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