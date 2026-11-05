export type UserRole = 'ceo' | 'admin' | 'investigator' | 'student';

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  organization?: string;
  created_at: string;
  last_login?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export type EvidenceStatus =
  | 'pending'
  | 'registered'
  | 'analyzing'
  | 'analyzed'
  | 'verified'
  | 'archived'
  | 'failed';

export interface EvidenceItem {
  id: number;
  evidence_id: string;
  original_filename: string;
  file_size_bytes: number;
  mime_type?: string;
  file_extension?: string;
  duration_seconds?: number;
  resolution?: string;
  sha256_hash?: string;
  status: EvidenceStatus;
  description?: string;
  tags?: string;
  uploaded_at: string;
  registered_at?: string;
  uploader_id: number;
}

export interface EvidenceListResponse {
  items: EvidenceItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface AnalysisFrame {
  id: number;
  frame_index: number;
  timestamp_ms?: number;
  manipulation_score?: number;
  is_suspicious?: boolean;
  face_detected?: boolean;
  thumbnail_path?: string;
}

export interface AnalysisResult {
  id: number;
  evidence_id: string;
  model_name: string;
  model_version: string;
  result_category:
    | 'potentially_manipulated'
    | 'no_manipulation_detected'
    | 'inconclusive'
    | 'analysis_unavailable'
    | 'analysis_failed';
  confidence_score?: number;
  manipulation_probability?: number;
  frames_analyzed?: number;
  frames_suspicious?: number;
  inference_time_seconds?: number;
  status: string;
  error_message?: string;
  limitations_note?: string;
  created_at: string;
}

export interface IntegrityVerification {
  evidence_id: string;
  registered_hash?: string;
  recalculated_hash?: string;
  hash_match?: boolean;
  signature_valid?: boolean;
  signature_detail?: string;
  blockchain_verified?: boolean;
  blockchain_detail?: string;
  overall_status: 'verified' | 'mismatch' | 'signature_invalid' | 'unavailable';
  detail?: string;
  verified_at: string;
}

export interface BlockchainTransaction {
  id: number;
  tx_hash?: string;
  block_number?: number;
  event_type: string;
  status: 'pending' | 'confirmed' | 'failed' | 'unavailable';
  network?: string;
  created_at?: string;
  confirmed_at?: string;
  error_message?: string;
}

export interface CustodyEvent {
  id: number;
  evidence_id: string;
  event_type: string;
  actor_name?: string;
  actor_role?: string;
  event_hash?: string;
  previous_event_hash?: string;
  file_hash_at_event?: string;
  signature_valid_at_event?: string;
  blockchain_tx_hash?: string;
  notes?: string;
  occurred_at: string;
}

export interface ReportItem {
  report_id: string;
  evidence_id?: string;
  title: string;
  status: string;
  generation_method: string;
  report_text?: string;
  pdf_available: boolean;
  generated_at?: string;
}

export interface DashboardMetrics {
  total_evidence: number;
  total_analyses: number;
  total_verified: number;
  total_blockchain_registrations: number;
  pending_operations: number;
  recent_evidence: Array<{
    evidence_id: string;
    original_filename: string;
    status: EvidenceStatus;
    uploaded_at?: string;
  }>;
  recent_custody_events: Array<{
    event_type: string;
    actor_name?: string;
    occurred_at: string;
  }>;
  analysis_summary: {
    potentially_manipulated: number;
    no_manipulation_detected: number;
    inconclusive: number;
    failed: number;
  };
  is_demonstration_data: boolean;
}

export interface TestExecution {
  execution_id: string;
  test_suite: string;
  status: 'running' | 'passed' | 'failed' | 'error';
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  skipped_tests: number;
  coverage_percent?: number;
  started_at?: string;
  completed_at?: string;
  is_demonstration_data: boolean;
}

export interface AuditLogItem {
  id: number;
  action: string;
  user_id?: number;
  resource_type?: string;
  success: boolean;
  detail?: string;
  occurred_at: string;
}

