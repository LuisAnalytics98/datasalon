import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/api';
import { Notification } from '../types';
import { Bell, X, CheckCircle, AlertCircle, Info, Clock } from 'lucide-react';

const NotificationCenter: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userNotifications = await notificationService.getNotifications(user.id);
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      await Promise.all(unreadNotifications.map(n => notificationService.markAsRead(n.id)));
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="w-5 h-5 text-blue-400" />;
      case 'reminder':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'confirmation':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'cancellation':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'payment':
        return <DollarSign className="w-5 h-5 text-green-400" />;
      default:
        return <Info className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Hace unos minutos';
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} horas`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-yellow-400 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 top-12 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Notificaciones</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
                  >
                    Marcar todas como leídas
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400 mx-auto mb-2"></div>
                  <p className="text-gray-400 text-sm">Cargando...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No tienes notificaciones</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-700 hover:bg-gray-800 transition-colors cursor-pointer ${
                      !notification.isRead ? 'bg-gray-800/50' : ''
                    }`}
                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-white truncate">
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0 ml-2" />
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-4 border-t border-gray-700">
                <button className="w-full text-center text-sm text-yellow-400 hover:text-yellow-300 transition-colors">
                  Ver todas las notificaciones
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;
