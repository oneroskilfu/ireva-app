import React, { useState, useEffect } from 'react';
import { isOnline, saveToPendingDB, getPendingCount } from '@/utils/pendingDB';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, WifiOff } from 'lucide-react';

// Example Investment Form using direct pendingDB approach
export const SimpleInvestmentForm: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [projectId, setProjectId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const { toast } = useToast();
  
  // Get userId from auth context or elsewhere
  const userId = 'current-user-id'; // Replace with actual user ID from context
  
  // Check for pending items on load
  useEffect(() => {
    const checkPending = async () => {
      const count = await getPendingCount('investments');
      setPendingCount(count);
    };
    
    checkPending();
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simple investment data object
      const investmentData = {
        amount: parseFloat(amount),
        projectId,
        userId,
        timestamp: new Date().toISOString()
      };
      
      if (!isOnline()) {
        // We're offline - store in IndexedDB
        await saveToPendingDB('investments', investmentData);
        
        // Register for sync
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
          const registration = await navigator.serviceWorker.ready;
          // @ts-ignore
          await registration.sync.register('sync-investments');
        }
        
        toast({
          title: 'Investment Saved Offline',
          description: 'Your investment will be submitted when you reconnect to the internet.',
          variant: 'default'
        });
        
        // Update pending count
        setPendingCount(await getPendingCount('investments'));
      } else {
        // We're online - normal submission
        const response = await fetch('/api/investments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(investmentData)
        });
        
        if (!response.ok) {
          throw new Error('Investment submission failed');
        }
        
        toast({
          title: 'Investment Successful',
          description: 'Your investment has been submitted.',
          variant: 'default'
        });
        
        // Clear form
        setAmount('');
        setProjectId('');
      }
    } catch (error) {
      console.error('Investment error:', error);
      
      // If connection was lost during submission, save offline
      if (!isOnline()) {
        await saveToPendingDB('investments', {
          amount: parseFloat(amount),
          projectId,
          userId,
          timestamp: new Date().toISOString()
        });
        
        toast({
          title: 'Connection Lost',
          description: 'Your investment has been saved locally and will be sent when you reconnect.',
          variant: 'default'
        });
        
        // Update pending count
        setPendingCount(await getPendingCount('investments'));
      } else {
        toast({
          title: 'Submission Failed',
          description: 'There was a problem submitting your investment. Please try again.',
          variant: 'destructive'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invest in Property</CardTitle>
        <CardDescription>
          Provide investment details to purchase shares in this property.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isOnline() && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>You are offline</AlertTitle>
            <AlertDescription>
              Don't worry! You can still submit this form. Your data will be saved and sent automatically when you're back online.
            </AlertDescription>
          </Alert>
        )}
        
        {pendingCount > 0 && (
          <Alert className="mb-4 bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertTitle>Pending Investments</AlertTitle>
            <AlertDescription>
              You have {pendingCount} pending investment{pendingCount > 1 ? 's' : ''} that will be submitted when you're back online.
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
          
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full mt-4"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Investment'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// KYC Form Example - follows the same approach
export const SimpleKYCForm: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [idType, setIdType] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const { toast } = useToast();
  
  // Get userId from auth context or elsewhere
  const userId = 'current-user-id'; // Replace with actual user ID
  
  // Check for pending items on load
  useEffect(() => {
    const checkPending = async () => {
      const count = await getPendingCount('kyc');
      setPendingCount(count);
    };
    
    checkPending();
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simple KYC data object
      const kycData = {
        fullName,
        idType,
        idNumber,
        userId,
        timestamp: new Date().toISOString()
      };
      
      if (!isOnline()) {
        // We're offline - store in IndexedDB
        await saveToPendingDB('kyc', kycData);
        
        // Register for sync
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
          const registration = await navigator.serviceWorker.ready;
          // @ts-ignore
          await registration.sync.register('sync-kyc');
        }
        
        toast({
          title: 'KYC Saved Offline',
          description: 'Your KYC data will be submitted when you reconnect to the internet.',
          variant: 'default'
        });
        
        // Update pending count
        setPendingCount(await getPendingCount('kyc'));
      } else {
        // We're online - normal submission
        const response = await fetch('/api/kyc', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(kycData)
        });
        
        if (!response.ok) {
          throw new Error('KYC submission failed');
        }
        
        toast({
          title: 'KYC Submitted',
          description: 'Your KYC information has been submitted for verification.',
          variant: 'default'
        });
        
        // Clear form
        setFullName('');
        setIdType('');
        setIdNumber('');
      }
    } catch (error) {
      console.error('KYC error:', error);
      
      // If connection was lost during submission, save offline
      if (!isOnline()) {
        await saveToPendingDB('kyc', {
          fullName,
          idType,
          idNumber,
          userId,
          timestamp: new Date().toISOString()
        });
        
        toast({
          title: 'Connection Lost',
          description: 'Your KYC information has been saved locally and will be sent when you reconnect.',
          variant: 'default'
        });
        
        // Update pending count
        setPendingCount(await getPendingCount('kyc'));
      } else {
        toast({
          title: 'Submission Failed',
          description: 'There was a problem submitting your KYC information. Please try again.',
          variant: 'destructive'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>KYC Verification</CardTitle>
        <CardDescription>
          Provide your identity verification information to comply with KYC requirements.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isOnline() && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>You are offline</AlertTitle>
            <AlertDescription>
              You can still submit your KYC information. Your data will be saved locally and submitted automatically when you're back online.
            </AlertDescription>
          </Alert>
        )}
        
        {pendingCount > 0 && (
          <Alert className="mb-4 bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertTitle>Pending KYC Submission</AlertTitle>
            <AlertDescription>
              You have {pendingCount} pending KYC submission{pendingCount > 1 ? 's' : ''} that will be sent when you're back online.
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="fullName" className="block text-sm font-medium">
              Full Legal Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="As it appears on your ID"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="idType" className="block text-sm font-medium">
                ID Type
              </label>
              <select
                id="idType"
                value={idType}
                onChange={(e) => setIdType(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Select ID Type</option>
                <option value="nationalId">National ID</option>
                <option value="passport">Passport</option>
                <option value="driversLicense">Driver's License</option>
                <option value="votersCard">Voter's Card</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="idNumber" className="block text-sm font-medium">
                ID Number
              </label>
              <input
                id="idNumber"
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter ID number"
                required
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full mt-4"
          >
            {isSubmitting ? 'Submitting...' : 'Submit KYC Information'}
          </Button>
          
          <p className="text-xs text-gray-500 mt-2">
            Your personal information is securely stored and processed according to our privacy policy.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default { SimpleInvestmentForm, SimpleKYCForm };