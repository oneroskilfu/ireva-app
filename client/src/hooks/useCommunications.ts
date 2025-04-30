import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';

export interface Communication {
  id: string;
  title: string;
  content: string;
  channel: 'email' | 'push' | 'sms';
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  segmentId?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommunicationLog {
  id: string;
  userId: string;
  communicationId: string;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  sentAt?: string;
  openedAt?: string;
}

export interface CommunicationFilters {
  status?: string;
  channel?: string;
  query?: string;
}

export const useCommunications = (filters?: CommunicationFilters) => {
  const queryClient = useQueryClient();
  const queryParams = new URLSearchParams();
  
  if (filters) {
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.channel) queryParams.append('channel', filters.channel);
    if (filters.query) queryParams.append('query', filters.query);
  }
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  
  // Fetch all communications with optional filters
  const { data: communications, isLoading, error } = useQuery<Communication[]>({
    queryKey: [`/api/crm/communications${queryString}`],
    refetchOnWindowFocus: false,
  });

  // Send a communication immediately
  const sendCommunication = useMutation({
    mutationFn: async (communicationId: string) => {
      const res = await apiRequest('POST', `/api/crm/communications/${communicationId}/send`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/communications'] });
    },
  });

  // Update a communication
  const updateCommunication = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<Communication> }) => {
      const res = await apiRequest('PUT', `/api/crm/communications/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/communications'] });
    },
  });

  // Get logs for a specific communication
  const getCommunicationLogs = (communicationId: string) => {
    return useQuery<CommunicationLog[]>({
      queryKey: [`/api/crm/communications/${communicationId}/logs`],
      enabled: !!communicationId,
      refetchOnWindowFocus: false,
    });
  };

  return {
    communications: communications || [],
    isLoading,
    error,
    sendCommunication,
    updateCommunication,
    getCommunicationLogs,
  };
};