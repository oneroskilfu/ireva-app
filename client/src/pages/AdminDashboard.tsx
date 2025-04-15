import React, { useState } from 'react';
import AdminPropertyManagement from './AdminPropertyManagement';
import AdminROITracker from './AdminROITracker';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'properties':
        return <AdminPropertyManagement />;
      case 'roi':
        return <AdminROITracker />;
      default:
        return (
          <div className="bg-white shadow-md rounded-lg p-8 max-w-3xl mx-auto border-l-4 border-red-500">
            <h1 className="text-3xl font-bold text-center mb-6">Welcome to the Admin Panel</h1>
            <p className="text-lg text-gray-700 text-center">
              You have successfully logged in with administrative privileges.
            </p>
            <div className="mt-8 p-4 bg-red-50 rounded-md">
              <h2 className="text-xl font-semibold mb-2">Administrator Account</h2>
              <p>Role: Admin</p>
              <p>Access Level: Full System Access</p>
            </div>
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-4">Dashboard Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-md shadow-sm">
                  <h4 className="font-medium text-lg">Total Properties</h4>
                  <p className="text-2xl font-bold text-blue-600">12</p>
                </div>
                <div className="bg-green-50 p-4 rounded-md shadow-sm">
                  <h4 className="font-medium text-lg">Active Investments</h4>
                  <p className="text-2xl font-bold text-green-600">145</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-md shadow-sm">
                  <h4 className="font-medium text-lg">ROI Distributions</h4>
                  <p className="text-2xl font-bold text-purple-600">₦4.5M</p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">iREVA Admin Panel</h1>
        <div className="flex space-x-2">
          <button className="px-4 py-2 rounded-md bg-red-600 text-white">Logout</button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="border-b flex">
          <button 
            className={`px-6 py-3 font-medium ${activeTab === 'dashboard' ? 'border-b-2 border-red-500 text-red-700' : 'text-gray-600'}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`px-6 py-3 font-medium ${activeTab === 'properties' ? 'border-b-2 border-red-500 text-red-700' : 'text-gray-600'}`}
            onClick={() => setActiveTab('properties')}
          >
            Properties
          </button>
          <button 
            className={`px-6 py-3 font-medium ${activeTab === 'roi' ? 'border-b-2 border-red-500 text-red-700' : 'text-gray-600'}`}
            onClick={() => setActiveTab('roi')}
          >
            ROI Tracking
          </button>
          <button 
            className={`px-6 py-3 font-medium ${activeTab === 'users' ? 'border-b-2 border-red-500 text-red-700' : 'text-gray-600'}`}
            onClick={() => setActiveTab('users')}
          >
            User Management
          </button>
        </div>
        
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}