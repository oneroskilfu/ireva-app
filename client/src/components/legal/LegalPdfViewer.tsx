import React, { useState } from 'react';
import { Dialog, DialogTitle, IconButton, DialogContent, DialogActions, Typography, Box, Button } from '@mui/material';
import { X, Check } from 'lucide-react';
import axios from 'axios';

interface LegalPdfViewerProps {
  open: boolean;
  onClose: () => void;
  pdfUrl: string;
  title: string;
  version?: string;
  lastUpdated?: string;
  documentType?: string; // For compliance logging
  showAcceptButton?: boolean;
  onAccept?: () => void;
}

export default function LegalPdfViewer({ 
  open, 
  onClose, 
  pdfUrl, 
  title, 
  version = "1.0.3", 
  lastUpdated = "April 2025" 
}: LegalPdfViewerProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2 }}>
        {title}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <X size={20} />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ height: '70vh', p: 0 }}>
        <iframe
          src={pdfUrl}
          width="100%"
          height="100%"
          style={{ border: 'none' }}
          title={title}
        />
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', p: 2 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Version: {version} | Last Updated: {lastUpdated}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            &copy; {new Date().getFullYear()} iREVA. All rights reserved.
          </Typography>
        </Box>
      </DialogActions>
    </Dialog>
  );
}