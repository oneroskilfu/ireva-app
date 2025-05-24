import { apiRequest } from '@/lib/queryClient';

// Define message types
export interface Message {
  id: number;
  senderId: number;
  recipientId: number;
  message: string;
  isRead: boolean | null;
  readAt: Date | null;
  createdAt: Date | null;
  sender?: User;
  recipient?: User;
}

export interface User {
  id: number;
  username: string;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
  profileImage?: string;
}

export interface SendMessageParams {
  recipientId: number;
  message: string;
}

export interface ReplyMessageParams {
  messageId: number;
  message: string;
}

// Message Service
const messageService = {
  // Get inbox messages
  async getInboxMessages(): Promise<Message[]> {
    const res = await apiRequest('GET', '/api/messages/inbox');
    return await res.json();
  },

  // Get sent messages
  async getSentMessages(): Promise<Message[]> {
    const res = await apiRequest('GET', '/api/messages/sent');
    return await res.json();
  },

  // Get unread messages count
  async getUnreadCount(): Promise<number> {
    const res = await apiRequest('GET', '/api/messages/unread/count');
    const { count } = await res.json();
    return count;
  },

  // Get a specific message
  async getMessage(id: number): Promise<Message> {
    const res = await apiRequest('GET', `/api/messages/${id}`);
    return await res.json();
  },

  // Get conversation thread
  async getConversation(messageId: number): Promise<Message[]> {
    const res = await apiRequest('GET', `/api/messages/${messageId}/conversation`);
    return await res.json();
  },

  // Send a new message
  async sendMessage(params: SendMessageParams): Promise<Message> {
    const res = await apiRequest('POST', '/api/messages', params);
    return await res.json();
  },

  // Reply to a message
  async replyToMessage(params: ReplyMessageParams): Promise<Message> {
    const res = await apiRequest('POST', `/api/messages/${params.messageId}/reply`, {
      message: params.message,
    });
    return await res.json();
  },

  // Mark a message as read
  async markAsRead(messageId: number): Promise<Message> {
    const res = await apiRequest('PATCH', `/api/messages/${messageId}/read`);
    return await res.json();
  },

  // Get all users (for recipient selection)
  async getAllUsers(): Promise<User[]> {
    const res = await apiRequest('GET', '/api/users');
    return await res.json();
  },
};

export default messageService;