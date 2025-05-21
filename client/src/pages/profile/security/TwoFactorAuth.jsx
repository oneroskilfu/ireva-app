import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../hooks/useAuth';
import { useApiRequest } from '../../../hooks/useApiRequest';
import { useToast } from '../../../hooks/use-toast';
import {
  Card,
  CardContent,
  Button,
  Input,
  Label,
  Alert,
  AlertTitle,
  AlertDescription,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../../components/ui/DesignSystem';
import {
  ShieldCheckIcon,
  KeyIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  XMarkIcon,
  QrCodeIcon,
  LockClosedIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

const TwoFactorAuth = () => {
  const { user } = useAuth();
  const api = useApiRequest();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // State for 2FA setup
  const [setupStep, setSetupStep] = useState(0); // 0: initial, 1: setup, 2: verify
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [isDisabling, setIsDisabling] = useState(false);
  const [password, setPassword] = useState('');
  
  // Get 2FA status
  const { 
    data: twoFactorStatus,
    isLoading: isLoadingStatus,
    refetch: refetchStatus
  } = useQuery({
    queryKey: ['/api/2fa/status'],
    queryFn: async () => {
      const response = await api.get('2fa/status');
      return response.data.data;
    },
    enabled: !!user,
    refetchOnWindowFocus: false,
  });
  
  // Generate 2FA secret mutation
  const generateSecretMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('2fa/generate');
      return response.data;
    },
    onSuccess: (data) => {
      setQrCodeUrl(data.data.qrCodeUrl);
      setSecret(data.data.secret);
      setSetupStep(1);
      
      toast({
        title: '2FA Setup Started',
        description: 'Scan the QR code with your authenticator app to continue.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Setup Failed',
        description: error.response?.data?.message || 'Failed to generate 2FA secret',
        variant: 'destructive',
      });
    },
  });
  
  // Verify and enable 2FA mutation
  const enableTwoFactorMutation = useMutation({
    mutationFn: async (verificationToken) => {
      const response = await api.post('2fa/verify', { token: verificationToken });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQuery(['/api/2fa/status']);
      setSetupStep(0);
      setToken('');
      
      toast({
        title: '2FA Enabled',
        description: 'Two-factor authentication has been successfully enabled for your account.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Verification Failed',
        description: error.response?.data?.message || 'Failed to verify 2FA token',
        variant: 'destructive',
      });
    },
  });
  
  // Disable 2FA mutation
  const disableTwoFactorMutation = useMutation({
    mutationFn: async ({ verificationToken, userPassword }) => {
      const response = await api.post('2fa/disable', { 
        token: verificationToken,
        password: userPassword
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQuery(['/api/2fa/status']);
      setIsDisabling(false);
      setToken('');
      setPassword('');
      
      toast({
        title: '2FA Disabled',
        description: 'Two-factor authentication has been turned off for your account.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Disable Failed',
        description: error.response?.data?.message || 'Failed to disable 2FA',
        variant: 'destructive',
      });
    },
  });
  
  // Handle start setup
  const handleStartSetup = () => {
    generateSecretMutation.mutate();
  };
  
  // Handle verify token
  const handleVerifyToken = (e) => {
    e.preventDefault();
    if (!token || token.length !== 6 || !/^\d+$/.test(token)) {
      toast({
        title: 'Invalid Token',
        description: 'Please enter a valid 6-digit token from your authenticator app.',
        variant: 'destructive',
      });
      return;
    }
    
    enableTwoFactorMutation.mutate(token);
  };
  
  // Handle disable 2FA
  const handleDisable2FA = (e) => {
    e.preventDefault();
    if (!token || token.length !== 6 || !/^\d+$/.test(token)) {
      toast({
        title: 'Invalid Token',
        description: 'Please enter a valid 6-digit token from your authenticator app.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!password) {
      toast({
        title: 'Password Required',
        description: 'Please enter your current password to disable 2FA.',
        variant: 'destructive',
      });
      return;
    }
    
    disableTwoFactorMutation.mutate({
      verificationToken: token,
      userPassword: password
    });
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Two-Factor Authentication</h2>
      
      <Card>
        <CardContent className="p-6">
          {isLoadingStatus ? (
            <div className="flex justify-center py-8">
              <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : twoFactorStatus?.mfaEnabled ? (
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <ShieldCheckIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Two-Factor Authentication is Enabled</h3>
                  <p className="text-gray-600">Your account is protected with an additional layer of security.</p>
                </div>
              </div>
              
              <Alert className="mb-6">
                <InformationCircleIcon className="h-4 w-4 mr-2" />
                <AlertTitle>Important Security Information</AlertTitle>
                <AlertDescription>
                  You will need to enter a verification code from your authenticator app each time you sign in.
                  Make sure you keep your authenticator app accessible or save your recovery codes.
                </AlertDescription>
              </Alert>
              
              <Button 
                variant="destructive"
                onClick={() => setIsDisabling(true)}
                className="w-full sm:w-auto"
              >
                <LockClosedIcon className="h-4 w-4 mr-2" />
                Disable Two-Factor Authentication
              </Button>
            </div>
          ) : setupStep === 0 ? (
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-gray-100 p-3 rounded-full mr-4">
                  <ShieldCheckIcon className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Two-Factor Authentication is Disabled</h3>
                  <p className="text-gray-600">Enhance your account security by enabling 2FA.</p>
                </div>
              </div>
              
              <Alert className="mb-6">
                <InformationCircleIcon className="h-4 w-4" />
                <AlertTitle>Why Enable Two-Factor Authentication?</AlertTitle>
                <AlertDescription>
                  Two-factor authentication adds an extra layer of security to your account. 
                  In addition to your password, you'll need a verification code from an 
                  authenticator app like Google Authenticator or Authy to sign in.
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={handleStartSetup}
                disabled={generateSecretMutation.isPending}
                className="w-full sm:w-auto"
              >
                {generateSecretMutation.isPending ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <KeyIcon className="h-4 w-4 mr-2" />
                    Set up Two-Factor Authentication
                  </>
                )}
              </Button>
            </div>
          ) : setupStep === 1 ? (
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <QrCodeIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Scan QR Code</h3>
                  <p className="text-gray-600">Use an authenticator app to scan the QR code below.</p>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200 flex justify-center mb-4">
                  {qrCodeUrl && (
                    <img src={qrCodeUrl} alt="2FA QR Code" className="max-w-full h-auto" />
                  )}
                </div>
                
                <p className="text-gray-600 text-center mb-2">Or enter this code manually in your app:</p>
                <div className="bg-gray-50 p-3 rounded font-mono text-center break-all mb-4">
                  {secret}
                </div>
                
                <Alert>
                  <InformationCircleIcon className="h-4 w-4" />
                  <AlertTitle>Recommended Authenticator Apps</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside text-sm">
                      <li>Google Authenticator (Android/iOS)</li>
                      <li>Authy (Android/iOS/Desktop)</li>
                      <li>Microsoft Authenticator (Android/iOS)</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSetupStep(0);
                    setQrCodeUrl('');
                    setSecret('');
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={() => setSetupStep(2)}>
                  Continue
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <KeyIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Verify Code</h3>
                  <p className="text-gray-600">Enter the 6-digit code from your authenticator app to enable 2FA.</p>
                </div>
              </div>
              
              <form onSubmit={handleVerifyToken} className="space-y-4">
                <div>
                  <Label htmlFor="token">Verification Code</Label>
                  <Input
                    id="token"
                    value={token}
                    onChange={(e) => setToken(e.target.value.slice(0, 6))}
                    placeholder="000000"
                    className="text-center text-lg letter-spacing-wide font-mono"
                    minLength={6}
                    maxLength={6}
                    required
                  />
                </div>
                
                <Alert>
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    If you lose access to your authenticator app, you won't be able to log in to your account.
                    Make sure to keep your authenticator app safe and keep backup codes if provided.
                  </AlertDescription>
                </Alert>
                
                <div className="flex justify-between">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => {
                      setSetupStep(1);
                      setToken('');
                    }}
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit"
                    disabled={enableTwoFactorMutation.isPending}
                  >
                    {enableTwoFactorMutation.isPending ? (
                      <>
                        <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                        Verify and Enable
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Disable 2FA Dialog */}
      <Dialog open={isDisabling} onOpenChange={setIsDisabling}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <ExclamationTriangleIcon className="h-5 w-5" />
              Disable Two-Factor Authentication
            </DialogTitle>
            <DialogDescription>
              This will remove the extra layer of security from your account. You'll only need your password to log in.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleDisable2FA}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="disable-token">Verification Code</Label>
                <Input
                  id="disable-token"
                  value={token}
                  onChange={(e) => setToken(e.target.value.slice(0, 6))}
                  placeholder="000000"
                  className="text-center text-lg letter-spacing-wide font-mono"
                  minLength={6}
                  maxLength={6}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the current code from your authenticator app
                </p>
              </div>
              
              <div>
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Confirm your password for security
                </p>
              </div>
              
              <Alert variant="destructive">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  Disabling two-factor authentication will make your account less secure.
                  Only proceed if absolutely necessary.
                </AlertDescription>
              </Alert>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsDisabling(false);
                  setToken('');
                  setPassword('');
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                variant="destructive"
                disabled={disableTwoFactorMutation.isPending}
              >
                {disableTwoFactorMutation.isPending ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    Disabling...
                  </>
                ) : (
                  'Disable 2FA'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TwoFactorAuth;