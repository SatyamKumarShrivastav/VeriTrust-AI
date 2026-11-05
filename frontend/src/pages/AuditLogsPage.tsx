import React, { useState, useEffect } from 'react';
import { systemService } from '../services/api';
import type { AuditLogItem } from '../types';
import { ScrollText, Shield, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await systemService.getAuditLogs({ page_size: 50 });
        setLogs(res.items);
        setTotal(res.total);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Security Audit Logs</h1>
        <p className="text-xs text-slate-400 mt-1">
          Immutable system log of authentication, access grants, evidence ingestion, and verification actions ({total} events).
        </p>
      </div>

      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090D16] border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Event Time</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Resource</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 text-slate-400 text-[11px] font-mono">
                      {new Date(log.occurred_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-200 uppercase tracking-wide text-[11px]">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-slate-400 capitalize">{log.resource_type || 'system'}</td>
                    <td className="py-3 px-4">
                      {log.success ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-400 text-[11px] font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>SUCCESS</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-red-400 text-[11px] font-medium">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>FAILED</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">{log.detail || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs">
            <ScrollText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p>No audit logs recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

