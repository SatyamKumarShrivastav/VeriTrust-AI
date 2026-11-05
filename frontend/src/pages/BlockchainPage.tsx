import React, { useState, useEffect } from 'react';
import { evidenceService, systemService } from '../services/api';
import type { BlockchainTransaction, EvidenceItem } from '../types';
import {
  Blocks,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Search,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Cpu,
} from 'lucide-react';

export const BlockchainPage: React.FC = () => {
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string>('');
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [networkHealth, setNetworkHealth] = useState<boolean>(false);
  const [copiedTx, setCopiedTx] = useState<string | null>(null);

  useEffect(() => {
    const fetchInit = async () => {
      try {
        const health = await systemService.getHealth();
        setNetworkHealth(health.blockchain);

        const evRes = await evidenceService.list({ page_size: 50, all_evidence: true });
        setEvidenceList(evRes.items);
        if (evRes.items.length > 0) {
          setSelectedEvidenceId(evRes.items[0].evidence_id);
        }
      } catch (err) {
        console.error('Failed to init blockchain explorer:', err);
      }
    };
    fetchInit();
  }, []);

  useEffect(() => {
    if (!selectedEvidenceId) return;
    const fetchTxs = async () => {
      setIsLoading(true);
      try {
        const res = await evidenceService.getBlockchainStatus(selectedEvidenceId);
        setTransactions(res.transactions);
      } catch (err) {
        console.error('Failed to load blockchain transactions:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTxs();
  }, [selectedEvidenceId]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTx(text);
    setTimeout(() => setCopiedTx(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Blockchain Evidence Explorer</h1>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-evident audit ledger tracking immutable registration fingerprints & custody milestones on-chain.
          </p>
        </div>

        {/* Network Status Badge */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              networkHealth ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span className="text-slate-300 font-medium">
            {networkHealth ? 'Local Ethereum Node Active' : 'Append-Only Ledger Mode'}
          </span>
        </div>
      </div>

      {/* Target Evidence Selector */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Blocks className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-200">Select Evidence Item:</span>
          <select
            value={selectedEvidenceId}
            onChange={(e) => setSelectedEvidenceId(e.target.value)}
            className="bg-[#090D16] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
          >
            {evidenceList.map((ev) => (
              <option key={ev.evidence_id} value={ev.evidence_id}>
                {ev.evidence_id} - {ev.original_filename}
              </option>
            ))}
          </select>
        </div>

        <div className="text-[11px] text-slate-400">
          Showing on-chain transactions for <span className="text-cyan-400 font-mono">{selectedEvidenceId}</span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl space-y-4 p-6">
        <h2 className="text-sm font-bold text-white flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Ledger Transaction Records ({transactions.length})</span>
        </h2>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="p-4 rounded-xl bg-[#090D16] border border-slate-800 space-y-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        tx.status === 'confirmed'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : tx.status === 'unavailable'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {tx.status}
                    </span>
                    <span className="font-semibold text-slate-200">{tx.event_type}</span>
                  </div>

                  <div className="text-[11px] text-slate-500">
                    Network: <span className="text-slate-400 capitalize">{tx.network || 'local'}</span> ·
                    Block: <span className="text-cyan-400 font-mono font-medium">#{tx.block_number ?? 'Pending'}</span>
                  </div>
                </div>

                {tx.tx_hash ? (
                  <div className="flex items-center justify-between p-2 rounded bg-slate-900/80 border border-slate-800/80">
                    <div className="font-mono text-[11px] text-emerald-300 truncate max-w-xl">
                      TX: {tx.tx_hash}
                    </div>
                    <button
                      onClick={() => handleCopy(tx.tx_hash!)}
                      className="ml-2 text-slate-400 hover:text-white"
                      title="Copy TX Hash"
                    >
                      {copiedTx === tx.tx_hash ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="text-[11px] text-amber-400/90 italic">
                    {tx.error_message || 'Transaction hash pending network confirmation.'}
                  </div>
                )}

                <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                  <span>Created: {tx.created_at ? new Date(tx.created_at).toLocaleString() : 'N/A'}</span>
                  <span>Confirmed: {tx.confirmed_at ? new Date(tx.confirmed_at).toLocaleString() : 'Pending'}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs">
            <Blocks className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p>No blockchain transactions found for this evidence record.</p>
          </div>
        )}
      </div>
    </div>
  );
};

