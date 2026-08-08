import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute: React.FC = () => {
  const { user, token, isLoading, isSecurityStaff } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center font-mono text-xs">
        Validating staff authorization credentials...
      </div>
    );
  }

  if (!token || !user || !isSecurityStaff) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};
