export type SocialNotificationType =
  | 'team-invite'
  | 'team-update'
  | 'team-join'
  | 'team-leave'
  | 'social';

export interface SocialNotification {
  id: string;
  type: SocialNotificationType;
  message: string;
  timestamp: number;
  read: boolean;
  actionLabel?: string;
  onAction?: () => void;
  metadata?: Record<string, unknown>;
}

export type SocialNotificationInput = Omit<SocialNotification, 'id' | 'timestamp' | 'read'>;
