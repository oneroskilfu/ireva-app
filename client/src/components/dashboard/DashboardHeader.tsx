import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { 
  Menu, Search, BellRing, ChevronDown, ListFilter, CalendarDays,
  Home, User, PieChart, Wallet, MessageSquare, BookOpen, HelpCircle, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'wouter';

export default function DashboardHeader() {
  const { user } = useAuth();
  const [activeNav, setActiveNav] = useState('overview');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [location] = useLocation();
  
  // Determine if we're in a sub-page that needs a back button
  const showBackButton = location !== '/dashboard' && location !== '/';
  
  const navItems = [
    { id: 'overview', label: 'Overview', icon: <Home className="h-5 w-5" /> },
    { id: 'properties', label: 'Explore', icon: <Search className="h-5 w-5" /> },
    { id: 'portfolio', label: 'Portfolio', icon: <PieChart className="h-5 w-5" /> },
    { id: 'wallet', label: 'Wallet', icon: <Wallet className="h-5 w-5" /> },
    { id: 'community', label: 'Community', icon: <MessageSquare className="h-5 w-5" /> },
    { id: 'education', label: 'Education', icon: <BookOpen className="h-5 w-5" /> },
    { id: 'support', label: 'Support', icon: <HelpCircle className="h-5 w-5" /> },
    { id: 'profile', label: 'Profile', icon: <User className="h-5 w-5" /> }
  ];
  
  // Get user's first name or username
  const displayName = user?.firstName || user?.username || 'Investor';
  
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };
  
  return (
    <div className="w-full bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Top navigation with logo, search and user area */}
        <div className="flex items-center justify-between mb-4">
          {/* Left: Logo and Menu */}
          <div className="flex items-center">
            {showBackButton ? (
              <Link href="/dashboard" className="mr-2 p-1 rounded-full hover:bg-slate-100">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            ) : (
              <Link href="/" className="mr-4">
                <div className="font-bold text-xl text-emerald-700">iREVA</div>
              </Link>
            )}
            
            <button 
              className="lg:hidden p-2 rounded-full hover:bg-slate-100 mr-2"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <Menu className="h-5 w-5" />
            </button>
            
            {!showBackButton && (
              <nav className="hidden lg:flex space-x-1">
                {navItems.slice(0, 5).map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveNav(item.id)}
                    className={`px-4 py-2 rounded-lg text-sm ${
                      activeNav === item.id 
                        ? 'bg-emerald-100 text-emerald-700 font-medium' 
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            )}
          </div>
          
          {/* Right: Search, Notifications, User */}
          <div className="flex items-center space-x-3">
            <div className="relative hidden md:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            
            <button className="relative p-2 rounded-full hover:bg-slate-100">
              <BellRing className="h-5 w-5 text-slate-600" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            
            <Link href="/profile" className="flex items-center">
              <div className="h-9 w-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-medium text-sm">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:inline text-sm font-medium ml-2">{displayName}</span>
            </Link>
          </div>
        </div>
        
        {/* Page title and filters row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">{getGreeting()}, {displayName}</h2>
            <p className="text-slate-500 text-sm mt-1">Welcome to iREVA Investment Dashboard</p>
          </div>
          
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <Button variant="outline" size="sm" className="text-xs md:text-sm flex items-center">
              <CalendarDays className="mr-2 h-4 w-4" />
              <span>Last 6 Months</span>
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="sm" className="text-xs md:text-sm flex items-center">
              <ListFilter className="mr-2 h-4 w-4" />
              <span>Customize</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile navigation drawer */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowMobileMenu(false)}>
          <div className="bg-white w-64 h-full p-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div className="font-bold text-xl text-emerald-700">iREVA</div>
              <button onClick={() => setShowMobileMenu(false)}>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex flex-col space-y-1">
              {navItems.map(item => (
                <Link 
                  href={`/${item.id}`} 
                  key={item.id}
                  className={`flex items-center px-4 py-3 rounded-lg ${
                    activeNav === item.id 
                      ? 'bg-emerald-100 text-emerald-700 font-medium' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  onClick={() => {
                    setActiveNav(item.id);
                    setShowMobileMenu(false);
                  }}
                >
                  <div className="mr-3">{item.icon}</div>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Mobile bottom navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40">
        <div className="grid grid-cols-5 gap-1 p-1">
          {navItems.slice(0, 5).map(item => (
            <Link 
              href={`/${item.id === 'overview' ? 'dashboard' : item.id}`} 
              key={item.id}
              className={`flex flex-col items-center justify-center py-2 rounded-lg ${
                activeNav === item.id 
                  ? 'text-emerald-700' 
                  : 'text-slate-600'
              }`}
              onClick={() => setActiveNav(item.id)}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}