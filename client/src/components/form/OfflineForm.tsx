import React from 'react';
import { saveForLater, isOnline, saveOrUpload } from '@/utils/offlineStorage';
import { useToast } from '@/hooks/use-toast';
import { useOfflineQueue } from '@/hooks/use-offline-queue';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, WifiOff } from 'lucide-react';

interface OfflineFormWrapperProps {
  children: React.ReactNode;
  onSubmit: (data: any) => Promise<void>;
  formData: any;
  storeName: string;
  apiEndpoint: string;
  successMessage?: string;
  pendingMessage?: string;
}

/**
 * A wrapper component that adds offline support to any form.
 * If offline, it will save the form data to IndexedDB and queue it for later submission.
 */
export const OfflineFormWrapper: React.FC<OfflineFormWrapperProps> = ({
  children,
  onSubmit,
  formData,
  storeName,
  apiEndpoint,
  successMessage = 'Your submission was successful',
  pendingMessage = 'You are offline. Your data will be submitted when you reconnect.'
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [offlineSubmitted, setOfflineSubmitted] = React.useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!isOnline()) {
        // We're offline - store data and register for sync
        await saveForLater(storeName, {
          ...formData,
          id: new Date().toISOString(),
          createdAt: new Date().toISOString()
        });
        
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          // TypeScript doesn't know about SyncManager yet
          // @ts-ignore
          await registration.sync.register(`sync-${storeName}`);
        }
        
        setOfflineSubmitted(true);
        
        toast({
          title: 'Saved for later',
          description: pendingMessage,
          variant: 'default'
        });
      } else {
        // We're online - process normally
        await onSubmit(formData);
        
        toast({
          title: 'Success',
          description: successMessage,
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: 'Error',
        description: 'There was a problem with your submission. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {!isOnline() && !offlineSubmitted && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>You are offline</AlertTitle>
          <AlertDescription>
            Don't worry! You can still submit this form. Your data will be saved and sent automatically when you're back online.
          </AlertDescription>
        </Alert>
      )}
      
      {offlineSubmitted && (
        <Alert className="mb-4">
          <WifiOff className="h-4 w-4" />
          <AlertTitle>Saved for offline submission</AlertTitle>
          <AlertDescription>
            Your data has been saved and will be submitted automatically when you reconnect to the internet.
          </AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        {children}
        
        <Button 
          type="submit" 
          disabled={isSubmitting || offlineSubmitted} 
          className="w-full mt-4"
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
    </div>
  );
};

// Example usage with investment form
export const OfflineInvestmentForm = () => {
  const [amount, setAmount] = React.useState('');
  const [projectId, setProjectId] = React.useState('');
  const { toast } = useToast();
  
  // Use our offline queue hook
  const { saveOffline, status } = useOfflineQueue('investments', 'sync-investments');
  
  // Get userId from auth context or elsewhere
  const userId = 'current-user-id'; // Replace with actual user ID
  
  const handleInvestmentSubmit = async (data: any) => {
    try {
      if (!isOnline()) {
        // We're offline - use our hook to save the data
        await saveOffline(data);
        toast({
          title: 'Investment Saved',
          description: 'Your investment will be submitted when you reconnect to the internet.',
          variant: 'default'
        });
        return { success: true, offline: true };
      } else {
        // We're online - normal submission
        const response = await fetch('/api/investments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          throw new Error('Investment submission failed');
        }
        
        const result = await response.json();
        
        toast({
          title: 'Investment Successful',
          description: 'Your investment has been successfully submitted.',
          variant: 'default'
        });
        
        return result;
      }
    } catch (error) {
      // If online submission fails due to network issues, try offline
      if (!isOnline()) {
        await saveOffline(data);
        toast({
          title: 'Connection Lost',
          description: 'Your investment has been saved and will be submitted when you reconnect.',
          variant: 'default'
        });
        return { success: true, offline: true };
      }
      
      // Otherwise it's a different error
      console.error('Investment submission error:', error);
      toast({
        title: 'Submission Failed',
        description: 'There was a problem submitting your investment. Please try again.',
        variant: 'destructive'
      });
      throw error;
    }
  };
  
  const formData = {
    amount: parseFloat(amount),
    projectId,
    userId,
    timestamp: new Date().toISOString()
  };
  
  return (
    <>
      {status.queuedItems > 0 && (
        <Alert className="mb-4 bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertTitle>Pending Investments</AlertTitle>
          <AlertDescription>
            You have {status.queuedItems} pending investment{status.queuedItems > 1 ? 's' : ''} that will be submitted when you're back online.
          </AlertDescription>
        </Alert>
      )}
    
      <OfflineFormWrapper
        onSubmit={handleInvestmentSubmit}
        formData={formData}
        storeName="investments"
        apiEndpoint="/api/investments"
        successMessage="Your investment has been successfully submitted"
        pendingMessage="Your investment will be submitted when you're back online"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="amount" className="block text-sm font-medium">
              Investment Amount (₦)
            </label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter amount"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="projectId" className="block text-sm font-medium">
              Project
            </label>
            <select
              id="projectId"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
            >
              <option value="">Select a project</option>
              <option value="project-1">Lakeside Apartments</option>
              <option value="project-2">Westfield Commercial Center</option>
              <option value="project-3">Palm Springs Residences</option>
            </select>
          </div>
        </div>
      </OfflineFormWrapper>
    </>
  );
};

// Simpler implementation for direct use in forms
export async function handleOfflineFormSubmission(
  formData: any,
  storeName: string,
  apiEndpoint: string
) {
  if (!isOnline()) {
    // We're offline - store data and register for sync
    await saveForLater(storeName, {
      ...formData,
      id: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });
    
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      // TypeScript doesn't know about SyncManager yet
      // @ts-ignore
      await registration.sync.register(`sync-${storeName}`);
    }
    
    return {
      success: true,
      offline: true,
      message: 'Data saved for when you reconnect'
    };
  } else {
    // We're online - use saveOrUpload utility which will handle both cases
    try {
      const result = await saveOrUpload(storeName, formData, apiEndpoint);
      return {
        success: true,
        offline: false,
        data: result
      };
    } catch (error) {
      console.error('Form submission error:', error);
      return {
        success: false,
        offline: false,
        error
      };
    }
  }
}

export default OfflineFormWrapper;