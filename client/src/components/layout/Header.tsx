import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Building, User, Shield, LogOut, Menu, X, Home, Info, TrendingUp, Users, HelpCircle } from "lucide-react";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

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
              <span className="text-xl font-bold">iREVA</span>
            </AnimatedLink>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {/* Properties dropdown with horizontal submenu */}
              <div className="relative group">
                <div className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer ${
                  location === "/" 
                    ? "border-primary text-primary" 
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}>
                  <span>Properties</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
                
                {/* Horizontal dropdown */}
                <div className="absolute left-0 mt-1 w-auto hidden group-hover:flex group-hover:opacity-100 transition-opacity duration-300 z-50">
                  <div className="bg-white py-2 px-1 rounded-md shadow-lg border border-gray-200 flex flex-row">
                    <Link href="/?type=all" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded whitespace-nowrap">
                      All Properties
                    </Link>
                    <Link href="/?type=residential" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded whitespace-nowrap">
                      Residential
                    </Link>
                    <Link href="/?type=commercial" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded whitespace-nowrap">
                      Commercial
                    </Link>
                    <Link href="/?type=industrial" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded whitespace-nowrap">
                      Industrial
                    </Link>
                    <Link href="/?type=mixed-use" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded whitespace-nowrap">
                      Mixed-Use
                    </Link>
                    <Link href="/?type=land" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded whitespace-nowrap">
                      Land
                    </Link>
                  </div>
                </div>
              </div>
              
              <AnimatedLink href="/how-it-works" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                location === "/how-it-works" 
                  ? "border-primary text-primary" 
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}>
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
            {/* Mobile menu button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="sm:hidden mr-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[350px]">
                <SheetHeader className="mb-6">
                  <SheetTitle className="flex items-center text-left">
                    <Building className="h-6 w-6 text-primary mr-2" />
                    <span className="text-xl font-bold">iREVA</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-4">
                  {/* Properties menu with submenu */}
                  <div className="mb-2">
                    <div className={`flex items-center p-2 rounded-md ${location === "/" ? "bg-primary/10 text-primary" : ""}`}>
                      <Home className="h-5 w-5 mr-2" />
                      <span>Properties</span>
                    </div>
                    
                    {/* Property type submenu (horizontal grid layout) */}
                    <div className="ml-8 grid grid-cols-2 gap-1 mt-1">
                      <SheetClose asChild>
                        <Link href="/?type=all" className="p-2 text-sm rounded-md hover:bg-gray-100">
                          All Properties
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/?type=residential" className="p-2 text-sm rounded-md hover:bg-gray-100">
                          Residential
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/?type=commercial" className="p-2 text-sm rounded-md hover:bg-gray-100">
                          Commercial
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/?type=industrial" className="p-2 text-sm rounded-md hover:bg-gray-100">
                          Industrial
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/?type=mixed-use" className="p-2 text-sm rounded-md hover:bg-gray-100">
                          Mixed-Use
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/?type=land" className="p-2 text-sm rounded-md hover:bg-gray-100">
                          Land
                        </Link>
                      </SheetClose>
                    </div>
                  </div>
                  <SheetClose asChild>
                    <Link href="/how-it-works" className={`flex items-center p-2 rounded-md ${location === "/how-it-works" ? "bg-primary/10 text-primary" : "hover:bg-gray-100"}`}>
                      <Info className="h-5 w-5 mr-2" />
                      How It Works
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/#about" className="flex items-center p-2 rounded-md hover:bg-gray-100">
                      <Building className="h-5 w-5 mr-2" />
                      About
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/market-trends" className={`flex items-center p-2 rounded-md ${location === "/market-trends" ? "bg-primary/10 text-primary" : "hover:bg-gray-100"}`}>
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Market Trends
                    </Link>
                  </SheetClose>
                  {user && (
                    <>
                      <SheetClose asChild>
                        <Link href="/community" className={`flex items-center p-2 rounded-md ${location === "/community" ? "bg-primary/10 text-primary" : "hover:bg-gray-100"}`}>
                          <Users className="h-5 w-5 mr-2" />
                          Community
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/dashboard" className={`flex items-center p-2 rounded-md ${location === "/dashboard" ? "bg-primary/10 text-primary" : "hover:bg-gray-100"}`}>
                          <Building className="h-5 w-5 mr-2" />
                          Dashboard
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/account/profile" className="flex items-center p-2 rounded-md hover:bg-gray-100">
                          <User className="h-5 w-5 mr-2" />
                          Profile
                        </Link>
                      </SheetClose>
                      <div className="pt-4 border-t">
                        <Button 
                          variant="ghost" 
                          className="flex w-full justify-start text-red-600 hover:text-red-800 hover:bg-red-50"
                          onClick={handleLogout}
                          disabled={logoutMutation.isPending}
                        >
                          <LogOut className="h-5 w-5 mr-2" />
                          {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
                        </Button>
                      </div>
                    </>
                  )}
                  {!user && (
                    <div className="pt-4 border-t space-y-2">
                      <SheetClose asChild>
                        <Link href="/auth?tab=login">
                          <Button variant="outline" className="w-full">
                            Login
                          </Button>
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/auth">
                          <Button variant="default" className="w-full">
                            Create Account
                          </Button>
                        </Link>
                      </SheetClose>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
            
            {/* Desktop navigation */}
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
                    <Link href="/support">
                      <DropdownMenuItem className="cursor-pointer">
                        <HelpCircle className="h-4 w-4 mr-2" />
                        Customer Support
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
              <div className="flex space-x-3">
                <AnimatedLink href="/auth?tab=login">
                  <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                    Login
                  </Button>
                </AnimatedLink>
                <AnimatedLink href="/auth">
                  <Button variant="default" size="sm">
                    Create Account
                  </Button>
                </AnimatedLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
