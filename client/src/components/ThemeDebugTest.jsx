// src/components/ThemeDebugTest.jsx
import React from 'react';
import { Button, Typography, Box } from '@mui/material';

const ThemeDebugTest = () => {
  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" color="primary">
        Theme Debug Test
      </Typography>
      <Typography variant="body1" sx={{ marginBottom: 2 }}>
        If you see this text styled correctly, the ThemeProvider is working!
      </Typography>
      <Button variant="contained" color="primary">
        Primary Button
      </Button>
      <Button variant="outlined" color="secondary" sx={{ marginLeft: 2 }}>
        Secondary Button
      </Button>
    </Box>
  );
};

export default ThemeDebugTest;