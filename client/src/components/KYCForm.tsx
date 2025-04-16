import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface KYCFormData {
  fullName: string;
  address: string;
  idType: string;
  idNumber: string;
  documentUrl: string;
}

const KYCForm: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState<KYCFormData>({
    fullName: '',
    address: '',
    idType: 'national_id',
    idNumber: '',
    documentUrl: '',
  });

  const submitKycMutation = useMutation({
    mutationFn: async (data: KYCFormData) => {
      const res = await apiRequest('POST', '/api/kyc', data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'KYC Submitted Successfully',
        description: 'Your KYC information has been submitted for verification.',
      });
      // Reset form
      setFormData({
        fullName: '',
        address: '',
        idType: 'national_id',
        idNumber: '',
        documentUrl: '',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Submit KYC',
        description: error.message || 'An error occurred while submitting your KYC information.',
        variant: 'destructive',
      });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, idType: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitKycMutation.mutate(formData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">KYC Verification</CardTitle>
        <CardDescription>
          Complete the Know Your Customer (KYC) process to start investing in properties.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Legal Name</Label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="Enter your full legal name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Residential Address</Label>
            <Textarea
              id="address"
              name="address"
              placeholder="Enter your complete residential address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="idType">ID Type</Label>
            <Select value={formData.idType} onValueChange={handleSelectChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select ID type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="national_id">National ID</SelectItem>
                <SelectItem value="passport">Passport</SelectItem>
                <SelectItem value="drivers_license">Driver's License</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="idNumber">ID Number</Label>
            <Input
              id="idNumber"
              name="idNumber"
              placeholder="Enter your ID number"
              value={formData.idNumber}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="documentUrl">Document URL</Label>
            <Input
              id="documentUrl"
              name="documentUrl"
              placeholder="Enter the URL of your uploaded ID document"
              value={formData.documentUrl}
              onChange={handleChange}
              required
            />
            <p className="text-sm text-muted-foreground">
              Upload your ID to a secure service and provide the URL. We'll integrate direct file uploads in the future.
            </p>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          type="submit" 
          className="w-full" 
          onClick={handleSubmit}
          disabled={submitKycMutation.isPending}
        >
          {submitKycMutation.isPending ? 'Submitting...' : 'Submit KYC Information'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default KYCForm;