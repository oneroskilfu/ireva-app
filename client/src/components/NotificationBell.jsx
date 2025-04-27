import React, { useState, useEffect } from 'react';
import { Badge, IconButton, Menu, MenuItem, Typography, Box, Divider, Button } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import axios from 'axios';
import { useLocation } from 'wouter';

const NotificationBell = ({ notifications = [], onNotificationClick = null }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [userNotifications, setUserNotifications] = useState(notifications);
  const [, setLocation] = useLocation();

  // Calculate unread notifications count
  const unreadCount = userNotifications.filter((n) => !n.isRead).length;

  // Fetch notifications from API if no notifications are provided
  useEffect(() => {
    if (notifications.length === 0) {
      fetchNotifications();
    } else {
      setUserNotifications(notifications);
    }
  }, [notifications]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications');
      if (response.data) {
        setUserNotifications(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    markAsRead(notification.id);
    
    // If link is provided, navigate to it
    if (notification.link) {
      setLocation(notification.link);
    }
    
    // If custom handler is provided, call it
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    
    handleClose();
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`/api/notifications/${notificationId}/read`);
      // Update local state to mark notification as read
      setUserNotifications(prevNotifications => 
        prevNotifications.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch('/api/notifications/mark-all-read');
      // Update local state to mark all notifications as read
      setUserNotifications(prevNotifications => 
        prevNotifications.map(n => ({ ...n, isRead: true }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
    handleClose();
  };

  const viewAllNotifications = () => {
    setLocation('/notifications');
    handleClose();
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen} aria-label={`${unreadCount} unread notifications`}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          style: {
            maxHeight: 400,
            width: '350px',
          },
        }}
      >
        <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </Box>
        
        <Divider />
        
        {userNotifications.length === 0 ? (
          <MenuItem>
            <Typography variant="body2" sx={{ py: 2, color: 'text.secondary' }}>
              No notifications
            </Typography>
          </MenuItem>
        ) : (
          <>
            {userNotifications.slice(0, 5).map((notification) => (
              <MenuItem 
                key={notification.id} 
                onClick={() => handleNotificationClick(notification)}
                sx={{ 
                  py: 1.5,
                  px: 2,
                  borderLeft: notification.isRead ? 'none' : '3px solid',
                  borderLeftColor: 'primary.main',
                  backgroundColor: notification.isRead ? 'inherit' : 'action.hover'
                }}
              >
                <Box>
                  <Typography variant="subtitle2">
                    {notification.title || "New update!"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {notification.message || notification.body || ""}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {notification.createdAt && new Date(notification.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
            
            <Divider />
            
            <MenuItem onClick={viewAllNotifications} sx={{ justifyContent: 'center' }}>
              <Typography variant="button" color="primary">
                View All Notifications
              </Typography>
            </MenuItem>
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;