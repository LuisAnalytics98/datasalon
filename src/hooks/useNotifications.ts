import { useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';

export const useNotifications = (userId: string) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      loadUnreadCount();
      
      // Set up interval to check for new notifications every 30 seconds
      const interval = setInterval(loadUnreadCount, 30000);
      
      return () => clearInterval(interval);
    }
  }, [userId]);

  const loadUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadNotificationCount(userId);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread notification count:', error);
    }
  };

  const refreshNotifications = async () => {
    setLoading(true);
    try {
      await loadUnreadCount();
    } finally {
      setLoading(false);
    }
  };

  return {
    unreadCount,
    loading,
    refreshNotifications
  };
};
