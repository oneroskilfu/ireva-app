import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

// Define types for the API response
interface EnvironmentStatus {
  success: boolean;
  missingKeys: string[];
  presentKeys: string[];
}

interface WebhookStatus {
  success: boolean;
  message: string;
  webhooks?: any[];
  error?: any;
}

interface TransactionStatus {
  success: boolean;
  message: string;
  order?: any;
  error?: any;
}

interface UIStatus {
  success: boolean;
  message: string;
}

interface IntegrationStatus {
  environment: EnvironmentStatus;
  webhooks: WebhookStatus;
  testTransaction: TransactionStatus;
  uiIntegration: UIStatus;
  completedSteps: string[];
  isComplete: boolean;
}

export default function CryptoIntegrationChecklist() {
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [testingIntegration, setTestingIntegration] = useState(false);
  const { toast } = useToast();

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const response = await apiRequest('GET', '/api/admin/crypto-integration/status');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Error fetching crypto integration status:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch crypto integration status',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const testIntegration = async () => {
    setTestingIntegration(true);
    try {
      const response = await apiRequest('POST', '/api/admin/crypto-integration/test');
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Test Successful',
          description: 'Integration test transaction was successful',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Test Failed',
          description: data.message || 'Integration test transaction failed',
          variant: 'destructive',
        });
      }
      
      // Refresh status after testing
      fetchStatus();
    } catch (error) {
      console.error('Error testing crypto integration:', error);
      toast({
        title: 'Error',
        description: 'Failed to test crypto integration',
        variant: 'destructive',
      });
    } finally {
      setTestingIntegration(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Calculate completion percentage
  const completionPercentage = status 
    ? (status.completedSteps.length / 4) * 100 
    : 0;

  // Render status icon based on status
  const StatusIcon = ({ success }: { success: boolean }) => {
    return success 
      ? <CheckCircle className="h-5 w-5 text-green-500" /> 
      : <XCircle className="h-5 w-5 text-red-500" />;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">Crypto Integration Checklist</CardTitle>
            <CardDescription>Verify your cryptocurrency payment integration setup</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchStatus} 
            disabled={loading}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 flex justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : status ? (
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Overall completion</span>
                <span className="text-sm">{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>

            <div className="space-y-4">
              {/* Environment Variables */}
              <div className="flex items-start space-x-3 p-3 rounded-md bg-muted/50">
                <div className="mt-0.5">
                  <StatusIcon success={status.environment.success} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium flex items-center space-x-2">
                    <span>API Keys & Environment Variables</span>
                    {status.environment.success && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Complete
                      </Badge>
                    )}
                  </h3>
                  
                  {status.environment.success ? (
                    <p className="text-sm text-muted-foreground">
                      All required environment variables are properly configured.
                    </p>
                  ) : (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Missing required environment variables:
                      </p>
                      <ul className="list-disc list-inside text-sm pl-2 space-y-1">
                        {status.environment.missingKeys.map(key => (
                          <li key={key} className="text-red-500">{key}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Webhooks */}
              <div className="flex items-start space-x-3 p-3 rounded-md bg-muted/50">
                <div className="mt-0.5">
                  <StatusIcon success={status.webhooks.success} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium flex items-center space-x-2">
                    <span>Webhooks Configuration</span>
                    {status.webhooks.success && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Complete
                      </Badge>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {status.webhooks.message}
                  </p>
                </div>
              </div>

              {/* Test Transaction */}
              <div className="flex items-start space-x-3 p-3 rounded-md bg-muted/50">
                <div className="mt-0.5">
                  <StatusIcon success={status.testTransaction.success} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium flex items-center space-x-2">
                    <span>Test Transaction</span>
                    {status.testTransaction.success && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Complete
                      </Badge>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {status.testTransaction.message}
                  </p>
                </div>
              </div>

              {/* UI Integration */}
              <div className="flex items-start space-x-3 p-3 rounded-md bg-muted/50">
                <div className="mt-0.5">
                  <StatusIcon success={status.uiIntegration.success} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium flex items-center space-x-2">
                    <span>Crypto Payment UI Integration</span>
                    {status.uiIntegration.success && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Complete
                      </Badge>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {status.uiIntegration.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Unable to fetch integration status</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          {status?.isComplete ? (
            <div className="flex items-center text-green-600 gap-2">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">All checks passed!</span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Complete all steps to enable crypto payments
            </p>
          )}
        </div>
        <Button 
          onClick={testIntegration} 
          disabled={loading || testingIntegration || !status?.environment.success}
        >
          {testingIntegration ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            'Test Integration'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}