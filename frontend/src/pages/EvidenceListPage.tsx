import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { evidenceService } from '../services/api';
import type { EvidenceItem } from '../types';
import {
  FolderOpen,
  Search,
  Filter,
  Plus,
  Eye,
  KeyRound,
  Cpu,
  Blocks,
  Clock,
  ArrowRight,
  FileVideo,
} from 'lucide-react';

export const EvidenceListPage: React.FC = () => {
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvidence = async () => {
    setIsLoading(true);
    try {
      const data = await evidenceService.list({
        page,
        page_size: pageSize,
        status: statusFilter || undefined,
        search: searchQuery || undefined,
        all_evidence: true,
      });
      setEvidenceList(data.items);
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to load evidence library:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidence();
  }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchEvidence();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Evidence Library</h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse, inspect, and verify registered digital video evidence records ({total} total).
          </p>
        </div>
        <Link
          to="/evidence/upload"
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center space-x-1.5 transition shadow-sm shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Evidence</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Evidence ID, filename, tags..."
            className="w-full bg-[#090D16] border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
          />
        </form>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-[#090D16] border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="registered">Registered</option>
            <option value="analyzed">Analyzed</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Evidence Table */}
      <div className="bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : evidenceList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090D16] border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Evidence ID</th>
                  <th className="py-3 px-4">Media Details</th>
                  <th className="py-3 px-4">SHA-256 Fingerprint</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Registered At</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {evidenceList.map((item) => (
                  <tr key={item.evidence_id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                      <Link to={`/evidence/${item.evidence_id}`} className="hover:underline">
                        {item.evidence_id}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2.5">
                        <FileVideo className="w-4 h-4 text-blue-400 shrink-0" />
                        <div className="min-w-0 max-w-xs">
                          <div className="font-medium text-slate-200 truncate">{item.original_filename}</div>
                          <div className="text-[10px] text-slate-500">
                            {(item.file_size_bytes / (1024 * 1024)).toFixed(2)} MB · {item.mime_type || 'video'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                      {item.sha256_hash ? (
                        <span title={item.sha256_hash}>
                          {item.sha256_hash.slice(0, 10)}...{item.sha256_hash.slice(-8)}
                        </span>
                      ) : (
                        <span className="text-amber-500/80">Pending calculation</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wider ${
                          item.status === 'verified'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : item.status === 'registered'
                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                            : item.status === 'analyzing'
                            ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30 animate-pulse'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {new Date(item.uploaded_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/evidence/${item.evidence_id}`}
                          title="Inspect Evidence"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          to={`/forensics?evidence_id=${item.evidence_id}`}
                          title="AI Deepfake Analysis"
                          className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 transition"
                        >
                          <Cpu className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 text-xs">
            <FolderOpen className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p>No evidence items match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

