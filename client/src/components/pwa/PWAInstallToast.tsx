import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// This component will show a toast when the app is installable
const PWAInstallToast: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [toastShown, setToastShown] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone || 
                        document.referrer.includes('android-app://');
    
    if (isStandalone) {
      // App is already installed, no need to show install toast
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Only show the toast once per session
      if (!toastShown) {
        showInstallToast();
        setToastShown(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Clean up
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [toastShown]);

  // Function to show the install toast
  const showInstallToast = () => {
    toast({
      title: "Install iREVA App",
      description: "Install our app for a better experience and offline access.",
      action: (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleInstallClick}
          className="flex items-center gap-2"
        >
          <Download size={14} />
          Install
        </Button>
      ),
      duration: 10000, // Show for 10 seconds
    });
  };

  // Handle the install button click
  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    await deferredPrompt.prompt();
    
    // Wait for user choice
    const choiceResult = await deferredPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
      
      // Schedule to show the toast again later if dismissed
      setTimeout(() => {
        setToastShown(false);
      }, 3 * 24 * 60 * 60 * 1000); // 3 days
    }
    
    // Clear the saved prompt
    setDeferredPrompt(null);
  };

  // This is a "hidden" component, it doesn't render anything
  // It just sets up the event listeners and shows toasts
  return null;
};

export default PWAInstallToast;