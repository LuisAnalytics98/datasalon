import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardPage: React.FC = () => {
  const { user, loading } = useAuth();

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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'employee':
      return <Navigate to="/employee" replace />;
    case 'client':
      return <Navigate to="/client" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default DashboardPage;
