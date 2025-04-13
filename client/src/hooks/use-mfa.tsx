import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useState } from 'react';

export type MFAMethod = 'app' | 'sms' | 'email' | 'backup';

export type MFASetupState = {
  step: 'idle' | 'setup' | 'verify' | 'complete';
  qrCode?: string;
  secret?: string;
  method?: MFAMethod;
  backupCodes?: string[];
  error?: string;
};

export function useMFA() {
  const { toast } = useToast();
  const [setupState, setSetupState] = useState<MFASetupState>({ step: 'idle' });
  
  // Get MFA status
  const { 
    data: mfaStatus, 
    isLoading: isLoadingStatus, 
    error: statusError 
  } = useQuery({
    queryKey: ['/api/mfa/status'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/mfa/status');
        if (!res.ok) {
          throw new Error('Failed to fetch MFA status');
        }
        return await res.json();
      } catch (error) {
        // Silently fail for non-authenticated users
        return { enabled: false };
      }
    },
    refetchOnWindowFocus: false
  });
  
  // Set up MFA
  const setupMFAMutation = useMutation({
    mutationFn: async ({ method, code }: { method: MFAMethod; code?: string }) => {
      const res = await apiRequest('POST', '/api/mfa/setup', { method, code });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to set up MFA');
      }
      return await res.json();
    },
    onSuccess: (data) => {
      if (data.step === 'setup') {
        setSetupState({
          step: 'setup',
          qrCode: data.qrCode,
          secret: data.secret,
          method: 'app'
        });
      } else if (data.step === 'verify') {
        setSetupState({
          step: 'verify',
          method: setupState.method
        });
      } else if (data.step === 'complete') {
        setSetupState({
          step: 'complete',
          backupCodes: data.backupCodes,
          method: setupState.method
        });
        
        toast({
          title: 'MFA Enabled',
          description: 'Multi-factor authentication has been enabled for your account.'
        });
        
        // Refresh MFA status
        queryClient.invalidateQueries({ queryKey: ['/api/mfa/status'] });
        
        // Also refresh user data since MFA status has changed
        queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      }
    },
    onError: (error: Error) => {
      setSetupState({
        ...setupState,
        error: error.message
      });
      
      toast({
        title: 'MFA Setup Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
  
  // Initiate MFA verification (when logging in)
  const initiateMFAMutation = useMutation({
    mutationFn: async (method: MFAMethod) => {
      const res = await apiRequest('POST', '/api/mfa/initiate', { method });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to initiate MFA verification');
      }
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Verification Initiated',
        description: data.message || 'Please enter the verification code to continue.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Verification Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
  
  // Verify MFA code (when logging in)
  const verifyMFAMutation = useMutation({
    mutationFn: async ({ method, code }: { method: MFAMethod; code: string }) => {
      const res = await apiRequest('POST', '/api/mfa/verify', { method, code });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Invalid verification code');
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Verification Successful',
        description: 'You have been successfully verified.',
      });
      
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Verification Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
  
  // Disable MFA
  const disableMFAMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/mfa/disable');
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to disable MFA');
      }
      return await res.json();
    },
    onSuccess: () => {
      setSetupState({ step: 'idle' });
      
      toast({
        title: 'MFA Disabled',
        description: 'Multi-factor authentication has been disabled for your account.'
      });
      
      // Refresh MFA status
      queryClient.invalidateQueries({ queryKey: ['/api/mfa/status'] });
      
      // Also refresh user data since MFA status has changed
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Disable MFA',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
  
  // Helper functions for setup process
  const startMFASetup = (method: MFAMethod) => {
    setSetupState({ step: 'idle', method });
    setupMFAMutation.mutate({ method });
  };
  
  const verifyMFASetup = (code: string) => {
    if (!setupState.method) {
      toast({
        title: 'Setup Error',
        description: 'No MFA method selected',
        variant: 'destructive'
      });
      return;
    }
    
    setupMFAMutation.mutate({ 
      method: setupState.method, 
      code 
    });
  };
  
  const resetMFASetup = () => {
    setSetupState({ step: 'idle' });
  };
  
  // Loading states
  const isLoading = 
    isLoadingStatus || 
    setupMFAMutation.isPending || 
    initiateMFAMutation.isPending || 
    verifyMFAMutation.isPending || 
    disableMFAMutation.isPending;
  
  return {
    mfaStatus,
    setupState,
    isLoading,
    error: statusError,
    startMFASetup,
    verifyMFASetup,
    resetMFASetup,
    initiateMFAVerification: initiateMFAMutation.mutate,
    verifyMFACode: verifyMFAMutation.mutate,
    disableMFA: disableMFAMutation.mutate
  };
}