import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { UserCheck, Shield, Building, Mail, User, Save, CheckCircle2 } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [organization, setOrganization] = useState(user?.organization || '');
  const [bio, setBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess(false);
    try {
      const updated = await authService.updateProfile({
        full_name: fullName,
        organization,
        bio,
      });
      updateUser(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Investigator Profile & Settings</h1>
        <p className="text-xs text-slate-400 mt-1">
          Review your credentials, authorized forensic role, and affiliation.
        </p>
      </div>

      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 md:p-8 space-y-6">
        {/* User Identity Header */}
        <div className="flex items-center space-x-4 border-b border-slate-800 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-[2px]">
            <div className="w-full h-full bg-[#090D16] rounded-[14px] flex items-center justify-center text-xl font-bold text-cyan-400">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{user?.full_name}</h2>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="text-xs text-slate-400 font-mono">@{user?.username}</span>
              <span className="text-slate-600">·</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30 uppercase">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Profile settings saved successfully.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#090D16] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full bg-[#090D16]/50 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-500 cursor-not-allowed"
            />
            <span className="text-[10px] text-slate-600 mt-1 block">Email is locked for forensic audit identity preservation.</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Organization / Agency</label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="e.g. State Forensic Science Laboratory"
              className="w-full bg-[#090D16] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center space-x-2 shadow-md shadow-blue-500/20 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile</span>
          </button>
        </form>
      </div>
    </div>
  );
};

