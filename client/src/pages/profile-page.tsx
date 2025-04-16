import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  User, CreditCard, Bell, ChevronRight, LogOut, Lock, 
  FileText, Settings, HelpCircle, Briefcase
} from "lucide-react";
import { Link } from "wouter";

export default function ProfilePage() {
  const { user, logoutMutation } = useAuth();
  const [kycVerified, setKycVerified] = useState(user?.kycStatus === "verified");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const menuItems = [
    {
      id: 'account',
      title: 'Account',
      items: [
        { 
          id: 'my-projects',
          label: 'My Projects',
          icon: <Briefcase className="h-5 w-5" />,
          link: '/portfolio'
        },
        { 
          id: 'account-settings',
          label: 'Account Settings', 
          icon: <Settings className="h-5 w-5" />,
          link: '/settings'
        },
        { 
          id: 'payment-methods',
          label: 'Payment Methods', 
          icon: <CreditCard className="h-5 w-5" />,
          link: '/payment-methods'
        }
      ]
    },
    {
      id: 'preferences',
      title: 'Preferences',
      items: [
        { 
          id: 'notifications',
          label: 'Notifications', 
          icon: <Bell className="h-5 w-5" />,
          hasToggle: true,
          toggleValue: notificationsEnabled,
          onToggle: () => setNotificationsEnabled(!notificationsEnabled)
        },
        { 
          id: 'change-password',
          label: 'Change Password', 
          icon: <Lock className="h-5 w-5" />,
          link: '/change-password'
        }
      ]
    },
    {
      id: 'support',
      title: 'Support',
      items: [
        { 
          id: 'help',
          label: 'Help Center', 
          icon: <HelpCircle className="h-5 w-5" />,
          link: '/help'
        },
        { 
          id: 'terms',
          label: 'Terms & Conditions', 
          icon: <FileText className="h-5 w-5" />,
          link: '/terms'
        }
      ]
    }
  ];
  
  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <DashboardHeader />
      
      <main className="flex-grow py-6">
        <div className="max-w-2xl mx-auto px-4">
          {/* Profile header */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 text-center">
            <div className="relative mx-auto w-24 h-24 mb-4">
              {user?.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt={user.firstName || user.username || ""} 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-emerald-600 flex items-center justify-center text-white text-3xl font-semibold">
                  {(user?.firstName?.charAt(0) || user?.username?.charAt(0) || "").toUpperCase()}
                </div>
              )}
            </div>
            
            <h2 className="text-xl font-bold">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.username}
            </h2>
            <p className="text-gray-500">{user?.email}</p>
            
            <div className="mt-4 flex items-center justify-center space-x-2">
              <span className="text-sm">KYC Verification:</span>
              <Switch 
                checked={kycVerified} 
                onCheckedChange={setKycVerified}
                disabled={user?.kycStatus !== "verified"} 
              />
              <span className="text-xs text-gray-500">
                {user?.kycStatus === "verified" 
                  ? "Verified" 
                  : user?.kycStatus === "pending"
                    ? "Pending"
                    : "Not Verified"}
              </span>
            </div>
          </div>
          
          {/* Menu sections */}
          {menuItems.map((section) => (
            <div key={section.id} className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 px-2 mb-2">{section.title}</h3>
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {section.items.map((item, index) => (
                  <div 
                    key={item.id}
                    className={`
                      ${index !== 0 ? 'border-t border-gray-100' : ''}
                    `}
                  >
                    {item.link ? (
                      <Link href={item.link}>
                        <a className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                          <div className="flex items-center">
                            <span className="text-gray-500 mr-3">{item.icon}</span>
                            <span>{item.label}</span>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </a>
                      </Link>
                    ) : item.hasToggle ? (
                      <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center">
                          <span className="text-gray-500 mr-3">{item.icon}</span>
                          <span>{item.label}</span>
                        </div>
                        <Switch 
                          checked={item.toggleValue} 
                          onCheckedChange={item.onToggle} 
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center">
                          <span className="text-gray-500 mr-3">{item.icon}</span>
                          <span>{item.label}</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {/* Logout button */}
          <div className="mt-8 mb-4 text-center">
            <Button 
              variant="outline" 
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}