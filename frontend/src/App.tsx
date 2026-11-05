import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { EvidenceListPage } from './pages/EvidenceListPage';
import { EvidenceUploadPage } from './pages/EvidenceUploadPage';
import { EvidenceDetailPage } from './pages/EvidenceDetailPage';
import { ForensicsPage } from './pages/ForensicsPage';
import { IntegrityPage } from './pages/IntegrityPage';
import { BlockchainPage } from './pages/BlockchainPage';
import { CustodyPage } from './pages/CustodyPage';
import { ReportsPage } from './pages/ReportsPage';
import { TestingDashboardPage } from './pages/TestingDashboardPage';
import { UsersPage } from './pages/UsersPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { ProfilePage } from './pages/ProfilePage';
import { DocsPage } from './pages/DocsPage';

// Protected Route wrapper component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090D16] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Top-Level Layout Routes */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/docs" element={<DocsPage />} />

            {/* Protected Application Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/evidence"
              element={
                <ProtectedRoute>
                  <EvidenceListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/evidence/upload"
              element={
                <ProtectedRoute>
                  <EvidenceUploadPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/evidence/:evidenceId"
              element={
                <ProtectedRoute>
                  <EvidenceDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/forensics"
              element={
                <ProtectedRoute>
                  <ForensicsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/integrity"
              element={
                <ProtectedRoute>
                  <IntegrityPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/blockchain"
              element={
                <ProtectedRoute>
                  <BlockchainPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/custody"
              element={
                <ProtectedRoute>
                  <CustodyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/testing"
              element={
                <ProtectedRoute>
                  <TestingDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit"
              element={
                <ProtectedRoute>
                  <AuditLogsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
