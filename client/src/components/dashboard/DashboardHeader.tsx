import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { 
  Menu, Search, BellRing, ChevronDown, ListFilter, CalendarDays
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export default function DashboardHeader() {
  const { user } = useAuth();
  const [activeNav, setActiveNav] = useState('overview');
  
  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'properties', label: 'Properties' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'customer', label: 'Customer' },
    { id: 'campaigns', label: 'Campaigns' },
    { id: 'accounts', label: 'Accounts' },
    { id: 'reports', label: 'Report' }
  ];
  
  // Get user's first name or username
  const displayName = user?.firstName || user?.username || 'Investor';
  
  return (
    <div className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Top navigation with logo, search and user area */}
        <div className="flex items-center justify-between mb-6">
          {/* Left: Logo and Menu */}
          <div className="flex items-center">
            <Link href="/">
              <a className="mr-6">
                <div className="font-bold text-2xl">IR</div>
              </a>
            </Link>
            
            <button className="lg:hidden mr-4">
              <Menu className="h-5 w-5" />
            </button>
            
            <nav className="hidden lg:flex space-x-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    activeNav === item.id 
                      ? 'bg-indigo-100 text-indigo-700 font-medium' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
          
          {/* Right: Search, Notifications, User */}
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <button className="relative p-2 rounded-full hover:bg-slate-100">
              <BellRing className="h-5 w-5 text-slate-600" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            
            <div className="flex items-center ml-4">
              <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium text-sm mr-2">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:inline text-sm font-medium">{displayName}</span>
            </div>
          </div>
        </div>
        
        {/* Page title and filters row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4">
          <div>
            <h2 className="text-2xl font-bold">Good Morning, {displayName}</h2>
            <p className="text-slate-500 text-sm mt-1">Welcome to iREVA Investment Dashboard</p>
          </div>
          
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <Button variant="outline" size="sm" className="flex items-center">
              <CalendarDays className="mr-2 h-4 w-4" />
              <span>Last 6 Months</span>
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="sm" className="flex items-center">
              <ListFilter className="mr-2 h-4 w-4" />
              <span>Customize</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}