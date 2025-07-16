import React, { useState, useEffect } from 'react';
import { getUnreadNotificationCount, getNotifications, markNotificationAsRead } from '../api/api';

function NotificationBell({ passengerId }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = async () => {
    try {
      const count = await getUnreadNotificationCount(passengerId);
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await getNotifications(passengerId);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      // Update the notification status locally
      setNotifications(prev => 
        prev.map(notif => 
          notif.notification_id === notificationId 
            ? { ...notif, status: 'Read' }
            : notif
        )
      );
      // Refresh unread count
      fetchUnreadCount();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    fetchUnreadCount();
    // Set up interval to check for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [passengerId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'Ticket Cancellation':
        return '❌';
      case 'BOOKING_CONFIRMATION':
        return '✅';
      case 'DELAY_ALERT':
        return '⏰';
      case 'FEEDBACK_REQUEST':
        return '📝';
      default:
        return '🔔';
    }
  };

  return (
    <div className="relative notification-bell">
      <button
        onClick={handleToggle}
        className="relative p-3 text-gray-600 hover:text-indigo-600 transition-all duration-300 rounded-full hover:bg-indigo-50"
        title="Notifications"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 notification-panel z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <span className="mr-2">🔔</span>
              Notifications
            </h3>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-600 mt-1">{unreadCount} unread</p>
            )}
          </div>
          
          <div className="p-2">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
                         ) : notifications.length === 0 ? (
               <div className="text-center py-8 text-gray-500">
                 <div className="text-4xl mb-2 float">🔔</div>
                 <p className="text-sm">No notifications yet</p>
                 <p className="text-xs text-gray-400 mt-1">You'll see updates here</p>
               </div>
             ) : (
               <div className="space-y-2">
                 {notifications.map((notification) => (
                   <div
                     key={notification.notification_id}
                     className={`p-4 rounded-lg border-l-4 transition-all duration-300 hover:shadow-md ${
                       notification.status === 'Unread'
                         ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-400 hover:from-blue-100 hover:to-indigo-100'
                         : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300'
                     }`}
                   >
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 leading-relaxed">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {formatDate(notification.created_at)}
                          </span>
                                                     {notification.status === 'Unread' && (
                             <button
                               onClick={() => handleMarkAsRead(notification.notification_id)}
                               className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded-full hover:bg-blue-100 transition-colors"
                             >
                               Mark as read
                             </button>
                           )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell; 