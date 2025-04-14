import React from 'react';
import { Drawer, List, ListItem, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';

const Sidebar = () => (
  <Drawer variant="permanent" anchor="left">
    <List>
      <ListItem button component={Link} to="/dashboard"><ListItemText primary="Dashboard" /></ListItem>
      <ListItem button component={Link} to="/messages"><ListItemText primary="Messages" /></ListItem>
      <ListItem button component={Link} to="/investments"><ListItemText primary="Investments" /></ListItem>
      <ListItem button component={Link} to="/roi"><ListItemText primary="ROI Tracker" /></ListItem>
    </List>
  </Drawer>
);

export default Sidebar;