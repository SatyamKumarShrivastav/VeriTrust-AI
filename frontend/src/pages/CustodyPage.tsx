import React, { useState, useEffect } from 'react';
import { evidenceService } from '../services/api';
import type { CustodyEvent, EvidenceItem } from '../types';
import {
  GitCommitHorizontal,
  ShieldCheck,
  User,
  Clock,
  Blocks,
  KeyRound,
  FileText,
  AlertCircle,
  Link as LinkIcon,
} from 'lucide-react';

export const CustodyPage: React.FC = () => {
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string>('');
  const [events, setEvents] = useState<CustodyEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchEvidence = async () => {
      try {
        const res = await evidenceService.list({ page_size: 50, all_evidence: true });
        setEvidenceList(res.items);
        if (res.items.length > 0) {
          setSelectedEvidenceId(res.items[0].evidence_id);
        }
      } catch (err) {
        console.error('Failed to load evidence for custody:', err);
      }
    };
    fetchEvidence();
  }, []);

  useEffect(() => {
    if (!selectedEvidenceId) return;
    const fetchCustody = async () => {
      setIsLoading(true);
      try {
        const res = await evidenceService.getCustodyEvents(selectedEvidenceId);
        setEvents(res.events || []);
      } catch (err) {
        console.error('Failed to load custody events:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustody();
  }, [selectedEvidenceId]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Chain of Custody Audit Trail</h1>
          <p className="text-xs text-slate-400 mt-1">
            Chronological, immutable audit ledger linking evidence access, analysis, verification, and transfers.
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

      {/* Custody Timeline View */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <GitCommitHorizontal className="w-5 h-5 text-teal-400" />
            <h2 className="text-sm font-bold text-white">Chronological Event Chain ({events.length} events)</h2>
          </div>
          <span className="text-xs font-mono text-cyan-400">{selectedEvidenceId}</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : events.length > 0 ? (
          <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
            {events.map((e, index) => (
              <div key={e.id} className="relative flex items-start space-x-4">
                {/* Node indicator */}
                <div className="absolute -left-6 mt-1.5 w-5 h-5 rounded-full bg-[#090D16] border-2 border-teal-400 flex items-center justify-center shadow-md shadow-teal-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                </div>

                <div className="flex-1 bg-[#090D16] border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800/80 pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-teal-300 text-xs uppercase tracking-wider">
                        #{index + 1} {e.event_type}
                      </span>
                      {e.actor_role && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 uppercase">
                          {e.actor_role}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {new Date(e.occurred_at).toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500">Authorized Actor:</span>
                      <div className="text-slate-300 font-medium">{e.actor_name || 'System Operator'}</div>
                    </div>
                    {e.notes && (
                      <div>
                        <span className="text-slate-500">Event Notes:</span>
                        <div className="text-slate-300 italic">{e.notes}</div>
                      </div>
                    )}
                  </div>

                  {/* Hash Chaining Inspection */}
                  <div className="pt-2 border-t border-slate-800/60 font-mono text-[10px] space-y-1">
                    {e.event_hash && (
                      <div className="flex items-center text-slate-400 truncate">
                        <span className="text-slate-600 mr-2 shrink-0">Current Event Digest:</span>
                        <span className="text-cyan-400 truncate">{e.event_hash}</span>
                      </div>
                    )}
                    {e.previous_event_hash && (
                      <div className="flex items-center text-slate-400 truncate">
                        <span className="text-slate-600 mr-2 shrink-0">Previous Event Link:</span>
                        <span className="text-slate-500 truncate">{e.previous_event_hash}</span>
                      </div>
                    )}
                    {e.blockchain_tx_hash && (
                      <div className="flex items-center text-emerald-400 truncate">
                        <Blocks className="w-3 h-3 mr-1.5 shrink-0" />
                        <span className="text-slate-500 mr-2 shrink-0">On-Chain TX:</span>
                        <span className="truncate">{e.blockchain_tx_hash}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs">
            <GitCommitHorizontal className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p>No custody events recorded for this item.</p>
          </div>
        )}
      </div>
    </div>
  );
};

