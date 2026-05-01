import { useState, useEffect } from 'react';
import { Bell, Zap, MessageSquare, Heart, Users, Check } from 'lucide-react';
import { Notification } from '../types';
import { fetchNotifications, markNotificationsRead } from '../services/api';
import { NotificationSkeleton } from '../components/ui/SkeletonLoader';
import { formatRelativeTime } from '../utils/formatters';

const typeConfig: Record<
  Notification['type'],
  { icon: React.ElementType; color: string; bg: string }
> = {
  new_event: {
    icon: Zap,
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-100 dark:bg-teal-900/40',
  },
  comment_reply: {
    icon: MessageSquare,
    color: 'text-sky-600 dark:text-sky-400',
    bg: 'bg-sky-100 dark:bg-sky-900/40',
  },
  like: {
    icon: Heart,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-100 dark:bg-rose-900/40',
  },
  follow: {
    icon: Users,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/40',
  },
};

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
}

function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const cfg = typeConfig[notification.type];
  const Icon = cfg.icon;

  return (
    <div
      onClick={() => !notification.isRead && onRead(notification.id)}
      className={`flex items-start gap-3.5 px-4 py-4 cursor-pointer transition-colors duration-150 ${
        !notification.isRead
          ? 'bg-teal-50/60 dark:bg-teal-900/10 hover:bg-teal-50 dark:hover:bg-teal-900/20'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
      }`}
    >
      <div className={`w-9 h-9 rounded-full ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <Icon size={16} className={cfg.color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${notification.isRead ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white font-medium'}`}>
          {notification.message}
        </p>
        {notification.meta && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate italic">
            "{notification.meta}"
          </p>
        )}
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>
      {!notification.isRead && (
        <div className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 mt-2" />
      )}
    </div>
  );
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications().then((data) => {
      setNotifications(data);
      setIsLoading(false);
    });
  }, []);

  const handleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    markNotificationsRead();
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    markNotificationsRead();
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 text-xs font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors duration-150"
          >
            <Check size={14} />
            Mark all read
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {Array.from({ length: 5 }).map((_, i) => <NotificationSkeleton key={i} />)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
              <Bell size={24} className="text-gray-400 dark:text-gray-600" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {notifications.map((n) => (
              <NotificationItem key={n.id} notification={n} onRead={handleRead} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
