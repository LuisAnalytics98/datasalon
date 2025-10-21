import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { appointmentService, reviewService } from '../../services/api';
import { Appointment, Review } from '../../types';
import { useToast } from '../../hooks/use-toast';
import NotificationButton from '../../components/NotificationButton';
import ReviewModal from '../../components/ReviewModal';
import BackToHomeButton from '../../components/BackToHomeButton';
import { 
  Calendar, 
  Clock, 
  Star, 
  Plus,
  User,
  LogOut,
  Bell,
  History,
  CreditCard
} from 'lucide-react';

const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    const loadClientData = async () => {
      if (!user) return;
      
      try {
        const [clientAppointments, clientReviews] = await Promise.all([
          appointmentService.getClientAppointments(user.id),
          reviewService.getReviews(undefined, user.id)
        ]);
        
        setAppointments(clientAppointments);
        setReviews(clientReviews);
      } catch (error) {
        console.error('Error loading client data:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadClientData();
  }, [user, toast]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleReviewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowReviewModal(true);
  };

  const handleReviewSubmit = (review: Review) => {
    setReviews(prev => [review, ...prev]);
    setShowReviewModal(false);
    setSelectedAppointment(null);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const upcomingAppointments = appointments.filter(apt => 
    apt.status === 'pending' || apt.status === 'confirmed'
  );

  const completedAppointments = appointments.filter(apt => 
    apt.status === 'completed'
  );

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
              <span className="ml-4 text-gray-400">Mi Cuenta</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <BackToHomeButton variant="minimal" />
              <NotificationButton userId={user?.id || ''} />
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
                onClick={() => setActiveTab('upcoming')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'upcoming' 
                    ? 'bg-yellow-400 text-black' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span>Próximas Citas</span>
              </button>
              
              <button
                onClick={() => setActiveTab('history')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'history' 
                    ? 'bg-yellow-400 text-black' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <History className="w-5 h-5" />
                <span>Historial</span>
              </button>
              
              <button
                onClick={() => setActiveTab('reviews')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'reviews' 
                    ? 'bg-yellow-400 text-black' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Star className="w-5 h-5" />
                <span>Mis Reviews</span>
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
          {activeTab === 'upcoming' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">Próximas Citas</h2>
                  <p className="text-gray-400">Tus citas programadas y confirmadas.</p>
                </div>
                <button 
                  onClick={() => navigate('/salons')}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  <span>Nueva Cita</span>
                </button>
              </div>

              {/* Upcoming Appointments */}
              <div className="space-y-4">
                {upcomingAppointments.length === 0 ? (
                  <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 text-center">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No tienes citas próximas programadas.</p>
                    <button 
                      onClick={() => navigate('/salons')}
                      className="mt-4 px-6 py-2 bg-yellow-400 text-black rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
                    >
                      Reservar Nueva Cita
                    </button>
                  </div>
                ) : (
                  upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-black" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {appointment.services?.name}
                            </h3>
                            <p className="text-gray-400">
                              con {appointment.employees?.firstName} {appointment.employees?.lastName}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(appointment.date)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            appointment.status === 'pending' ? 'bg-yellow-900 text-yellow-200' :
                            appointment.status === 'confirmed' ? 'bg-blue-900 text-blue-200' :
                            'bg-gray-900 text-gray-200'
                          }`}>
                            {appointment.status === 'pending' ? 'Pendiente' : 'Confirmada'}
                          </span>
                        </div>
                      </div>
                      
                      {appointment.notes && (
                        <div className="mt-4 p-3 bg-gray-700 rounded-lg">
                          <p className="text-gray-300 text-sm">{appointment.notes}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Historial de Citas</h2>
                <p className="text-gray-400">Todas tus citas completadas.</p>
              </div>

              <div className="space-y-4">
                {completedAppointments.length === 0 ? (
                  <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 text-center">
                    <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No tienes citas completadas aún.</p>
                  </div>
                ) : (
                  completedAppointments.map((appointment) => (
                    <div key={appointment.id} className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-black" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {appointment.services?.name}
                            </h3>
                            <p className="text-gray-400">
                              con {appointment.employees?.firstName} {appointment.employees?.lastName}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(appointment.date)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-900 text-green-200">
                            Completada
                          </span>
                          {appointment.price && (
                            <span className="text-green-400 font-semibold">
                              ${appointment.price}
                            </span>
                          )}
                          <button
                            onClick={() => handleReviewAppointment(appointment)}
                            className="flex items-center space-x-1 px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                          >
                            <Star className="w-4 h-4" />
                            <span>Calificar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Mis Reseñas</h2>
                <p className="text-gray-400">Tus calificaciones y comentarios sobre los servicios.</p>
              </div>

              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 text-center">
                    <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">No has calificado ningún servicio aún.</p>
                    <p className="text-gray-500 text-sm">
                      Después de completar una cita, podrás calificar tu experiencia.
                    </p>
                  </div>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-5 h-5 ${
                                    i < review.rating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-gray-400 text-sm">
                              {new Date(review.createdAt).toLocaleDateString('es-ES')}
                            </span>
                          </div>
                          
                          {review.comment && (
                            <p className="text-gray-300 mb-3">{review.comment}</p>
                          )}
                          
                          {review.preferences && review.preferences.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {review.preferences.map((pref, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-yellow-600 text-black text-xs rounded-full"
                                >
                                  {pref}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
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

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        appointment={selectedAppointment}
        onReviewSubmit={handleReviewSubmit}
      />
    </div>
  );
};

export default ClientDashboard;
