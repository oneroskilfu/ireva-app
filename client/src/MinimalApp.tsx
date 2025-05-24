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
  IconButton
} from "@mui/material";
import { Menu as MenuIcon, Notifications, AccountCircle } from "@mui/icons-material";

// Enhanced app with more Material UI components for testing
export default function MinimalApp() {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton 
            edge="start" 
            color="inherit" 
            aria-label="menu" 
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            iREVA Platform
          </Typography>
          <IconButton color="inherit">
            <Notifications />
          </IconButton>
          <IconButton color="inherit">
            <AccountCircle />
          </IconButton>
        </Toolbar>
      </AppBar>
      
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