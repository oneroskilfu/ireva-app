import React from 'react';
import { Snackbar, Alert, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';

/**
 * CustomSnackbar component for showing alerts and notifications
 * 
 * @param {Object} props Component props
 * @param {boolean} props.open Whether the snackbar is open
 * @param {Function} props.onClose Function to call when the snackbar is closed
 * @param {string} props.severity The severity of the alert ('success', 'error', 'warning', 'info')
 * @param {string} props.message The message to display
 * @param {number} props.duration How long to show the snackbar in milliseconds (default: 6000ms)
 */
const CustomSnackbar = ({ 
  open, 
  onClose, 
  severity = 'success', 
  message = '', 
  duration = 6000 
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        severity={severity}
        variant="filled"
        onClose={onClose}
        action={
          <IconButton 
            size="small" 
            aria-label="close" 
            color="inherit" 
            onClick={onClose}
          >
            <Close fontSize="small" />
          </IconButton>
        }
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default CustomSnackbar;