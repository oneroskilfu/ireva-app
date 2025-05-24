import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '../lib/queryClient';

export function useCommunications() {
  const { data: communications = [], isLoading: isLoadingCommunications } = useQuery({
    queryKey: ['/api/crm/communications'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/crm/communications');
      return await response.json();
    }
  });

  const createCommunicationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/crm/communications', data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/communications'] });
    }
  });

  const updateCommunicationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest('PUT', `/api/crm/communications/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/communications'] });
    }
  });

  const deleteCommunicationMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/crm/communications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/communications'] });
    }
  });

  const sendCommunicationMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('POST', `/api/crm/communications/${id}/send`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/communications'] });
    }
  });

  return {
    communications,
    isLoadingCommunications,
    createCommunication: createCommunicationMutation.mutate,
    updateCommunication: updateCommunicationMutation.mutate,
    deleteCommunication: deleteCommunicationMutation.mutate,
    sendCommunication: sendCommunicationMutation.mutate,
    isCreatingCommunication: createCommunicationMutation.isPending,
    isUpdatingCommunication: updateCommunicationMutation.isPending,
    isDeletingCommunication: deleteCommunicationMutation.isPending,
    isSendingCommunication: sendCommunicationMutation.isPending
  };
}