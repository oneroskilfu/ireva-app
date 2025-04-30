import { useState } from 'react';
import {
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  CircularProgress
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/queryClient';
import { toast } from '../../lib/toast';

interface User {
  id: string;
  email: string;
  status: 'active' | 'inactive' | 'suspended' | 'deactivated';
}

interface StatusToggleProps {
  user: User;
  onUpdate?: () => void;
}

const StatusToggle = ({ user, onUpdate }: StatusToggleProps) => {
  const [status, setStatus] = useState(user.status);
  const queryClient = useQueryClient();

  // Update user status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (newStatus: string) => 
      apiRequest("PATCH", `/api/admin/users/${user.id}/status`, { status: newStatus })
        .then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "Status Updated",
        description: `User status has been updated to ${status}.`,
        variant: "success"
      });
      
      if (onUpdate) {
        onUpdate();
      }
    },
    onError: (error) => {
      // Revert to the original status
      setStatus(user.status);
      
      toast({
        title: "Status Update Failed",
        description: error.message || "Failed to update user status.",
        variant: "destructive"
      });
    }
  });

  const handleChange = (event: SelectChangeEvent<string>) => {
    const newStatus = event.target.value;
    setStatus(newStatus as 'active' | 'inactive' | 'suspended' | 'deactivated');
    updateStatusMutation.mutate(newStatus);
  };

  return (
    <FormControl fullWidth size="small" sx={{ minWidth: 120 }}>
      {updateStatusMutation.isPending ? (
        <CircularProgress size={24} sx={{ m: 1 }} />
      ) : (
        <Select
          value={status}
          onChange={handleChange}
          displayEmpty
        >
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
          <MenuItem value="suspended">Suspended</MenuItem>
          <MenuItem value="deactivated">Deactivated</MenuItem>
        </Select>
      )}
    </FormControl>
  );
};

export default StatusToggle;