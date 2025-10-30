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

export interface StaffMessageAttachment {
  id: string;
  name: string;
  description?: string;
  url?: string;
}

export interface StaffMessage {
  id: string;
  sender: string;
  subject: string;
  body: string;
  timestamp: number;
  read: boolean;
  priority?: 'low' | 'normal' | 'high';
  attachments?: StaffMessageAttachment[];
}
