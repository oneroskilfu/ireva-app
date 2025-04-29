import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Rating,
  LinearProgress
} from '@mui/material';
import { 
  LocationOn, 
  ArrowForward,
  Favorite,
  FavoriteBorder
} from '@mui/icons-material';
import axios from 'axios';
import { useLocation } from 'wouter';

const PropertyHighlights = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedProperties, setSavedProperties] = useState({});
  const [_, navigate] = useLocation();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/properties/featured');
        setProperties(response.data);
        
        // Get saved properties
        const savedResponse = await axios.get('/api/investor/properties/saved');
        const saved = {};
        savedResponse.data.forEach(prop => {
          saved[prop.id] = true;
        });
        setSavedProperties(saved);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching featured properties:', err);
        setError('Failed to load properties');
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handleViewProperty = (id) => {
    navigate(`/investor/properties/${id}`);
  };

  const handleViewAllProperties = () => {
    navigate('/investor/properties');
  };

  const toggleSaveProperty = async (id) => {
    try {
      if (savedProperties[id]) {
        await axios.delete(`/api/investor/properties/${id}/save`);
        setSavedProperties(prev => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
      } else {
        await axios.post(`/api/investor/properties/${id}/save`);
        setSavedProperties(prev => ({ ...prev, [id]: true }));
      }
    } catch (err) {
      console.error('Error toggling saved property:', err);
    }
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

  if (properties.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography variant="body1" color="text.secondary">
          No featured properties available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Grid container spacing={2}>
        {properties.map((property) => (
          <Grid item key={property.id} xs={12} sm={6} md={4}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                position: 'relative'
              }}
            >
              <Button
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  minWidth: 'auto',
                  p: 0.5,
                  zIndex: 1,
                  bgcolor: 'background.paper',
                  borderRadius: '50%',
                  boxShadow: 2
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSaveProperty(property.id);
                }}
              >
                {savedProperties[property.id] ? (
                  <Favorite color="error" />
                ) : (
                  <FavoriteBorder />
                )}
              </Button>
              
              <CardMedia
                component="img"
                height="140"
                image={property.imageUrl || 'https://via.placeholder.com/300x140?text=Property'}
                alt={property.title}
              />
              
              <CardContent sx={{ flexGrow: 1, p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Chip 
                    label={property.status} 
                    size="small" 
                    color={
                      property.status === 'Open' ? 'success' : 
                      property.status === 'Coming Soon' ? 'warning' : 
                      'default'
                    }
                    variant="outlined"
                  />
                  <Typography variant="body2" color="text.secondary">
                    {property.returnRate}% ROI
                  </Typography>
                </Box>
                
                <Typography variant="h6" component="h3" sx={{ mb: 0.5, fontWeight: 'bold' }}>
                  {property.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  mb: 1
                }}>
                  <LocationOn fontSize="small" sx={{ mr: 0.5 }} />
                  {property.location}
                </Typography>
                
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Investment Progress
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={property.investmentProgress} 
                    sx={{ mb: 0.5, height: 6, borderRadius: 1 }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      ${property.currentInvestment.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ${property.targetInvestment.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating 
                    value={property.rating || 0} 
                    readOnly 
                    size="small" 
                    precision={0.5}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    ({property.reviewCount || 0} reviews)
                  </Typography>
                </Box>
                
                <Button 
                  variant="outlined" 
                  size="small" 
                  fullWidth 
                  endIcon={<ArrowForward />}
                  onClick={() => handleViewProperty(property.id)}
                  sx={{ mt: 'auto' }}
                >
                  View Property
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Button 
          variant="contained" 
          onClick={handleViewAllProperties}
        >
          View All Properties
        </Button>
      </Box>
    </Box>
  );
};

export default PropertyHighlights;