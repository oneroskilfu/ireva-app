import * as React from 'react';
import SimpleLayout from '../components/layout/SimpleLayout';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  Button,
  Divider,
  Badge
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
  read: boolean;
  avatar?: string;
}

const mockMessages: Message[] = [
  {
    id: 1,
    sender: 'Property Manager',
    content: 'Quarterly report for Lagos Waterfront Apartments has been published. Please review at your earliest convenience.',
    timestamp: '2023-04-12T10:30:00',
    read: true
  },
  {
    id: 2,
    sender: 'Investment Advisor',
    content: 'I noticed you showed interest in commercial properties. We have a new listing in Lekki that might interest you. Would you like to schedule a call?',
    timestamp: '2023-04-13T14:45:00',
    read: false
  },
  {
    id: 3,
    sender: 'Support Team',
    content: 'Your KYC verification is complete. You now have full access to all investment opportunities on the platform.',
    timestamp: '2023-04-14T09:15:00',
    read: false
  }
];

const SimpleMessagesPage: React.FC = () => {
  const [messages, setMessages] = React.useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = React.useState('');
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-NG', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const handleMessageClick = (id: number) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === id ? { ...msg, read: true } : msg
      )
    );
  };
  
  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    
    const newMsg: Message = {
      id: messages.length + 1,
      sender: 'You',
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: true
    };
    
    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');
  };
  
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
          Communications with property managers and the REVA team
        </Typography>
      </Box>
      
      <Paper sx={{ mb: 4, p: 0 }}>
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {messages.map((message) => (
            <React.Fragment key={message.id}>
              <ListItem 
                alignItems="flex-start"
                onClick={() => handleMessageClick(message.id)}
                sx={{ 
                  cursor: 'pointer',
                  bgcolor: message.read ? 'transparent' : 'action.hover'
                }}
              >
                <ListItemAvatar>
                  <Avatar>{message.sender[0]}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography
                        sx={{ fontWeight: message.read ? 'normal' : 'bold' }}
                      >
                        {message.sender}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {formatDate(message.timestamp)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography
                      sx={{ display: 'inline', fontWeight: message.read ? 'normal' : 'medium' }}
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      {message.content}
                    </Typography>
                  }
                />
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      </Paper>
      
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Send Message
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Type your message here..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            sx={{ mr: 2 }}
          />
          <Button
            variant="contained"
            endIcon={<SendIcon />}
            onClick={handleSendMessage}
            disabled={newMessage.trim() === ''}
          >
            Send
          </Button>
        </Box>
      </Paper>
    </SimpleLayout>
  );
};

export default SimpleMessagesPage;