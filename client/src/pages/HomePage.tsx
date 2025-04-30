import { 
  Button, 
  Container, 
  Typography, 
  Box, 
  AppBar, 
  Toolbar, 
  Card, 
  CardContent, 
  Grid,
  Paper,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tab,
  Tabs
} from "@mui/material";
import { 
  Menu as MenuIcon, 
  Notifications, 
  AccountCircle, 
  Dashboard, 
  People, 
  Business, 
  Assessment,
  CreditCard,
  Settings, 
  BugReport
} from "@mui/icons-material";
import { useState } from "react";
import { Link } from "wouter";
import DebugLogin from "../components/DebugLogin";

// Enhanced app with more Material UI components for testing
export default function HomePage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountMenuAnchor, setAccountMenuAnchor] = useState<null | HTMLElement>(null);
  
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleAccountMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAccountMenuAnchor(event.currentTarget);
  };
  
  const handleAccountMenuClose = () => {
    setAccountMenuAnchor(null);
  };
  
  const adminMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
    { text: 'User Management', icon: <People />, path: '/admin/users' },
    { text: 'Properties', icon: <Business />, path: '/admin/properties' },
    { text: 'Portfolio', icon: <Assessment />, path: '/admin/portfolio' },
    { text: 'Payments', icon: <CreditCard />, path: '/admin/payments' },
    { text: 'Settings', icon: <Settings />, path: '/admin/settings' }
  ];
  
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton 
            edge="start" 
            color="inherit" 
            aria-label="menu" 
            sx={{ mr: 2 }}
            onClick={toggleDrawer}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            iREVA Platform
          </Typography>
          <IconButton color="inherit">
            <Notifications />
          </IconButton>
          <IconButton 
            color="inherit"
            onClick={handleAccountMenuOpen}
          >
            <AccountCircle />
          </IconButton>
          
          <Menu
            anchorEl={accountMenuAnchor}
            open={Boolean(accountMenuAnchor)}
            onClose={handleAccountMenuClose}
          >
            <MenuItem onClick={handleAccountMenuClose}>Profile</MenuItem>
            <MenuItem onClick={handleAccountMenuClose}>My Account</MenuItem>
            <MenuItem onClick={handleAccountMenuClose}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
      >
        <Box
          sx={{ width: 250 }}
          role="presentation"
        >
          <List>
            {adminMenuItems.map((item) => (
              <Link href={item.path} key={item.text}>
                <ListItem 
                  onClick={toggleDrawer}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } 
                  }}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              </Link>
            ))}
          </List>
        </Box>
      </Drawer>
      
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Welcome to iREVA
          </Typography>
          <Typography variant="h5" gutterBottom>
            Real Estate Investment Platform
          </Typography>
          
          <Box sx={{ mt: 4, mb: 6 }}>
            <Button variant="contained" color="primary" size="large" sx={{ m: 1 }}>
              Get Started
            </Button>
            <Button variant="outlined" color="primary" size="large" sx={{ m: 1 }}>
              Learn More
            </Button>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 6 }} />
        
        <Typography variant="h4" component="h2" gutterBottom>
          Featured Properties
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} md={4} key={item}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Property {item}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    A high-quality investment opportunity with excellent returns.
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Button size="small" color="primary">
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            About iREVA
          </Typography>
          <Typography variant="body1">
            iREVA is a cutting-edge real estate investment platform that enables investors
            to participate in high-quality property investments with minimal capital.
          </Typography>
        </Paper>
      </Container>
    </>
  );
}