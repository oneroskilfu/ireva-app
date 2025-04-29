import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  Divider,
  IconButton,
  Button
} from '@mui/material';
import { 
  Notifications,
  Money,
  FormatListBulleted,
  Event,
  Announcement,
  KeyboardArrowRight,
  MarkEmailRead
} from '@mui/icons-material';
import axios from 'axios';
import { useLocation } from 'wouter';

// Icon mapping for different notification types
const notificationIcons = {
  investment: <Money fontSize="small" color="primary" />,
  roi: <Money fontSize="small" color="success" />,
  property: <FormatListBulleted fontSize="small" color="info" />,
  event: <Event fontSize="small" color="secondary" />,
  announcement: <Announcement fontSize="small" color="warning" />
};

const NotificationsList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [_, navigate] = useLocation();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/notifications');
        setNotifications(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications');
        setLoading(false);
      }
    };

    fetchNotifications();

    // Poll for new notifications every 60 seconds
    const intervalId = setInterval(fetchNotifications, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  const markAsRead = async (id) => {
    try {
      await axios.patch(`/api/notifications/${id}/read`);
      setNotifications(
        notifications.map(notification => 
          notification.id === id 
            ? { ...notification, read: true } 
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch('/api/notifications/mark-all-read');
      setNotifications(
        notifications.map(notification => ({ ...notification, read: true }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const handleViewAll = () => {
    navigate('/investor/notifications');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress size={30} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mr: 1 }}>
            Notifications
          </Typography>
          <Badge badgeContent={unreadCount} color="error">
            <Notifications color="action" />
          </Badge>
        </Box>
        <Box>
          <IconButton 
            size="small" 
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            title="Mark all as read"
          >
            <MarkEmailRead fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      
      {notifications.length > 0 ? (
        <>
          <List sx={{ flexGrow: 1, overflow: 'auto', py: 0 }}>
            {notifications.slice(0, 5).map((notification) => (
              <React.Fragment key={notification.id}>
                <ListItem 
                  alignItems="flex-start"
                  sx={{ 
                    py: 1, 
                    px: 0,
                    backgroundColor: notification.read ? 'transparent' : 'action.hover',
                    '&:hover': { backgroundColor: 'action.selected' }
                  }}
                  secondaryAction={
                    !notification.read && (
                      <IconButton 
                        edge="end" 
                        size="small" 
                        onClick={() => markAsRead(notification.id)}
                      >
                        <MarkEmailRead fontSize="small" />
                      </IconButton>
                    )
                  }
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {notificationIcons[notification.type] || <Notifications fontSize="small" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={notification.title}
                    secondary={
                      <React.Fragment>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                          sx={{ display: 'block', fontSize: '0.75rem' }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                        >
                          {new Date(notification.createdAt).toLocaleString()}
                        </Typography>
                      </React.Fragment>
                    }
                    primaryTypographyProps={{ 
                      variant: 'body2', 
                      fontWeight: notification.read ? 'normal' : 'bold' 
                    }}
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
          
          <Box sx={{ mt: 'auto', pt: 1, textAlign: 'center' }}>
            <Button 
              variant="text" 
              size="small" 
              endIcon={<KeyboardArrowRight />}
              onClick={handleViewAll}
            >
              View All ({notifications.length})
            </Button>
          </Box>
        </>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          flexGrow: 1,
          flexDirection: 'column',
          p: 2
        }}>
          <Notifications sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="body2" color="text.secondary" align="center">
            No notifications to display
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default NotificationsList;