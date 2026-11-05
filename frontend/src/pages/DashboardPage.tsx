import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { systemService } from '../services/api';
import type { DashboardMetrics } from '../types';
import {
  ShieldCheck,
  FolderOpen,
  Cpu,
  KeyRound,
  Blocks,
  Clock,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle,
  FileText,
  Activity,
  GitCommitHorizontal,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await systemService.getMetrics();
        setMetrics(data);
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const analysisChartData = metrics
    ? [
        { name: 'Potentially Manipulated', value: metrics.analysis_summary.potentially_manipulated, color: '#EF4444' },
        { name: 'No Manipulation Detected', value: metrics.analysis_summary.no_manipulation_detected, color: '#10B981' },
        { name: 'Inconclusive', value: metrics.analysis_summary.inconclusive, color: '#F59E0B' },
        { name: 'Unavailable / Failed', value: metrics.analysis_summary.failed, color: '#64748B' },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Forensic Intelligence Operations</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time status of digital evidence integrity, VeriFace AI analyses, and blockchain ledger provenance.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/evidence/upload"
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition-all"
          >
            <span>Register Evidence</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Evidence</span>
            <FolderOpen className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{metrics?.total_evidence ?? 0}</div>
          <div className="text-[11px] text-slate-500">Tracked in registry</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">AI Analyses</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">{metrics?.total_analyses ?? 0}</div>
          <div className="text-[11px] text-purple-400 font-medium">VeriFace inference</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Integrity Verified</span>
            <KeyRound className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{metrics?.total_verified ?? 0}</div>
          <div className="text-[11px] text-emerald-400 font-medium">SHA-256 match confirmed</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">On-Chain Anchored</span>
            <Blocks className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">{metrics?.total_blockchain_registrations ?? 0}</div>
          <div className="text-[11px] text-cyan-400 font-medium">Blockchain confirmed</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Pending Tasks</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{metrics?.pending_operations ?? 0}</div>
          <div className="text-[11px] text-slate-500">In background queue</div>
        </div>
      </div>

      {/* Main Charts & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deepfake Analysis Distribution */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span>AI Deepfake Assessments</span>
            </h2>
            <Link to="/forensics" className="text-xs text-blue-400 hover:text-blue-300">
              Details
            </Link>
          </div>

          {analysisChartData.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analysisChartData}
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {analysisChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#090D16', borderColor: '#1E293B', borderRadius: '8px', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {analysisChartData.map((d, i) => (
                  <div key={i} className="flex items-center space-x-1.5 text-[11px] text-slate-400">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="truncate">{d.name}: {d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-center p-4 text-slate-500 text-xs">
              <Cpu className="w-8 h-8 text-slate-600 mb-2" />
              <span>No AI analyses run yet.</span>
              <span className="text-[10px] text-slate-600 mt-1">Upload a video to initiate detection.</span>
            </div>
          )}
        </div>

        {/* Recent Evidence Items */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <FolderOpen className="w-4 h-4 text-indigo-400" />
              <span>Recent Evidence</span>
            </h2>
            <Link to="/evidence" className="text-xs text-blue-400 hover:text-blue-300">
              View All
            </Link>
          </div>

          <div className="space-y-2.5">
            {metrics?.recent_evidence && metrics.recent_evidence.length > 0 ? (
              metrics.recent_evidence.map((item) => (
                <Link
                  key={item.evidence_id}
                  to={`/evidence/${item.evidence_id}`}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#090D16] border border-slate-800/80 hover:border-slate-700 transition"
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-semibold text-slate-200 truncate">{item.original_filename}</div>
                    <div className="text-[10px] font-mono text-cyan-400">{item.evidence_id}</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider shrink-0 ${
                      item.status === 'verified'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : item.status === 'registered'
                        ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {item.status}
                  </span>
                </Link>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">No evidence items registered yet.</div>
            )}
          </div>
        </div>

        {/* Recent Custody Audit Events */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <GitCommitHorizontal className="w-4 h-4 text-teal-400" />
              <span>Chain of Custody Events</span>
            </h2>
            <Link to="/custody" className="text-xs text-blue-400 hover:text-blue-300">
              Ledger
            </Link>
          </div>

          <div className="space-y-2.5">
            {metrics?.recent_custody_events && metrics.recent_custody_events.length > 0 ? (
              metrics.recent_custody_events.map((e, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-[#090D16] border border-slate-800/80 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-teal-300 text-[11px] uppercase tracking-wider">
                      {e.event_type}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(e.occurred_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">Actor: {e.actor_name || 'System'}</div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">No custody events recorded yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

