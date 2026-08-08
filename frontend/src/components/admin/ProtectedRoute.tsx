import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute: React.FC = () => {
  const { user, token, isLoading, isStaff } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--admin-bg)] text-[var(--admin-text-primary)] flex items-center justify-center font-mono text-xs">
        Validating administrative staff credentials...
      </div>
    );
  }

  if (!token || !user || !isStaff) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};
