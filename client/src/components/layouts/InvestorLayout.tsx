import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import { 
  User, 
  Home, 
  PieChart, 
  Building, 
  CreditCard, 
  Wallet, 
  BookOpen, 
  Bell, 
  MessageSquare,
  Settings 
} from "lucide-react";

interface InvestorLayoutProps {
  children: ReactNode;
}

/**
 * Layout component for investor pages with navigation sidebar
 */
export default function InvestorLayout({ children }: InvestorLayoutProps) {
  const { user } = useAuth();
  const [location] = useLocation();

  // Navigation items for investor sidebar
  const navItems = [
    { name: "Dashboard", href: "/investor", icon: Home },
    { name: "Portfolio", href: "/investor/portfolio", icon: PieChart },
    { name: "Properties", href: "/investor/properties", icon: Building },
    { name: "Investments", href: "/investor/investments", icon: CreditCard },
    { name: "Wallet", href: "/investor/wallet", icon: Wallet },
    { name: "Education", href: "/investor/education", icon: BookOpen },
    { name: "Notifications", href: "/investor/notifications", icon: Bell },
    { name: "Messages", href: "/investor/messages", icon: MessageSquare },
    { name: "Settings", href: "/investor/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow flex">
        {/* Investor Sidebar */}
        <aside className="w-64 bg-gray-50 border-r border-gray-200 hidden md:block">
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-6">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{user?.username || "Investor"}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role || "investor"}</p>
              </div>
            </div>
            
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = location === item.href || 
                  (item.href !== "/investor" && location.startsWith(item.href));
                
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
          {children}
        </main>
      </div>
      
      <Footer />
    </div>
  );
}