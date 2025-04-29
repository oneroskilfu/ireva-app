import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Chip,
  Divider,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid
} from '@mui/material';
import {
  Notifications,
  ErrorOutline,
  WarningAmber,
  InfoOutlined,
  CheckCircleOutline,
  Delete,
  Send,
  MarkEmailRead,
  PersonAdd,
  AttachMoney,
  AddAlert
} from '@mui/icons-material';

// Notification type definition
type NotificationType = 'system' | 'user' | 'transaction' | 'kyc' | 'alert';
type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

// Notification interface
interface Notification {
  id: number;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  requiresAction: boolean;
  user?: {
    id: number;
    name: string;
  };
}

// Sample notification data
const sampleNotifications: Notification[] = [
  {
    id: 1,
    type: 'kyc',
    priority: 'high',
    title: 'New KYC submission',
    message: 'There are 5 new KYC submissions awaiting your review.',
    timestamp: '2025-04-28T10:15:00',
    read: false,
    requiresAction: true
  },
  {
    id: 2,
    type: 'transaction',
    priority: 'medium',
    title: 'Large withdrawal request',
    message: 'A withdrawal request of ₦5,000,000 has been initiated by user Sarah Okonkwo.',
    timestamp: '2025-04-28T09:45:00',
    read: false,
    requiresAction: true,
    user: {
      id: 87,
      name: 'Sarah Okonkwo'
    }
  },
  {
    id: 3,
    type: 'system',
    priority: 'critical',
    title: 'Database backup failed',
    message: 'The automated database backup failed to complete. Please check the server logs.',
    timestamp: '2025-04-28T03:00:00',
    read: true,
    requiresAction: true
  },
  {
    id: 4,
    type: 'user',
    priority: 'low',
    title: 'New user registration',
    message: 'A new user has signed up to the platform.',
    timestamp: '2025-04-27T18:22:00',
    read: true,
    requiresAction: false,
    user: {
      id: 156,
      name: 'Emmanuel Adeyemi'
    }
  },
  {
    id: 5,
    type: 'alert',
    priority: 'high',
    title: 'Property funding complete',
    message: 'The Victoria Island Office Complex property has reached its funding goal of ₦800,000,000.',
    timestamp: '2025-04-27T15:30:00',
    read: false,
    requiresAction: false
  }
];

const AdminNotifications: React.FC = () => {
  // State for create announcement dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [notificationDetails, setNotificationDetails] = useState({
    title: '',
    message: '',
    type: 'system' as NotificationType,
    priority: 'medium' as NotificationPriority
  });
  
  // Get notification icon based on type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'system':
        return <InfoOutlined />;
      case 'user':
        return <PersonAdd />;
      case 'transaction':
        return <AttachMoney />;
      case 'kyc':
        return <MarkEmailRead />;
      case 'alert':
        return <AddAlert />;
      default:
        return <Notifications />;
    }
  };
  
  // Get priority icon and color
  const getPriorityIndicator = (priority: NotificationPriority) => {
    switch (priority) {
      case 'low':
        return { 
          icon: <InfoOutlined fontSize="small" />, 
          color: 'info',
          label: 'Low'
        };
      case 'medium':
        return { 
          icon: <InfoOutlined fontSize="small" />, 
          color: 'primary',
          label: 'Medium'
        };
      case 'high':
        return { 
          icon: <WarningAmber fontSize="small" />, 
          color: 'warning',
          label: 'High'
        };
      case 'critical':
        return { 
          icon: <ErrorOutline fontSize="small" />, 
          color: 'error',
          label: 'Critical'
        };
      default:
        return { 
          icon: <InfoOutlined fontSize="small" />, 
          color: 'default',
          label: 'Unknown'
        };
    }
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  // Handle opening the create announcement dialog
  const handleCreateDialogOpen = () => {
    setCreateDialogOpen(true);
  };
  
  // Handle closing the create announcement dialog
  const handleCreateDialogClose = () => {
    setCreateDialogOpen(false);
  };
  
  // Handle sending an announcement
  const handleSendAnnouncement = () => {
    // Handle sending announcement logic here
    console.log('Sending announcement', notificationDetails);
    setCreateDialogOpen(false);
  };
  
  // Handle marking a notification as read
  const handleMarkAsRead = (id: number) => {
    // Handle marking notification as read logic here
    console.log('Marking notification as read', id);
  };
  
  // Handle deleting a notification
  const handleDeleteNotification = (id: number) => {
    // Handle deleting notification logic here
    console.log('Deleting notification', id);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          System Notifications
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<Send />}
          onClick={handleCreateDialogOpen}
        >
          Send Announcement
        </Button>
      </Box>
      
      <Card sx={{ 
        boxShadow: 2,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}>
        <CardContent sx={{ p: 0 }}>
          <List sx={{ p: 0 }}>
            {sampleNotifications.map((notification, index) => {
              const { icon, color, label } = getPriorityIndicator(notification.priority);
              return (
                <React.Fragment key={notification.id}>
                  <ListItem
                    sx={{ 
                      py: 2,
                      px: 3,
                      backgroundColor: notification.read ? 'transparent' : 'rgba(25, 118, 210, 0.05)',
                    }}
                    secondaryAction={
                      <Box>
                        {!notification.read && (
                          <IconButton 
                            edge="end" 
                            aria-label="mark as read"
                            onClick={() => handleMarkAsRead(notification.id)}
                            sx={{ mr: 1 }}
                          >
                            <MarkEmailRead color="primary" />
                          </IconButton>
                        )}
                        <IconButton 
                          edge="end" 
                          aria-label="delete"
                          onClick={() => handleDeleteNotification(notification.id)}
                        >
                          <Delete color="action" />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: `${color}.light` }}>
                        {getNotificationIcon(notification.type)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography
                            variant="subtitle2"
                            component="span"
                            sx={{
                              fontWeight: notification.read ? 'normal' : 'bold',
                              mr: 1
                            }}
                          >
                            {notification.title}
                          </Typography>
                          <Chip
                            icon={icon}
                            label={label}
                            color={color as any}
                            size="small"
                            sx={{ height: 20 }}
                          />
                          {notification.requiresAction && (
                            <Chip
                              label="Action Required"
                              color="secondary"
                              size="small"
                              sx={{ ml: 1, height: 20 }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography
                            variant="body2"
                            color="text.primary"
                            sx={{
                              display: 'block',
                              fontWeight: notification.read ? 'normal' : 'medium',
                              my: 0.5
                            }}
                          >
                            {notification.message}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block' }}
                          >
                            {formatTimestamp(notification.timestamp)}
                            {notification.user && ` • User: ${notification.user.name} (ID: ${notification.user.id})`}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < sampleNotifications.length - 1 && <Divider component="li" />}
                </React.Fragment>
              );
            })}
          </List>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Button>
              View All Notifications
            </Button>
          </Box>
        </CardContent>
      </Card>
      
      {/* Create Announcement Dialog */}
      <Dialog open={createDialogOpen} onClose={handleCreateDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>Send System Announcement</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Announcement Title"
                fullWidth
                required
                value={notificationDetails.title}
                onChange={(e) => setNotificationDetails({
                  ...notificationDetails,
                  title: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={notificationDetails.priority}
                  label="Priority"
                  onChange={(e) => setNotificationDetails({
                    ...notificationDetails,
                    priority: e.target.value as NotificationPriority
                  })}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Announcement Message"
                fullWidth
                required
                multiline
                rows={5}
                value={notificationDetails.message}
                onChange={(e) => setNotificationDetails({
                  ...notificationDetails,
                  message: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Target Audience</InputLabel>
                <Select
                  value="all_users"
                  label="Target Audience"
                >
                  <MenuItem value="all_users">All Users</MenuItem>
                  <MenuItem value="investors">Investors Only</MenuItem>
                  <MenuItem value="admins">Admin Staff Only</MenuItem>
                  <MenuItem value="specific">Specific Users (Select Below)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateDialogClose}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<Send />}
            onClick={handleSendAnnouncement}
          >
            Send Announcement
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminNotifications;