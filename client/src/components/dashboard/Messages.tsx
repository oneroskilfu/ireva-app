import React from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  Card, 
  CardContent, 
  Box, 
  Avatar, 
  Chip, 
  Divider, 
  IconButton, 
  Badge 
} from '@mui/material';
import { 
  CheckCircle, 
  MonetizationOn, 
  Announcement, 
  MarkEmailRead, 
  NotificationsActive,
  SupportAgent,
  Delete
} from '@mui/icons-material';

// Define message types for type safety
type MessageType = 'kyc' | 'roi' | 'announcement' | 'support';

interface Message {
  id: number;
  type: MessageType;
  title: string;
  content: string;
  date: string;
  read: boolean;
  icon: React.ReactNode;
}

// Sample message data with different types
const messageData: Message[] = [
  {
    id: 1,
    type: 'kyc',
    title: 'Your KYC has been approved!',
    content: 'Congratulations! Your identity verification is complete. You now have full access to all investment opportunities.',
    date: '2 days ago',
    read: false,
    icon: <CheckCircle sx={{ color: 'success.main' }} />
  },
  {
    id: 2,
    type: 'roi',
    title: 'ROI distribution sent for Project Sunset',
    content: 'We have distributed ₦125,000 to your wallet as part of the quarterly ROI for Project Sunset.',
    date: '5 days ago',
    read: true,
    icon: <MonetizationOn sx={{ color: 'primary.main' }} />
  },
  {
    id: 3,
    type: 'announcement',
    title: 'New property just listed: The Hive',
    content: 'A new premium property in Lekki has been added to our marketplace. Early investors receive additional bonus.',
    date: '1 week ago',
    read: false,
    icon: <Announcement sx={{ color: 'info.main' }} />
  },
  {
    id: 4,
    type: 'support',
    title: 'Your support case has been resolved',
    content: 'The issue you reported regarding investment display has been resolved. Thank you for your patience.',
    date: '2 weeks ago',
    read: true,
    icon: <SupportAgent sx={{ color: 'secondary.main' }} />
  }
];

// Get chip color and label based on message type
const getChipProps = (type: MessageType) => {
  switch (type) {
    case 'kyc':
      return { color: 'success', label: 'KYC' };
    case 'roi':
      return { color: 'primary', label: 'ROI' };
    case 'announcement':
      return { color: 'info', label: 'Announcement' };
    case 'support':
      return { color: 'secondary', label: 'Support' };
    default:
      return { color: 'default', label: 'Message' };
  }
};

const Messages: React.FC = () => {
  const unreadCount = messageData.filter(message => !message.read).length;
  
  return (
    <Card sx={{ 
      boxShadow: 2,
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 4
      },
      maxHeight: 400,
      overflow: 'auto'
    }}>
      <CardContent sx={{ pb: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Badge badgeContent={unreadCount} color="error" sx={{ mr: 1 }}>
              <NotificationsActive color="primary" />
            </Badge>
            <Typography variant="h6">Messages</Typography>
          </Box>
          <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
            View All
          </Typography>
        </Box>
      </CardContent>
      
      <List sx={{ pt: 0 }}>
        {messageData.map((message, index) => (
          <React.Fragment key={message.id}>
            <ListItem 
              alignItems="flex-start"
              sx={{ 
                py: 2,
                backgroundColor: message.read ? 'transparent' : 'rgba(25, 118, 210, 0.05)',
                transition: 'background-color 0.2s',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
              secondaryAction={
                <IconButton edge="end" aria-label="mark as read" size="small">
                  {message.read ? <Delete color="action" /> : <MarkEmailRead color="primary" />}
                </IconButton>
              }
            >
              <Box sx={{ display: 'flex', width: '100%' }}>
                <Avatar sx={{ mr: 2, mt: 0.5, backgroundColor: 'background.paper' }}>
                  {message.icon}
                </Avatar>
                <Box sx={{ flex: 1, pr: 6 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography 
                        variant="subtitle1" 
                        component="span"
                        sx={{ 
                          fontWeight: message.read ? 'normal' : 'bold',
                          mr: 1
                        }}
                      >
                        {message.title}
                      </Typography>
                      <Chip 
                        size="small" 
                        label={getChipProps(message.type).label} 
                        color={getChipProps(message.type).color as any}
                        sx={{ height: 20 }}
                      />
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {message.content}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {message.date}
                  </Typography>
                </Box>
              </Box>
            </ListItem>
            {index < messageData.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        ))}
      </List>
    </Card>
  );
};

export default Messages;