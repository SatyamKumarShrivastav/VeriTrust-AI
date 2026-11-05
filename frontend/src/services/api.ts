import axios from 'axios';
import type {
  User,
  EvidenceItem,
  EvidenceListResponse,
  AnalysisResult,
  IntegrityVerification,
  BlockchainTransaction,
  CustodyEvent,
  ReportItem,
  DashboardMetrics,
  TestExecution,
  AuditLogItem,
} from '../types';

const API_BASE_URL = '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Bearer token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('veritrust_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 unauthorized errors gracefully
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('veritrust_token');
      localStorage.removeItem('veritrust_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ──────────────────────────────────────────────────
export const authService = {
  login: async (username: string, password: string) => {
    const res = await apiClient.post('/auth/login', { username, password });
    return res.data;
  },
  register: async (userData: {
    email: string;
    username: string;
    full_name: string;
    password: string;
    organization?: string;
  }) => {
    const res = await apiClient.post('/auth/register', userData);
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },
  updateProfile: async (data: { full_name?: string; organization?: string; bio?: string }): Promise<User> => {
    const res = await apiClient.patch('/auth/me', data);
    return res.data;
  },
  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('veritrust_token');
      localStorage.removeItem('veritrust_user');
    }
  },
};

// ─── Evidence API ──────────────────────────────────────────────
export const evidenceService = {
  upload: async (
    file: File,
    description?: string,
    tags?: string,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<EvidenceItem> => {
    const formData = new FormData();
    formData.append('file', file);
    if (description) formData.append('description', description);
    if (tags) formData.append('tags', tags);

    const res = await apiClient.post('/evidence', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    });
    return res.data;
  },

  list: async (params?: {
    page?: number;
    page_size?: number;
    status?: string;
    search?: string;
    all_evidence?: boolean;
  }): Promise<EvidenceListResponse> => {
    const res = await apiClient.get('/evidence', { params });
    return res.data;
  },

  getById: async (evidenceId: string): Promise<EvidenceItem> => {
    const res = await apiClient.get(`/evidence/${evidenceId}`);
    return res.data;
  },

  archive: async (evidenceId: string): Promise<void> => {
    await apiClient.delete(`/evidence/${evidenceId}`);
  },

  // AI Deepfake Analysis
  triggerAnalysis: async (evidenceId: string): Promise<{ message: string; status: string }> => {
    const res = await apiClient.post(`/evidence/${evidenceId}/analyze`);
    return res.data;
  },

  getAnalysis: async (evidenceId: string): Promise<AnalysisResult> => {
    const res = await apiClient.get(`/evidence/${evidenceId}/analysis`);
    return res.data;
  },

  // Cryptographic Verification
  verifyIntegrity: async (evidenceId: string): Promise<IntegrityVerification> => {
    const res = await apiClient.post(`/evidence/${evidenceId}/verify`);
    return res.data;
  },

  getIntegrity: async (evidenceId: string): Promise<IntegrityVerification> => {
    const res = await apiClient.get(`/evidence/${evidenceId}/integrity`);
    return res.data;
  },

  // Blockchain Ledger
  registerBlockchain: async (evidenceId: string): Promise<any> => {
    const res = await apiClient.post(`/evidence/${evidenceId}/register`);
    return res.data;
  },

  getBlockchainStatus: async (
    evidenceId: string
  ): Promise<{ evidence_id: string; transactions: BlockchainTransaction[] }> => {
    const res = await apiClient.get(`/evidence/${evidenceId}/blockchain`);
    return res.data;
  },

  // Chain of Custody
  getCustodyEvents: async (
    evidenceId: string
  ): Promise<{ evidence_id: string; events: CustodyEvent[] }> => {
    const res = await apiClient.get(`/evidence/${evidenceId}/custody-events`);
    return res.data;
  },

  // Reports
  generateReport: async (evidenceId: string): Promise<{ message: string }> => {
    const res = await apiClient.post(`/evidence/${evidenceId}/reports`);
    return res.data;
  },

  getLatestReport: async (evidenceId: string): Promise<ReportItem> => {
    const res = await apiClient.get(`/evidence/${evidenceId}/reports/latest`);
    return res.data;
  },

  downloadReportPdfUrl: (reportId: string): string => {
    return `/api/v1/reports/${reportId}/download`;
  },
};

// ─── Dashboard & Admin API ────────────────────────────────────
export const systemService = {
  getMetrics: async (): Promise<DashboardMetrics> => {
    const res = await apiClient.get('/dashboard/metrics');
    return res.data;
  },

  getReportsList: async (params?: { page?: number; page_size?: number }): Promise<{ items: ReportItem[]; total: number; page: number }> => {
    const res = await apiClient.get('/reports', { params });
    return res.data;
  },

  getAuditLogs: async (params?: { page?: number; page_size?: number }): Promise<{ items: AuditLogItem[]; total: number; page: number }> => {
    const res = await apiClient.get('/audit-logs', { params });
    return res.data;
  },

  getTestResults: async (): Promise<{ executions: TestExecution[] }> => {
    const res = await apiClient.get('/tests/results');
    return res.data;
  },

  getUsersList: async (): Promise<User[]> => {
    const res = await apiClient.get('/users');
    return res.data;
  },

  updateUserRole: async (userId: number, role: string): Promise<{ message: string }> => {
    const res = await apiClient.patch(`/users/${userId}/role`, null, { params: { role } });
    return res.data;
  },

  getHealth: async (): Promise<{ status: string; database: boolean; blockchain: boolean; ai_model: boolean }> => {
    const res = await apiClient.get('/health');
    return res.data;
  },
};

