import React, { useState, useEffect } from 'react';
import { FiUsers, FiHome, FiDollarSign, FiBarChart2 } from 'react-icons/fi';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

// Stat Card Component
const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className="card flex items-center">
      <div className={`p-3 rounded-lg mr-4 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-600">{title}</p>
        <h3 className="text-2xl font-semibold">{value}</h3>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [userGrowth, setUserGrowth] = useState([]);
  const [investmentTrends, setInvestmentTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, userGrowthRes, investmentTrendsRes] = await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/admin/user-growth'),
          api.get('/admin/investment-trends')
        ]);
        
        setStats(statsRes.data);
        setUserGrowth(userGrowthRes.data);
        setInvestmentTrends(investmentTrendsRes.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg my-4">
        <p>{error}</p>
      </div>
    );
  }

  // As a fallback, if the API is not responding properly, we'll display placeholder data
  const placeholderStats = {
    totalUsers: '---',
    totalProperties: '---',
    totalInvestments: '---',
    totalAmountInvested: '---'
  };

  const displayStats = stats || placeholderStats;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to the REVA admin dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Total Users" 
          value={displayStats.totalUsers} 
          icon={<FiUsers size={24} color="white" />} 
          color="bg-primary-color text-white" 
        />
        <StatCard 
          title="Total Properties" 
          value={displayStats.totalProperties} 
          icon={<FiHome size={24} color="white" />} 
          color="bg-secondary-color text-white" 
        />
        <StatCard 
          title="Total Investments" 
          value={displayStats.totalInvestments} 
          icon={<FiBarChart2 size={24} color="white" />} 
          color="bg-success-color text-white" 
        />
        <StatCard 
          title="Amount Invested" 
          value={`₦${displayStats.totalAmountInvested}`} 
          icon={<FiDollarSign size={24} color="white" />} 
          color="bg-purple-600 text-white" 
        />
      </div>

      {/* KYC Verifications */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">Pending KYC Verifications</h2>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <p className="text-yellow-700">
            There are {displayStats.pendingKYCCount || '---'} users waiting for KYC verification. 
            <a href="/kyc" className="text-primary-color ml-2 font-medium">View pending requests →</a>
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {!stats ? (
            <p className="text-gray-500 italic">Activity data is currently unavailable.</p>
          ) : (
            stats.recentActivities && stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start pb-4 border-b">
                  <div className="rounded-full w-10 h-10 flex items-center justify-center bg-gray-100 mr-4">
                    {activity.type === 'user' && <FiUsers className="text-primary-color" />}
                    {activity.type === 'property' && <FiHome className="text-secondary-color" />}
                    {activity.type === 'investment' && <FiDollarSign className="text-success-color" />}
                  </div>
                  <div>
                    <p className="font-medium">{activity.message}</p>
                    <p className="text-sm text-gray-500">{activity.timestamp}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">No recent activities to display.</p>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;