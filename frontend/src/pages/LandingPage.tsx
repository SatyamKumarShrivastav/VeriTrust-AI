import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Fingerprint,
  Cpu,
  Blocks,
  FileCheck2,
  FlaskConical,
  ExternalLink,
  ArrowRight,
  Lock,
  Eye,
  CheckCircle2,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold tracking-wide">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>Semester VII Knowledge Demonstration Platform</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Detect the Fake. <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400">
            Verify the Evidence.
          </span>{' '}
          <br className="hidden sm:inline" />
          Preserve the Trust.
        </h1>

        <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          VeriTrust AI is a unified digital forensics intelligence platform that bridges deepfake AI detection, SHA-256 cryptographic manifests, Ed25519 digital signatures, tamper-evident blockchain registration, and evidence-grounded generative reporting.
        </p>

        {/* Developer Attribution Card */}
        <div className="inline-block p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl max-w-md mx-auto">
          <div className="text-xs text-slate-400 mb-1">Project Designed & Developed by</div>
          <div className="flex items-center justify-center space-x-3">
            <span className="text-base font-bold text-white">Mr. S. K. Shrivastav</span>
            <a
              href="https://www.linkedin.com/in/s-k-shrivastav/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-700/60 transition-all hover:scale-105"
            >
              <span>Connect on LinkedIn</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            AI · Digital Forensics · Cryptography · Blockchain · Automated QA
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02]"
          >
            <span>Launch VeriTrust AI</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm flex items-center justify-center space-x-2 transition-all"
          >
            <span>Sign In to Dashboard</span>
          </Link>
        </div>
      </div>

      {/* The 5 Core Forensic Questions */}
      <div className="max-w-5xl mx-auto bg-slate-900/60 rounded-2xl border border-slate-800 p-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl md:text-2xl font-bold text-white">The Five Forensic Questions Answered</h2>
          <p className="text-xs md:text-sm text-slate-400">
            VeriTrust AI clearly separates media authenticity assessment, file integrity, identity verification, and provenance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            {
              q: 'Does media show signs of manipulation?',
              sub: 'AI Deepfake Analysis',
              desc: 'Frame-level feature extraction with documented uncertainty and limitations.',
              color: 'text-purple-400',
              border: 'border-purple-500/30',
            },
            {
              q: 'Has evidence changed since registration?',
              sub: 'SHA-256 Fingerprint',
              desc: 'Recalculates file hash in 1MB chunks to detect bit-level modifications.',
              color: 'text-amber-400',
              border: 'border-amber-500/30',
            },
            {
              q: 'Can recorded history be checked?',
              sub: 'Blockchain Ledger',
              desc: 'Immutable on-chain fingerprint anchoring without exposing raw media.',
              color: 'text-emerald-400',
              border: 'border-emerald-500/30',
            },
            {
              q: 'Who uploaded, accessed, or transferred?',
              sub: 'Chain of Custody',
              desc: 'Cryptographically linked events with actor, IP, timestamp and hash chain.',
              color: 'text-teal-400',
              border: 'border-teal-500/30',
            },
            {
              q: 'Can a report explain verified results?',
              sub: 'Grounded Forensic Report',
              desc: 'Deterministic & LLM synthesis anchored strictly to factual database records.',
              color: 'text-cyan-400',
              border: 'border-cyan-500/30',
            },
          ].map((item, idx) => (
            <div key={idx} className={`p-4 rounded-xl bg-[#0B1120] border ${item.border} flex flex-col justify-between space-y-2`}>
              <div>
                <span className="text-[10px] font-mono text-slate-500">Q0{idx + 1}</span>
                <h3 className="text-xs font-bold text-slate-200 mt-1 leading-snug">{item.q}</h3>
              </div>
              <div>
                <div className={`text-[11px] font-semibold ${item.color}`}>{item.sub}</div>
                <p className="text-[11px] text-slate-400 mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5 Integrated Technologies */}
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Five Pillars of VeriTrust AI</h2>
          <p className="text-sm text-slate-400">Integrated full-stack engineering across multi-disciplinary domains.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">AI Deepfake Detection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Integrates OpenCV video processing with VeriFace AI architecture to extract frames, detect suspicious facial anomalies, and provide frame-level temporal risk scores.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Fingerprint className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Cryptographic Integrity</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Computes 256-bit cryptographic fingerprints, creates standardized JSON evidence manifests, and applies Ed25519 digital signatures to guarantee non-repudiation.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Blocks className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Blockchain Provenance</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Smart contracts on Ethereum-compatible networks store non-sensitive evidence digests and transfer milestones, creating an append-only audit ledger.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Grounded Generative AI</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transforms structured verification JSON into comprehensive, human-readable forensic reports with deterministic fallback mode and PDF generation.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <FlaskConical className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Automated Testing & QA</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pytest, HTTPX, and Playwright automated suites test file tampering detection, cryptographic signatures, authorization barriers, and API contracts.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Role-Based Access Control</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Strict RBAC separating Super Administrator (CEO), Administrator, Investigator, and Viewer roles. Restricts unauthorized cross-user evidence inspection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

