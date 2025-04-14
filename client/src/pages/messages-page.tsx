import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Divider,
  TextField,
  Paper,
  Avatar,
  Badge,
  CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import API from '../api/axios';
import SimpleLayout from '../components/layout/SimpleLayout';

interface Message {
  id: number;
  sender: string;
  receiver: string;
  subject: string;
  content: string;
  timestamp: string;
  read: boolean;
}

const MessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newMessage, setNewMessage] = useState({
    receiver: '',
    subject: '',
    content: ''
  });

  // Fetch messages on component mount
  useEffect(() => {
    setLoading(true);
    API.get('/messages')
      .then(res => {
        setMessages(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages. Please try again later.');
        setLoading(false);
      });
  }, []);

  // Handle marking a message as read
  const handleMarkAsRead = (id: number) => {
    API.put(`/messages/${id}/read`, {})
      .then(res => {
        // Update the messages state
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === id ? { ...msg, read: true } : msg
          )
        );
      })
      .catch(err => {
        console.error(`Error marking message ${id} as read:`, err);
      });
  };

  // Handle deleting a message
  const handleDelete = (id: number) => {
    API.delete(`/messages/${id}`)
      .then(res => {
        // Remove the message from state
        setMessages(prevMessages => 
          prevMessages.filter(msg => msg.id !== id)
        );
      })
      .catch(err => {
        console.error(`Error deleting message ${id}:`, err);
      });
  };

  // Handle input change for new message form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewMessage(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle sending a new message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.receiver || !newMessage.subject || !newMessage.content) {
      alert('Please fill all fields');
      return;
    }
    
    API.post('/messages', newMessage)
      .then(res => {
        // Clear the form
        setNewMessage({
          receiver: '',
          subject: '',
          content: ''
        });
        
        // Optionally, you can add the new message to the messages state
        // if the API returns the created message
        if (res.data) {
          setMessages(prevMessages => [...prevMessages, res.data]);
        }
      })
      .catch(err => {
        console.error('Error sending message:', err);
      });
  };

  // Calculate unread message count
  const unreadCount = messages.filter(msg => !msg.read).length;

  return (
    <SimpleLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Messages
          {unreadCount > 0 && (
            <Badge 
              badgeContent={unreadCount} 
              color="primary" 
              sx={{ ml: 2 }}
            />
          )}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Manage your communications
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' }}}>
        {/* Message list */}
        <Paper sx={{ flex: 3, p: 2, height: 'fit-content' }}>
          <Typography variant="h6" gutterBottom>
            Inbox
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ p: 2 }}>
              <Typography color="error">{error}</Typography>
            </Box>
          ) : messages.length === 0 ? (
            <Box sx={{ p: 2 }}>
              <Typography>No messages yet.</Typography>
            </Box>
          ) : (
            <List>
              {messages.map((message) => (
                <React.Fragment key={message.id}>
                  <ListItem
                    sx={{
                      bgcolor: message.read ? 'transparent' : 'action.hover',
                      borderRadius: 1,
                    }}
                    secondaryAction={
                      <Box>
                        {!message.read && (
                          <IconButton 
                            edge="end" 
                            aria-label="mark as read" 
                            onClick={() => handleMarkAsRead(message.id)}
                            sx={{ mr: 1 }}
                          >
                            <MarkEmailReadIcon />
                          </IconButton>
                        )}
                        <IconButton 
                          edge="end" 
                          aria-label="delete" 
                          onClick={() => handleDelete(message.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    }
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {message.sender.charAt(0).toUpperCase()}
                      </Avatar>
                      <ListItemText
                        primary={
                          <Typography 
                            sx={{ 
                              fontWeight: message.read ? 'normal' : 'bold',
                              display: 'flex',
                              justifyContent: 'space-between'
                            }}
                          >
                            {message.subject}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              From: {message.sender}
                            </Typography>
                            <Typography component="p" variant="body2">
                              {message.content.length > 100 
                                ? `${message.content.substring(0, 100)}...` 
                                : message.content}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(message.timestamp).toLocaleString()}
                            </Typography>
                          </>
                        }
                      />
                    </Box>
                  </ListItem>
                  <Divider component="li" sx={{ my: 1 }} />
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>

        {/* New message form */}
        <Paper sx={{ flex: 2, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            New Message
          </Typography>
          <Box component="form" onSubmit={handleSendMessage}>
            <TextField
              fullWidth
              margin="normal"
              label="To"
              name="receiver"
              value={newMessage.receiver}
              onChange={handleInputChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Subject"
              name="subject"
              value={newMessage.subject}
              onChange={handleInputChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Message"
              name="content"
              value={newMessage.content}
              onChange={handleInputChange}
              multiline
              rows={6}
              required
            />
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              sx={{ mt: 2 }}
              fullWidth
            >
              Send Message
            </Button>
          </Box>
        </Paper>
      </Box>
    </SimpleLayout>
  );
};

export default MessagesPage;