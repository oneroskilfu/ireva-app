import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import {
  Menu,
  X,
  LayoutDashboard,
  Home,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Wallet,
  MessageSquare,
  UsersRound,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Avatar,
  AvatarImage,
  AvatarFallback
} from '@/components/ui/avatar';
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [location, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  // Common navigation items for all users
  const commonNav: NavItem[] = [
    { label: 'Home', path: '/', icon: <Home className="h-4 w-4 mr-2" /> },
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-4 w-4 mr-2" /> },
  ];

  // Investor-specific navigation items
  const investorNav: NavItem[] = [
    { label: 'Wallet', path: '/wallet', icon: <Wallet className="h-4 w-4 mr-2" /> },
    { label: 'Messages', path: '/messages', icon: <MessageSquare className="h-4 w-4 mr-2" /> },
  ];

  // Admin-specific navigation items
  const adminNav: NavItem[] = [
    { label: 'Admin Panel', path: '/admin', icon: <ShieldCheck className="h-4 w-4 mr-2" /> },
    { label: 'User Management', path: '/admin/users', icon: <UsersRound className="h-4 w-4 mr-2" /> },
  ];

  // Build complete navigation based on user role
  const navItems = [
    ...commonNav,
    ...(user?.role === 'investor' ? investorNav : []),
    ...(user?.role === 'admin' ? adminNav : []),
    ...(isAuthenticated ? [{ label: 'Settings', path: '/settings', icon: <Settings className="h-4 w-4 mr-2" /> }] : [])
  ];

  // Check if a navigation item matches the current path
  const isActive = (path: string) => {
    if (path === '/' && location === '/') return true;
    if (path !== '/' && location.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Link href="/">
              <span className="text-2xl font-bold tracking-tight cursor-pointer text-primary">
                iREVA
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <span className={cn(
                  "flex items-center text-sm font-medium cursor-pointer transition-colors",
                  isActive(item.path) 
                    ? "text-primary font-semibold" 
                    : "text-muted-foreground hover:text-foreground"
                )}>
                  {item.icon}
                  {item.label}
                </span>
              </Link>
            ))}

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 pr-2 text-sm text-muted-foreground">
                  <span className="hidden lg:inline">Welcome,</span> 
                  <span className="font-medium text-foreground">{user?.username || user?.email}</span>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-1 h-auto">
                      <Avatar className="h-8 w-8 border-2 border-primary/20 hover:border-primary transition-colors">
                        {user?.profileImage ? (
                          <AvatarImage src={user.profileImage} alt={user?.username || user?.email || "User"} />
                        ) : (
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {(user?.username?.[0] || user?.email?.[0] || "U").toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center gap-2 p-2 border-b">
                      <Avatar className="h-10 w-10">
                        {user?.profileImage ? (
                          <AvatarImage src={user.profileImage} alt={user?.username || user?.email || "User"} />
                        ) : (
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {(user?.username?.[0] || user?.email?.[0] || "U").toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex flex-col space-y-0.5">
                        <p className="text-sm font-medium">{user?.username || user?.email}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {user?.role || "User"}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <span className="flex items-center w-full cursor-pointer">
                          <Settings className="h-4 w-4 mr-2" />
                          Account Settings
                        </span>
                      </Link>
                    </DropdownMenuItem>
                    {user?.role === 'admin' && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <span className="flex items-center w-full cursor-pointer">
                            <ShieldCheck className="h-4 w-4 mr-2" />
                            Admin Panel
                          </span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {user?.role === 'investor' && (
                      <DropdownMenuItem asChild>
                        <Link href="/wallet">
                          <span className="flex items-center w-full cursor-pointer">
                            <Wallet className="h-4 w-4 mr-2" />
                            My Wallet
                          </span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Link href="/auth">
                <Button variant="default" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Login / Register
                </Button>
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[80%] sm:w-[250px]">
              <div className="flex items-center justify-between">
                <Link href="/">
                  <SheetClose asChild>
                    <span className="text-xl font-bold cursor-pointer text-primary">
                      iREVA
                    </span>
                  </SheetClose>
                </Link>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon">
                    <X className="h-6 w-6" />
                    <span className="sr-only">Close menu</span>
                  </Button>
                </SheetClose>
              </div>
              
              {isAuthenticated && (
                <div className="mt-5 mb-6 px-3 py-3 bg-muted/60 rounded-md text-muted-foreground flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    {user?.profileImage ? (
                      <AvatarImage src={user.profileImage} alt={user?.username || user?.email || "User"} />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {(user?.username?.[0] || user?.email?.[0] || "U").toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium truncate max-w-[160px]">{user?.username || user?.email}</span>
                    <span className="text-xs capitalize flex items-center gap-1">
                      <span className={cn(
                        "inline-block w-2 h-2 rounded-full",
                        user?.role === 'admin' ? "bg-green-500" : "bg-blue-500"
                      )}></span>
                      {user?.role}
                    </span>
                  </div>
                </div>
              )}
              
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <Link key={item.path} href={item.path}>
                    <SheetClose asChild>
                      <div className={cn(
                        "flex items-center py-2 px-3 text-base font-medium cursor-pointer rounded-md transition-colors",
                        isActive(item.path) 
                          ? "bg-primary/10 text-primary font-semibold" 
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      )}>
                        {item.icon}
                        {item.label}
                      </div>
                    </SheetClose>
                  </Link>
                ))}
                
                {isAuthenticated && (
                  <>
                    <div className="h-px bg-muted my-2" />
                    <SheetClose asChild>
                      <Button 
                        variant="destructive" 
                        className="mt-2 w-full"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleLogout();
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </SheetClose>
                  </>
                )}
                
                {!isAuthenticated && (
                  <Link href="/auth">
                    <SheetClose asChild>
                      <Button className="w-full mt-2">
                        <User className="h-4 w-4 mr-2" />
                        Login / Register
                      </Button>
                    </SheetClose>
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container py-6">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-muted py-6">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} iREVA. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy">
              <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                Privacy Policy
              </span>
            </Link>
            <Link href="/terms">
              <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                Terms of Service
              </span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;