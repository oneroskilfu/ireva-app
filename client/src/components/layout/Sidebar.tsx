import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  UserRound, 
  LayoutDashboard, 
  Building2, 
  Users, 
  BarChartBig, 
  Settings, 
  HelpCircle, 
  LogOut, 
  TrendingUp, 
  MessageSquare, 
  Mail,
  DollarSign
} from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const [location] = useLocation();
  
  const isActive = (path: string) => {
    return location === path ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:text-primary hover:bg-gray-100';
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 shadow-sm">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">iREVA Platform</h2>
        <p className="text-sm text-gray-500">Real Estate Investment</p>
      </div>
      
      <div className="p-2">
        <div className="pt-2 pb-4">
          <div className="flex items-center p-3 mb-2 rounded-md">
            <UserRound className="mr-2 h-5 w-5 text-primary" />
            <span className="font-medium">Admin Panel</span>
          </div>
        </div>
        
        <ul className="space-y-1">
          <li>
            <Link href="/dashboard">
              <a className={`flex items-center p-3 rounded-md ${isActive('/dashboard')}`}>
                <LayoutDashboard className="mr-2 h-5 w-5" />
                <span>Dashboard</span>
              </a>
            </Link>
          </li>
          
          <li>
            <Link href="/projects">
              <a className={`flex items-center p-3 rounded-md ${isActive('/projects')}`}>
                <Building2 className="mr-2 h-5 w-5" />
                <span>Projects</span>
              </a>
            </Link>
          </li>
          
          <li>
            <Link href="/properties">
              <a className={`flex items-center p-3 rounded-md ${isActive('/properties')}`}>
                <Building2 className="mr-2 h-5 w-5" />
                <span>Properties</span>
              </a>
            </Link>
          </li>
          
          <li>
            <Link href="/roi">
              <a className={`flex items-center p-3 rounded-md ${isActive('/roi')}`}>
                <TrendingUp className="mr-2 h-5 w-5" />
                <span>ROI Tracker</span>
              </a>
            </Link>
          </li>
          
          <li>
            <Link href="/investments">
              <a className={`flex items-center p-3 rounded-md ${isActive('/investments')}`}>
                <DollarSign className="mr-2 h-5 w-5" />
                <span>Investments</span>
              </a>
            </Link>
          </li>
          
          <li>
            <Link href="/admin">
              <a className={`flex items-center p-3 rounded-md ${isActive('/admin')}`}>
                <Users className="mr-2 h-5 w-5" />
                <span>Users</span>
              </a>
            </Link>
          </li>
          
          <li>
            <Link href="/analytics">
              <a className={`flex items-center p-3 rounded-md ${isActive('/analytics')}`}>
                <BarChartBig className="mr-2 h-5 w-5" />
                <span>Analytics</span>
              </a>
            </Link>
          </li>
          
          <li>
            <Link href="/messages">
              <a className={`flex items-center p-3 rounded-md ${isActive('/messages')}`}>
                <Mail className="mr-2 h-5 w-5" />
                <span>Messaging</span>
              </a>
            </Link>
          </li>
          
          <li>
            <Link href="/account/security">
              <a className={`flex items-center p-3 rounded-md ${isActive('/account/security')}`}>
                <Settings className="mr-2 h-5 w-5" />
                <span>Settings</span>
              </a>
            </Link>
          </li>
          
          <li>
            <Link href="/support">
              <a className={`flex items-center p-3 rounded-md ${isActive('/support')}`}>
                <HelpCircle className="mr-2 h-5 w-5" />
                <span>Support</span>
              </a>
            </Link>
          </li>
          
          <li>
            <button 
              onClick={onLogout}
              className="w-full flex items-center p-3 rounded-md text-red-600 hover:bg-red-50"
            >
              <LogOut className="mr-2 h-5 w-5" />
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;