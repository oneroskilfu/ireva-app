// client/src/components/admin/AdminAnalyticsOverview.tsx

import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const metrics = [
  { title: 'Total Users', value: 1243 },
  { title: 'Verified Investors', value: 874 },
  { title: 'Projects Funded', value: 32 },
  { title: 'Total Volume', value: '$1.2M' },
];

const chartData = [
  { month: 'Jan', investments: 120 },
  { month: 'Feb', investments: 210 },
  { month: 'Mar', investments: 320 },
  { month: 'Apr', investments: 440 },
  { month: 'May', investments: 310 },
];

export default function AdminAnalyticsOverview() {
  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>Platform Overview</Typography>

      <Grid container spacing={2} mb={4}>
        {metrics.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.title}>
            <Paper elevation={3} sx={{ padding: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                {item.title}
              </Typography>
              <Typography variant="h6">{item.value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" mb={2}>Monthly Investment Volume</Typography>
      <Paper elevation={3} sx={{ padding: 2, height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="investments" fill="#1976d2" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
}