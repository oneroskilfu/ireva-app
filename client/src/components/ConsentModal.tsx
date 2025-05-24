import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Shield, FileText, Eye } from 'lucide-react';

interface ConsentStatus {
  needsConsent: boolean;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  currentVersions: {
    terms: string;
    privacy: string;
  };
}

interface LegalDocument {
  version: string;
  lastUpdated: string;
  content: string;
}

export default function ConsentModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const { toast } = useToast();

  // Check consent status
  const { data: consentStatus } = useQuery<ConsentStatus>({
    queryKey: ['/api/consent/status'],
    retry: false,
  });

  // Get terms of service
  const { data: termsData } = useQuery<LegalDocument>({
    queryKey: ['/api/legal/terms'],
  });

  // Get privacy policy
  const { data: privacyData } = useQuery<LegalDocument>({
    queryKey: ['/api/legal/privacy'],
  });

  // Accept consent mutation
  const acceptConsentMutation = useMutation({
    mutationFn: async (data: { termsAccepted: boolean; privacyAccepted: boolean }) => {
      const response = await apiRequest('POST', '/api/consent/accept', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/consent/status'] });
      setIsOpen(false);
      toast({
        title: "Consent Recorded",
        description: "Thank you for accepting our Terms of Service and Privacy Policy.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Show modal if consent is needed
  useEffect(() => {
    if (consentStatus?.needsConsent) {
      setIsOpen(true);
    }
  }, [consentStatus]);

  const handleAcceptConsent = () => {
    if (!termsAccepted || !privacyAccepted) {
      toast({
        title: "Consent Required",
        description: "Please accept both Terms of Service and Privacy Policy to continue.",
        variant: "destructive",
      });
      return;
    }

    acceptConsentMutation.mutate({
      termsAccepted,
      privacyAccepted,
    });
  };

  const canSubmit = termsAccepted && privacyAccepted;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Terms of Service & Privacy Policy
          </DialogTitle>
          <DialogDescription>
            Please review and accept our Terms of Service and Privacy Policy to continue using the platform.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="terms" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="terms" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Terms of Service
              {termsData && (
                <Badge variant="outline" className="text-xs">
                  v{termsData.version}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Privacy Policy
              {privacyData && (
                <Badge variant="outline" className="text-xs">
                  v{privacyData.version}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="terms" className="flex-1 min-h-0">
            <div className="space-y-4 h-full flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Terms of Service</h3>
                {termsData && (
                  <div className="text-sm text-muted-foreground">
                    Last updated: {new Date(termsData.lastUpdated).toLocaleDateString()}
                  </div>
                )}
              </div>
              
              <ScrollArea className="flex-1 border rounded-md p-4">
                {termsData ? (
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {termsData.content}
                    </pre>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-muted-foreground">Loading terms...</div>
                  </div>
                )}
              </ScrollArea>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms-checkbox"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(!!checked)}
                />
                <label
                  htmlFor="terms-checkbox"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I have read and agree to the Terms of Service
                </label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="privacy" className="flex-1 min-h-0">
            <div className="space-y-4 h-full flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Privacy Policy</h3>
                {privacyData && (
                  <div className="text-sm text-muted-foreground">
                    Last updated: {new Date(privacyData.lastUpdated).toLocaleDateString()}
                  </div>
                )}
              </div>
              
              <ScrollArea className="flex-1 border rounded-md p-4">
                {privacyData ? (
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {privacyData.content}
                    </pre>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-muted-foreground">Loading privacy policy...</div>
                  </div>
                )}
              </ScrollArea>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="privacy-checkbox"
                  checked={privacyAccepted}
                  onCheckedChange={(checked) => setPrivacyAccepted(!!checked)}
                />
                <label
                  htmlFor="privacy-checkbox"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I have read and agree to the Privacy Policy
                </label>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Both documents must be accepted to continue using the platform.
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground">
              {termsAccepted && privacyAccepted ? (
                <span className="text-green-600">✓ Ready to continue</span>
              ) : (
                <span>Please accept both documents</span>
              )}
            </div>
            
            <Button
              onClick={handleAcceptConsent}
              disabled={!canSubmit || acceptConsentMutation.isPending}
              className="min-w-32"
            >
              {acceptConsentMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Accept & Continue'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}