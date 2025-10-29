import { useState, useCallback } from 'react';
import { SocialNotification, SocialNotificationInput } from '../types/social';

const createNotificationId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function useSocialNotifications() {
  const [notifications, setNotifications] = useState<SocialNotification[]>([]);

  const pushNotification = useCallback((input: SocialNotificationInput) => {
    const notification: SocialNotification = {
      ...input,
      id: createNotificationId(),
      timestamp: Date.now(),
      read: false
    };

    setNotifications((prev) => [...prev, notification]);
    return notification.id;
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    pushNotification,
    markAsRead,
    dismissNotification,
    clearNotifications
  };
}
