/**
 * InAppService.js
 * 
 * Service for managing in-app notifications that appear in the notification
 * center and as real-time alerts
 */

class InAppService {
  /**
   * Send an in-app notification
   * 
   * @param {object} params - Notification parameters
   * @param {string} params.userId - User ID to receive the notification
   * @param {string} params.notificationId - ID of the notification record
   * @param {string} params.title - Notification title
   * @param {string} params.message - Notification message
   * @param {string} params.type - Type of notification
   * @param {object} params.data - Additional notification data
   * @returns {Promise<object>} Result of the operation
   */
  static async send(params) {
    try {
      const { userId, notificationId, title, message, type, data } = params;
      
      // In a real-time system, we would emit an event to connected clients
      // For this implementation, we'll simulate successful delivery
      // In production, this would use socket.io or similar to push to client
      
      console.log(`[InAppService] Notification sent to user ${userId}:`, {
        id: notificationId,
        title,
        message,
        type
      });
      
      // Return success status
      return {
        success: true,
        channel: 'in-app',
        notificationId
      };
    } catch (error) {
      console.error('Error sending in-app notification:', error);
      return {
        success: false,
        channel: 'in-app',
        error: error.message
      };
    }
  }
  
  /**
   * Format a notification based on its type
   * 
   * @param {object} notification - Notification data
   * @returns {object} Formatted notification with appropriate icons and styling
   */
  static formatNotification(notification) {
    // Default formatting
    let formattedNotification = {
      ...notification,
      icon: 'bell',
      iconColor: 'blue',
      actionLabel: 'View',
      actionUrl: '#'
    };
    
    // Format based on type
    switch (notification.type) {
      case 'investment':
        formattedNotification.icon = 'currency-dollar';
        formattedNotification.iconColor = 'green';
        formattedNotification.actionLabel = 'View Investment';
        formattedNotification.actionUrl = `/investments/${notification.data?.investmentId || ''}`;
        break;
        
      case 'kyc':
        formattedNotification.icon = 'identification';
        formattedNotification.iconColor = notification.data?.status === 'approved' ? 'green' : 
                                         notification.data?.status === 'rejected' ? 'red' : 'yellow';
        formattedNotification.actionLabel = 'View KYC Status';
        formattedNotification.actionUrl = `/profile/kyc`;
        break;
        
      case 'roi':
        formattedNotification.icon = 'chart-bar';
        formattedNotification.iconColor = 'purple';
        formattedNotification.actionLabel = 'View ROI Details';
        formattedNotification.actionUrl = `/investments/${notification.data?.investmentId || ''}`;
        break;
        
      case 'wallet':
        formattedNotification.icon = 'credit-card';
        formattedNotification.iconColor = 'blue';
        formattedNotification.actionLabel = 'View Transaction';
        formattedNotification.actionUrl = `/wallet/transactions`;
        break;
        
      case 'system':
        formattedNotification.icon = 'server';
        formattedNotification.iconColor = 'gray';
        formattedNotification.actionLabel = 'View Details';
        formattedNotification.actionUrl = '#';
        break;
    }
    
    return formattedNotification;
  }
  
  /**
   * Generate a browser notification payload
   * 
   * @param {object} notification - Notification data
   * @returns {object} Browser notification payload
   */
  static getBrowserNotificationPayload(notification) {
    return {
      title: notification.title,
      body: notification.message,
      icon: '/notification-icon.png', // Path to notification icon
      badge: '/badge-icon.png',      // Path to badge icon
      data: {
        url: this.formatNotification(notification).actionUrl,
        notificationId: notification.id,
        timestamp: new Date().toISOString()
      },
      requireInteraction: notification.priority === 'high',
      silent: notification.priority === 'low'
    };
  }
}

module.exports = InAppService;