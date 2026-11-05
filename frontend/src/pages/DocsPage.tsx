import React from 'react';
import { BookOpen, ExternalLink, ShieldCheck, GraduationCap, Cpu, KeyRound, Blocks, FlaskConical, FileText } from 'lucide-react';

export const DocsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-10 py-4">
      {/* Page Title */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold tracking-wide mb-3">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Academic Knowledge Demonstration Dossier</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">System Architecture & Research Foundations</h1>
        <p className="text-xs text-slate-400 mt-2">
          VeriTrust AI: An AI-Powered Digital Evidence Integrity, Verification and Security Platform Using Blockchain and Automated Testing.
        </p>
      </div>

      {/* Developer Attribution Card */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <h2 className="text-sm font-bold text-white">Project Authorship & Attribution</h2>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#090D16] p-4 rounded-xl border border-slate-800">
          <div>
            <div className="text-base font-bold text-white">Mr. S. K. Shrivastav</div>
            <div className="text-xs text-slate-400">Department of Artificial Intelligence & Data Science · Semester VII</div>
          </div>
          <a
            href="https://www.linkedin.com/in/s-k-shrivastav/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md shadow-cyan-500/20 transition"
          >
            <span>LinkedIn Profile</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Mapping to Seven Academic Subjects */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <GraduationCap className="w-5 h-5 text-indigo-400" />
          <span>Curriculum Subject Mapping (Semester VII KD)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              code: '23AI702',
              title: 'Software Testing Automation',
              contribution: 'Automated functional, cryptographic, RBAC regression, and Playwright UI tests.',
              evidence: 'Pytest test suite, CI automation matrix, pass/fail dashboard analytics.',
            },
            {
              code: '23AIE27',
              title: 'Blockchain & Crypto Tech',
              contribution: 'Solidity EvidenceRegistry smart contract, local Ethereum network integration, and custody ledger.',
              evidence: 'Contract code, deployed contract address, transaction hash verification.',
            },
            {
              code: '23AIE10',
              title: 'Generative AI',
              contribution: 'Grounded forensic reporting synthesizing structured JSON findings with deterministic fallback.',
              evidence: 'Prompt constraints, fact preservation, PDF automated export.',
            },
            {
              code: '23CS702',
              title: 'Cryptography & Network Security',
              contribution: 'SHA-256 chunk-based digest, Ed25519 asymmetric signatures, and JWT token authorization.',
              evidence: 'Cryptographic manifests, public key validation, bcrypt password hashing.',
            },
            {
              code: '23CS703',
              title: 'CNS Lab',
              contribution: 'Practical hash verification, digital signature experiments, and simulated tampering detection.',
              evidence: 'Demonstrated 1-byte file alteration causing immediate hash mismatch.',
            },
            {
              code: '23AEO01',
              title: 'Drone Design & Development',
              contribution: 'Simulated UAV aerial video evidence ingestion, capture metadata, and chain of custody tracking.',
              evidence: 'Drone flight media tags, operator ID recording, aerial integrity verification.',
            },
            {
              code: '23AI701',
              title: 'Professional Ethics in Engineering',
              contribution: 'Privacy protection, disclaimer of model limits, prohibition of premature guilt claims.',
              evidence: 'Mandatory human reviewer warnings, safe error handling, non-retention of raw video on-chain.',
            },
          ].map((sub, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-cyan-400">{sub.code}</span>
                <span className="text-[10px] text-slate-500 uppercase">{sub.title}</span>
              </div>
              <div className="text-slate-300 font-medium">{sub.contribution}</div>
              <div className="text-[11px] text-slate-500">Evaluation Evidence: {sub.evidence}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Academic Literature Review References */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span>Priority Research Citations (2025–2026)</span>
        </h2>

        <div className="space-y-3 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-[#090D16] border border-slate-800 space-y-1">
            <div className="font-semibold text-white">
              [1] Video Integrity Verification against Deepfake Alterations Using Aspects of Blockchain and SHA-256 Cryptographic Algorithm
            </div>
            <div className="text-slate-400 text-[11px]">IEEE · ComComAp 2025 · DOI: 10.1109/ComComAp68359.2025.11353195</div>
            <p className="text-slate-500 text-[10px]">Basis for VeriTrust AI's dual-tier AI + Cryptographic ledger integration.</p>
          </div>

          <div className="p-3 rounded-xl bg-[#090D16] border border-slate-800 space-y-1">
            <div className="font-semibold text-white">
              [2] Blockchain as a Tool to Improve Chain of Custody Procedures in Digital Forensics: A Systematic Review
            </div>
            <div className="text-slate-400 text-[11px]">LACCEI · 2025 · DOI: 10.18687/LACCEI2025.1.1.321</div>
            <p className="text-slate-500 text-[10px]">Justification for chronological hash-linked event tracking and actor identification.</p>
          </div>

          <div className="p-3 rounded-xl bg-[#090D16] border border-slate-800 space-y-1">
            <div className="font-semibold text-white">
              [3] Advancing Reliable Synthetic Video Detection: Insights from the SAFE Challenge
            </div>
            <div className="text-slate-400 text-[11px]">Forensic Science International: Digital Investigation · 2026 · DOI: 10.1016/j.fsidi.2026.302120</div>
            <p className="text-slate-500 text-[10px]">Benchmark methodology for frame sampling and detection uncertainty bounds.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

