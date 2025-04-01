import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Loading from './components/common/Loading';

// Lazy loaded components
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const MonitoringPage = lazy(() => import('./pages/MonitoringPage'));
const ForensicsPage = lazy(() => import('./pages/ForensicsPage'));
const ControlPanelPage = lazy(() => import('./pages/ControlPanelPage'));

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <Loading />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  const { checkAuthStatus } = useAuth();
  
  useEffect(() => {
    // Check if user is authenticated when app loads
    checkAuthStatus();
  }, [checkAuthStatus]);
  
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        
        <Route path="/monitoring" element={
          <ProtectedRoute>
            <MonitoringPage />
          </ProtectedRoute>
        } />
        
        <Route path="/forensics" element={
          <ProtectedRoute>
            <ForensicsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/control-panel" element={
          <ProtectedRoute>
            <ControlPanelPage />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;