import React from 'react';
import { ExternalLink, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800 bg-[#090D16] text-xs text-slate-500 py-6 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-slate-300 font-medium">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>VeriTrust AI Platform</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Detect the Fake. Verify the Evidence. Preserve the Trust.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-[11px]">
          <span>Designed & Developed by</span>
          <a
            href="https://www.linkedin.com/in/s-k-shrivastav/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-cyan-400 hover:text-cyan-300 inline-flex items-center transition-colors"
          >
            <span>Mr. S. K. Shrivastav</span>
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>

        <div className="text-[11px] text-slate-500 text-center md:text-right">
          <p>Semester VII Knowledge Demonstration · B.Tech Artificial Intelligence & Data Science</p>
          <p className="text-[10px] text-slate-600">Academic demonstration system. Human expert review required for forensic conclusions.</p>
        </div>
      </div>
    </footer>
  );
};

