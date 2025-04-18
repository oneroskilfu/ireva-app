import React from 'react';
import { Button } from '@/components/ui/button';
import { adminLogger } from '@/services/adminLogService';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

const TestAdminLogsButton = () => {
  const { toast } = useToast();

  const generateTestLogs = async () => {
    try {
      // Create a series of test admin logs
      await adminLogger.userApproval(1, { reason: 'Completed KYC verification' });
      await adminLogger.kycVerification(2, { documents: ['id_card', 'utility_bill'] });
      await adminLogger.propertyCreation(3, 'Golden Meadows Estate', { 
        location: 'Abuja',
        type: 'residential',
        units: 24
      });
      await adminLogger.investmentApproval(4, { amount: 500000, investor: 'John Doe' });
      await adminLogger.systemUpdate('Updated site configuration', { 
        settings: { 
          minimumInvestment: 100000,
          allowPartialInvestments: true  
        } 
      });
      
      // Invalidate admin logs query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/admin-logs'] });
      
      toast({
        title: 'Test Logs Created',
        description: 'Sample admin activity logs have been generated',
      });
    } catch (error) {
      console.error('Error generating test logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate test logs',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button 
      onClick={generateTestLogs} 
      variant="outline" 
      size="sm"
      className="ml-2"
    >
      Generate Test Logs
    </Button>
  );
};

export default TestAdminLogsButton;