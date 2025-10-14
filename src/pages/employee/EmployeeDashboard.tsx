import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/api';
import { Appointment } from '../../types';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle,
  User,
  LogOut,
  Bell,
  Settings
} from 'lucide-react';

const EmployeeDashboard: React.FC = () => {
  const { user, salon, logout } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('today');

  useEffect(() => {
    const loadAppointments = async () => {
      if (!user || !salon) return;
      
      try {
        const today = new Date().toISOString().split('T')[0];
        const employeeAppointments = await appointmentService.getAppointments(salon.id, today);
        setAppointments(employeeAppointments.filter(apt => apt.employeeId === user.id));
      } catch (error) {
        console.error('Error loading appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [user, salon]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, status: Appointment['status']) => {
    try {
      await appointmentService.updateAppointment(appointmentId, { status });
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId ? { ...apt, status } : apt
        )
      );
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
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
              <span className="ml-4 text-gray-400">Dashboard Empleado</span>
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
                onClick={() => setActiveTab('today')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'today' 
                    ? 'bg-yellow-400 text-black' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span>Citas de Hoy</span>
              </button>
              
              <button
                onClick={() => setActiveTab('schedule')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'schedule' 
                    ? 'bg-yellow-400 text-black' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Clock className="w-5 h-5" />
                <span>Mi Horario</span>
              </button>
              
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'profile' 
                    ? 'bg-yellow-400 text-black' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <User className="w-5 h-5" />
                <span>Mi Perfil</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeTab === 'today' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Citas de Hoy</h2>
                <p className="text-gray-400">Gestiona tus citas del día de hoy.</p>
              </div>

              {/* Appointments List */}
              <div className="space-y-4">
                {appointments.length === 0 ? (
                  <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 text-center">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No tienes citas programadas para hoy.</p>
                  </div>
                ) : (
                  appointments.map((appointment) => (
                    <div key={appointment.id} className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-black" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {appointment.clients?.firstName} {appointment.clients?.lastName}
                            </h3>
                            <p className="text-gray-400">{appointment.services?.name}</p>
                            <div className="flex items-center space-x-2 text-sm text-gray-400">
                              <Clock className="w-4 h-4" />
                              <span>{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            appointment.status === 'pending' ? 'bg-yellow-900 text-yellow-200' :
                            appointment.status === 'confirmed' ? 'bg-blue-900 text-blue-200' :
                            appointment.status === 'in_progress' ? 'bg-purple-900 text-purple-200' :
                            appointment.status === 'completed' ? 'bg-green-900 text-green-200' :
                            'bg-red-900 text-red-200'
                          }`}>
                            {appointment.status === 'pending' ? 'Pendiente' :
                             appointment.status === 'confirmed' ? 'Confirmada' :
                             appointment.status === 'in_progress' ? 'En Progreso' :
                             appointment.status === 'completed' ? 'Completada' :
                             'Cancelada'}
                          </span>
                        </div>
                      </div>
                      
                      {appointment.notes && (
                        <div className="mt-4 p-3 bg-gray-700 rounded-lg">
                          <p className="text-gray-300 text-sm">{appointment.notes}</p>
                        </div>
                      )}
                      
                      <div className="mt-4 flex space-x-2">
                        {appointment.status === 'confirmed' && (
                          <button
                            onClick={() => updateAppointmentStatus(appointment.id, 'in_progress')}
                            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            <Clock className="w-4 h-4" />
                            <span>Iniciar Servicio</span>
                          </button>
                        )}
                        
                        {appointment.status === 'in_progress' && (
                          <button
                            onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Completar Servicio</span>
                          </button>
                        )}
                        
                        {appointment.status === 'pending' && (
                          <button
                            onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Cancelar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Mi Horario</h2>
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <p className="text-gray-400">Funcionalidad de horarios en desarrollo...</p>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Mi Perfil</h2>
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Nombre</label>
                    <p className="text-white">{user?.firstName} {user?.lastName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <p className="text-white">{user?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Teléfono</label>
                    <p className="text-white">{user?.phone || 'No especificado'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
