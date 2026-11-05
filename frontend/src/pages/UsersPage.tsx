import React, { useState, useEffect } from 'react';
import { systemService } from '../services/api';
import type { User } from '../types';
import { Users, Shield, UserCheck, AlertCircle } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await systemService.getUsersList();
      setUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch users. Admin privileges required.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await systemService.updateUserRole(userId, newRole);
      await fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to change role.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">User Management & Access Control</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage system users and role permissions (CEO, Administrator, Investigator, Viewer).
        </p>
      </div>

      {error ? (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : (
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090D16] border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Current Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4 text-right">Assign Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-medium text-slate-200">
                      <div>{u.full_name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">@{u.username}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-emerald-400 text-xs font-semibold">Active</span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="bg-[#090D16] border border-slate-700 rounded px-2 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-blue-500"
                      >
                        <option value="ceo">CEO / Lead</option>
                        <option value="admin">Administrator</option>
                        <option value="investigator">Investigator</option>
                        <option value="student">Student / Viewer</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

