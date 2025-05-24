import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import NotificationBell from "@/components/NotificationBell";
import {
  LayoutDashboard,
  Wallet,
  Building,
  TrendingUp,
  FileText,
  MessageSquare,
  HelpCircle,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  User,
  Heart,
  Bookmark,
  BookText,
  Calculator,
  Shield,
  BadgeCheck,
  Home,
  ChevronRight,
  BarChart,
  LineChart,
  PieChart
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface InvestorLayoutProps {
  children: ReactNode;
}

const InvestorLayout = ({ children }: InvestorLayoutProps) => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const typedUser = user as User;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navItems = [
    { path: "/investor/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: "/investor/portfolio", label: "My Portfolio", icon: <TrendingUp className="w-5 h-5" /> },
    { path: "/investor/projects", label: "Invest Now", icon: <Building className="w-5 h-5" />, highlight: true },
    { path: "/investor/properties", label: "Browse Properties", icon: <FileText className="w-5 h-5" /> },
    { path: "/investor/wallet", label: "Wallet", icon: <Wallet className="w-5 h-5" /> },
    { path: "/investor/insights/reports", label: "Investment Reports", icon: <BarChart className="w-5 h-5" /> },
    { path: "/investor/roi-dashboard", label: "ROI Dashboard", icon: <LineChart className="w-5 h-5" /> },
    { path: "/investor/saved", label: "Saved Properties", icon: <Bookmark className="w-5 h-5" /> },
    { path: "/investor/roi-calculator", label: "ROI Calculator", icon: <Calculator className="w-5 h-5" /> },
    { path: "/investor/documents", label: "Documents", icon: <FileText className="w-5 h-5" /> },
    { path: "/investor/notifications", label: "Notifications", icon: <Bell className="w-5 h-5" /> },
    { path: "/investor/kyc", label: "KYC Verification", icon: <BadgeCheck className="w-5 h-5" /> },
    { path: "/investor/messages", label: "Messages", icon: <MessageSquare className="w-5 h-5" /> },
    { path: "/investor/support", label: "Support", icon: <HelpCircle className="w-5 h-5" /> },
    { path: "/investor/faqs", label: "FAQ", icon: <HelpCircle className="w-5 h-5" /> },
    { path: "/investor/settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
  ];

  const initials = typedUser?.firstName && typedUser?.lastName 
    ? `${typedUser.firstName[0]}${typedUser.lastName[0]}` 
    : typedUser?.username?.substring(0, 2).toUpperCase() || 'IR';

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Function to check verification status
  const getVerificationStatus = () => {
    if (typedUser?.kycStatus === 'verified') {
      return { icon: <BadgeCheck className="h-4 w-4" />, text: 'Verified', class: 'bg-green-100 text-green-800' };
    } else if (typedUser?.kycStatus === 'pending') {
      return { icon: <Shield className="h-4 w-4" />, text: 'Pending', class: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { icon: <Shield className="h-4 w-4" />, text: 'Unverified', class: 'bg-red-100 text-red-800' };
    }
  };

  const verificationStatus = getVerificationStatus();

  // Auto-close sidebar on mobile when changing routes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    // Set initial state based on screen size
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Group navigation items for better organization
  const mainNavItems = navItems.slice(0, 8);
  const accountNavItems = navItems.slice(8);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white dark:bg-slate-950 border-b dark:border-slate-800 h-16 flex items-center px-4 sticky top-0 z-30 shadow-sm">
        <div className="flex-1 flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar} 
            className="mr-4 lg:hidden text-primary hover:text-primary/90 hover:bg-primary/5"
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
          <Link href="/investor/dashboard">
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">iREVA</div>
              <div className="text-lg font-medium hidden md:inline text-foreground/90">Investor Portal</div>
            </div>
          </Link>
        </div>
        <div className="flex items-center space-x-2">
          
          {/* Notifications */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <NotificationBell />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Notifications</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative flex items-center space-x-2 p-1" size="sm">
                <Avatar className="h-8 w-8 border border-primary/20">
                  <AvatarImage src={user?.profileImage || ""} alt={user?.firstName || user?.username} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-sm hidden md:flex">
                  <span className="font-medium">{user?.firstName || user?.username}</span>
                  <Badge variant="outline" className={`text-xs ${verificationStatus.class}`}>
                    <span className="flex items-center gap-1">
                      {verificationStatus.icon}
                      {verificationStatus.text}
                    </span>
                  </Badge>
                </div>
                <ChevronRight className="h-4 w-4 ml-1 hidden md:block text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex flex-col space-y-1 p-2 md:hidden">
                <p className="font-medium text-sm">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                <Badge variant="outline" className={`text-xs w-fit mt-1 ${verificationStatus.class}`}>
                  <span className="flex items-center gap-1">
                    {verificationStatus.icon}
                    {verificationStatus.text}
                  </span>
                </Badge>
              </div>
              <DropdownMenuSeparator className="md:hidden" />
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild className="bg-primary text-white hover:bg-primary/90 hover:text-white">
                  <Link href="/investor/projects">
                    <div className="flex items-center w-full">
                      <Building className="mr-2 h-4 w-4" />
                      <span>Invest Now</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/investor/profile">
                    <div className="flex items-center w-full">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/investor/wallet">
                    <div className="flex items-center w-full">
                      <Wallet className="mr-2 h-4 w-4" />
                      <span>Wallet</span>
                    </div>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/investor/settings">
                    <div className="flex items-center w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} disabled={logoutMutation.isPending} className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/50">
                <LogOut className="mr-2 h-4 w-4" />
                <span>{logoutMutation.isPending ? 'Logging out...' : 'Log out'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Sidebar - Mobile Modal Backdrop */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 z-20 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
        
        {/* Sidebar */}
        <aside 
          className={cn(
            "bg-white dark:bg-slate-950 border-r dark:border-slate-800 w-64 lg:w-72 transition-all duration-300 shrink-0",
            "lg:translate-x-0 lg:static fixed top-16 bottom-0 left-0 z-20 overflow-y-auto",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full",
            "scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent"
          )}
        >
          <nav className="p-4">
            <div className="space-y-4">
              {/* Main Navigation Group */}
              <div>
                <h3 className="text-xs uppercase text-muted-foreground font-medium mb-2 px-3">Main</h3>
                <div className="space-y-1">
                  {mainNavItems.map((item) => {
                    const isActive = location === item.path;
                    return (
                      <Link key={item.path} href={item.path}>
                        <Button
                          variant={isActive ? "default" : item.highlight ? "default" : "ghost"}
                          className={cn(
                            "w-full justify-start font-medium",
                            isActive 
                              ? "bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20"
                              : item.highlight
                                ? "bg-primary text-white hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          )}
                          size="sm"
                        >
                          {item.icon}
                          <span className="ml-3">{item.label}</span>
                          {isActive && <div className="ml-auto w-1 h-4 bg-primary rounded-full" />}
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              </div>
              
              {/* Account Navigation Group */}
              <div>
                <h3 className="text-xs uppercase text-muted-foreground font-medium mb-2 px-3">Account</h3>
                <div className="space-y-1">
                  {accountNavItems.map((item) => {
                    const isActive = location === item.path;
                    return (
                      <Link key={item.path} href={item.path}>
                        <Button
                          variant={isActive ? "default" : "ghost"}
                          className={cn(
                            "w-full justify-start font-medium",
                            isActive 
                              ? "bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20" 
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          )}
                          size="sm"
                        >
                          {item.icon}
                          <span className="ml-3">{item.label}</span>
                          {isActive && <div className="ml-auto w-1 h-4 bg-primary rounded-full" />}
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </nav>
          
          <div className="p-4 border-t dark:border-slate-800 mt-4">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-lg p-4 shadow-sm">
              <h4 className="font-medium mb-2 flex items-center text-primary">
                <Shield className="h-5 w-5 mr-2" /> Investment Protection
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Complete KYC verification to unlock premium investment opportunities.
              </p>
              <Link href="/investor/kyc">
                <Button size="sm" className="w-full">
                  Verify Identity
                </Button>
              </Link>
            </div>
            
            {/* Stats Card */}
            <div className="mt-4 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-lg p-4 shadow-sm">
              <h4 className="font-medium mb-2 text-foreground flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-primary" /> Portfolio Overview
              </h4>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 rounded-md bg-muted/50">
                  <p className="text-xs text-muted-foreground">Invested</p>
                  <p className="font-semibold text-primary">₦{user?.totalInvested?.toLocaleString() || '0'}</p>
                </div>
                <div className="p-2 rounded-md bg-muted/50">
                  <p className="text-xs text-muted-foreground">Earnings</p>
                  <p className="font-semibold text-green-600">₦{user?.totalEarnings?.toLocaleString() || '0'}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default InvestorLayout;