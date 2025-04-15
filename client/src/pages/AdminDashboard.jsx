import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Link } from 'wouter';
import Sidebar from '../components/Sidebar';
import { getCurrentUser } from '../utils/auth';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

// Mock data for charts
const propertyData = [
  { month: 'Jan', value: 2400 },
  { month: 'Feb', value: 3100 },
  { month: 'Mar', value: 4200 },
  { month: 'Apr', value: 3800 },
  { month: 'May', value: 5100 },
  { month: 'Jun', value: 4800 },
  { month: 'Jul', value: 5800 },
  { month: 'Aug', value: 6300 },
  { month: 'Sep', value: 6000 },
  { month: 'Oct', value: 6800 },
  { month: 'Nov', value: 7500 },
  { month: 'Dec', value: 8000 },
];

const roiData = [
  { month: 'Jan', value: 200 },
  { month: 'Feb', value: 500 },
  { month: 'Mar', value: 600 },
  { month: 'Apr', value: 320 },
  { month: 'May', value: 900 },
  { month: 'Jun', value: 1100 },
  { month: 'Jul', value: 1300 },
  { month: 'Aug', value: 1700 },
  { month: 'Sep', value: 1400 },
  { month: 'Oct', value: 1800 },
  { month: 'Nov', value: 1600 },
  { month: 'Dec', value: 2100 },
];

const AdminDashboard = () => {
  const [, setLocation] = useLocation();
  const [userData, setUserData] = useState({});
  const [stats, setStats] = useState({
    totalUsers: 1250,
    activeProjects: 18,
    roiPaid: 1200000,
    totalInvestments: 2500000,
    fundsRaisedThisMonth: 350000
  });
  
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setUserData(user);
    }
    
    // In a real application, we would fetch real stats
    // API.get('/admin/stats').then(res => setStats(res.data)).catch(err => console.error(err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setLocation('/');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Sidebar - Based on first mockup */}
      <div className="w-64 bg-[#553627] text-white min-h-screen">
        <div className="p-4 flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-400 rounded-full"></div>
          <h1 className="text-xl font-semibold">Admin</h1>
        </div>
        
        <nav className="mt-6">
          <Link to="/admin/dashboard" className="flex items-center px-4 py-3 bg-[#664332] text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Dashboard
          </Link>
          
          <Link to="/admin/users" className="flex items-center px-4 py-3 text-white hover:bg-[#664332] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            Users
          </Link>
          
          <Link to="/admin/portfolio" className="flex items-center px-4 py-3 text-white hover:bg-[#664332] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
            </svg>
            Portfolio
          </Link>
          
          <Link to="/admin/crm" className="flex items-center px-4 py-3 text-white hover:bg-[#664332] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
            </svg>
            CRM
          </Link>
          
          <Link to="/admin/developers" className="flex items-center px-4 py-3 text-white hover:bg-[#664332] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            Developers
          </Link>
          
          <Link to="/admin/properties" className="flex items-center px-4 py-3 text-white hover:bg-[#664332] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Properties
          </Link>
          
          <Link to="/admin/roi" className="flex items-center px-4 py-3 text-white hover:bg-[#664332] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            ROI
          </Link>
          
          <Link to="/admin/wallet" className="flex items-center px-4 py-3 text-white hover:bg-[#664332] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
            </svg>
            Wallet
          </Link>
          
          <Link to="/admin/analytics" className="flex items-center px-4 py-3 text-white hover:bg-[#664332] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm9 4a1 1 0 10-2 0v6a1 1 0 102 0V7zm-3 2a1 1 0 10-2 0v4a1 1 0 102 0V9zm-3 3a1 1 0 10-2 0v1a1 1 0 102 0v-1z" clipRule="evenodd" />
            </svg>
            Analytics
          </Link>
          
          <Link to="/admin/settings" className="flex items-center px-4 py-3 text-white hover:bg-[#664332] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            Settings
          </Link>
          
          <button onClick={handleLogout} className="w-full flex items-center px-4 py-3 text-white hover:bg-[#664332] transition-colors mt-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm9 14H5a1 1 0 01-1-1V5h8v11zm1-11.5a.5.5 0 00-.5.5v1a.5.5 0 001 0V6a.5.5 0 00-.5-.5zm0 3a.5.5 0 00-.5.5v1a.5.5 0 001 0V9a.5.5 0 00-.5-.5z" clipRule="evenodd" />
            </svg>
            Logout
          </button>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1">
        {/* Header with Title, Notification, and Profile */}
        <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden">
                <img src="https://via.placeholder.com/40" alt="Admin" className="w-full h-full object-cover" />
              </div>
              <span className="font-medium">Admin</span>
            </div>
          </div>
        </header>
        
        {/* Main Dashboard Content */}
        <main className="p-6">
          {/* Stats Grid - Top Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
            {/* Total Users */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-gray-600 text-sm font-medium">Total Users</h3>
              <p className="text-4xl font-bold mt-2">{stats.totalUsers.toLocaleString()}</p>
            </div>
            
            {/* Total Investments */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-gray-600 text-sm font-medium">Total Investments</h3>
              <p className="text-4xl font-bold mt-2">₦{stats.totalInvestments.toLocaleString()}</p>
            </div>
            
            {/* Active Projects */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-gray-600 text-sm font-medium">Active Projects</h3>
              <p className="text-4xl font-bold mt-2">{stats.activeProjects}</p>
            </div>
            
            {/* ROI Paid */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-gray-600 text-sm font-medium">ROI Paid</h3>
              <p className="text-4xl font-bold mt-2">₦{stats.roiPaid.toLocaleString()}</p>
            </div>
          </div>
          
          {/* Second Row - Funds Raised This Month */}
          <div className="grid grid-cols-1 gap-6 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-gray-600 text-sm font-medium">Funds Raised This Month</h3>
              <p className="text-4xl font-bold mt-2">₦{stats.fundsRaisedThisMonth.toLocaleString()}</p>
            </div>
          </div>
          
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Property Overview Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Property Overview</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={propertyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#888" fontSize={12} />
                    <YAxis stroke="#888" fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#6B7280" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* ROI Tracking Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">ROI Tracking</h3>
                <Link to="/admin/roi" className="text-blue-500 text-sm hover:underline flex items-center">
                  View more
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={roiData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#888" fontSize={12} />
                    <YAxis stroke="#888" fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Quick Access Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* User Management Card */}
            <Link to="/admin/users" className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold">User Management</h3>
                <p className="text-sm text-gray-500 mt-1">Manage users</p>
              </div>
            </Link>
            
            {/* CRM Card */}
            <Link to="/admin/crm" className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold">CRM</h3>
                <p className="text-sm text-gray-500 mt-1">Manage customers</p>
              </div>
            </Link>
            
            {/* Developers Card */}
            <Link to="/admin/developers" className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold">Developers</h3>
                <p className="text-sm text-gray-500 mt-1">View developer list</p>
              </div>
            </Link>
            
            {/* Properties Card */}
            <Link to="/admin/properties" className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold">Properties</h3>
                <p className="text-sm text-gray-500 mt-1">Manage properties</p>
              </div>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;