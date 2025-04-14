import { 
  Twitter, 
  Facebook, 
  Linkedin, 
  Copy, 
  Check,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

interface SocialShareButtonsProps {
  title: string;
  description: string;
  url: string;
  compact?: boolean;
}

export function SocialShareButtons({ title, description, url, compact = false }: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  
  // Prepare encoded content for sharing
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const encodedUrl = encodeURIComponent(url);
  
  // Share URLs for different platforms
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`;
  
  // Handle copy link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopied(true);
        toast({
          title: "Link copied",
          description: "Investment opportunity link copied to clipboard"
        });
        
        // Reset copy state after 2 seconds
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        toast({
          title: "Failed to copy",
          description: "Could not copy the link to clipboard",
          variant: "destructive"
        });
      });
  };
  
  const openShareWindow = (shareUrl: string) => {
    window.open(
      shareUrl,
      "share-dialog",
      "width=800,height=600,location=0,menubar=0,toolbar=0,status=0,scrollbars=1,resizable=1"
    );
  };
  
  if (compact) {
    return (
      <div className="flex space-x-2">
        <Button
          size="sm"
          variant="outline"
          className="w-8 h-8 p-0"
          onClick={() => openShareWindow(twitterUrl)}
          title="Share on Twitter"
        >
          <Twitter className="h-4 w-4" />
          <span className="sr-only">Share on Twitter</span>
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          className="w-8 h-8 p-0"
          onClick={() => openShareWindow(facebookUrl)}
          title="Share on Facebook"
        >
          <Facebook className="h-4 w-4" />
          <span className="sr-only">Share on Facebook</span>
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          className="w-8 h-8 p-0"
          onClick={() => openShareWindow(linkedinUrl)}
          title="Share on LinkedIn"
        >
          <Linkedin className="h-4 w-4" />
          <span className="sr-only">Share on LinkedIn</span>
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          className="w-8 h-8 p-0"
          onClick={() => openShareWindow(whatsappUrl)}
          title="Share on WhatsApp"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="sr-only">Share on WhatsApp</span>
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          className="w-8 h-8 p-0"
          onClick={copyToClipboard}
          title="Copy link"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          <span className="sr-only">Copy link</span>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold">Share this investment opportunity</h4>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex items-center"
          onClick={() => openShareWindow(twitterUrl)}
        >
          <Twitter className="h-4 w-4 mr-2" />
          Twitter
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          className="flex items-center"
          onClick={() => openShareWindow(facebookUrl)}
        >
          <Facebook className="h-4 w-4 mr-2" />
          Facebook
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          className="flex items-center"
          onClick={() => openShareWindow(linkedinUrl)}
        >
          <Linkedin className="h-4 w-4 mr-2" />
          LinkedIn
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          className="flex items-center"
          onClick={() => openShareWindow(whatsappUrl)}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          WhatsApp
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          className="flex items-center"
          onClick={copyToClipboard}
        >
          {copied ? (
            <Check className="h-4 w-4 mr-2 text-green-500" />
          ) : (
            <Copy className="h-4 w-4 mr-2" />
          )}
          {copied ? "Copied" : "Copy link"}
        </Button>
      </div>
    </div>
  );
}