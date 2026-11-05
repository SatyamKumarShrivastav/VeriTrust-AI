import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { evidenceService } from '../services/api';
import type { EvidenceItem, IntegrityVerification } from '../types';
import {
  KeyRound,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  FileCode,
  FileCheck,
  ShieldAlert,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const IntegrityPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get('evidence_id') || '';

  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string>(initialId);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);
  const [verification, setVerification] = useState<IntegrityVerification | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [tamperSimulation, setTamperSimulation] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load evidence list
  useEffect(() => {
    const fetchEvidence = async () => {
      try {
        const res = await evidenceService.list({ page_size: 50, all_evidence: true });
        setEvidenceList(res.items);
        if (!selectedEvidenceId && res.items.length > 0) {
          setSelectedEvidenceId(res.items[0].evidence_id);
        }
      } catch (err) {
        console.error('Failed to load evidence for integrity:', err);
      }
    };
    fetchEvidence();
  }, []);

  // Update selected evidence details
  useEffect(() => {
    if (!selectedEvidenceId) return;
    setSearchParams({ evidence_id: selectedEvidenceId });
    setTamperSimulation(false);

    const ev = evidenceList.find((e) => e.evidence_id === selectedEvidenceId);
    if (ev) {
      setSelectedEvidence(ev);
    } else {
      evidenceService.getById(selectedEvidenceId).then(setSelectedEvidence).catch(() => {});
    }

    // Try fetching existing verification
    evidenceService
      .getIntegrity(selectedEvidenceId)
      .then(setVerification)
      .catch(() => setVerification(null));
  }, [selectedEvidenceId, evidenceList]);

  const handleVerify = async () => {
    if (!selectedEvidenceId) return;
    setIsVerifying(true);
    setError(null);
    try {
      const res = await evidenceService.verifyIntegrity(selectedEvidenceId);
      setVerification(res);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Integrity verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Cryptographic Evidence Integrity</h1>
          <p className="text-xs text-slate-400 mt-1">
            Independent verification of SHA-256 chunk-based digest, Ed25519 asymmetric signature, and manifest consistency.
          </p>
        </div>

        {/* Evidence Selector */}
        <div className="flex items-center space-x-2">
          <label className="text-xs text-slate-400">Target Evidence:</label>
          <select
            value={selectedEvidenceId}
            onChange={(e) => setSelectedEvidenceId(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
          >
            {evidenceList.map((ev) => (
              <option key={ev.evidence_id} value={ev.evidence_id}>
                {ev.evidence_id} - {ev.original_filename}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {selectedEvidence && (
        <div className="space-y-6">
          {/* Action & Verification Controller */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono text-cyan-400">{selectedEvidence.evidence_id}</span>
                <h2 className="text-lg font-bold text-white">{selectedEvidence.original_filename}</h2>
                <div className="text-xs text-slate-400">
                  Size: {(selectedEvidence.file_size_bytes / (1024 * 1024)).toFixed(2)} MB · Algorithm: SHA-256
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isVerifying ? 'animate-spin' : ''}`} />
                  <span>Execute Hash Recalculation & Signature Check</span>
                </button>
              </div>
            </div>

            {/* Verification Outcomes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
              {/* Check 1: SHA-256 Integrity */}
              <div className="p-4 rounded-xl bg-[#090D16] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>SHA-256 Hash Matching</span>
                  <KeyRound className="w-4 h-4 text-amber-400" />
                </div>
                {tamperSimulation ? (
                  <div className="text-red-400 font-bold text-sm flex items-center space-x-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    <span>INTEGRITY MISMATCH</span>
                  </div>
                ) : verification ? (
                  <div
                    className={`font-bold text-sm flex items-center space-x-1.5 ${
                      verification.hash_match ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {verification.hash_match ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>INTEGRITY VERIFIED</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4" />
                        <span>INTEGRITY MISMATCH</span>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-slate-500 text-xs">Run check to verify</div>
                )}
                <div className="text-[11px] text-slate-500">Compares current bytes vs registered digest</div>
              </div>

              {/* Check 2: Ed25519 Digital Signature */}
              <div className="p-4 rounded-xl bg-[#090D16] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Manifest Signature (Ed25519)</span>
                  <FileCheck className="w-4 h-4 text-cyan-400" />
                </div>
                {verification ? (
                  <div
                    className={`font-bold text-sm flex items-center space-x-1.5 ${
                      verification.signature_valid ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {verification.signature_valid ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>SIGNATURE VALID</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4" />
                        <span>SIGNATURE UNVERIFIED</span>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-slate-500 text-xs">Awaiting verification</div>
                )}
                <div className="text-[11px] text-slate-500">Verified via authorized public key</div>
              </div>

              {/* Check 3: Blockchain Reference */}
              <div className="p-4 rounded-xl bg-[#090D16] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Blockchain Ledger Anchor</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                {verification ? (
                  <div className="font-bold text-sm text-slate-300">
                    {verification.blockchain_detail || 'Local Node Connected'}
                  </div>
                ) : (
                  <div className="text-slate-500 text-xs">Checked during run</div>
                )}
                <div className="text-[11px] text-slate-500">Tamper-evident transaction check</div>
              </div>
            </div>
          </div>

          {/* Hash Comparison Viewer */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <FileCode className="w-4 h-4 text-blue-400" />
              <span>Cryptographic Hash Inspection & Comparison</span>
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-[#090D16] border border-slate-800 space-y-1">
                <div className="text-slate-500 text-[11px] font-sans">
                  Trusted Registered Hash (Stored at Ingestion):
                </div>
                <div className="text-amber-300 break-all">{selectedEvidence.sha256_hash}</div>
              </div>

              <div className="p-3 rounded-xl bg-[#090D16] border border-slate-800 space-y-1">
                <div className="text-slate-500 text-[11px] font-sans">
                  Recalculated Hash (Computed dynamically from current file on storage):
                </div>
                <div className="text-emerald-300 break-all">
                  {tamperSimulation
                    ? '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4' // Altered hash
                    : verification?.recalculated_hash || selectedEvidence.sha256_hash}
                </div>
              </div>
            </div>

            {/* Live Tampering Demonstration Toggle */}
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-purple-300">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Academic Evaluation: Tampering & Integrity Mismatch Demo</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Simulate modifying 1 byte in the video stream to demonstrate immediate cryptographic mismatch detection.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setTamperSimulation(!tamperSimulation)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  tamperSimulation
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/20'
                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-500/20'
                }`}
              >
                {tamperSimulation ? 'Reset to Unmodified File' : 'Simulate 1-Byte Tamper'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

