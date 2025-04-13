import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MFAMethod, useMFA } from '@/hooks/use-mfa';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, QrCode, Mail, Phone, Copy, Check, BookCopy, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function MFASetup() {
  const { mfaStatus, setupState, isLoading, startMFASetup, verifyMFASetup, resetMFASetup, disableMFA } = useMFA();
  const [method, setMethod] = useState<MFAMethod>('app');
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  
  const handleStartSetup = () => {
    startMFASetup(method);
  };
  
  const handleVerifySetup = () => {
    if (!code) return;
    verifyMFASetup(code);
  };
  
  const handleMethodChange = (value: string) => {
    setMethod(value as MFAMethod);
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handlePrintBackupCodes = () => {
    if (!setupState.backupCodes || setupState.backupCodes.length === 0) return;
    
    const content = `
      <html>
        <head>
          <title>MFA Backup Codes</title>
          <style>
            body { font-family: sans-serif; padding: 2rem; }
            h1 { font-size: 1.5rem; margin-bottom: 1rem; }
            p { margin-bottom: 1rem; }
            ul { list-style-type: none; padding: 0; }
            li { font-family: monospace; font-size: 1.2rem; margin-bottom: 0.5rem; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; }
          </style>
        </head>
        <body>
          <h1>MFA Backup Codes</h1>
          <p>Keep these backup codes in a safe place. Each code can only be used once.</p>
          <ul>
            ${setupState.backupCodes.map(code => `<li>${code}</li>`).join('')}
          </ul>
        </body>
      </html>
    `;
    
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(content);
      win.document.close();
      win.print();
    }
  };
  
  if (mfaStatus?.enabled) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Multi-Factor Authentication</CardTitle>
          <CardDescription>
            Your account is protected with multi-factor authentication.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>MFA is enabled</AlertTitle>
            <AlertDescription>
              Your account is currently secured using {mfaStatus.primaryMethod} as the primary authentication method.
              {mfaStatus.lastVerified && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Last verified: {new Date(mfaStatus.lastVerified).toLocaleString()}
                </p>
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button 
            variant="destructive" 
            onClick={() => disableMFA()}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Disabling MFA...
              </>
            ) : (
              'Disable MFA'
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  if (setupState.step === 'setup' && setupState.qrCode) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Set Up Authenticator App</CardTitle>
          <CardDescription>
            Scan the QR code with your authenticator app or enter the code manually.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center">
            <div className="border border-border p-2 rounded-lg mb-4">
              <img src={setupState.qrCode} alt="QR Code" className="w-48 h-48" />
            </div>
            
            {setupState.secret && (
              <div className="flex items-center gap-2 bg-muted p-2 rounded-md w-full">
                <code className="text-sm font-mono">{setupState.secret}</code>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => copyToClipboard(setupState.secret as string)}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="verification-code">Verification Code</Label>
            <Input
              id="verification-code"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
            />
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit code from your authenticator app to verify and complete the setup.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button variant="outline" onClick={resetMFASetup} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            className="flex-1"
            onClick={handleVerifySetup} 
            disabled={!code || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
              </>
            ) : (
              'Verify & Enable'
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  if (setupState.step === 'verify') {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Verify Your Identity</CardTitle>
          <CardDescription>
            We've sent a verification code to your {setupState.method === 'email' ? 'email address' : 'phone'}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verification-code">Verification Code</Label>
            <Input
              id="verification-code"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
            />
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit code to verify and complete the setup.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button variant="outline" onClick={resetMFASetup} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            className="flex-1"
            onClick={handleVerifySetup} 
            disabled={!code || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
              </>
            ) : (
              'Verify & Enable'
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  if (setupState.step === 'complete' && setupState.backupCodes) {
    return (
      <>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>MFA Setup Complete</CardTitle>
            <CardDescription>
              Multi-factor authentication has been enabled for your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Setup Successful</AlertTitle>
              <AlertDescription className="text-green-700">
                You've successfully enabled multi-factor authentication using {setupState.method}.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">Backup Codes</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowBackupCodes(true)}
                >
                  <BookCopy className="h-4 w-4 mr-2" /> View Backup Codes
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Save your backup codes in a secure place. They can be used to access your account if you lose your authentication device.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={resetMFASetup} className="w-full">
              Done
            </Button>
          </CardFooter>
        </Card>
        
        <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Backup Codes</DialogTitle>
              <DialogDescription>
                Each code can only be used once. Store these codes in a secure place.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {setupState.backupCodes.map((code, index) => (
                  <div 
                    key={index} 
                    className="p-2 border rounded-md font-mono text-center bg-background"
                  >
                    {code}
                  </div>
                ))}
              </div>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  If you lose your device and don't have these backup codes, you may lose access to your account.
                </AlertDescription>
              </Alert>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setupState.backupCodes && copyToClipboard(setupState.backupCodes.join('\n'))}
                className="w-full"
              >
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy All Codes'}
              </Button>
              <Button 
                onClick={handlePrintBackupCodes}
                className="w-full"
              >
                <BookCopy className="mr-2 h-4 w-4" /> Print Codes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Enable Multi-Factor Authentication</CardTitle>
        <CardDescription>
          Add an extra layer of security to your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="app" onValueChange={handleMethodChange}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="app">
              <QrCode className="h-4 w-4 mr-2" />
              App
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </TabsTrigger>
            <TabsTrigger value="sms">
              <Phone className="h-4 w-4 mr-2" />
              SMS
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="app">
            <div className="space-y-4">
              <p className="text-sm">
                Use an authenticator app like Google Authenticator, Microsoft Authenticator, or Authy to get two-factor authentication codes.
              </p>
              <div className="flex items-center gap-2 py-2">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_Authenticator_for_Android_logo.svg/64px-Google_Authenticator_for_Android_logo.svg.png" 
                     alt="Google Authenticator" 
                     className="w-8 h-8" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Microsoft_Authenticator_logo.svg/64px-Microsoft_Authenticator_logo.svg.png" 
                     alt="Microsoft Authenticator" 
                     className="w-8 h-8" />
                <img src="https://store-images.s-microsoft.com/image/apps.57266.82265945-e86d-4174-a3e0-9844c06f215a.a60a23c8-f72a-4b3a-a166-7a7d5df45fb2.47e6233d-ce17-4e73-9328-98208fe31e0d" 
                     alt="Authy" 
                     className="w-8 h-8 rounded" />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="email">
            <div className="space-y-4">
              <p className="text-sm">
                Receive a verification code via email whenever you sign in. We'll use the email address associated with your account.
              </p>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Email Verification</AlertTitle>
                <AlertDescription>
                  Make sure you have access to your email account when signing in.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
          
          <TabsContent value="sms">
            <div className="space-y-4">
              <p className="text-sm">
                Receive a verification code via SMS whenever you sign in. We'll use the phone number associated with your account.
              </p>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>SMS Verification</AlertTitle>
                <AlertDescription>
                  Make sure you have access to your phone when signing in.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleStartSetup}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Setting Up...
            </>
          ) : (
            'Set Up MFA'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}