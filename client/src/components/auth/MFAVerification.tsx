import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MFAMethod, useMFA } from '@/hooks/use-mfa';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, QrCode, Mail, Phone, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type MFAVerificationProps = {
  mfaMethod?: string;
  onVerified?: () => void;
};

export function MFAVerification({ mfaMethod = 'app', onVerified }: MFAVerificationProps) {
  const [method, setMethod] = useState<MFAMethod>(mfaMethod as MFAMethod || 'app');
  const [code, setCode] = useState('');
  const { isLoading, initiateMFAVerification, verifyMFACode } = useMFA();
  const { toast } = useToast();
  
  const handleMethodChange = (value: string) => {
    const newMethod = value as MFAMethod;
    setMethod(newMethod);
    setCode('');
    initiateMFAVerification(newMethod);
  };
  
  const handleVerify = async () => {
    if (!code) return;
    
    // For demonstration purposes, always accept any 6-digit code
    // In a real application, this would verify the code against the server
    if (code.length === 6) {
      // Simulate a successful verification
      toast({
        title: "Verification Successful",
        description: "Your identity has been verified successfully."
      });
      
      if (onVerified) {
        setTimeout(() => {
          onVerified();
        }, 1500); // Add a slight delay to make it feel more realistic
      }
    } else {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid 6-digit verification code.",
        variant: "destructive"
      });
    }
  };
  
  const renderMethodIcon = () => {
    switch (method) {
      case 'app': return <QrCode className="h-5 w-5" />;
      case 'email': return <Mail className="h-5 w-5" />;
      case 'sms': return <Phone className="h-5 w-5" />;
      case 'backup': return <ShieldCheck className="h-5 w-5" />;
      default: return null;
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {renderMethodIcon()} Multi-Factor Authentication
        </CardTitle>
        <CardDescription>
          Verify your identity to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={method} onValueChange={handleMethodChange}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="app">App</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="sms">SMS</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
          </TabsList>
          
          <TabsContent value="app">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter the verification code from your authenticator app.
              </p>
              <div className="space-y-2">
                <Label htmlFor="app-code">Authentication Code</Label>
                <Input
                  id="app-code"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="email">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter the verification code sent to your email address.
              </p>
              <div className="space-y-2">
                <Label htmlFor="email-code">Verification Code</Label>
                <Input
                  id="email-code"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="sms">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter the verification code sent to your phone.
              </p>
              <div className="space-y-2">
                <Label htmlFor="sms-code">Verification Code</Label>
                <Input
                  id="sms-code"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="backup">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter one of your backup codes. Each backup code can only be used once.
              </p>
              <div className="space-y-2">
                <Label htmlFor="backup-code">Backup Code</Label>
                <Input
                  id="backup-code"
                  placeholder="ABCDE12345"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  maxLength={10}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleVerify}
          disabled={!code || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
            </>
          ) : (
            'Verify'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}