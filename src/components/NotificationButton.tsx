import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useNotifications } from '../hooks/useNotifications';
import { Bell } from 'lucide-react';
import NotificationCenter from './NotificationCenter';

interface NotificationButtonProps {
  userId: string;
  className?: string;
}

const NotificationButton: React.FC<NotificationButtonProps> = ({
  userId,
  className = ""
}) => {
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const { unreadCount, loading } = useNotifications(userId);

  return (
    <>
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsNotificationCenterOpen(true)}
          className={`p-2 text-gray-400 hover:text-yellow-400 transition-colors ${className}`}
          disabled={loading}
        >
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      <NotificationCenter
        userId={userId}
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
      />
    </>
  );
};

export default NotificationButton;
