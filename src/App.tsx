import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import BookingPage from './pages/BookingPage';
import SalonRequestPage from './pages/SalonRequestPage';
import SalonSelectionPage from './pages/SalonSelectionPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import InitialSetupPage from './pages/admin/InitialSetupPage';
import EmployeeManagementPage from './pages/admin/EmployeeManagementPage';

// Owner Pages
import OwnerDashboard from './pages/owner/OwnerDashboard';

// Employee Pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';

// Client Pages
import ClientDashboard from './pages/client/ClientDashboard';
import AuthCallback from './pages/AuthCallback';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/salon-request" element={<SalonRequestPage />} />
            <Route path="/salons" element={<SalonSelectionPage />} />
            <Route 
              path="/login" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <LoginPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <RegisterPage />
                </ProtectedRoute>
              } 
            />

            {/* Dashboard Route - Direct authentication */}
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Auth Callback (public) */}
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/setup" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <InitialSetupPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/employees" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <EmployeeManagementPage />
                </ProtectedRoute>
              } 
            />

            {/* Owner Routes */}
            <Route 
              path="/owner" 
              element={
                <ProtectedRoute allowedRoles={['owner']}>
                  <OwnerDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Employee Routes */}
            <Route 
              path="/employee" 
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Client Routes */}
            <Route 
              path="/client" 
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <ClientDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Booking Route */}
            <Route 
              path="/booking" 
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <BookingPage />
                </ProtectedRoute>
              } 
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;