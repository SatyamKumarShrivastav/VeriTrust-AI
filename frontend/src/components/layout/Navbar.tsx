import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { systemService } from '../../services/api';
import { Shield, ExternalLink, User, LogOut, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [health, setHealth] = useState<{ database: boolean; blockchain: boolean; ai_model: boolean } | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const data = await systemService.getHealth();
        setHealth(data);
      } catch {
        setHealth({ database: false, blockchain: false, ai_model: false });
      }
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 border-b border-slate-800 bg-[#090D16]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Developer */}
      <div className="flex items-center space-x-6">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[1.5px] flex items-center justify-center shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-[#090D16] rounded-[7px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-white tracking-wide">VeriTrust</span>
              <span className="px-1.5 py-0.5 text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded">AI</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Detect. Verify. Preserve.</p>
          </div>
        </Link>

        {/* Developer Attribution with LinkedIn Link */}
        <div className="hidden lg:flex items-center pl-6 border-l border-slate-800/80">
          <span className="text-xs text-slate-400 mr-2">Lead Developer:</span>
          <a
            href="https://www.linkedin.com/in/s-k-shrivastav/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors bg-cyan-950/40 px-2.5 py-1 rounded-full border border-cyan-800/50 hover:border-cyan-600"
          >
            <span>Mr. S. K. Shrivastav</span>
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>
      </div>

      {/* System Status & User Actions */}
      <div className="flex items-center space-x-4">
        {/* Node Status Indicators */}
        <div className="hidden md:flex items-center space-x-3 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${health?.database ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-slate-400">MySQL</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${health?.blockchain ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span className="text-slate-400">Ledger</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${health?.ai_model ? 'bg-emerald-400' : 'bg-blue-400'}`} />
            <span className="text-slate-400">VeriFace</span>
          </div>
        </div>

        {isAuthenticated && user ? (
          <div className="flex items-center space-x-3">
            <Link
              to="/profile"
              className="flex items-center space-x-2.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-xs font-semibold text-blue-300 uppercase">
                {user.full_name?.charAt(0) || user.username?.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-slate-200">{user.full_name}</div>
                <div className="text-[10px] text-cyan-400 uppercase tracking-wider">{user.role}</div>
              </div>
            </Link>

            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Link
              to="/login"
              className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 px-3.5 py-1.5 rounded-lg shadow-sm shadow-blue-500/30 transition"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

