import { X } from 'lucide-react';
import { SocialNotification } from '../types/social';

interface SocialNotificationCenterProps {
  notifications: SocialNotification[];
  onDismiss: (id: string) => void;
  onMarkAsRead: (id: string) => void;
  primaryColor: string;
  textColor: string;
  backgroundColor: string;
}

export function SocialNotificationCenter({
  notifications,
  onDismiss,
  onMarkAsRead,
  primaryColor,
  textColor,
  backgroundColor
}: SocialNotificationCenterProps) {
  if (notifications.length === 0) {
    return null;
  }

  const sortedNotifications = [...notifications].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 w-80 max-w-full">
      {sortedNotifications.map((notification) => {
        const formattedTime = new Date(notification.timestamp).toLocaleTimeString();

        return (
          <div
            key={notification.id}
            className="border rounded-lg shadow-lg bg-black/90 backdrop-blur-md p-4"
            style={{
              borderColor: notification.read ? `${primaryColor}40` : primaryColor,
              color: textColor,
              boxShadow: `0 0 25px ${primaryColor}20`
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className="uppercase text-xs font-semibold tracking-wide"
                    style={{ color: primaryColor }}
                  >
                    {notification.type.replace('-', ' ')}
                  </span>
                  <span className="text-xs opacity-70">{formattedTime}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: textColor }}>
                  {notification.message}
                </p>
                {notification.actionLabel && notification.onAction && (
                  <button
                    onClick={() => {
                      notification.onAction?.();
                      onMarkAsRead(notification.id);
                    }}
                    className="mt-3 text-xs font-mono px-3 py-1 border rounded transition-opacity hover:opacity-80"
                    style={{
                      borderColor: primaryColor,
                      color: primaryColor,
                      backgroundColor: backgroundColor
                    }}
                  >
                    {notification.actionLabel}
                  </button>
                )}
              </div>
              <button
                onClick={() => onDismiss(notification.id)}
                className="text-xs opacity-60 hover:opacity-100 transition-opacity"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
