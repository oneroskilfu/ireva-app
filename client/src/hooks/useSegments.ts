import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '../lib/queryClient';

export function useSegments() {
  const { data: segments = [], isLoading: isLoadingSegments } = useQuery({
    queryKey: ['/api/crm/segments'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/crm/segments');
      return await response.json();
    }
  });

  const createSegmentMutation = useMutation({
    mutationFn: async (segmentData: any) => {
      const response = await apiRequest('POST', '/api/crm/segments', segmentData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/segments'] });
    }
  });

  const updateSegmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest('PUT', `/api/crm/segments/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/segments'] });
    }
  });

  const deleteSegmentMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/crm/segments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/segments'] });
    }
  });

  return {
    segments,
    isLoadingSegments,
    createSegment: createSegmentMutation.mutate,
    updateSegment: updateSegmentMutation.mutate,
    deleteSegment: deleteSegmentMutation.mutate,
    isCreatingSegment: createSegmentMutation.isPending,
    isUpdatingSegment: updateSegmentMutation.isPending,
    isDeletingSegment: deleteSegmentMutation.isPending
  };
}