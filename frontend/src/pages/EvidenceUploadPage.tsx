import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { evidenceService } from '../services/api';
import type { EvidenceItem } from '../types';
import {
  UploadCloud,
  FileVideo,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Cpu,
  KeyRound,
  Blocks,
} from 'lucide-react';

const ALLOWED_EXTENSIONS = ['mp4', 'avi', 'mov', 'mkv', 'webm', 'mpeg'];
const MAX_SIZE_MB = 500;

export const EvidenceUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedEvidence, setUploadedEvidence] = useState<EvidenceItem | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const ext = file.name.split('.').pop()?.toLowerCase();

      if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
        setError(`Unsupported file format (.${ext}). Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
        setSelectedFile(null);
        return;
      }

      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds ${MAX_SIZE_MB}MB limit.`);
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a valid digital media file.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const result = await evidenceService.upload(
        selectedFile,
        description,
        tags,
        (progressEvent) => {
          if (progressEvent.total) {
            const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(pct);
          }
        }
      );
      setUploadedEvidence(result);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Evidence upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Register & Ingest Digital Evidence</h1>
        <p className="text-xs text-slate-400 mt-1">
          Upload media files to initiate cryptographic fingerprinting (SHA-256), manifest signing (Ed25519), and blockchain anchoring.
        </p>
      </div>

      {/* Success Notification Card */}
      {uploadedEvidence && (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-emerald-500/40 shadow-2xl space-y-4 animate-in fade-in">
          <div className="flex items-center space-x-3 text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
            <h2 className="text-base font-bold text-white">Evidence Registered Successfully</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#090D16] p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-500">Evidence ID:</span>
              <div className="font-mono font-bold text-cyan-400 text-sm">{uploadedEvidence.evidence_id}</div>
            </div>
            <div>
              <span className="text-slate-500">Original Filename:</span>
              <div className="text-slate-200 font-medium truncate">{uploadedEvidence.original_filename}</div>
            </div>
            <div>
              <span className="text-slate-500">File Size:</span>
              <div className="text-slate-200">{(uploadedEvidence.file_size_bytes / (1024 * 1024)).toFixed(2)} MB</div>
            </div>
            <div>
              <span className="text-slate-500">Status:</span>
              <div className="text-emerald-400 font-semibold uppercase">{uploadedEvidence.status}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => navigate(`/evidence/${uploadedEvidence.evidence_id}`)}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center space-x-1.5 transition"
            >
              <span>View Evidence Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setUploadedEvidence(null);
                setSelectedFile(null);
                setDescription('');
                setTags('');
                setUploadProgress(null);
              }}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
            >
              Upload Another Item
            </button>
          </div>
        </div>
      )}

      {/* Upload Form */}
      {!uploadedEvidence && (
        <form onSubmit={handleUpload} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          {error && (
            <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Drag & Drop Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              selectedFile
                ? 'border-blue-500/60 bg-blue-500/5'
                : 'border-slate-700 hover:border-slate-500 bg-[#090D16]/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".mp4,.avi,.mov,.mkv,.webm,.mpeg"
              className="hidden"
            />

            {selectedFile ? (
              <div className="space-y-2">
                <FileVideo className="w-12 h-12 text-blue-400 mx-auto" />
                <div className="text-sm font-semibold text-slate-200">{selectedFile.name}</div>
                <div className="text-xs text-slate-400">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Click to choose different file
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <UploadCloud className="w-12 h-12 text-slate-500 mx-auto" />
                <div className="text-sm font-semibold text-slate-300">
                  Click to select video evidence or drag & drop here
                </div>
                <div className="text-xs text-slate-500">
                  Supported: MP4, AVI, MOV, MKV, WEBM (Up to {MAX_SIZE_MB}MB)
                </div>
              </div>
            )}
          </div>

          {/* Description & Tags */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Case / Incident Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details of capture location, forensic case reference, chain-of-custody transfer notes..."
                className="w-full bg-[#090D16] border border-slate-700 rounded-lg p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Tags (Comma-separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="uav-drone, facial-tampering, high-confidence, cctv"
                className="w-full bg-[#090D16] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Progress Bar */}
          {uploadProgress !== null && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Uploading evidence to secure storage...</span>
                <span className="font-semibold text-blue-400">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!selectedFile || isUploading}
            className="w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Upload & Initiate Cryptographic Ingestion</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

