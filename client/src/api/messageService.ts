import API from './axios';

export interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
  read: boolean;
  recipient: string;
  avatar?: string;
}

// Get all messages for the current user
export const getUserMessages = async () => {
  const response = await API.get<Message[]>('/messages');
  return response.data;
};

// Send a new message
export const sendMessage = async (messageData: {
  recipient: string;
  content: string;
}) => {
  const response = await API.post<Message>('/messages', messageData);
  return response.data;
};

// Mark a message as read
export const markMessageAsRead = async (id: number) => {
  const response = await API.put<Message>(`/messages/${id}/read`, {});
  return response.data;
};

// Delete a message
export const deleteMessage = async (id: number) => {
  const response = await API.delete(`/messages/${id}`);
  return response.data;
};

// Get unread message count
export const getUnreadMessageCount = async () => {
  const response = await API.get<{count: number}>('/messages/unread/count');
  return response.data.count;
};