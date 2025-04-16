import { get, post, put } from './api';
import { Notification } from '@shared/schema';

/**
 * Service for managing notifications
 */
const notificationService = {
  /**
   * Get all notifications for the current user
   */
  getUserNotifications: async (): Promise<Notification[]> => {
    const response = await get<Notification[]>('/notifications');
    return response.data;
  },

  /**
   * Get unread notifications count for the current user
   */
  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await get<{ count: number }>('/notifications/unread');
    return response.data;
  },

  /**
   * Mark a notification as read
   * @param id - Notification ID
   */
  markAsRead: async (id: number): Promise<Notification> => {
    const response = await put<Notification>(`/notifications/${id}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<{ success: boolean }> => {
    const response = await put<{ success: boolean }>('/notifications/read-all');
    return response.data;
  },

  /**
   * Create a notification (admin only)
   * @param notification - Notification data
   */
  createNotification: async (notification: {
    userId: number;
    type: string;
    title: string;
    message: string;
    link?: string;
  }): Promise<Notification> => {
    const response = await post<Notification>('/admin/notifications', notification);
    return response.data;
  },

  /**
   * Send a notification to all users (admin only)
   * @param notification - Notification data
   */
  notifyAllUsers: async (notification: {
    type: string;
    title: string;
    message: string;
    link?: string;
  }): Promise<{ success: boolean; count: number }> => {
    const response = await post<{ success: boolean; count: number }>(
      '/admin/notifications/broadcast', 
      notification
    );
    return response.data;
  },
};

export default notificationService;