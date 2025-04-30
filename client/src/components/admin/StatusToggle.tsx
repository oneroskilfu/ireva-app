import React, { useState } from 'react';
import { 
  Select, 
  MenuItem, 
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';

interface StatusToggleProps {
  userId: string | number;
  currentStatus: string;
  onStatusChange: (userId: string | number, newStatus: string) => Promise<void>;
}

export const StatusToggle: React.FC<StatusToggleProps> = ({ userId, currentStatus, onStatusChange }) => {
  const [status, setStatus] = useState(currentStatus);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const newStatus = event.target.value as string;
    setPendingStatus(newStatus);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (pendingStatus) {
      setIsUpdating(true);
      try {
        await onStatusChange(userId, pendingStatus);
        setStatus(pendingStatus);
      } catch (error) {
        console.error('Error updating status:', error);
      } finally {
        setIsUpdating(false);
        setConfirmOpen(false);
        setPendingStatus(null);
      }
    }
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    setPendingStatus(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'suspended':
        return 'error';
      case 'deactivated':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Chip 
          label={status} 
          color={getStatusColor(status) as any}
          size="small"
        />
        
        <Select
          value={status}
          onChange={handleStatusChange as any}
          size="small"
          disabled={isUpdating}
          style={{ minWidth: 120 }}
        >
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
          <MenuItem value="suspended">Suspended</MenuItem>
          <MenuItem value="deactivated">Deactivated</MenuItem>
        </Select>
      </div>

      <Dialog
        open={confirmOpen}
        onClose={handleCancel}
      >
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to change this user's status from <strong>{status}</strong> to <strong>{pendingStatus}</strong>?
            {pendingStatus === 'suspended' && (
              <p>This will prevent the user from logging in and performing any actions.</p>
            )}
            {pendingStatus === 'deactivated' && (
              <p>This will completely deactivate the user account.</p>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} disabled={isUpdating}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            color="primary" 
            disabled={isUpdating}
            variant="contained"
          >
            {isUpdating ? 'Updating...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};