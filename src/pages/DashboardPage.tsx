import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthDebug from '../components/AuthDebug';

const DashboardPage: React.FC = () => {
  const { user, loading } = useAuth();
  const [forceRedirect, setForceRedirect] = useState(false);

  console.log('DashboardPage render:', { user, loading, forceRedirect });

  // Force redirect after 5 seconds if still loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.log('Force redirect due to loading timeout');
        setForceRedirect(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [loading]);

  // If force redirect is needed
  if (forceRedirect && user) {
    console.log('Force redirecting based on user role:', user.role);
    const dashboardPath = user.role === 'admin' ? '/admin' : 
                         user.role === 'employee' ? '/employee' : 
                         user.role === 'owner' ? '/owner' :
                         '/client';
    return <Navigate to={dashboardPath} replace />;
  }

  // Show loading while AuthContext is loading
  if (loading) {
    console.log('Still loading...');
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando dashboard...</p>
          <p className="text-gray-500 text-sm mt-2">Si esto tarda más de 5 segundos, se redirigirá automáticamente</p>
        </div>
        <AuthDebug />
      </div>
    );
  }

  // If no user after loading is complete, redirect to login
  if (!user) {
    console.log('No user after loading complete, redirecting to login');
    return (
      <>
        <Navigate to="/login" replace />
        <AuthDebug />
      </>
    );
  }

  console.log('User found, redirecting based on role:', user.role);
  console.log('User role details:', { role: user.role, email: user.email, id: user.id });

  // Redirect based on user role
  switch (user.role) {
    case 'admin':
      console.log('Redirecting to admin dashboard');
      console.log('Navigation should happen now');
      return (
        <>
          <Navigate to="/admin" replace />
          <AuthDebug />
        </>
      );
    case 'owner':
      console.log('Redirecting to owner dashboard');
      return (
        <>
          <Navigate to="/owner" replace />
          <AuthDebug />
        </>
      );
    case 'employee':
      console.log('Redirecting to employee dashboard');
      return (
        <>
          <Navigate to="/employee" replace />
          <AuthDebug />
        </>
      );
    case 'client':
      console.log('Redirecting to client dashboard');
      return (
        <>
          <Navigate to="/client" replace />
          <AuthDebug />
        </>
      );
    default:
      console.log('Unknown role, redirecting to login');
      return (
        <>
          <Navigate to="/login" replace />
          <AuthDebug />
        </>
      );
  }
};

export default DashboardPage;
