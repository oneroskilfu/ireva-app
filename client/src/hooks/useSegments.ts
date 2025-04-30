import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';

export interface Segment {
  id: string;
  name: string;
  filters: {
    minInvestment?: number;
    lastActivityDays?: number;
    kycStatus?: string[];
    investorType?: string[];
    registrationDateFrom?: string;
    registrationDateTo?: string;
  };
  userCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface CreateSegmentData {
  name: string;
  filters: Record<string, any>;
}

export const useSegments = () => {
  const queryClient = useQueryClient();
  
  // Fetch all segments
  const { data: segments, isLoading, error } = useQuery<Segment[]>({
    queryKey: ['/api/crm/segments'],
    refetchOnWindowFocus: false,
  });

  // Create a new segment
  const createSegment = useMutation({
    mutationFn: async (data: CreateSegmentData) => {
      const res = await apiRequest('POST', '/api/crm/segments', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/segments'] });
    },
  });

  // Update a segment
  const updateSegment = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<Segment> }) => {
      const res = await apiRequest('PUT', `/api/crm/segments/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/segments'] });
    },
  });

  // Delete a segment
  const deleteSegment = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('DELETE', `/api/crm/segments/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/segments'] });
    },
  });

  // Fetch segment details with user count
  const getSegmentDetails = (segmentId: string) => {
    return useQuery<Segment>({
      queryKey: [`/api/crm/segments/${segmentId}`],
      enabled: !!segmentId,
      refetchOnWindowFocus: false,
    });
  };

  return {
    segments: segments || [],
    isLoading,
    error,
    createSegment,
    updateSegment,
    deleteSegment,
    getSegmentDetails,
  };
};