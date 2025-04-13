import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  HomeIcon, 
  TrendingUp, 
  LayoutDashboard, 
  Users, 
  Settings, 
  Shield, 
  UserCircle, 
  Wallet, 
  LogOut 
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardSidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  const isAdmin = user?.isAdmin;
  
  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: <HomeIcon className="h-5 w-5" />,
    },
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Market Trends",
      href: "/market-trends",
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      name: "Community",
      href: "/community",
      icon: <Users className="h-5 w-5" />,
    },
  ];
  
  const accountItems = [
    {
      name: "Profile",
      href: "/account/profile",
      icon: <UserCircle className="h-5 w-5" />,
    },
    {
      name: "Wallet",
      href: "/account/wallet",
      icon: <Wallet className="h-5 w-5" />,
    },
    {
      name: "Security",
      href: "/account/security",
      icon: <Shield className="h-5 w-5" />,
    },
    {
      name: "Settings",
      href: "/account/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];
  
  const adminItems = [
    {
      name: "Admin Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
  ];
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <div className="hidden md:flex w-64 flex-col h-full border-r bg-white">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4 mb-5">
          <span className="font-semibold text-lg text-primary">InvestProperty</span>
        </div>
        
        <nav className="mt-2 flex-1 px-4 space-y-1">
          <div className="pb-2">
            <p className="text-sm font-medium text-gray-400 mb-2 px-2">Navigation</p>
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a className={cn(
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  location === item.href
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}>
                  {React.cloneElement(item.icon, {
                    className: cn(
                      "mr-3 flex-shrink-0 h-5 w-5",
                      location === item.href
                        ? "text-white"
                        : "text-gray-500 group-hover:text-gray-600"
                    ),
                  })}
                  {item.name}
                </a>
              </Link>
            ))}
          </div>
          
          <div className="pt-4 pb-2">
            <p className="text-sm font-medium text-gray-400 mb-2 px-2">Account</p>
            {accountItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a className={cn(
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  location === item.href
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}>
                  {React.cloneElement(item.icon, {
                    className: cn(
                      "mr-3 flex-shrink-0 h-5 w-5",
                      location === item.href
                        ? "text-white"
                        : "text-gray-500 group-hover:text-gray-600"
                    ),
                  })}
                  {item.name}
                </a>
              </Link>
            ))}
          </div>
          
          {isAdmin && (
            <div className="pt-4 pb-2">
              <p className="text-sm font-medium text-gray-400 mb-2 px-2">Admin</p>
              {adminItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <a className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                    location === item.href
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}>
                    {React.cloneElement(item.icon, {
                      className: cn(
                        "mr-3 flex-shrink-0 h-5 w-5",
                        location === item.href
                          ? "text-white"
                          : "text-gray-500 group-hover:text-gray-600"
                      ),
                    })}
                    {item.name}
                  </a>
                </Link>
              ))}
            </div>
          )}
        </nav>
      </div>
      
      <div className="flex-shrink-0 flex border-t p-4">
        <div className="flex items-center w-full">
          <div className="flex-shrink-0">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
              {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-700">
              {user?.firstName} {user?.lastName || ''}
            </p>
            <p className="text-xs font-medium text-gray-500">
              {user?.email || user?.username}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="ml-auto"
          >
            <LogOut className="h-5 w-5 text-gray-500" />
          </Button>
        </div>
      </div>
    </div>
  );
}