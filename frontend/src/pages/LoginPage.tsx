import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { Shield, Lock, User, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const data = await authService.login(username, password);
      login(data.access_token, data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Sign In to VeriTrust AI</h2>
          <p className="text-xs text-slate-400">
            Enter your credentials to access the forensics & evidence verification platform.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Username or Email</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="investigator@veritrust.ai"
                className="w-full bg-[#090D16] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#090D16] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-md shadow-blue-500/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Login Credentials */}
        <div className="border-t border-slate-800 pt-4 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400">Demo Role Quick-Fill (Academic Evaluation):</div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('skshrivastav', 'Admin@1234')}
              className="px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-cyan-300 font-medium text-center border border-slate-700"
            >
              CEO / Lead
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('investigator1', 'Investigator@1234')}
              className="px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-blue-300 font-medium text-center border border-slate-700"
            >
              Investigator
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('student1', 'Student@1234')}
              className="px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-purple-300 font-medium text-center border border-slate-700"
            >
              Viewer
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          Need an account?{' '}
          <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

