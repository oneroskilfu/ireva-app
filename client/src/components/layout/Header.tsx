import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Building, User, Settings, Shield, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { AnimatedLink } from "@/components/ui/animated-link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
            <AnimatedLink href="/" className="flex-shrink-0 flex items-center">
              <Building className="h-6 w-6 text-primary mr-2" />
              <span className="text-xl font-bold">REVA</span>
            </AnimatedLink>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <AnimatedLink href="/" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                location === "/" 
                  ? "border-primary text-primary" 
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}>
                Properties
              </AnimatedLink>
              <AnimatedLink href="/#how-it-works" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                How It Works
              </AnimatedLink>
              <AnimatedLink href="/#about" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                About
              </AnimatedLink>
              <AnimatedLink href="/market-trends" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                location === "/market-trends" 
                  ? "border-primary text-primary" 
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}>
                Market Trends
              </AnimatedLink>
              {user && (
                <AnimatedLink href="/community" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location === "/community" 
                    ? "border-primary text-primary" 
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}>
                  Community
                </AnimatedLink>
              )}
            </nav>
          </div>
          <div className="flex items-center">
            {user ? (
              <>
                <AnimatedLink href="/dashboard">
                  <Button variant="outline" size="sm" className="hidden md:inline-flex mr-3 text-primary">
                    <Building className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </AnimatedLink>
                {user.isAdmin && (
                  <AnimatedLink href="/admin">
                    <Button variant="outline" size="sm" className="hidden md:inline-flex mr-3 bg-red-50 text-red-600 hover:bg-red-100 border-red-200">
                      Admin
                    </Button>
                  </AnimatedLink>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="mr-3">
                      <User className="h-4 w-4 mr-2" />
                      <span className="hidden md:inline-block">Account</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span>{user.firstName || user.username}</span>
                        {user.email && <span className="text-xs text-muted-foreground">{user.email}</span>}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="/account/profile">
                      <DropdownMenuItem className="cursor-pointer">
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/account/security">
                      <DropdownMenuItem className="cursor-pointer">
                        <Shield className="h-4 w-4 mr-2" />
                        Security Settings
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/dashboard">
                      <DropdownMenuItem className="cursor-pointer">
                        <Building className="h-4 w-4 mr-2" />
                        Dashboard
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <AnimatedLink href="/auth">
                <Button variant="default" size="sm">
                  Create
                </Button>
              </AnimatedLink>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
