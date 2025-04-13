import { Github, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  return (
    <footer className="bg-background border-t py-6 md:py-8">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h4 className="font-medium text-base">RealtyFund</h4>
            <p className="text-sm text-muted-foreground">
              Invest in premium real estate opportunities with our transparent and secure platform.
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-base">Pages</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</a></li>
              <li><a href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">Dashboard</a></li>
              <li><a href="/market-trends" className="text-muted-foreground hover:text-foreground transition-colors">Market Trends</a></li>
              <li><a href="/analytics" className="text-muted-foreground hover:text-foreground transition-colors">Analytics</a></li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-base">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Blog</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Knowledge Base</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Support</a></li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-base">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex">
                <Mail className="h-4 w-4 mr-2 mt-0.5" />
                <span className="text-muted-foreground">support@realtyfund.com</span>
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
            &copy; 2025 RealtyFund. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}