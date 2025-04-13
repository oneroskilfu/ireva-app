import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Building } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function Header() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className={cn(
      "bg-white shadow-sm sticky top-0 z-50 transition-shadow duration-300", 
      scrolled ? "shadow-md" : "shadow-sm"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Building className="h-6 w-6 text-primary mr-2" />
              <span className="text-xl font-bold">InvestProperty</span>
            </Link>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/">
                <a className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location === "/" 
                    ? "border-primary text-primary" 
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}>
                  Properties
                </a>
              </Link>
              <Link href="/#how-it-works">
                <a className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  How It Works
                </a>
              </Link>
              <Link href="/#about">
                <a className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  About
                </a>
              </Link>
              <Link href="/market-trends">
                <a className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location === "/market-trends" 
                    ? "border-primary text-primary" 
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}>
                  Market Trends
                </a>
              </Link>
              {user && (
                <Link href="/community">
                  <a className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    location === "/community" 
                      ? "border-primary text-primary" 
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}>
                    Community
                  </a>
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className="hidden md:inline-flex mr-3 text-primary">
                    <Building className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
                </Button>
              </>
            ) : (
              <Link href="/auth">
                <Button variant="default" size="sm">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
