import React, { useMemo, useState } from 'react';
import { Bell, CheckCircle2, Inbox, Mail, X } from 'lucide-react';
import { SocialNotification, StaffMessage } from '../types/social';

interface MessageCenterOverlayProps {
  notifications: SocialNotification[];
  staffMessages: StaffMessage[];
  onDismissNotification: (id: string) => void;
  onMarkNotificationRead: (id: string) => void;
  onMarkStaffMessageRead: (id: string) => void;
  onClose: () => void;
  primaryColor: string;
  textColor: string;
  backgroundColor: string;
}

export function MessageCenterOverlay({
  notifications,
  staffMessages,
  onDismissNotification,
  onMarkNotificationRead,
  onMarkStaffMessageRead,
  onClose,
  primaryColor,
  textColor,
  backgroundColor,
}: MessageCenterOverlayProps) {
  const [activeTab, setActiveTab] = useState<'notifications' | 'messages'>('notifications');
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);

  const sortedNotifications = useMemo(
    () => [...notifications].sort((a, b) => b.timestamp - a.timestamp),
    [notifications]
  );

  const sortedMessages = useMemo(
    () => [...staffMessages].sort((a, b) => b.timestamp - a.timestamp),
    [staffMessages]
  );

  const unreadNotificationCount = sortedNotifications.filter(notification => !notification.read).length;
  const unreadMessageCount = sortedMessages.filter(message => !message.read).length;

  const handleExpandMessage = (messageId: string) => {
    setExpandedMessageId(prev => (prev === messageId ? null : messageId));
    onMarkStaffMessageRead(messageId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-3xl rounded-xl border shadow-2xl"
        style={{
          backgroundColor: `${backgroundColor}f0`,
          borderColor: `${primaryColor}40`,
          boxShadow: `0 0 40px ${primaryColor}30`,
        }}
      >
        <div
          className="flex items-center justify-between border-b px-6 py-4"
          style={{ borderColor: `${primaryColor}30` }}
        >
          <div>
            <h2 className="text-xl font-mono" style={{ color: primaryColor }}>
              Message Center
            </h2>
            <p className="text-xs uppercase tracking-widest" style={{ color: `${textColor}b0` }}>
              Secure communications hub
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-2 transition-colors hover:bg-black/40"
            aria-label="Close message center"
          >
            <X className="h-5 w-5" style={{ color: primaryColor }} />
          </button>
        </div>

        <div className="flex border-b px-6" style={{ borderColor: `${primaryColor}30` }}>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex flex-1 items-center justify-center gap-2 border-b-2 py-3 text-sm font-semibold transition-colors ${
              activeTab === 'notifications' ? '' : 'border-transparent'
            }`}
            style={{
              color: activeTab === 'notifications' ? primaryColor : `${textColor}b0`,
              borderColor: activeTab === 'notifications' ? primaryColor : 'transparent',
            }}
          >
            <Bell className="h-4 w-4" />
            Notifications
            {unreadNotificationCount > 0 && (
              <span className="rounded-full px-2 py-0.5 text-xs" style={{ backgroundColor: primaryColor, color: '#000000' }}>
                {unreadNotificationCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex flex-1 items-center justify-center gap-2 border-b-2 py-3 text-sm font-semibold transition-colors ${
              activeTab === 'messages' ? '' : 'border-transparent'
            }`}
            style={{
              color: activeTab === 'messages' ? primaryColor : `${textColor}b0`,
              borderColor: activeTab === 'messages' ? primaryColor : 'transparent',
            }}
          >
            <Mail className="h-4 w-4" />
            Communications
            {unreadMessageCount > 0 && (
              <span className="rounded-full px-2 py-0.5 text-xs" style={{ backgroundColor: primaryColor, color: '#000000' }}>
                {unreadMessageCount}
              </span>
            )}
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-4 space-y-4">
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              {sortedNotifications.length === 0 ? (
                <div
                  className="rounded-lg border p-6 text-center"
                  style={{ borderColor: `${primaryColor}30`, color: `${textColor}b0` }}
                >
                  <Inbox className="mx-auto mb-3 h-10 w-10" style={{ color: `${primaryColor}80` }} />
                  <p className="font-semibold">No notifications yet</p>
                  <p className="text-sm">System alerts and social updates will appear here.</p>
                </div>
              ) : (
                sortedNotifications.map(notification => {
                  const formattedTime = new Date(notification.timestamp).toLocaleString();

                  return (
                    <div
                      key={notification.id}
                      className="rounded-lg border p-4 transition-all"
                      style={{
                        borderColor: notification.read ? `${primaryColor}30` : primaryColor,
                        backgroundColor: notification.read ? 'transparent' : `${primaryColor}10`,
                        color: textColor,
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 text-xs uppercase tracking-widest" style={{ color: primaryColor }}>
                            <Bell className="h-3 w-3" />
                            {notification.type.replace('-', ' ')}
                            <span className="text-[10px]" style={{ color: `${textColor}80` }}>
                              {formattedTime}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed" style={{ color: textColor }}>
                            {notification.message}
                          </p>
                          {notification.actionLabel && notification.onAction && (
                            <button
                              onClick={() => {
                                notification.onAction?.();
                                onMarkNotificationRead(notification.id);
                              }}
                              className="text-xs font-mono px-3 py-1 border rounded transition-colors hover:bg-black/40"
                              style={{ borderColor: primaryColor, color: primaryColor }}
                            >
                              {notification.actionLabel}
                            </button>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2 text-xs">
                          {!notification.read && (
                            <button
                              onClick={() => onMarkNotificationRead(notification.id)}
                              className="flex items-center gap-1 rounded px-2 py-1 transition-colors hover:bg-black/40"
                              style={{ color: primaryColor }}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Mark read
                            </button>
                          )}
                          <button
                            onClick={() => onDismissNotification(notification.id)}
                            className="rounded px-2 py-1 text-[11px] uppercase tracking-wider opacity-70 transition-opacity hover:opacity-100"
                            style={{ color: `${textColor}a0` }}
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="space-y-4">
              {sortedMessages.length === 0 ? (
                <div
                  className="rounded-lg border p-6 text-center"
                  style={{ borderColor: `${primaryColor}30`, color: `${textColor}b0` }}
                >
                  <Inbox className="mx-auto mb-3 h-10 w-10" style={{ color: `${primaryColor}80` }} />
                  <p className="font-semibold">No secure communications</p>
                  <p className="text-sm">Directives from staff and mission control will appear here.</p>
                </div>
              ) : (
                sortedMessages.map(message => {
                  const isExpanded = expandedMessageId === message.id;
                  const formattedTime = new Date(message.timestamp).toLocaleString();

                  return (
                    <div
                      key={message.id}
                      className="rounded-lg border p-4 transition-all"
                      style={{
                        borderColor: message.read ? `${primaryColor}30` : primaryColor,
                        backgroundColor: isExpanded ? `${primaryColor}10` : 'transparent',
                        color: textColor,
                      }}
                    >
                      <button
                        onClick={() => handleExpandMessage(message.id)}
                        className="flex w-full flex-col gap-2 text-left"
                      >
                        <div className="flex items-center justify-between text-xs uppercase tracking-widest">
                          <span style={{ color: primaryColor }}>{message.sender}</span>
                          <span style={{ color: `${textColor}80` }}>{formattedTime}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-sm font-semibold" style={{ color: textColor }}>
                            {message.subject}
                          </h3>
                          {!message.read && (
                            <span
                              className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
                              style={{ backgroundColor: primaryColor, color: '#000000' }}
                            >
                              Unread
                            </span>
                          )}
                        </div>
                        {isExpanded && (
                          <p className="whitespace-pre-line text-sm leading-relaxed" style={{ color: `${textColor}` }}>
                            {message.body}
                          </p>
                        )}
                        {message.attachments && message.attachments.length > 0 && isExpanded && (
                          <div className="rounded border p-3 text-xs" style={{ borderColor: `${primaryColor}40`, color: `${textColor}c0` }}>
                            <p className="mb-2 font-semibold" style={{ color: primaryColor }}>
                              Attachments
                            </p>
                            <ul className="space-y-1">
                              {message.attachments.map(attachment => (
                                <li key={attachment.id} className="flex items-center justify-between">
                                  <span>{attachment.name}</span>
                                  <span style={{ color: `${textColor}80` }}>{attachment.description}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
