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

  // For the landing page only, we want a transparent header that becomes solid on scroll
  const isLandingPage = location === "/";
  
  return (
    <header className={cn(
      "sticky top-0 z-50 transition-all duration-300", 
      scrolled || !isLandingPage 
        ? "bg-white shadow-md" 
        : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Building className={cn(
                "h-6 w-6 mr-2",
                scrolled || !isLandingPage ? "text-primary" : "text-white"
              )} />
              <span className={cn(
                "text-xl font-bold",
                scrolled || !isLandingPage ? "text-gray-900" : "text-white"
              )}>
                iREVA
              </span>
            </Link>
            
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/" 
                className={cn(
                  "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                  location === "/" 
                    ? (scrolled || !isLandingPage ? "border-primary text-primary" : "border-white text-white") 
                    : scrolled || !isLandingPage 
                      ? "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      : "border-transparent text-white hover:border-white/60 hover:text-white"
                )}
              >
                Properties
              </Link>
              <Link href="/#how-it-works"
                className={cn(
                  "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                  scrolled || !isLandingPage 
                    ? "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    : "border-transparent text-white hover:border-white/60 hover:text-white"
                )}
              >
                How It Works
              </Link>
              <Link href="/#about"
                className={cn(
                  "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                  scrolled || !isLandingPage 
                    ? "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    : "border-transparent text-white hover:border-white/60 hover:text-white"
                )}
              >
                About
              </Link>
              <Link href="/forum"
                className={cn(
                  "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                  location === "/forum" || location.startsWith("/forum/") 
                    ? (scrolled || !isLandingPage ? "border-primary text-primary" : "border-white text-white") 
                    : scrolled || !isLandingPage 
                      ? "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      : "border-transparent text-white hover:border-white/60 hover:text-white"
                )}
              >
                Forum
              </Link>
              {user && (
                <>
                  <Link href="/community"
                    className={cn(
                      "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                      location === "/community" 
                        ? (scrolled || !isLandingPage ? "border-primary text-primary" : "border-white text-white") 
                        : scrolled || !isLandingPage 
                          ? "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                          : "border-transparent text-white hover:border-white/60 hover:text-white"
                    )}
                  >
                    Community
                  </Link>
                  <Link href="/verification"
                    className={cn(
                      "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                      location === "/verification" 
                        ? (scrolled || !isLandingPage ? "border-primary text-primary" : "border-white text-white") 
                        : scrolled || !isLandingPage 
                          ? "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                          : "border-transparent text-white hover:border-white/60 hover:text-white"
                    )}
                  >
                    Verification
                  </Link>
                </>
              )}
            </nav>
          </div>
          
          <div className="flex items-center gap-3">
            {!user && (
              <Link href="/demo" className="hidden md:block">
                <Button 
                  variant={scrolled || !isLandingPage ? "outline" : "secondary"} 
                  size="sm"
                  className={scrolled || !isLandingPage ? "" : "bg-white/10 border-white/20 text-white hover:bg-white/20"}
                >
                  Demo
                </Button>
              </Link>
            )}
            
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={cn(
                      "hidden md:inline-flex mr-3",
                      scrolled || !isLandingPage ? "text-primary" : "text-white border-white/20 hover:bg-white/10"
                    )}
                  >
                    <Building className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/verification">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={cn(
                      "hidden md:inline-flex mr-3",
                      scrolled || !isLandingPage ? "" : "text-white border-white/20 hover:bg-white/10"
                    )}
                  >
                    Verify Account
                  </Button>
                </Link>
                <Button 
                  variant={scrolled || !isLandingPage ? "default" : "secondary"}
                  size="sm" 
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className={scrolled || !isLandingPage ? "" : "bg-white text-primary hover:bg-gray-100"}
                >
                  {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
                </Button>
              </>
            ) : (
              <Link href="/auth">
                <Button 
                  variant={scrolled || !isLandingPage ? "default" : "secondary"}
                  size="sm"
                  className={scrolled || !isLandingPage ? "" : "bg-white text-primary hover:bg-gray-100"}
                >
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
