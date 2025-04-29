import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import NotificationBell from "@/components/NotificationBell";
import {
  LayoutDashboard,
  Users,
  Building,
  FileText,
  ClipboardCheck,
  BarChart3,
  MessageSquare,
  HelpCircle,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  User,
  Shield,
  Database,
  CreditCard,
  BookOpen,
  Activity,
  Home,
  Wallet,
  TrendingUp,
  PieChart,
  Bitcoin
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

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: "/admin/users", label: "User Management", icon: <Users className="w-5 h-5" /> },
    { path: "/admin/projects", label: "Projects", icon: <Building className="w-5 h-5" /> },
    { path: "/admin/properties", label: "Properties", icon: <FileText className="w-5 h-5" /> },
    { path: "/admin/kyc", label: "KYC Verification", icon: <ClipboardCheck className="w-5 h-5" /> },
    { path: "/admin/investments", label: "Investments", icon: <BarChart3 className="w-5 h-5" /> },
    { path: "/admin/roi-dashboard", label: "ROI Dashboard", icon: <TrendingUp className="w-5 h-5" /> },
    { path: "/admin/wallet-management", label: "Wallet Management", icon: <Wallet className="w-5 h-5" /> },
    { path: "/admin/crypto-integration", label: "Crypto Integration", icon: <Bitcoin className="w-5 h-5" /> },
    { path: "/admin/crypto-transactions", label: "Crypto Transactions", icon: <PieChart className="w-5 h-5" /> },
    { path: "/admin/transactions", label: "Transactions", icon: <Activity className="w-5 h-5" /> },
    { path: "/admin/payments", label: "Payments", icon: <CreditCard className="w-5 h-5" /> },
    { path: "/admin/compliance", label: "Compliance Center", icon: <ClipboardCheck className="w-5 h-5" /> },
    { path: "/admin/documents", label: "Documents", icon: <FileText className="w-5 h-5" /> },
    { path: "/admin/messages", label: "Messages", icon: <MessageSquare className="w-5 h-5" /> },
    { path: "/admin/resources", label: "Resources", icon: <BookOpen className="w-5 h-5" /> },
    { path: "/admin/system", label: "System", icon: <Database className="w-5 h-5" /> },
    { path: "/admin/settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
  ];

  const initials = user?.firstName && user?.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}` 
    : user?.username?.substring(0, 2).toUpperCase() || 'AD';

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
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
          <Link href="/admin/dashboard">
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-primary">iREVA</div>
              <div className="text-xl font-semibold hidden md:inline">Admin Panel</div>
            </div>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <NotificationBell />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative flex items-center space-x-2" size="sm">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profileImage || ""} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-sm">
                  <span className="font-medium">{user?.firstName || user?.username}</span>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 text-xs">
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      {user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </span>
                  </Badge>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/profile">
                  <div className="flex items-center w-full">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/settings">
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
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <h4 className="font-medium mb-2 flex items-center text-amber-700">
                <HelpCircle className="h-5 w-5 mr-2" /> Admin Guide
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Need help with the admin panel? Check out the detailed admin documentation.
              </p>
              <Link href="/admin/help">
                <Button size="sm" variant="outline" className="w-full border-amber-200 text-amber-700 hover:text-amber-800 hover:bg-amber-100">
                  View Admin Guide
                </Button>
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;