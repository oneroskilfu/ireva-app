import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getCurrentUser } from '../utils/auth';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [stats, setStats] = useState({
    totalUsers: 320,
    ongoingProjects: 12,
    roiPaid: 24000000,
    totalInvestments: 156000000
  });
  
  const [recentActivities, setRecentActivities] = useState([
    { id: 1, type: 'user_register', user: 'john_doe', time: '2 hours ago' },
    { id: 2, type: 'investment', user: 'sarah_j', amount: 500000, property: 'Hilltop Residences', time: '4 hours ago' },
    { id: 3, type: 'roi_payment', amount: 1500000, time: '1 day ago' },
    { id: 4, type: 'property_added', property: 'Lakeside Apartments', time: '2 days ago' },
    { id: 5, type: 'kyc_verification', user: 'michael_t', status: 'pending', time: '2 days ago' }
  ]);
  
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setUserData(user);
    }
    
    // In a real application, we would fetch real stats
    // API.get('/admin/stats').then(res => setStats(res.data)).catch(err => console.error(err));
    // API.get('/admin/activities').then(res => setRecentActivities(res.data)).catch(err => console.error(err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  // Function to get appropriate activity description
  const getActivityDescription = (activity) => {
    switch(activity.type) {
      case 'user_register':
        return <span><strong>{activity.user}</strong> registered</span>;
      case 'investment':
        return <span><strong>{activity.user}</strong> invested ₦{activity.amount.toLocaleString()} in <strong>{activity.property}</strong></span>;
      case 'roi_payment':
        return <span>ROI payment of ₦{activity.amount.toLocaleString()} processed</span>;
      case 'property_added':
        return <span>New property added: <strong>{activity.property}</strong></span>;
      case 'kyc_verification':
        return <span>KYC verification for <strong>{activity.user}</strong> is {activity.status}</span>;
      default:
        return <span>Unknown activity</span>;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 p-8">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {userData.name || 'Admin'}</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
            <p className="text-3xl font-bold mt-2">{stats.totalUsers}</p>
            <p className="text-green-500 text-sm mt-1">+8% from last month</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-500 text-sm font-medium">Ongoing Projects</h3>
            <p className="text-3xl font-bold mt-2">{stats.ongoingProjects}</p>
            <p className="text-green-500 text-sm mt-1">+2 new this month</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-500 text-sm font-medium">Total ROI Paid</h3>
            <p className="text-3xl font-bold mt-2">₦{(stats.roiPaid / 1000000).toFixed(1)}M</p>
            <p className="text-red-500 text-sm mt-1">-2.3% from last month</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-500 text-sm font-medium">Total Investments</h3>
            <p className="text-3xl font-bold mt-2">₦{(stats.totalInvestments / 1000000).toFixed(1)}M</p>
            <p className="text-green-500 text-sm mt-1">+12.5% from last month</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
            <div className="space-y-4">
              {recentActivities.map(activity => (
                <div className="flex justify-between items-center py-3 border-b border-gray-100" key={activity.id}>
                  <div className="text-gray-700">
                    {getActivityDescription(activity)}
                  </div>
                  <span className="text-gray-400 text-sm">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Admin Tools</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Link to="/admin/users" className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-red-50 transition-colors">
                <div className="w-12 h-12 flex items-center justify-center bg-red-100 text-red-600 rounded-full mb-2">
                  <span className="text-xl">👥</span>
                </div>
                <span className="text-sm font-medium text-gray-700">Users</span>
              </Link>
              
              <Link to="/admin/properties" className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-red-50 transition-colors">
                <div className="w-12 h-12 flex items-center justify-center bg-red-100 text-red-600 rounded-full mb-2">
                  <span className="text-xl">🏢</span>
                </div>
                <span className="text-sm font-medium text-gray-700">Properties</span>
              </Link>
              
              <Link to="/admin/analytics" className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-red-50 transition-colors">
                <div className="w-12 h-12 flex items-center justify-center bg-red-100 text-red-600 rounded-full mb-2">
                  <span className="text-xl">📊</span>
                </div>
                <span className="text-sm font-medium text-gray-700">Analytics</span>
              </Link>
              
              <Link to="/admin/roi" className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-red-50 transition-colors">
                <div className="w-12 h-12 flex items-center justify-center bg-red-100 text-red-600 rounded-full mb-2">
                  <span className="text-xl">💰</span>
                </div>
                <span className="text-sm font-medium text-gray-700">ROI</span>
              </Link>
              
              <Link to="/admin/kyc" className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-red-50 transition-colors">
                <div className="w-12 h-12 flex items-center justify-center bg-red-100 text-red-600 rounded-full mb-2">
                  <span className="text-xl">📝</span>
                </div>
                <span className="text-sm font-medium text-gray-700">KYC</span>
              </Link>
              
              <Link to="/admin/settings" className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-red-50 transition-colors">
                <div className="w-12 h-12 flex items-center justify-center bg-red-100 text-red-600 rounded-full mb-2">
                  <span className="text-xl">⚙️</span>
                </div>
                <span className="text-sm font-medium text-gray-700">Settings</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;