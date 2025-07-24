import React, { useState, useEffect } from 'react';
import { getNotifications, markNotificationAsRead } from '../api/api';

function NotificationsPage({ passengerId }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getNotifications(passengerId);
      setNotifications(data);
    } catch (err) {
      setError('Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [passengerId]);

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
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => n.status === 'Unread');
    try {
      await Promise.all(
        unreadNotifications.map(notif => markNotificationAsRead(notif.notification_id))
      );
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, status: 'Read' }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
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

  const getNotificationColor = (type) => {
    switch (type) {
      case 'Ticket Cancellation':
        return 'border-red-400 bg-red-50';
      case 'BOOKING_CONFIRMATION':
        return 'border-green-400 bg-green-50';
      case 'DELAY_ALERT':
        return 'border-yellow-400 bg-yellow-50';
      case 'FEEDBACK_REQUEST':
        return 'border-blue-400 bg-blue-50';
      default:
        return 'border-gray-400 bg-gray-50';
    }
  };

  const unreadCount = notifications.filter(n => n.status === 'Unread').length;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center py-10">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchNotifications}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="glass p-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold gradient-text mb-2">Notifications</h2>
            <p className="text-gray-600">Stay updated with your railway journey</p>
          </div>
          <div className="flex items-center space-x-4">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="btn-primary text-sm"
              >
                Mark all as read
              </button>
            )}
            <button
              onClick={fetchNotifications}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-all duration-300 hover:scale-105"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 glass">
          <div className="text-6xl mb-4 float">🔔</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No notifications yet</h3>
          <p className="text-gray-500">You'll see important updates here when they arrive.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.notification_id}
              className={`p-6 rounded-lg border-l-4 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                notification.status === 'Unread'
                  ? 'glass border-l-4 border-indigo-400'
                  : 'bg-gray-50 border-l-4 border-gray-300'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="text-3xl">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-gray-800 leading-relaxed mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{formatDate(notification.created_at)}</span>
                        <span className="capitalize">{notification.type.replace('_', ' ').toLowerCase()}</span>
                        {notification.status === 'Unread' && (
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                                         {notification.status === 'Unread' && (
                       <button
                         onClick={() => handleMarkAsRead(notification.notification_id)}
                         className="ml-4 px-3 py-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:bg-indigo-50 rounded-full transition-all duration-300 hover:scale-105"
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

      {notifications.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
          {unreadCount > 0 && ` (${unreadCount} unread)`}
        </div>
      )}
    </div>
  );
}

export default NotificationsPage; 