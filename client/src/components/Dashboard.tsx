import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken } from '../utils/auth.js';
import { useToast } from '@/hooks/use-toast';

// MUI components
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Stack,
  Divider,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Button,
  Chip
} from '@mui/material';

// Lucide icons
import {
  TrendingUp,
  Building,
  Users,
  DollarSign,
  Calendar,
  User,
  MessageSquare,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface DashboardStats {
  totalProperties: number;
  totalInvestors: number;
  totalInvestment: number;
  activeProjects: number;
  avgInvestment: number;
  roi: number;
}

interface RecentActivity {
  id: number;
  type: string;
  user: string;
  action: string;
  timestamp: string;
  amount?: number;
  property?: string;
}

interface UpcomingEvent {
  id: number;
  title: string;
  date: string;
  type: string;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    totalInvestors: 0,
    totalInvestment: 0,
    activeProjects: 0,
    avgInvestment: 0,
    roi: 0
  });
  
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real implementation, you'd call your API endpoints
        const statsRes = await axios.get('/api/dashboard/stats', {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        
        const activitiesRes = await axios.get('/api/dashboard/activities', {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        
        const eventsRes = await axios.get('/api/dashboard/events', {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        
        setStats(statsRes.data);
        setRecentActivity(activitiesRes.data);
        setUpcomingEvents(eventsRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
        
        // Since the endpoints aren't implemented, use sample data
        setStats({
          totalProperties: 12,
          totalInvestors: 48,
          totalInvestment: 24500000,
          activeProjects: 8,
          avgInvestment: 510000,
          roi: 14.5
        });
        
        setRecentActivity([
          {
            id: 1,
            type: 'investment',
            user: 'Adebayo Johnson',
            action: 'invested in',
            property: 'Lagos Waterfront Apartments',
            amount: 2000000,
            timestamp: '2023-04-14T10:30:00'
          },
          {
            id: 2,
            type: 'property',
            user: 'Admin',
            action: 'added new property',
            property: 'Abuja Heights Complex',
            timestamp: '2023-04-13T14:45:00'
          },
          {
            id: 3,
            type: 'user',
            user: 'Chioma Okafor',
            action: 'created account',
            timestamp: '2023-04-13T09:15:00'
          },
          {
            id: 4,
            type: 'message',
            user: 'Emmanuel Nwachukwu',
            action: 'sent a message about',
            property: 'Lekki Phase 1 Commercial Center',
            timestamp: '2023-04-12T16:20:00'
          }
        ]);
        
        setUpcomingEvents([
          {
            id: 1,
            title: 'Property Launch: Abuja Heights Complex',
            date: '2023-04-20T14:00:00',
            type: 'launch'
          },
          {
            id: 2,
            title: 'Dividend Payout: Lagos Waterfront',
            date: '2023-04-25T00:00:00',
            type: 'payout'
          },
          {
            id: 3,
            title: 'Investment Round Closing: Ikoyi Towers',
            date: '2023-04-30T23:59:59',
            type: 'deadline'
          }
        ]);
      }
    };
    
    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-NG', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'investment':
        return <DollarSign color="#047857" />;
      case 'property':
        return <Building color="#0369a1" />;
      case 'user':
        return <User color="#7c3aed" />;
      case 'message':
        return <MessageSquare color="#b45309" />;
      default:
        return <CheckCircle color="#059669" />;
    }
  };

  const getEventChipColor = (type: string): 'success' | 'primary' | 'warning' | 'default' => {
    switch(type) {
      case 'launch':
        return 'success';
      case 'payout':
        return 'primary';
      case 'deadline':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getEventIcon = (type: string) => {
    switch(type) {
      case 'launch':
        return <Building className="h-5 w-5" />;
      case 'payout':
        return <DollarSign className="h-5 w-5" />;
      case 'deadline':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Calendar className="h-5 w-5" />;
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Dashboard Overview
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" mb={4}>
        Welcome to the REVA Real Estate Investment Platform
      </Typography>
      
      {error && (
        <Paper 
          sx={{ 
            p: 2, 
            mb: 4, 
            bgcolor: '#fef2f2', 
            border: '1px solid #fee2e2',
            color: '#b91c1c'
          }}
        >
          {error}
        </Paper>
      )}
      
      {loading ? (
        <Box sx={{ width: '100%', mb: 4 }}>
          <LinearProgress />
        </Box>
      ) : (
        <>
          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={2}>
                <CardContent>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Properties
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {stats.totalProperties}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#e0f2fe', color: '#0284c7', width: 56, height: 56 }}>
                      <Building color="#0284c7" />
                    </Avatar>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={2}>
                <CardContent>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Investors
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {stats.totalInvestors}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#f3e8ff', color: '#7e22ce', width: 56, height: 56 }}>
                      <Users color="#7e22ce" />
                    </Avatar>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={2}>
                <CardContent>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Total Investment
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {formatCurrency(stats.totalInvestment)}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#ecfdf5', color: '#047857', width: 56, height: 56 }}>
                      <DollarSign color="#047857" />
                    </Avatar>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={2}>
                <CardContent>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Average ROI
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {stats.roi}%
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#fff7ed', color: '#c2410c', width: 56, height: 56 }}>
                      <TrendingUp color="#c2410c" />
                    </Avatar>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Activity and Events */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Card elevation={2} sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    Recent Activity
                  </Typography>
                  <List>
                    {recentActivity.map((activity) => (
                      <React.Fragment key={activity.id}>
                        <ListItem alignItems="flex-start">
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: '#f3f4f6' }}>
                              {getActivityIcon(activity.type)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="body1">
                                <Typography component="span" fontWeight="bold">{activity.user}</Typography>
                                {' '}{activity.action}{' '}
                                {activity.property && (
                                  <Typography component="span" fontWeight="medium" color="primary">
                                    {activity.property}
                                  </Typography>
                                )}
                                {activity.amount && (
                                  <Typography component="span" fontWeight="medium">
                                    {' '}{formatCurrency(activity.amount)}
                                  </Typography>
                                )}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="body2" color="text.secondary">
                                {formatDate(activity.timestamp)} at {formatTime(activity.timestamp)}
                              </Typography>
                            }
                          />
                        </ListItem>
                        <Divider variant="inset" component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Button variant="outlined" size="small">View All Activity</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={5}>
              <Card elevation={2} sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    Upcoming Events
                  </Typography>
                  <List>
                    {upcomingEvents.map((event) => (
                      <ListItem key={event.id} sx={{ mb: 2, p: 2, bgcolor: '#f9fafb', borderRadius: 1 }}>
                        <Stack direction="column" spacing={1} width="100%">
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Avatar sx={{ width: 36, height: 36, bgcolor: '#f3f4f6' }}>
                              {getEventIcon(event.type)}
                            </Avatar>
                            <Box>
                              <Typography variant="body1" fontWeight="medium">{event.title}</Typography>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography variant="body2" color="text.secondary">
                                  {formatDate(event.date)}
                                </Typography>
                                <Chip 
                                  label={event.type} 
                                  size="small" 
                                  color={getEventChipColor(event.type)}
                                  sx={{ height: 20 }}
                                />
                              </Stack>
                            </Box>
                          </Stack>
                        </Stack>
                      </ListItem>
                    ))}
                  </List>
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Button variant="outlined" size="small">View Calendar</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default Dashboard;