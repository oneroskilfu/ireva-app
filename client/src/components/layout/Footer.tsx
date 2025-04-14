import { Github, Mail, ArrowRight, Send } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Footer() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        variant: "destructive",
        title: "Email required",
        description: "Please enter your email address to subscribe."
      });
      return;
    }
    
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast({
        variant: "destructive",
        title: "Invalid email",
        description: "Please enter a valid email address."
      });
      return;
    }
    
    // In a real implementation, this would connect to a newsletter service
    toast({
      title: "Subscription successful!",
      description: "You're now subscribed to our newsletter.",
    });
    
    setEmail("");
  };

  return (
    <footer className="bg-background border-t py-10 md:py-12">
      <div className="container px-4 md:px-6">
        {/* Newsletter subscription */}
        <div className="mb-10 pb-10 border-b">
          <div className="max-w-md mx-auto md:mx-0">
            <h4 className="font-semibold text-lg mb-3">Subscribe for updates</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Stay updated on new investment opportunities and market insights.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <Input
                type="email"
                placeholder="Your email address"
                className="focus-visible:ring-primary"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit" size="sm" className="shrink-0 gap-1">
                Subscribe
                <Send className="h-4 w-4 ml-1" />
              </Button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h4 className="font-medium text-base">REVA</h4>
            <p className="text-sm text-muted-foreground">
              Invest in premium real estate opportunities with our transparent and secure platform.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-base">Pages</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link></li>
              <li><Link href="/how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How It Works</Link></li>
              <li><Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link></li>
              <li><Link href="/market-trends" className="text-muted-foreground hover:text-foreground transition-colors">Market Trends</Link></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-base">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/community" className="text-muted-foreground hover:text-foreground transition-colors">Community</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Knowledge Base</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</Link></li>
              <li><Link href="/support" className="text-muted-foreground hover:text-foreground transition-colors">Customer Support</Link></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-base">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex">
                <Mail className="h-4 w-4 mr-2 mt-0.5" />
                <span className="text-muted-foreground">support@reva.com</span>
              </li>
              <li className="flex">
                <Github className="h-4 w-4 mr-2 mt-0.5" />
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">GitHub</a>
              </li>
            </ul>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-muted-foreground mb-4 md:mb-0">
            &copy; 2025 REVA. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}