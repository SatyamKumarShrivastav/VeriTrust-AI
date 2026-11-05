import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { evidenceService } from '../services/api';
import type { EvidenceItem, IntegrityVerification, BlockchainTransaction, CustodyEvent } from '../types';
import {
  ShieldCheck,
  FileVideo,
  KeyRound,
  Cpu,
  Blocks,
  GitCommitHorizontal,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Copy,
  Check,
} from 'lucide-react';

export const EvidenceDetailPage: React.FC = () => {
  const { evidenceId } = useParams<{ evidenceId: string }>();
  const navigate = useNavigate();

  const [evidence, setEvidence] = useState<EvidenceItem | null>(null);
  const [integrity, setIntegrity] = useState<IntegrityVerification | null>(null);
  const [blockchainTxs, setBlockchainTxs] = useState<BlockchainTransaction[]>([]);
  const [custodyEvents, setCustodyEvents] = useState<CustodyEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadData = async () => {
    if (!evidenceId) return;
    setIsLoading(true);
    try {
      const ev = await evidenceService.getById(evidenceId);
      setEvidence(ev);

      // Best effort parallel fetches for supplementary metadata
      try {
        const integ = await evidenceService.getIntegrity(evidenceId);
        setIntegrity(integ);
      } catch {}

      try {
        const bc = await evidenceService.getBlockchainStatus(evidenceId);
        setBlockchainTxs(bc.transactions || []);
      } catch {}

      try {
        const ce = await evidenceService.getCustodyEvents(evidenceId);
        setCustodyEvents(ce.events || []);
      } catch {}
    } catch (err) {
      console.error('Failed to load evidence detail:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [evidenceId]);

  const handleCopyHash = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleTriggerAnalysis = async () => {
    if (!evidenceId) return;
    setActionLoading('analysis');
    setStatusMessage(null);
    try {
      await evidenceService.triggerAnalysis(evidenceId);
      setStatusMessage({ text: 'AI analysis job queued successfully.', type: 'success' });
      await loadData();
    } catch (err: any) {
      setStatusMessage({ text: err.response?.data?.detail || 'Analysis trigger failed.', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerifyIntegrity = async () => {
    if (!evidenceId) return;
    setActionLoading('verify');
    setStatusMessage(null);
    try {
      const res = await evidenceService.verifyIntegrity(evidenceId);
      setIntegrity(res);
      setStatusMessage({ text: `Integrity check complete: ${res.overall_status.toUpperCase()}`, type: 'success' });
      await loadData();
    } catch (err: any) {
      setStatusMessage({ text: err.response?.data?.detail || 'Integrity check failed.', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRegisterBlockchain = async () => {
    if (!evidenceId) return;
    setActionLoading('blockchain');
    setStatusMessage(null);
    try {
      const res = await evidenceService.registerBlockchain(evidenceId);
      setStatusMessage({ text: res.message || 'Blockchain registration initiated.', type: 'success' });
      await loadData();
    } catch (err: any) {
      setStatusMessage({ text: err.response?.data?.detail || 'Blockchain registration failed.', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleGenerateReport = async () => {
    if (!evidenceId) return;
    setActionLoading('report');
    setStatusMessage(null);
    try {
      await evidenceService.generateReport(evidenceId);
      setStatusMessage({ text: 'Forensic report generation queued.', type: 'success' });
    } catch (err: any) {
      setStatusMessage({ text: err.response?.data?.detail || 'Report generation failed.', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!evidence) {
    return (
      <div className="text-center py-16 space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-white">Evidence Record Not Found</h2>
        <Link to="/evidence" className="text-xs text-blue-400 hover:underline">
          Return to Evidence Library
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back and Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/evidence')}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-white font-mono">{evidence.evidence_id}</h1>
              <span
                className={`px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                  evidence.status === 'verified'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                }`}
              >
                {evidence.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{evidence.original_filename}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleVerifyIntegrity}
            disabled={!!actionLoading}
            className="px-3.5 py-2 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 text-xs font-semibold flex items-center space-x-1.5 transition disabled:opacity-50"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Verify Integrity</span>
          </button>

          <Link
            to={`/forensics?evidence_id=${evidence.evidence_id}`}
            className="px-3.5 py-2 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30 hover:bg-purple-500/25 text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>AI Forensics</span>
          </Link>

          <button
            onClick={handleRegisterBlockchain}
            disabled={!!actionLoading}
            className="px-3.5 py-2 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 text-xs font-semibold flex items-center space-x-1.5 transition disabled:opacity-50"
          >
            <Blocks className="w-3.5 h-3.5" />
            <span>Anchor Ledger</span>
          </button>

          <button
            onClick={handleGenerateReport}
            disabled={!!actionLoading}
            className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition disabled:opacity-50"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Status Feedback Banner */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center space-x-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Grid: Metadata & Fingerprint */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Media Details & Hash */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cryptographic Manifest Card */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Cryptographic Fingerprint & Manifest</span>
            </h2>

            <div className="space-y-3 bg-[#090D16] p-4 rounded-xl border border-slate-800">
              <div>
                <div className="text-[11px] text-slate-500 mb-1">SHA-256 Digest (Registered at Ingestion):</div>
                <div className="flex items-center justify-between p-2.5 rounded bg-slate-900 font-mono text-xs text-amber-300 break-all border border-slate-800">
                  <span>{evidence.sha256_hash || 'Calculation in progress...'}</span>
                  {evidence.sha256_hash && (
                    <button
                      onClick={() => handleCopyHash(evidence.sha256_hash!)}
                      className="ml-2 text-slate-400 hover:text-white shrink-0"
                      title="Copy Hash"
                    >
                      {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              {integrity && (
                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500">Recalculated Hash Match:</span>
                    <div className="font-semibold mt-0.5">
                      {integrity.hash_match ? (
                        <span className="text-emerald-400 flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Exact Match (100% Intact)</span>
                        </span>
                      ) : (
                        <span className="text-red-400 flex items-center space-x-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Integrity Mismatch Detected</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Digital Signature (Ed25519):</span>
                    <div className="font-semibold mt-0.5">
                      {integrity.signature_valid ? (
                        <span className="text-emerald-400">Valid Signature</span>
                      ) : (
                        <span className="text-slate-400">Verification Pending</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-500 italic">
              Note: SHA-256 establishes mathematical file consistency against registered reference. It does not certify the truthfulness of depicted events.
            </p>
          </div>

          {/* Chain of Custody Timeline on Details Page */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <GitCommitHorizontal className="w-4 h-4 text-teal-400" />
              <span>Chain of Custody History ({custodyEvents.length} events)</span>
            </h2>

            <div className="space-y-3">
              {custodyEvents.map((e, idx) => (
                <div key={idx} className="flex items-start space-x-3 p-3 rounded-xl bg-[#090D16] border border-slate-800 text-xs">
                  <div className="w-2 h-2 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-teal-300 uppercase tracking-wider">{e.event_type}</span>
                      <span className="text-[10px] text-slate-500">{new Date(e.occurred_at).toLocaleString()}</span>
                    </div>
                    <div className="text-slate-400 text-[11px]">Actor: {e.actor_name || 'System Actor'}</div>
                    {e.notes && <div className="text-slate-500 text-[11px] italic">{e.notes}</div>}
                    {e.blockchain_tx_hash && (
                      <div className="font-mono text-[10px] text-cyan-400 truncate">
                        TX: {e.blockchain_tx_hash}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Evidence Specs & Blockchain */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <FileVideo className="w-4 h-4 text-blue-400" />
              <span>Media Specification</span>
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-500">File Size</span>
                <span className="text-slate-200">{(evidence.file_size_bytes / (1024 * 1024)).toFixed(2)} MB</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-500">Format / MIME</span>
                <span className="text-slate-200 uppercase">{evidence.file_extension || evidence.mime_type}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-500">Uploaded Date</span>
                <span className="text-slate-200">{new Date(evidence.uploaded_at).toLocaleDateString()}</span>
              </div>
              {evidence.tags && (
                <div className="py-1.5">
                  <span className="text-slate-500 block mb-1">Tags</span>
                  <div className="flex flex-wrap gap-1.5">
                    {evidence.tags.split(',').map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Blockchain Registration Card */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Blocks className="w-4 h-4 text-emerald-400" />
              <span>Blockchain Ledger Status</span>
            </h2>

            {blockchainTxs.length > 0 ? (
              <div className="space-y-2.5 text-xs">
                {blockchainTxs.map((tx) => (
                  <div key={tx.id} className="p-3 rounded-xl bg-[#090D16] border border-slate-800 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-semibold text-emerald-400 uppercase">{tx.status}</span>
                      <span className="text-[10px] text-slate-500">Block #{tx.block_number || 'Pending'}</span>
                    </div>
                    {tx.tx_hash && (
                      <div className="font-mono text-[10px] text-slate-300 break-all">
                        {tx.tx_hash}
                      </div>
                    )}
                    {tx.error_message && (
                      <div className="text-[10px] text-amber-400/90 leading-tight">
                        {tx.error_message}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-500 bg-[#090D16] p-4 rounded-xl border border-slate-800 text-center">
                Not anchored on blockchain yet. Click "Anchor Ledger" above to submit transaction.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

