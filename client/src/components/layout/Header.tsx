import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
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

  // Always use white background like in the example
  return (
    <header className="sticky top-0 z-50 transition-all duration-300 bg-white shadow-sm">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left side - Main navigation */}
          <div className="flex items-center space-x-4">
            <div className="flex">
              <Link href="/" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                Explore
              </Link>
              <div className="relative group">
                <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none">
                  Properties
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                {/* Dropdown menu */}
                <div className="absolute left-0 mt-2 w-48 bg-white shadow-md rounded-md p-2 hidden group-hover:block transition-all duration-200 z-50">
                  <Link href="/properties/residential" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                    Residential
                  </Link>
                  <Link href="/properties/commercial" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                    Commercial
                  </Link>
                  <Link href="/properties/industrial" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                    Industrial
                  </Link>
                  <Link href="/properties/mixed-use" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                    Mixed-use
                  </Link>
                </div>
              </div>
              <Link href="/" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                Company
                <ChevronDown className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
          
          {/* Center - Logo */}
          <div className="flex items-center justify-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold tracking-wider text-gray-900">
                iREVA
              </span>
            </Link>
          </div>
          
          {/* Right side - Secondary links and auth */}
          <div className="flex items-center space-x-4">
            <Link href="/help" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Help
            </Link>
            <Link href="/blog" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Blog
            </Link>
            
            {/* Language selector */}
            <div className="relative">
              <button className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900">
                EN
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
            </div>
            
            {/* Auth buttons */}
            {user ? (
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/auth" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                  Log in
                </Link>
                <Link href="/auth">
                  <Button 
                    size="sm"
                    className="rounded-full bg-gray-900 text-white hover:bg-gray-800"
                  >
                    Start Investing
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
