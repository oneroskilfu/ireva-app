import React, { useState } from 'react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Users, Copy, Share2, Coins } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const ReferralCard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  // Get the full URL to share
  const getReferralUrl = () => {
    return `${window.location.origin}/auth?ref=${user?.referralCode || ''}`;
  };
  
  // Handle copy to clipboard
  const handleCopy = () => {
    const referralUrl = getReferralUrl();
    navigator.clipboard.writeText(referralUrl).then(() => {
      setCopied(true);
      toast({
        title: "Copied to clipboard!",
        description: "Share this link with friends to earn rewards",
        duration: 3000,
      });
      
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    });
  };
  
  // Handle share functionality (Mobile)
  const handleShare = async () => {
    const referralUrl = getReferralUrl();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join iREVA Real Estate Investment Platform',
          text: 'I\'m investing in properties with iREVA. Join using my referral link and we both get rewards!',
          url: referralUrl,
        });
        
        toast({
          title: "Thanks for sharing!",
          description: "Your friends will thank you too",
          duration: 3000,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to copy if Web Share API is not available
      handleCopy();
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-tr from-violet-50 to-slate-50 overflow-hidden shadow-md border-0">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <Users className="h-5 w-5" /> Refer &amp; Earn
          </CardTitle>
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            $50 per referral
          </div>
        </div>
        <CardDescription>
          Share your unique code with friends and earn rewards when they join and invest
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-white p-4 rounded-md border border-slate-200">
          <p className="text-sm text-slate-500 mb-2">Your referral code</p>
          <div className="flex items-center gap-2">
            <Input 
              value={user?.referralCode || ''} 
              readOnly 
              className="font-medium text-lg text-center bg-slate-50"
            />
            <Button 
              size="icon" 
              variant="outline" 
              onClick={handleCopy} 
              className={copied ? "bg-green-100 text-green-800" : ""}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-md border border-slate-200">
          <p className="text-sm text-slate-500 mb-2">Statistics</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-3 rounded-md">
              <p className="text-xs text-slate-500">Referrals</p>
              <p className="text-2xl font-bold">{user?.referrals?.length || 0}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-md">
              <p className="text-xs text-slate-500">Rewards</p>
              <p className="text-2xl font-bold flex items-center">
                ${user?.referralRewards || 0}
                <Coins className="h-4 w-4 ml-1 text-yellow-500" />
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col gap-3 pt-0">
        <Button 
          onClick={handleCopy} 
          variant="default" 
          className="w-full"
        >
          <Copy className="mr-2 h-4 w-4" /> Copy Referral Link
        </Button>
        
        <Button 
          onClick={handleShare} 
          variant="outline" 
          className="w-full"
        >
          <Share2 className="mr-2 h-4 w-4" /> Share
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ReferralCard;