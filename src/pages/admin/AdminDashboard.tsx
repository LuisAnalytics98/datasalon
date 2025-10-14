import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dashboardService, appointmentService, employeeService, serviceService } from '../../services/api';
import { DashboardStats } from '../../types';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Plus,
  Settings,
  LogOut,
  Bell,
  BarChart3
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user, salon, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!salon) return;
      
      try {
        const today = new Date().toISOString().split('T')[0];
        const dashboardStats = await dashboardService.getStats(salon.id, today);
        setStats(dashboardStats);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [salon]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-yellow-400">DataSalon</h1>
              <span className="ml-4 text-gray-400">Admin Dashboard</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-yellow-400 transition-colors">
                <Bell className="w-6 h-6" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-black font-bold text-sm">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </span>
                </div>
                <span className="text-gray-300">{user?.firstName} {user?.lastName}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 min-h-screen border-r border-gray-700">
          <nav className="p-4">
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'overview' 
                    ? 'bg-yellow-400 text-black' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span>Resumen</span>
              </button>
              
              <button
                onClick={() => setActiveTab('appointments')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'appointments' 
                    ? 'bg-yellow-400 text-black' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span>Citas</span>
              </button>
              
              <button
                onClick={() => setActiveTab('employees')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'employees' 
                    ? 'bg-yellow-400 text-black' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Users className="w-5 h-5" />
                <span>Empleados</span>
              </button>
              
              <button
                onClick={() => setActiveTab('services')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'services' 
                    ? 'bg-yellow-400 text-black' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>Servicios</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Resumen del Salón</h2>
                <p className="text-gray-400">Bienvenido, {user?.firstName}. Aquí tienes un resumen de tu salón.</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Citas Hoy</p>
                      <p className="text-3xl font-bold text-white">{stats?.todayAppointments || 0}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-yellow-400" />
                  </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Ingresos del Mes</p>
                      <p className="text-3xl font-bold text-white">${stats?.totalRevenue || 0}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-400" />
                  </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Empleados Activos</p>
                      <p className="text-3xl font-bold text-white">{stats?.activeEmployees || 0}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-400" />
                  </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Servicios Populares</p>
                      <p className="text-3xl font-bold text-white">{stats?.popularServices?.length || 0}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-400" />
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">Acciones Rápidas</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                    <Plus className="w-5 h-5 text-yellow-400" />
                    <span>Nueva Cita</span>
                  </button>
                  <button className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                    <Users className="w-5 h-5 text-yellow-400" />
                    <span>Agregar Empleado</span>
                  </button>
                  <button className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                    <Settings className="w-5 h-5 text-yellow-400" />
                    <span>Nuevo Servicio</span>
                  </button>
                </div>
              </div>

              {/* Popular Services */}
              {stats?.popularServices && stats.popularServices.length > 0 && (
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                  <h3 className="text-xl font-bold text-white mb-4">Servicios Más Populares</h3>
                  <div className="space-y-3">
                    {stats.popularServices.map((service, index) => (
                      <div key={service.serviceId} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center font-bold">
                            {index + 1}
                          </span>
                          <span className="text-white">{service.serviceName}</span>
                        </div>
                        <span className="text-gray-400">{service.count} citas</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'appointments' && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Gestión de Citas</h2>
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <p className="text-gray-400">Funcionalidad de gestión de citas en desarrollo...</p>
              </div>
            </div>
          )}

          {activeTab === 'employees' && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Gestión de Empleados</h2>
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <p className="text-gray-400">Funcionalidad de gestión de empleados en desarrollo...</p>
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Gestión de Servicios</h2>
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <p className="text-gray-400">Funcionalidad de gestión de servicios en desarrollo...</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
