import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';

const summaryData = [
  { title: 'Total ROI Paid', value: '₦12,500,000' },
  { title: 'Pending ROI', value: '₦3,200,000' },
  { title: 'Investors Paid', value: '85' },
  { title: 'Projects Paying ROI', value: '6' }
];

const ROIOverview = () => {
  return (
    <Grid container spacing={2}>
      {summaryData.map((item, index) => (
        <Grid item xs={12} md={3} key={index}>
          <Paper elevation={3} style={{ padding: '1rem' }}>
            <Typography variant="subtitle2">{item.title}</Typography>
            <Typography variant="h6">{item.value}</Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default ROIOverview;