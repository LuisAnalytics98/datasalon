import React from 'react';
import { useAuth } from '../context/AuthContext';

const AuthDebug: React.FC = () => {
  const { user, loading, salon } = useAuth();

  return (
    <div className="fixed top-4 right-4 bg-black/90 text-white p-4 rounded-lg border border-yellow-400 z-50 max-w-sm">
      <h3 className="text-yellow-400 font-bold mb-2">Auth Debug</h3>
      <div className="text-xs space-y-1">
        <div>Loading: {loading ? 'true' : 'false'}</div>
        <div>User: {user ? 'exists' : 'null'}</div>
        {user && (
          <>
            <div>Email: {user.email}</div>
            <div>Role: {user.role}</div>
            <div>ID: {user.id}</div>
          </>
        )}
        <div>Salon: {salon ? 'exists' : 'null'}</div>
        {salon && (
          <>
            <div>Salon Name: {salon.name}</div>
            <div>Salon ID: {salon.id}</div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthDebug;
