import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FolderOpen,
  UploadCloud,
  Cpu,
  KeyRound,
  Blocks,
  GitCommitHorizontal,
  FileText,
  FlaskConical,
  Users,
  ScrollText,
  UserCheck,
  BookOpen,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { hasRole, isAuthenticated } = useAuth();

  const navSectionClass = 'text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2 mt-4';
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
      isActive
        ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold shadow-sm shadow-blue-500/10'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
    }`;

  if (!isAuthenticated) return null;

  return (
    <aside className="w-64 border-r border-slate-800 bg-[#090D16] flex flex-col h-[calc(100vh-4rem)] sticky top-16 select-none overflow-y-auto p-4">
      <div className="space-y-1">
        {/* Operations */}
        <div className={navSectionClass}>Operations</div>
        <NavLink to="/dashboard" className={navLinkClass}>
          <LayoutDashboard className="w-4 h-4 text-blue-400" />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/evidence" end className={navLinkClass}>
          <FolderOpen className="w-4 h-4 text-indigo-400" />
          <span>Evidence Library</span>
        </NavLink>
        <NavLink to="/evidence/upload" className={navLinkClass}>
          <UploadCloud className="w-4 h-4 text-cyan-400" />
          <span>Upload Evidence</span>
        </NavLink>

        {/* Verification Core */}
        <div className={navSectionClass}>Verification Engine</div>
        <NavLink to="/forensics" className={navLinkClass}>
          <Cpu className="w-4 h-4 text-purple-400" />
          <span>AI Deepfake Analysis</span>
        </NavLink>
        <NavLink to="/integrity" className={navLinkClass}>
          <KeyRound className="w-4 h-4 text-amber-400" />
          <span>Crypto Integrity & Sig</span>
        </NavLink>
        <NavLink to="/blockchain" className={navLinkClass}>
          <Blocks className="w-4 h-4 text-emerald-400" />
          <span>Blockchain Explorer</span>
        </NavLink>
        <NavLink to="/custody" className={navLinkClass}>
          <GitCommitHorizontal className="w-4 h-4 text-teal-400" />
          <span>Chain of Custody</span>
        </NavLink>

        {/* Intelligence & Quality */}
        <div className={navSectionClass}>Intelligence & QA</div>
        <NavLink to="/reports" className={navLinkClass}>
          <FileText className="w-4 h-4 text-sky-400" />
          <span>Forensic Reports</span>
        </NavLink>
        <NavLink to="/testing" className={navLinkClass}>
          <FlaskConical className="w-4 h-4 text-rose-400" />
          <span>Automated Testing QA</span>
        </NavLink>

        {/* Administration & Governance */}
        {(hasRole('ceo', 'admin')) && (
          <>
            <div className={navSectionClass}>Administration</div>
            <NavLink to="/users" className={navLinkClass}>
              <Users className="w-4 h-4 text-indigo-400" />
              <span>User Management</span>
            </NavLink>
            <NavLink to="/audit" className={navLinkClass}>
              <ScrollText className="w-4 h-4 text-amber-500" />
              <span>Audit Logs</span>
            </NavLink>
          </>
        )}

        {/* Resources */}
        <div className={navSectionClass}>Account & Docs</div>
        <NavLink to="/profile" className={navLinkClass}>
          <UserCheck className="w-4 h-4 text-slate-400" />
          <span>Profile & Settings</span>
        </NavLink>
        <NavLink to="/docs" className={navLinkClass}>
          <BookOpen className="w-4 h-4 text-slate-400" />
          <span>Documentation & Ethics</span>
        </NavLink>
      </div>

      {/* Academic KD Banner */}
      <div className="mt-auto pt-6">
        <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400">
          <div className="font-semibold text-slate-300 mb-0.5">Semester VII KD</div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Academic demonstration platform connecting AI, Crypto, Blockchain & Testing.
          </p>
        </div>
      </div>
    </aside>
  );
};

