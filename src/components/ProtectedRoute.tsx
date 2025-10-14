import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: User['role'][];
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = [], 
  requireAuth = true 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not logged in
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is logged in but doesn't have the required role
  if (requireAuth && user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on user role
    const dashboardPath = user.role === 'admin' ? '/admin' : 
                         user.role === 'employee' ? '/employee' : 
                         '/client';
    return <Navigate to={dashboardPath} replace />;
  }

  // If user is logged in and trying to access auth pages, redirect to dashboard
  if (user && (location.pathname === '/login' || location.pathname === '/register')) {
    const dashboardPath = user.role === 'admin' ? '/admin' : 
                         user.role === 'employee' ? '/employee' : 
                         '/client';
    return <Navigate to={dashboardPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
