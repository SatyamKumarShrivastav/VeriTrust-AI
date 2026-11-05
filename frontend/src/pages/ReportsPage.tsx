import React, { useState, useEffect } from 'react';
import { evidenceService, systemService } from '../services/api';
import type { ReportItem, EvidenceItem } from '../types';
import {
  FileText,
  Download,
  Eye,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  FileCode,
  Shield,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string>('');
  const [activeReport, setActiveReport] = useState<ReportItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const data = await systemService.getReportsList({ page_size: 50 });
      setReports(data.items);
      if (data.items.length > 0 && !activeReport) {
        // Load first report details
        const fullReport = await evidenceService.getLatestReport(data.items[0].evidence_id || '');
        setActiveReport(fullReport);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchEvidence = async () => {
      try {
        const res = await evidenceService.list({ page_size: 50, all_evidence: true });
        setEvidenceList(res.items);
        if (res.items.length > 0) {
          setSelectedEvidenceId(res.items[0].evidence_id);
        }
      } catch (err) {
        console.error('Failed to load evidence for report generation:', err);
      }
    };
    fetchEvidence();
    fetchReports();
  }, []);

  const handleGenerateReport = async () => {
    if (!selectedEvidenceId) return;
    setIsGenerating(true);
    setStatusMsg(null);
    try {
      await evidenceService.generateReport(selectedEvidenceId);
      setStatusMsg({ text: 'Report generation queued. Generating PDF...', type: 'success' });
      // Poll after 2.5 seconds
      setTimeout(async () => {
        await fetchReports();
        try {
          const rep = await evidenceService.getLatestReport(selectedEvidenceId);
          setActiveReport(rep);
        } catch {}
        setIsGenerating(false);
      }, 3000);
    } catch (err: any) {
      setStatusMsg({ text: err.response?.data?.detail || 'Report generation failed.', type: 'error' });
      setIsGenerating(false);
    }
  };

  const handleSelectReport = async (rep: ReportItem) => {
    try {
      const full = await evidenceService.getLatestReport(rep.evidence_id || '');
      setActiveReport(full);
    } catch {
      setActiveReport(rep);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Forensic Evidence Reports</h1>
          <p className="text-xs text-slate-400 mt-1">
            Evidence-grounded reports synthesized from cryptographic integrity checks, VeriFace AI, and blockchain records.
          </p>
        </div>

        {/* Generate New Report Trigger */}
        <div className="flex items-center space-x-2">
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

          <button
            onClick={handleGenerateReport}
            disabled={isGenerating || !selectedEvidenceId}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-md shadow-cyan-500/20 transition disabled:opacity-50"
          >
            {isGenerating ? (
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center space-x-2 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Main Layout: List & Report Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reports List */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
            Generated Reports ({reports.length})
          </h2>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {reports.map((r) => (
              <div
                key={r.report_id}
                onClick={() => handleSelectReport(r)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  activeReport?.report_id === r.report_id
                    ? 'bg-blue-600/15 border-blue-500/40 text-white shadow-sm'
                    : 'bg-[#090D16] border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-cyan-400">{r.report_id}</span>
                  <span className="text-[10px] text-slate-500 uppercase">{r.generation_method}</span>
                </div>
                <div className="text-xs font-medium text-slate-200 mt-1 truncate">{r.title}</div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {r.generated_at ? new Date(r.generated_at).toLocaleString() : 'Recent'}
                </div>
              </div>
            ))}

            {reports.length === 0 && !isLoading && (
              <div className="text-center py-8 text-xs text-slate-500">
                No reports generated yet. Select an evidence item above to compile a report.
              </div>
            )}
          </div>
        </div>

        {/* Report Preview */}
        <div className="lg:col-span-2 bg-slate-900/80 rounded-2xl border border-slate-800 p-6 space-y-4">
          {activeReport ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base font-bold text-white">{activeReport.title}</h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase">
                      {activeReport.status}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-cyan-400 mt-0.5">{activeReport.report_id}</div>
                </div>

                {activeReport.pdf_available && (
                  <a
                    href={evidenceService.downloadReportPdfUrl(activeReport.report_id)}
                    download
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center space-x-2 shadow-md shadow-blue-500/20 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </a>
                )}
              </div>

              {/* Formatted Report Text */}
              <div className="bg-[#090D16] p-5 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
                {activeReport.report_text || 'Report content is being compiled...'}
              </div>
            </div>
          ) : (
            <div className="text-center py-24 text-slate-500 text-xs">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-2" />
              <p>Select a report from the list to preview forensic findings.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

