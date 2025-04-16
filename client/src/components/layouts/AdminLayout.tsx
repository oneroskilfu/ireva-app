import { Outlet } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { User, Home, BarChart3, Users, FileText, Settings, MessageSquare, Bell } from "lucide-react";

/**
 * Layout component for admin pages with navigation sidebar
 */
export default function AdminLayout() {
  const { user } = useAuth();
  const [location] = useLocation();

  // Navigation items for admin sidebar
  const navItems = [
    { name: "Dashboard", href: "/admin", icon: Home },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Properties", href: "/admin/properties", icon: FileText },
    { name: "Investments", href: "/admin/investments", icon: BarChart3 },
    { name: "Notifications", href: "/admin/notifications", icon: Bell },
    { name: "Messages", href: "/admin/messages", icon: MessageSquare },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow flex">
        {/* Admin Sidebar */}
        <aside className="w-64 bg-gray-50 border-r border-gray-200 hidden md:block">
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-6">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{user?.username || "Admin"}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
            
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = location === item.href || 
                  (item.href !== "/admin" && location.startsWith(item.href));
                
                const Icon = item.icon;
                
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                  >
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`w-full justify-start ${isActive ? "" : "hover:bg-gray-100"}`}
                      size="sm"
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="flex-grow p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
      
      <Footer />
    </div>
  );
}