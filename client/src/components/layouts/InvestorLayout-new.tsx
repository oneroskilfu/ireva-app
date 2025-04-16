import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
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
  BookText
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

interface InvestorLayoutProps {
  children: ReactNode;
}

const InvestorLayout = ({ children }: InvestorLayoutProps) => {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navItems = [
    { path: "/investor", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: "/investor/portfolio", label: "My Portfolio", icon: <TrendingUp className="w-5 h-5" /> },
    { path: "/investor/properties", label: "Browse Properties", icon: <Building className="w-5 h-5" /> },
    { path: "/investor/wallet", label: "Wallet", icon: <Wallet className="w-5 h-5" /> },
    { path: "/investor/saved", label: "Saved Properties", icon: <Bookmark className="w-5 h-5" /> },
    { path: "/investor/favorites", label: "Favorites", icon: <Heart className="w-5 h-5" /> },
    { path: "/investor/documents", label: "Documents", icon: <FileText className="w-5 h-5" /> },
    { path: "/investor/learn", label: "Learning Center", icon: <BookText className="w-5 h-5" /> },
    { path: "/investor/messages", label: "Messages", icon: <MessageSquare className="w-5 h-5" /> },
    { path: "/investor/support", label: "Support", icon: <HelpCircle className="w-5 h-5" /> },
    { path: "/investor/settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
  ];

  const initials = user?.firstName && user?.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}` 
    : user?.username?.substring(0, 2).toUpperCase() || 'IN';

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar for desktop */}
      <div 
        className={`fixed inset-y-0 left-0 z-20 flex-col bg-card border-r border-border transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "w-64" : "w-20"
        } hidden md:flex`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <div className={`flex items-center ${!isSidebarOpen && "justify-center w-full"}`}>
            {isSidebarOpen ? (
              <span className="text-lg font-bold">iREVA Investor</span>
            ) : (
              <span className="text-lg font-bold">iR</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={!isSidebarOpen ? "hidden" : ""}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex flex-col flex-1 overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={(e) => {
                  // Prevent default for the current path
                  if (location === item.path) {
                    e.preventDefault();
                  }
                }}
              >
                <div
                  className={`flex items-center px-3 py-2 text-sm rounded-md cursor-pointer group transition-colors
                    ${
                      location === item.path
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }
                    ${!isSidebarOpen && "justify-center p-3"}
                  `}
                >
                  {item.icon}
                  {isSidebarOpen && <span className="ml-3">{item.label}</span>}
                </div>
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            className={`w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted
              ${!isSidebarOpen && "justify-center p-3"}
            `}
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </div>

      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-10 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-20 w-64 flex-col bg-card border-r border-border transition-transform duration-300 ease-in-out transform md:hidden ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <span className="text-lg font-bold">iREVA Investor</span>
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex flex-col flex-1 overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={(e) => {
                  // Prevent default for the current path
                  if (location === item.path) {
                    e.preventDefault();
                  }
                  setIsSidebarOpen(false);
                }}
              >
                <div
                  className={`flex items-center px-3 py-2 text-sm rounded-md cursor-pointer group transition-colors
                    ${
                      location === item.path
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }
                  `}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </div>
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            <span className="ml-2">Logout</span>
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "md:ml-64" : "md:ml-20"
        }`}
      >
        {/* Header */}
        <header className="h-16 border-b border-border bg-card sticky top-0 z-10">
          <div className="flex items-center justify-between h-full px-4">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={toggleSidebar}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary"></span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-80 overflow-y-auto">
                    <div className="py-2 px-3 hover:bg-muted rounded-sm cursor-pointer">
                      <p className="font-medium">New property available</p>
                      <p className="text-sm text-muted-foreground">Lekki Gardens Phase 2 is now open for investment</p>
                      <p className="text-xs text-muted-foreground mt-1">2 days ago</p>
                    </div>
                    <DropdownMenuSeparator />
                    <div className="py-2 px-3 hover:bg-muted rounded-sm cursor-pointer">
                      <p className="font-medium">Monthly report</p>
                      <p className="text-sm text-muted-foreground">Your investment report for May is ready</p>
                      <p className="text-xs text-muted-foreground mt-1">5 days ago</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer justify-center font-medium">
                    View all notifications
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImage || ''} alt={user?.username || 'Investor'} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline-block">
                      {user?.firstName || user?.username}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Wallet className="mr-2 h-4 w-4" />
                    <span>Wallet</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default InvestorLayout;