import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, X } from 'lucide-react';
import { Notification, User } from '../types';
import { db } from '../lib/database';

interface NotificationDropdownProps {
  currentUser: User | null;
  onNotificationClick?: (notification: Notification) => void;
  isDark: boolean;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  currentUser,
  onNotificationClick,
  isDark
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (currentUser) {
      loadNotifications();
    }
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const userNotifications = await db.getNotifications(currentUser.id);
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read && currentUser) {
      await db.markNotificationAsRead(currentUser.id, notification.id);
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
    }
    
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  const markAllAsRead = async () => {
    if (!currentUser) return;
    
    await db.markAllNotificationsAsRead(currentUser.id);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'question_answered':
        return '💬';
      case 'answer_voted':
        return '👍';
      case 'question_voted':
        return '⬆️';
      case 'new_question':
        return '❓';
      default:
        return '🔔';
    }
  };

  if (!currentUser) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative p-2 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-sm
          ${isDark 
            ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }
        `}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className={`
            absolute -top-1 -right-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg animate-pulse
            ${isDark ? 'bg-red-500' : 'bg-red-500'}
          `}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className={`
          absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl z-50 max-h-96 overflow-hidden transition-all duration-300 transform
          ${isDark 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
          }
          animate-in slide-in-from-top-2
        `}>
          {/* Header */}
          <div className={`
            flex items-center justify-between p-4 border-b
            ${isDark ? 'border-gray-700' : 'border-gray-200'}
          `}>
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Notifications
            </h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className={`
                    text-sm font-medium flex items-center space-x-1 px-3 py-1 rounded-lg transition-all duration-300 transform hover:scale-105
                    ${isDark 
                      ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/20' 
                      : 'text-purple-600 hover:text-purple-700 hover:bg-purple-50'
                    }
                  `}
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className={`
                  p-1 rounded-lg transition-all duration-300 transform hover:scale-110
                  ${isDark ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}
                `}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center">
                <div className={`
                  animate-spin rounded-full h-8 w-8 border-2 border-transparent mx-auto mb-3
                  ${isDark ? 'border-t-blue-400 border-r-blue-400' : 'border-t-purple-600 border-r-purple-600'}
                `}></div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Loading notifications...
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                <p className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  No notifications yet
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  You'll see updates about your questions and answers here
                </p>
              </div>
            ) : (
              <div className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-100'}`}>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`
                      p-4 cursor-pointer transition-all duration-300 transform hover:scale-[1.02]
                      ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}
                      ${!notification.read 
                        ? isDark 
                          ? 'bg-blue-900/20 border-l-4 border-l-blue-500' 
                          : 'bg-purple-50 border-l-4 border-l-purple-500'
                        : ''
                      }
                    `}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-lg flex-shrink-0 mt-0.5 animate-bounce">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {notification.title}
                        </p>
                        <p className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {formatTime(notification.createdAt)}
                          </span>
                          {!notification.read && (
                            <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-blue-500' : 'bg-purple-500'} animate-pulse`}></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className={`
              p-3 border-t
              ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}
            `}>
              <button className={`
                w-full text-sm font-medium py-2 rounded-lg transition-all duration-300 transform hover:scale-105
                ${isDark 
                  ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/20' 
                  : 'text-purple-600 hover:text-purple-700 hover:bg-purple-50'
                }
              `}>
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};