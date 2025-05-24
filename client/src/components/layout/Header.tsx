import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  ChevronDown, 
  Users, 
  Lightbulb, 
  Newspaper, 
  Home, 
  Building, 
  Factory, 
  LayoutGrid, 
  LandPlot,
  Wallet,
  BookOpen
} from "lucide-react";
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
              <Link href="/" className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900">
                Explore
              </Link>
              <div className="relative group">
                <Link href="/properties">
                  <button className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 focus:outline-none">
                    Properties
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </button>
                </Link>
                {/* Dropdown menu */}
                <div className="absolute left-0 mt-2 w-48 bg-white shadow-md rounded-md p-2 hidden group-hover:block transition-all duration-200 z-50">
                  <Link href="/properties" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                    <LayoutGrid className="h-4 w-4 mr-2 text-primary" />
                    All Properties
                  </Link>
                  <Link href="/properties/residential" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                    <Home className="h-4 w-4 mr-2 text-primary" />
                    Residential
                  </Link>
                  <Link href="/properties/commercial" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                    <Building className="h-4 w-4 mr-2 text-primary" />
                    Commercial
                  </Link>
                  <Link href="/properties/industrial" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                    <Factory className="h-4 w-4 mr-2 text-primary" />
                    Industrial
                  </Link>
                  <Link href="/properties/mixed-use" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                    <LayoutGrid className="h-4 w-4 mr-2 text-primary" />
                    Mixed-use
                  </Link>
                  <Link href="/properties/land" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                    <LandPlot className="h-4 w-4 mr-2 text-primary" />
                    Land
                  </Link>
                </div>
              </div>
              <div className="relative group">
                <button className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 focus:outline-none">
                  Company
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                {/* Company Dropdown menu */}
                <div className="absolute left-0 mt-2 w-48 bg-white shadow-md rounded-md p-2 hidden group-hover:block transition-all duration-200 z-50">
                  <Link href="/company/team" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                    <Users className="h-4 w-4 mr-2 text-primary" />
                    Team
                  </Link>
                  <Link href="/company/culture" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                    <Lightbulb className="h-4 w-4 mr-2 text-primary" />
                    Culture
                  </Link>
                  <Link href="/company/press" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                    <Newspaper className="h-4 w-4 mr-2 text-primary" />
                    Press
                  </Link>
                </div>
              </div>
              <div className="relative group">
                <button className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 focus:outline-none">
                  Resources
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                {/* Resources Dropdown menu */}
                <div className="absolute left-0 mt-2 w-48 bg-white shadow-md rounded-md p-2 hidden group-hover:block transition-all duration-200 z-50">
                  <Link href="/crypto-education" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                    <BookOpen className="h-4 w-4 mr-2 text-primary" />
                    Crypto Education
                  </Link>
                  <Link href="/wallet" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                    <Wallet className="h-4 w-4 mr-2 text-primary" />
                    Wallet
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Center - Logo */}
          <div className="flex items-center justify-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-3xl font-bold tracking-wider text-gray-900">
                iREVA
              </span>
            </Link>
          </div>
          
          {/* Right side - Secondary links and auth */}
          <div className="flex items-center space-x-4">
            <Link href="/help" className="text-base font-medium text-gray-700 hover:text-gray-900">
              Help
            </Link>
            <Link href="/blog" className="text-base font-medium text-gray-700 hover:text-gray-900">
              Blog
            </Link>
            
            {/* Country selector */}
            <div className="relative group">
              <button className="flex items-center text-base font-medium text-gray-700 hover:text-gray-900 focus:outline-none">
                <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-200 flex items-center justify-center bg-gray-50">
                  <img 
                    src="https://flagcdn.com/w20/ng.png" 
                    width="24" 
                    height="24" 
                    alt="Nigeria" 
                    className="object-cover"
                  />
                </div>
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              {/* Country dropdown menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-md rounded-md p-2 hidden group-hover:block transition-all duration-200 z-50">
                <a href="/global" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                  <div className="w-5 h-5 rounded-full overflow-hidden border border-gray-200 flex items-center justify-center bg-gray-50 mr-2">
                    <img 
                      src="https://flagcdn.com/w20/un.png" 
                      width="20" 
                      height="20" 
                      alt="Global" 
                      className="object-cover"
                    />
                  </div>
                  Global
                </a>
                <a href="/ghana" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                  <div className="w-5 h-5 rounded-full overflow-hidden border border-gray-200 flex items-center justify-center bg-gray-50 mr-2">
                    <img 
                      src="https://flagcdn.com/w20/gh.png" 
                      width="20" 
                      height="20" 
                      alt="Ghana" 
                      className="object-cover"
                    />
                  </div>
                  Ghana
                </a>
                <a href="/kenya" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                  <div className="w-5 h-5 rounded-full overflow-hidden border border-gray-200 flex items-center justify-center bg-gray-50 mr-2">
                    <img 
                      src="https://flagcdn.com/w20/ke.png" 
                      width="20" 
                      height="20" 
                      alt="Kenya" 
                      className="object-cover"
                    />
                  </div>
                  Kenya
                </a>
              </div>
            </div>
            
            {/* Auth buttons */}
            {user ? (
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="text-base font-medium text-gray-700 hover:text-gray-900"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/auth" className="text-base font-medium text-gray-700 hover:text-gray-900">
                  Log in
                </Link>
                <Link href="/auth">
                  <Button 
                    size="sm"
                    className="rounded-full bg-gray-900 text-white hover:bg-gray-800 text-base"
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