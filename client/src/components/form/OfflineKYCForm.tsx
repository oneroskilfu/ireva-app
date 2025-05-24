import React, { useState } from 'react';
import { useOfflineQueue, isOnline } from '@/hooks/use-offline-queue';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, WifiOff } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface KYCFormData {
  fullName: string;
  idType: string;
  idNumber: string;
  dateOfBirth: string;
  address: string;
  phoneNumber: string;
  userId: string;
}

export const OfflineKYCForm: React.FC = () => {
  const { toast } = useToast();
  const { saveOffline, status } = useOfflineQueue('kyc', 'sync-kyc');
  
  // Form state
  const [formData, setFormData] = useState<KYCFormData>({
    fullName: '',
    idType: '',
    idNumber: '',
    dateOfBirth: '',
    address: '',
    phoneNumber: '',
    userId: 'current-user-id', // Replace with actual user ID from auth context
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle ID type selection
  const handleIdTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, idType: value }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!isOnline()) {
        // Save KYC data for later sync when offline
        await saveOffline(formData);
        
        toast({
          title: 'KYC Data Saved',
          description: 'Your KYC information will be submitted when you reconnect to the internet.',
          variant: 'default',
        });
      } else {
        // Online submission
        const response = await fetch('/api/kyc', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        
        if (!response.ok) {
          throw new Error('Failed to submit KYC data');
        }
        
        toast({
          title: 'KYC Submitted',
          description: 'Your KYC information has been submitted successfully for verification.',
          variant: 'default',
        });
        
        // Reset form after successful submission
        setFormData({
          fullName: '',
          idType: '',
          idNumber: '',
          dateOfBirth: '',
          address: '',
          phoneNumber: '',
          userId: 'current-user-id', // Replace with actual user ID from auth context
        });
      }
    } catch (error) {
      console.error('KYC submission error:', error);
      
      // If the error is due to network issues, try saving offline
      if (!isOnline()) {
        await saveOffline(formData);
        
        toast({
          title: 'Connection Lost',
          description: 'Your KYC information has been saved and will be submitted when you reconnect.',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Submission Failed',
          description: 'There was a problem submitting your KYC information. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>KYC Verification</CardTitle>
        <CardDescription>
          Please provide your identity verification details. This information is required before you can invest.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {!isOnline() && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>You are offline</AlertTitle>
            <AlertDescription>
              Don't worry! You can still submit your KYC information. Your data will be saved locally and submitted automatically when you're back online.
            </AlertDescription>
          </Alert>
        )}
        
        {status.queuedItems > 0 && (
          <Alert className="mb-4 bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertTitle>Pending KYC Submissions</AlertTitle>
            <AlertDescription>
              You have {status.queuedItems} pending KYC submission{status.queuedItems > 1 ? 's' : ''} that will be sent when you're back online.
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="As it appears on your ID"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="idType">ID Type</Label>
              <Select 
                value={formData.idType} 
                onValueChange={handleIdTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select ID Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nationalId">National ID</SelectItem>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="driverLicense">Driver's License</SelectItem>
                  <SelectItem value="votersCard">Voter's Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="idNumber">ID Number</Label>
              <Input
                id="idNumber"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                placeholder="Enter your ID number"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Residential Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Your current residential address"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="e.g. 08012345678"
              pattern="[0-9]+"
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full mt-6" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit KYC Information'}
          </Button>
          
          <p className="text-xs text-gray-500 mt-4">
            By submitting this form, you certify that all information provided is true and accurate.
            Your personal information will be handled according to our Privacy Policy.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default OfflineKYCForm;