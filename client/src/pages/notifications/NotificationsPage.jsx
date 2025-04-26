import React, { useState, useEffect } from 'react';
import { 
  Box,
  Typography,
  Container,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton,
  Tab,
  Tabs,
  Grid
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Delete as DeleteIcon,
  MarkEmailRead as MarkReadIcon,
  Business as PropertyIcon,
  AccountBalance as InvestmentIcon,
  Payment as PaymentIcon,
  Announcement as AnnouncementIcon
} from '@mui/icons-material';
import PushNotificationSubscription from '../../components/PushNotificationSubscription';
import PushNotificationDemo from '../../components/PushNotificationDemo';

// Mock notifications data - would come from API in production
const mockNotifications = [
  {
    id: 1,
    type: 'property',
    title: 'New Property Available',
    message: 'A new premium property has been listed in Lagos, Nigeria. Check it out!',
    date: '2023-10-15T09:45:00',
    read: false
  },
  {
    id: 2,
    type: 'investment',
    title: 'ROI Payment Received',
    message: 'You have received an ROI payment of ₦185,000 for Westfield Retail Center.',
    date: '2023-10-14T14:30:00',
    read: true
  },
  {
    id: 3,
    type: 'payment',
    title: 'Payment Successful',
    message: 'Your investment of ₦2,500,000 in Oakridge Apartments has been processed successfully.',
    date: '2023-10-12T11:20:00',
    read: false
  },
  {
    id: 4,
    type: 'announcement',
    title: 'Platform Maintenance',
    message: 'We will be conducting platform maintenance on October 20th from 2AM to 4AM WAT.',
    date: '2023-10-10T16:15:00',
    read: true
  },
  {
    id: 5,
    type: 'property',
    title: 'Property Update',
    message: 'Construction update available for Oakridge Apartments. New photos have been added.',
    date: '2023-10-08T10:00:00',
    read: false
  }
];

const getIconByType = (type) => {
  switch (type) {
    case 'property':
      return <PropertyIcon />;
    case 'investment':
      return <InvestmentIcon />;
    case 'payment':
      return <PaymentIcon />;
    case 'announcement':
      return <AnnouncementIcon />;
    default:
      return <NotificationsIcon />;
  }
};

const getColorByType = (type) => {
  switch (type) {
    case 'property':
      return 'primary';
    case 'investment':
      return 'success';
    case 'payment':
      return 'info';
    case 'announcement':
      return 'warning';
    default:
      return 'default';
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [activeTab, setActiveTab] = useState(0);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };
  
  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };
  
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };
  
  const filteredNotifications = activeTab === 0 
    ? notifications
    : activeTab === 1 
      ? notifications.filter(n => !n.read)
      : notifications.filter(n => n.read);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Notifications
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ pb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <NotificationsIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Your Notifications</Typography>
                  {unreadCount > 0 && (
                    <Chip 
                      size="small" 
                      label={`${unreadCount} unread`} 
                      color="primary" 
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
                <Chip 
                  label="Mark all as read" 
                  variant="outlined" 
                  size="small"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  sx={{ cursor: 'pointer' }}
                />
              </Box>
              
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange}
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab label="All" />
                <Tab label="Unread" />
                <Tab label="Read" />
              </Tabs>
            </CardContent>
            
            <List sx={{ pt: 0 }}>
              {filteredNotifications.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    {activeTab === 1 
                      ? "You have no unread notifications." 
                      : activeTab === 2 
                      ? "You have no read notifications." 
                      : "You have no notifications."}
                  </Typography>
                </Box>
              ) : (
                filteredNotifications.map((notification, index) => (
                  <React.Fragment key={notification.id}>
                    <ListItem 
                      alignItems="flex-start"
                      secondaryAction={
                        <Box>
                          {!notification.read && (
                            <IconButton 
                              edge="end" 
                              aria-label="mark as read" 
                              size="small"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <MarkReadIcon />
                            </IconButton>
                          )}
                          <IconButton 
                            edge="end" 
                            aria-label="delete" 
                            size="small"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      }
                      sx={{
                        bgcolor: notification.read ? 'inherit' : 'action.hover',
                        transition: 'background-color 0.3s'
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: `${getColorByType(notification.type)}.main` }}>
                          {getIconByType(notification.type)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography 
                              variant="subtitle2" 
                              fontWeight={notification.read ? 'regular' : 'bold'}
                            >
                              {notification.title}
                            </Typography>
                            <Chip 
                              label={notification.type}
                              size="small"
                              color={getColorByType(notification.type)}
                              sx={{ ml: 1, height: 20, '& .MuiChip-label': { px: 1 } }}
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                              sx={{ display: 'block', mb: 0.5 }}
                            >
                              {notification.message}
                            </Typography>
                            <Typography
                              component="span"
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatDate(notification.date)}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < filteredNotifications.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))
              )}
            </List>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Push Notification Settings
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Enable push notifications to stay updated on your investments even when you're not on the site.
              </Typography>
              <PushNotificationSubscription />
            </CardContent>
          </Card>
          
          {/* If user is on a testing or development environment, show demo component */}
          <PushNotificationDemo />
        </Grid>
      </Grid>
    </Container>
  );
};

export default NotificationsPage;