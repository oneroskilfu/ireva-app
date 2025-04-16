import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
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
  BadgeCheck
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface InvestorLayoutProps {
  children: ReactNode;
}

const InvestorLayout = ({ children }: InvestorLayoutProps) => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navItems = [
    { path: "/investor/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: "/investor/portfolio", label: "My Portfolio", icon: <TrendingUp className="w-5 h-5" /> },
    { path: "/investor/properties", label: "Browse Properties", icon: <Building className="w-5 h-5" /> },
    { path: "/investor/wallet", label: "Wallet", icon: <Wallet className="w-5 h-5" /> },
    { path: "/investor/saved", label: "Saved Properties", icon: <Bookmark className="w-5 h-5" /> },
    { path: "/investor/roi-calculator", label: "ROI Calculator", icon: <Calculator className="w-5 h-5" /> },
    { path: "/investor/documents", label: "Documents", icon: <FileText className="w-5 h-5" /> },
    { path: "/investor/kyc", label: "KYC Verification", icon: <BadgeCheck className="w-5 h-5" /> },
    { path: "/investor/messages", label: "Messages", icon: <MessageSquare className="w-5 h-5" /> },
    { path: "/investor/support", label: "Support", icon: <HelpCircle className="w-5 h-5" /> },
    { path: "/investor/faqs", label: "FAQ", icon: <HelpCircle className="w-5 h-5" /> },
    { path: "/investor/settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
  ];

  const initials = user?.firstName && user?.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}` 
    : user?.username?.substring(0, 2).toUpperCase() || 'IR';

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Function to check verification status
  const getVerificationStatus = () => {
    if (user?.kycStatus === 'verified') {
      return { icon: <BadgeCheck className="h-4 w-4" />, text: 'Verified', class: 'bg-green-100 text-green-800' };
    } else if (user?.kycStatus === 'pending') {
      return { icon: <Shield className="h-4 w-4" />, text: 'Pending', class: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { icon: <Shield className="h-4 w-4" />, text: 'Unverified', class: 'bg-red-100 text-red-800' };
    }
  };

  const verificationStatus = getVerificationStatus();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white border-b h-16 flex items-center px-4 sticky top-0 z-10">
        <div className="flex-1 flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar} 
            className="mr-4 lg:hidden"
          >
            {isSidebarOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
          <Link href="/investor/dashboard">
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-primary">iREVA</div>
              <div className="text-xl font-semibold hidden md:inline">Investor Portal</div>
            </div>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[60vh] overflow-auto p-2">
                <div className="text-center text-muted-foreground py-4">
                  No new notifications
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative flex items-center space-x-2" size="sm">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profileImage || ""} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-sm">
                  <span className="font-medium">{user?.firstName || user?.username}</span>
                  <Badge variant="outline" className={`text-xs ${verificationStatus.class}`}>
                    <span className="flex items-center gap-1">
                      {verificationStatus.icon}
                      {verificationStatus.text}
                    </span>
                  </Badge>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
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
                <Link href="/investor/settings">
                  <div className="flex items-center w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} disabled={logoutMutation.isPending}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>{logoutMutation.isPending ? 'Logging out...' : 'Log out'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside 
          className={`bg-white border-r w-64 transition-all duration-300 shrink-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
            lg:translate-x-0 lg:sticky fixed top-16 bottom-0 left-0 z-10 overflow-y-auto`}
        >
          <nav className="p-4">
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = location === item.path;
                return (
                  <Link key={item.path} href={item.path}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`w-full justify-start ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      {item.icon}
                      <span className="ml-3">{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </nav>
          
          <div className="p-4 border-t mt-6">
            <div className="bg-primary/10 rounded-lg p-4">
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
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 p-4 ${!isSidebarOpen ? 'lg:ml-0' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default InvestorLayout;