import React from 'react';
import { Dialog, DialogTitle, IconButton, DialogContent } from '@mui/material';
import { X } from 'lucide-react';

interface LegalPdfViewerProps {
  open: boolean;
  onClose: () => void;
  pdfUrl: string;
  title: string;
}

export default function LegalPdfViewer({ open, onClose, pdfUrl, title }: LegalPdfViewerProps) {
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
      <DialogContent dividers sx={{ height: '80vh', p: 0 }}>
        <iframe
          src={pdfUrl}
          width="100%"
          height="100%"
          style={{ border: 'none' }}
          title={title}
        />
      </DialogContent>
    </Dialog>
  );
}