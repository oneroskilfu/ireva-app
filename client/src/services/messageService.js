import API from '../api/axios';

// Get all messages for the current user
export const getUserMessages = async () => {
  try {
    const response = await API.get('/messages');
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

// Send a new message
export const sendMessage = async (messageData) => {
  try {
    const response = await API.post('/messages', messageData);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Mark a message as read
export const markMessageAsRead = async (id) => {
  try {
    const response = await API.put(`/messages/${id}/read`, {});
    return response.data;
  } catch (error) {
    console.error(`Error marking message ${id} as read:`, error);
    throw error;
  }
};

// Delete a message
export const deleteMessage = async (id) => {
  try {
    const response = await API.delete(`/messages/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting message ${id}:`, error);
    throw error;
  }
};

// Get unread message count
export const getUnreadMessageCount = async () => {
  try {
    const response = await API.get('/messages/unread/count');
    return response.data.count;
  } catch (error) {
    console.error('Error fetching unread message count:', error);
    throw error;
  }
};