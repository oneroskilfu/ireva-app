import React, { useState } from 'react';
import { Link } from 'wouter';
import AdminPropertyManagement from './AdminPropertyManagement';
import AdminROITracker from './AdminROITracker';

// New admin components from the Admin directory
import PropertyManagement from './Admin/PropertyManagement';
import RoiTracker from './Admin/RoiTracker';

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
                  <Link href="/admin/properties">
                    <a className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block">
                      Manage Properties →
                    </a>
                  </Link>
                </div>
                <div className="bg-green-50 p-4 rounded-md shadow-sm">
                  <h4 className="font-medium text-lg">Active Investments</h4>
                  <p className="text-2xl font-bold text-green-600">145</p>
                  <a className="text-sm text-green-600 hover:text-green-800 mt-2 inline-block cursor-pointer">
                    View Investments →
                  </a>
                </div>
                <div className="bg-purple-50 p-4 rounded-md shadow-sm">
                  <h4 className="font-medium text-lg">ROI Distributions</h4>
                  <p className="text-2xl font-bold text-purple-600">₦4.5M</p>
                  <Link href="/admin/roi-tracker">
                    <a className="text-sm text-purple-600 hover:text-purple-800 mt-2 inline-block">
                      Track ROI →
                    </a>
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Admin Quick Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/admin/properties">
                  <a className="flex items-center p-4 bg-gray-50 rounded-md shadow-sm hover:bg-gray-100 transition-colors">
                    <div className="bg-blue-100 p-3 rounded-full mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Property Management</h4>
                      <p className="text-sm text-gray-600">Add, edit and manage properties</p>
                    </div>
                  </a>
                </Link>
                
                <Link href="/admin/roi-tracker">
                  <a className="flex items-center p-4 bg-gray-50 rounded-md shadow-sm hover:bg-gray-100 transition-colors">
                    <div className="bg-purple-100 p-3 rounded-full mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">ROI Tracking</h4>
                      <p className="text-sm text-gray-600">Manage and process ROI distributions</p>
                    </div>
                  </a>
                </Link>
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
          <Link href="/admin/properties">
            <a className={`px-6 py-3 font-medium ${activeTab === 'properties' ? 'border-b-2 border-red-500 text-red-700' : 'text-gray-600'}`}>
              Properties
            </a>
          </Link>
          <Link href="/admin/roi-tracker">
            <a className={`px-6 py-3 font-medium ${activeTab === 'roi' ? 'border-b-2 border-red-500 text-red-700' : 'text-gray-600'}`}>
              ROI Tracking
            </a>
          </Link>
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